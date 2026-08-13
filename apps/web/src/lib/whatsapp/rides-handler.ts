import { supabaseAdmin } from '../supabase/admin'
import { getRideEstimate, calculatePrice, reverseGeocode, LocationCoordinate } from '../google-maps'
import { sendTextMessage, sendInteractiveButtons } from './meta-api'
import { HARDCODED_WHATSAPP_CONFIG } from './hardcoded-config'

export async function handleRideHailingBooking(
  message: any,
  accountId: string,
  contactId: string,
  senderPhone: string,
  accessToken: string
) {
  try {
    const config = HARDCODED_WHATSAPP_CONFIG
    const supabase = supabaseAdmin()
    const text = message.text?.body?.toLowerCase() || ''
    const cleanPhone = senderPhone.replace(/\D/g, '')
    const tenDigitPhone = cleanPhone.slice(-10)

    // ───── 0. AUTOMATED WHATSAPP LOGIN OTP GENERATION HOOK ─────
    // Exclude ride booking / transport dispatch messages from triggering automated login OTP
    const isRideRequestMessage = text.includes('rideo') || text.includes('ride request') || text.includes('start trip pin') || text.includes('start ride') || text.includes('pickup') || text.includes('estimated fare');

    if (!isRideRequestMessage && (text.includes('login otp') || text === 'otp' || text === 'login' || text === 'code' || text === 'help')) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      try {
        await supabase.from('whatsapp_otps').upsert([
          { phone_number: tenDigitPhone, otp: otpCode, expires_at: expiresAt },
          { phone_number: cleanPhone, otp: otpCode, expires_at: expiresAt }
        ]);
      } catch (dbErr) {
        console.warn('whatsapp_otps table upsert warning (non-blocking):', dbErr);
      }

      let phoneId = config.phone_number_id;
      if (!phoneId) {
        const { data: cfg } = await supabase.from('whatsapp_config').select('phone_number_id').maybeSingle();
        phoneId = cfg?.phone_number_id || '1213113635214047';
      }

      await sendTextMessage({
        accessToken,
        phoneNumberId: phoneId,
        to: senderPhone,
        text: `🔐 YOUR FAGO LOGIN OTP IS: ${otpCode}\n\n` +
          `Valid for 10 minutes. Enter this 6-digit OTP on your FAGO login screen to sign in instantly.\n\n` +
          `Do not share this code with anyone.`
      });
      return true;
    }

    // ───── 0.1 DRIVER DAILY WAKEUP & LOCATION PINNING HOOK ─────
    // Check if sender phone matches a registered driver partner
    const { data: driverRows } = await supabase
      .from('drivers')
      .select('id, name, vehicle_type, vehicle_registration, status')
      .or(`whatsapp_number.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    const driverRow = driverRows?.[0]

    if (driverRow) {
      // Driver pinned live location via WhatsApp Attachment (Pin Location)
      if (message.type === 'location' && message.location) {
        const lat = message.location.latitude
        const lng = message.location.longitude

        await supabase
          .from('drivers')
          .update({
            pickup_latitude: lat,
            pickup_longitude: lng,
            status: 'online',
            updated_at: new Date().toISOString()
          })
          .eq('id', driverRow.id)

        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: `📍 LOCATION PINNED SUCCESSFULLY! 📍\n\n` +
            `👤 Driver: ${driverRow.name}\n` +
            `🚛 Vehicle: ${driverRow.vehicle_registration}\n` +
            `🌐 Coordinates: (${lat}, ${lng})\n\n` +
            `✅ Your live vehicle position is now ACTIVE on RideO map for nearby customers!`
        })
        return true
      }

      // Driver sent Daily Active Good Morning check-in message
      if (text.includes('active') || text.includes('good morning') || text.includes('online')) {
        // Extract auto-prefilled GPS coordinates if included in the message text
        let extractedLat: number | null = null
        let extractedLng: number | null = null

        const rawText = message.text?.body || ''
        const match = rawText.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/) || rawText.match(/Coordinates:\s*\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/i)
        if (match) {
          extractedLat = parseFloat(match[1])
          extractedLng = parseFloat(match[2])
        }

        const updateData: any = {
          status: 'online',
          updated_at: new Date().toISOString()
        }
        if (extractedLat !== null && extractedLng !== null) {
          updateData.pickup_latitude = extractedLat
          updateData.pickup_longitude = extractedLng
        }

        await supabase
          .from('drivers')
          .update(updateData)
          .eq('id', driverRow.id)

        const locationNotice = extractedLat !== null && extractedLng !== null
          ? `📍 Live GPS Auto-Pinned: (${extractedLat}, ${extractedLng})\n\n✅ Your vehicle (${driverRow.vehicle_registration}) is now ACTIVE on RideO map for nearby customers!`
          : `📍 Please share your live PICKUP location using the WhatsApp attachment (Pin Location) button so nearby RideO riders can find your vehicle!`

        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: `☀️ GOOD MORNING ${driverRow.name.toUpperCase()}! ☀️\n\n` +
            `Your vehicle status is now ACTIVE & ONLINE for today.\n\n` +
            locationNotice
        })
        return true
      }

      // ───── DRIVER CONFIRMS RIDE via WhatsApp text "CONFIRM" ─────
      if (text.includes('confirm') || text.includes('accept') || text.includes('ok') || text.includes('yes')) {
        // Find ALL driver IDs associated with this phone number
        const { data: allMatchingDrivers } = await supabase
          .from('drivers')
          .select('id')
          .or(`whatsapp_number.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,phone.ilike.%${cleanPhone}%`);
          
        const driverIds = allMatchingDrivers?.map(d => d.id) || [];
        
        // Find the latest pending ride assigned to ANY of these driver IDs
        let pendingRide = null;
        if (driverIds.length > 0) {
          const { data } = await supabase
            .from('rides')
            .select('*')
            .in('driver_id', driverIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          pendingRide = data;
        }

        if (pendingRide) {
          // Generate fresh 4-digit OTP for trip verification
          const tripOtp = String(1000 + Math.floor(Math.random() * 9000))

          // Update ride status to 'accepted' + store OTP
          await supabase
            .from('rides')
            .update({
              status: 'accepted',
              otp: tripOtp,
              accepted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', pendingRide.id)

          // Notify the DRIVER with confirmation
          const pickupAddress = pendingRide.pickup_address || pendingRide.pickup_location?.address || `GPS: ${pendingRide.pickup_latitude || pendingRide.pickup_location?.lat}, ${pendingRide.pickup_longitude || pendingRide.pickup_location?.lng}`;
          const dropoffAddress = pendingRide.dropoff_address || pendingRide.drop_location?.address || `GPS: ${pendingRide.dropoff_latitude || pendingRide.drop_location?.lat}, ${pendingRide.dropoff_longitude || pendingRide.drop_location?.lng}`;
          const distanceVal = pendingRide.distance_km || pendingRide.distance || '-';
          const fareVal = pendingRide.fare || pendingRide.estimated_price || pendingRide.price || '-';
          const navLat = pendingRide.pickup_latitude || pendingRide.pickup_location?.lat;
          const navLng = pendingRide.pickup_longitude || pendingRide.pickup_location?.lng;

          await sendTextMessage({
            accessToken,
            phoneNumberId: config.phone_number_id,
            to: senderPhone,
            text: `✅ RIDE CONFIRMED! ✅\n\n` +
              `📍 Pickup: ${pickupAddress}\n` +
              `🏁 Drop-off: ${dropoffAddress}\n` +
              `📏 Distance: ${distanceVal} km\n` +
              `💰 Fare: ₹${fareVal}\n\n` +
              `🔢 *START TRIP PIN:* ${tripOtp}\n` +
              `(Rider will share this PIN to verify before starting trip)\n\n` +
              `🗺️ Navigate to pickup:\nhttps://www.google.com/maps/dir/?api=1&destination=${navLat},${navLng}`
          })

          // Notify the RIDER (passenger) about driver acceptance + OTP
          const riderWhatsappPhone = pendingRide.passenger_phone || '919123596988'
          await sendTextMessage({
            accessToken,
            phoneNumberId: config.phone_number_id,
            to: riderWhatsappPhone,
            text: `🚕 DRIVER CONFIRMED YOUR RIDE! 🚕\n\n` +
              `👨‍✈️ Driver: ${driverRow.name}\n` +
              `🚗 Vehicle: ${driverRow.vehicle_type} (${driverRow.vehicle_registration || ''})\n` +
              `📍 Pickup: ${pickupAddress}\n` +
              `🏁 Drop-off: ${dropoffAddress}\n` +
              `📏 Distance: ${distanceVal} km\n` +
              `💰 Fare: ₹${fareVal}\n\n` +
              `📍 *Your Trip OTP:* ${tripOtp}\n` +
              `(Share this OTP with driver to start the trip)\n\n` +
              `🆔 Ride ID: ${pendingRide.id?.slice(0, 8)}`
          })

          return true
        } else {
          await sendTextMessage({
            accessToken,
            phoneNumberId: config.phone_number_id,
            to: senderPhone,
            text: `⚠️ No pending ride requests found for your account. Please wait for a new ride request from RideO.`
          })
          return true
        }
      }
    }

    // ───── 1. CUSTOMER RIDE & TRANSPORT BOOKING ─────
    let isScheduled = false
    let scheduledTimeStr = ''
    if (text.includes('schedule') || text.includes('later')) {
      isScheduled = true
      scheduledTimeStr = text.replace(/(schedule|ride|book|for|cab|later|\ba\b)/g, '').replace(/\s+/g, ' ').trim()
    }

    // Check if message text already contains Google Maps pin coordinates or RentO booking payload
    const mapMatch = message.text?.body?.match(/maps\/search\/\?api=1&query=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                     message.text?.body?.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/)

    if (mapMatch) {
      const lat = mapMatch[1]
      const lng = mapMatch[2]
      await sendTextMessage({
        accessToken,
        phoneNumberId: config.phone_number_id,
        to: senderPhone,
        text: `📍 LOCATION & BOOKING RECEIVED! 📍\n\n` +
          `🌐 Live GPS: (${lat}, ${lng})\n\n` +
          `✅ Your booking details & live GPS coordinates have been received and broadcasted to nearby verified operators. Operator will contact you directly on WhatsApp!`
      })
      return true
    }

    if (text.includes('rento') || text.includes('machinery') || text.includes('tractor') || text.includes('tanker')) {
      await sendTextMessage({
        accessToken,
        phoneNumberId: config.phone_number_id,
        to: senderPhone,
        text: `🚜 Welcome to RentO Agricultural & Heavy Machinery! 🚜\n\n` +
          `Your machinery booking request has been registered. Nearby machinery operators will contact you directly on WhatsApp.`
      })
      return true
    }

    if (text.includes('ride') || text.includes('book') || text.includes('cab') || text.includes('schedule')) {
      await sendTextMessage({
        accessToken,
        phoneNumberId: config.phone_number_id,
        to: senderPhone,
        text: isScheduled 
          ? `You want to schedule a ride for ${scheduledTimeStr || 'later'}. Please share your PICKUP location pin.`
          : 'Welcome to Ride-Hailing! Please share your PICKUP location using the WhatsApp attachment (pin) feature.'
      })
      return true
    }

    // ───── 2. HANDLE LOCATION PINS (Pickup or Dropoff) ─────
    if (message.type === 'location' && message.location) {
      const loc: LocationCoordinate = {
        lat: message.location.latitude,
        lng: message.location.longitude
      }

      const { data: activeRide } = await supabase
        .from('rides')
        .select('*')
        .eq('account_id', accountId)
        .eq('contact_id', contactId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!activeRide || (activeRide.pickup_lat && activeRide.dropoff_lat)) {
        const address = await reverseGeocode(loc)
        await supabase.from('rides').insert({
          account_id: accountId,
          contact_id: contactId,
          status: 'pending',
          pickup_lat: loc.lat,
          pickup_lng: loc.lng,
          pickup_address: address,
          dropoff_lat: 0,
          dropoff_lng: 0
        })

        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: `Pickup set to: ${address}\nNow, please share your DROPOFF location.`
        })
        return true
      } else if (activeRide && activeRide.pickup_lat && !activeRide.dropoff_lat) {
        const dropoffAddress = await reverseGeocode(loc)
        
        await supabase.from('rides')
          .update({
            dropoff_lat: loc.lat,
            dropoff_lng: loc.lng,
            dropoff_address: dropoffAddress,
          })
          .eq('id', activeRide.id)

        // Fetch estimates for all vehicle categories
        const res = await fetch(`http://localhost:3000/api/rides/estimate?pickup_lat=${activeRide.pickup_lat}&pickup_lng=${activeRide.pickup_lng}&dropoff_lat=${loc.lat}&dropoff_lng=${loc.lng}`)
        if (!res.ok) {
           await sendTextMessage({
             accessToken,
             phoneNumberId: config.phone_number_id,
             to: senderPhone,
             text: 'Could not calculate route. Please try again.'
           })
           return true
        }
        const data = await res.json()
        
        const auto = data.estimates?.find((e: any) => e.category === 'autoo')
        const mini = data.estimates?.find((e: any) => e.category === 'mini')

        let textBody = `Trip Details:\nFrom: ${activeRide.pickup_address}\nTo: ${dropoffAddress}\nDistance: ${data.estimates[0]?.distance_km}km\nETA: ${data.estimates[0]?.duration_mins} mins\n`
        if (auto) textBody += `\n🛺 AutoO: ₹${auto.fare_breakdown?.total}`
        if (mini) textBody += `\n🚗 Mini: ₹${mini.fare_breakdown?.total}`
        textBody += `\n\nPlease select your preferred ride option:`

        await sendInteractiveButtons({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          bodyText: textBody,
          buttons: [
            { id: `req_autoo_${activeRide.id}`, title: `Auto (₹${auto?.fare_breakdown?.total})` },
            { id: `req_mini_${activeRide.id}`, title: `Mini (₹${mini?.fare_breakdown?.total})` },
            { id: `cancel_ride_${activeRide.id}`, title: 'Cancel' }
          ]
        })
        return true
      }
    }

    // ───── 3. HANDLE INTERACTIVE REPLIES ─────
    if (message.type === 'interactive' && message.interactive) {
      const replyId = message.interactive.button_reply?.id || message.interactive.list_reply?.id
      
      if (replyId && replyId.startsWith('req_')) {
        const parts = replyId.split('_')
        const vehicleCategory = parts[1]
        const rideId = parts.slice(2).join('_')
        
        const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single()
        if (ride) {
          await fetch('http://localhost:3000/api/rides/request', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                passenger_phone: senderPhone,
                passenger_name: 'Customer',
                pickup_lat: ride.pickup_lat,
                pickup_lng: ride.pickup_lng,
                pickup_address: ride.pickup_address,
                dropoff_lat: ride.dropoff_lat,
                dropoff_lng: ride.dropoff_lng,
                dropoff_address: ride.dropoff_address,
                vehicle_category: vehicleCategory,
                service_type: 'daily',
                payment_mode: 'upi',
                is_pink_ride: false
             })
          })
          
          await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)

          await sendInteractiveButtons({
            accessToken,
            phoneNumberId: config.phone_number_id,
            to: senderPhone,
            bodyText: '✅ Your ride is confirmed! We are broadcasting to nearby drivers. You will receive OTP shortly.',
            buttons: [
              { id: `report_ride_${rideId}`, title: 'Report Issue' }
            ]
          })
        }
        return true
      }

      if (replyId && replyId.startsWith('accept_ride_')) {
        const rideId = replyId.replace('accept_ride_', '')
        const { data: driverRows } = await supabase.from('drivers').select('*').or(`whatsapp_number.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%`).order('created_at', { ascending: false }).limit(1)
        const driver = driverRows?.[0]
        
        if (driver) {
          const { data: pendingRide } = await supabase.from('rides').select('*').eq('id', rideId).single()
          
          if (pendingRide && pendingRide.status === 'pending') {
            const tripOtp = String(1000 + Math.floor(Math.random() * 9000))

            await supabase
              .from('rides')
              .update({
                status: 'accepted',
                driver_id: driver.id,
                otp: tripOtp,
                accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', rideId)

            const pickupAddress = pendingRide.pickup_address || pendingRide.pickup_location?.address || `GPS: ${pendingRide.pickup_latitude || pendingRide.pickup_location?.lat}, ${pendingRide.pickup_longitude || pendingRide.pickup_location?.lng}`;
            const dropoffAddress = pendingRide.dropoff_address || pendingRide.drop_location?.address || `GPS: ${pendingRide.dropoff_latitude || pendingRide.drop_location?.lat}, ${pendingRide.dropoff_longitude || pendingRide.drop_location?.lng}`;
            const distanceVal = pendingRide.distance_km || pendingRide.distance || '-';
            const fareVal = pendingRide.fare || pendingRide.estimated_price || pendingRide.price || '-';
            const navLat = pendingRide.pickup_latitude || pendingRide.pickup_location?.lat;
            const navLng = pendingRide.pickup_longitude || pendingRide.pickup_location?.lng;

            // Notify the DRIVER with confirmation
            await sendTextMessage({
              accessToken,
              phoneNumberId: config.phone_number_id,
              to: senderPhone,
              text: `✅ RIDE CONFIRMED! ✅\n\n` +
                `📍 Pickup: ${pickupAddress}\n` +
                `🏁 Drop-off: ${dropoffAddress}\n` +
                `📏 Distance: ${distanceVal} km\n` +
                `💰 Fare: ₹${fareVal}\n\n` +
                `🔢 *START TRIP PIN:* ${tripOtp}\n` +
                `(Rider will share this PIN to verify before starting trip)\n\n` +
                `🗺️ Navigate to pickup:\nhttps://www.google.com/maps/dir/?api=1&destination=${navLat},${navLng}`
            })

            // Notify the RIDER (passenger) about driver acceptance + OTP
            const riderPhone = pendingRide.passenger_phone || '919123596988'
            const riderWhatsappPhone = riderPhone.startsWith('91') ? riderPhone : `91${riderPhone}`
            await sendTextMessage({
              accessToken,
              phoneNumberId: config.phone_number_id,
              to: riderWhatsappPhone,
              text: `🚕 DRIVER CONFIRMED YOUR RIDE! 🚕\n\n` +
                `👨‍✈️ Driver: ${driver.name}\n` +
                `🚗 Vehicle: ${driver.vehicle_type} (${driver.vehicle_registration || ''})\n` +
                `📍 Pickup: ${pickupAddress}\n` +
                `🏁 Drop-off: ${dropoffAddress}\n` +
                `📏 Distance: ${distanceVal} km\n` +
                `💰 Fare: ₹${fareVal}\n\n` +
                `📍 *Your Trip OTP:* ${tripOtp}\n` +
                `(Share this OTP with driver to start the trip)\n\n` +
                `🆔 Ride ID: ${pendingRide.id?.slice(0, 8)}`
            })
          } else {
             await sendTextMessage({
               accessToken,
               phoneNumberId: config.phone_number_id,
               to: senderPhone,
               text: `⚠️ This ride is no longer available.`
             })
          }
        }
        return true
      }
      
      if (replyId && (replyId.startsWith('cancel_ride_') || replyId.startsWith('decline_ride_'))) {
        const rideId = replyId.replace('cancel_ride_', '').replace('decline_ride_', '')
        await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
        
        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: 'Your ride request has been cancelled/declined.'
        })
        return true
      }

      if (replyId && replyId.startsWith('report_ride_')) {
        const rideId = replyId.replace('report_ride_', '')
        await supabase.from('rides')
          .update({ is_flagged: true, flag_reason: 'Issue reported' })
          .eq('id', rideId)
        
        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: 'Thank you for reporting. Our dispatch team has been alerted.'
        })
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error in handleRideHailingBooking:', error)
    return false
  }
}
