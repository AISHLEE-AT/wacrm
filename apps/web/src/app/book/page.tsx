'use client'
import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Dynamically import Map so it only renders on client
const RideMap = dynamic(() => import('@/components/GoogleRideMap'), { ssr: false })

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function BookRideContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const supabase = createClient()
  const [pickup, setPickup] = useState<[number, number] | null>(null)
  const [dropoff, setDropoff] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(true)

  // Peer-to-peer State
  const [drivers, setDrivers] = useState<any[]>([])
  const [searchingDrivers, setSearchingDrivers] = useState(false)
  const [activeRide, setActiveRide] = useState<any>(null)

  const locateUser = () => {
    setLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickup([pos.coords.latitude, pos.coords.longitude])
          setLocating(false)
        },
        (err) => {
          console.error(err)
          setLocating(false)
          // Fallback to manual entry or default location
          if (!pickup) setPickup([11.0168, 76.9558])
        },
        { enableHighAccuracy: true }
      )
    } else {
      setLocating(false)
      if (!pickup) setPickup([11.0168, 76.9558])
    }
  }

  useEffect(() => {
    locateUser()
  }, [])

  const searchDrivers = async () => {
    if (!pickup || !dropoff) return
    setSearchingDrivers(true)
    
    try {
      const { data, error } = await supabase.rpc('get_nearby_drivers', {
        pickup_lat: pickup[0],
        pickup_lon: pickup[1],
        radius_km: 100
      })

      if (error) throw error
      
      setDrivers(data || [])
      if (!data || data.length === 0) {
        alert('No drivers found within 100km.')
      }
    } catch (e: any) {
      alert(`Error searching drivers: ${e.message}`)
    } finally {
      setSearchingDrivers(false)
    }
  }

  const handleBookDriver = async (driver: any) => {
    setSearchingDrivers(true)
    
    try {
      const otp = (1000 + (Date.now() % 9000)).toString()
      // Calculate trip distance and fare
      const tripKm = getDistanceKm(pickup![0], pickup![1], dropoff![0], dropoff![1]);
      const baseFare = driver.vehicle_type === 'bike' ? 15 : driver.vehicle_type === 'auto' ? 30 : 50;
      const perKmRate = driver.vehicle_type === 'bike' ? 8 : driver.vehicle_type === 'auto' ? 14 : 16;
      const price = Math.max(
        driver.vehicle_type === 'bike' ? 25 : driver.vehicle_type === 'auto' ? 45 : 89,
        Math.round(baseFare + Math.max(0, tripKm - 1.5) * perKmRate)
      );

      const { data: userAuth } = await supabase.auth.getUser()

      const { data: rideResponse, error } = await supabase.from('rides').insert({
        customer_id: userAuth?.user?.id || null,
        driver_id: driver.id,
        pickup_latitude: pickup![0],
        pickup_longitude: pickup![1],
        pickup_address: `GPS: ${pickup![0].toFixed(4)}, ${pickup![1].toFixed(4)}`,
        dropoff_latitude: dropoff![0],
        dropoff_longitude: dropoff![1],
        dropoff_address: `GPS: ${dropoff![0].toFixed(4)}, ${dropoff![1].toFixed(4)}`,
        vehicle_type: driver.vehicle_type,
        distance_km: parseFloat(tripKm.toFixed(2)),
        price: price,
        status: 'pending',
        otp: otp
      }).select().single()

      if (error) throw error

      setActiveRide(rideResponse)

      // Setup Realtime listener
      supabase
        .channel(`public:rides:id=${rideResponse.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideResponse.id}` },
          (payload) => {
            const updatedRide = payload.new
            setActiveRide(updatedRide)
          }
        )
        .subscribe()

    } catch (e: any) {
      alert('Error booking ride: ' + e.message)
    }
    setSearchingDrivers(false)
  }

  return (
    <div className="flex flex-col w-full bg-gray-50 relative" style={{ height: '100dvh' }}>
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 text-center font-bold text-gray-800 flex justify-between items-center">
        <span>{locating ? 'Finding your location...' : !dropoff ? 'Tap map to set Drop-off' : 'Confirm your Ride'}</span>
        
        {/* Recenter button */}
        <button 
          onClick={locateUser}
          className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Use current location"
        >
          📍
        </button>
      </div>
      
      <div className="flex-1 w-full z-0 relative">
        <RideMap pickup={pickup} dropoff={dropoff} setDropoff={setDropoff} />
      </div>

      {dropoff && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] p-6 pb-8 space-y-4 transform transition-transform overflow-y-auto max-h-[50vh]">
          
          {activeRide ? (
            <div className={`p-6 rounded-xl border-2 text-center ${activeRide.status === 'pending' ? 'border-orange-500 bg-orange-50' : 'border-green-500 bg-green-50'}`}>
              <h2 className={`text-xl font-bold ${activeRide.status === 'pending' ? 'text-orange-600' : 'text-green-600'}`}>
                {activeRide.status === 'pending' ? 'Waiting for Driver to Accept...' : 'Driver Accepted!'}
              </h2>
              {activeRide.status === 'accepted' && (
                <div className="mt-4 text-4xl font-black text-gray-800 tracking-widest">
                  OTP: {activeRide.otp}
                </div>
              )}
            </div>
          ) : drivers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-500">Nearby Drivers</h3>
                <button onClick={() => setDrivers([])} className="text-red-500 font-semibold">Cancel</button>
              </div>
              <div className="space-y-3">
                {drivers.map(driver => (
                  <div key={driver.id} className="bg-gray-50 border p-4 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">
                        {driver.vehicle_type === 'bike' ? '🏍️' : driver.vehicle_type === 'auto' ? '🛺' : driver.vehicle_type === 'sedan' ? '🚙' : driver.vehicle_type === 'suv' ? '🚐' : driver.vehicle_type === 'mini' ? '🚗' : '🚕'}
                      </span>
                      <div>
                        <p className="font-bold text-gray-800">{driver.name}</p>
                        <p className="text-sm text-gray-500">{driver.vehicle_model} • {driver.distance_km.toFixed(1)}km away</p>
                      </div>
                    </div>
                    <button 
                      disabled={searchingDrivers}
                      onClick={() => handleBookDriver(driver)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button 
              disabled={searchingDrivers}
              onClick={searchDrivers}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center active:scale-95"
            >
              {searchingDrivers ? 'Searching...' : 'Find Nearby Drivers'}
            </button>
          )}

        </div>
      )}
    </div>
  )
}

export default function BookRidePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500 text-lg">Loading map...</div>
      </div>
    }>
      <BookRideContent />
    </Suspense>
  )
}
