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

    // ───── 0. DRIVER DAILY WAKEUP & LOCATION PINNING HOOK ─────
    // Check if sender phone matches a registered driver partner
    const { data: driverRow } = await supabase
      .from('drivers')
      .select('id, name, vehicle_type, vehicle_registration, status')
      .or(`whatsapp_number.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%`)
      .maybeSingle()

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
        await supabase
          .from('drivers')
          .update({ status: 'online', updated_at: new Date().toISOString() })
          .eq('id', driverRow.id)

        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: `☀️ GOOD MORNING ${driverRow.name.toUpperCase()}! ☀️\n\n` +
            `Your vehicle status is now ACTIVE & ONLINE for today.\n\n` +
            `📍 Please share your live PICKUP location using the WhatsApp attachment (Pin Location) button so nearby RideO riders can find your vehicle!`
        })
        return true
      }
    }

    // ───── 1. CUSTOMER RIDE & TRANSPORT BOOKING ─────
    let isScheduled = false
    let scheduledTimeStr = ''
    if (text.includes('schedule') || text.includes('later')) {
      isScheduled = true
      scheduledTimeStr = text.replace(/(schedule|ride|book|for|cab|later|\ba\b)/g, '').replace(/\s+/g, ' ').trim()
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
      } else if (activeRide && activeRide.pickup_lat && !activeRide.distance_km) {
        const dropoffAddress = await reverseGeocode(loc)
        const pickupLoc = { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng }
        const estimate = await getRideEstimate(pickupLoc, loc)
        
        if (!estimate) {
          await sendTextMessage({
            accessToken,
            phoneNumberId: config.phone_number_id,
            to: senderPhone,
            text: 'Could not calculate route. Please try again.'
          })
          return true
        }

        const vehicle = { baseFare: 50, perKmRate: 15, perMinuteRate: 2 }
        const price = calculatePrice(estimate, vehicle)

        await supabase.from('rides')
          .update({
            dropoff_lat: loc.lat,
            dropoff_lng: loc.lng,
            dropoff_address: dropoffAddress,
            distance_km: estimate.distanceMeters / 1000,
            estimated_duration_mins: estimate.durationSeconds / 60,
            estimated_price: price
          })
          .eq('id', activeRide.id)

        await sendInteractiveButtons({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          bodyText: `Trip Details:\nFrom: ${activeRide.pickup_address}\nTo: ${dropoffAddress}\nDistance: ${estimate.distanceText}\nETA: ${estimate.durationText}\n\nEstimated Fare: ₹${price}\n\n⚠️ Strict Policy: You only pay exactly ₹${price}. No extra charges.`,
          buttons: [
            { id: `confirm_ride_${activeRide.id}`, title: 'Confirm Ride' },
            { id: `cancel_ride_${activeRide.id}`, title: 'Cancel' }
          ]
        })
        return true
      }
    }

    // ───── 3. HANDLE INTERACTIVE REPLIES ─────
    if (message.type === 'interactive' && message.interactive) {
      const replyId = message.interactive.button_reply?.id || message.interactive.list_reply?.id
      if (replyId && replyId.startsWith('confirm_ride_')) {
        const rideId = replyId.replace('confirm_ride_', '')
        await supabase.from('rides').update({ status: 'pending' }).eq('id', rideId)
        
        await sendInteractiveButtons({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          bodyText: 'Your ride is confirmed! We are finding a driver for you. If a driver demands extra fare, please report immediately.',
          buttons: [
            { id: `report_ride_${rideId}`, title: 'Report Extortion' }
          ]
        })
        return true
      }
      
      if (replyId && replyId.startsWith('cancel_ride_')) {
        const rideId = replyId.replace('cancel_ride_', '')
        await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
        
        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: 'Your ride request has been cancelled.'
        })
        return true
      }

      if (replyId && replyId.startsWith('report_ride_')) {
        const rideId = replyId.replace('report_ride_', '')
        await supabase.from('rides')
          .update({ is_flagged: true, flag_reason: 'Driver demanding extra fare' })
          .eq('id', rideId)
        
        await sendTextMessage({
          accessToken,
          phoneNumberId: config.phone_number_id,
          to: senderPhone,
          text: 'Thank you for reporting. Our dispatch team has been alerted and is reviewing the driver right now.'
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
