'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function DriverApp() {
  const [user, setUser] = useState<any>(null)
  const [driver, setDriver] = useState<any>(null)
  const [pendingRides, setPendingRides] = useState<any[]>([])
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (driverData) {
        setDriver(driverData)
        loadPendingRides(driverData.account_id)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    // Start tracking location
    if (navigator.geolocation && driver?.status === 'online') {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lng: longitude })
          
          if (driver) {
            await supabase.from('drivers').update({
              current_lat: latitude,
              current_lng: longitude,
              last_location_update: new Date().toISOString()
            }).eq('id', driver.id)
          }
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [driver?.status])

  async function loadPendingRides(accountId: string) {
    const { data } = await supabase
      .from('rides')
      .select('*, contacts(name, phone)')
      .eq('account_id', accountId)
      .eq('status', 'pending')
    
    if (data) setPendingRides(data)
  }

  async function acceptRide(rideId: string) {
    await supabase.from('rides').update({
      status: 'accepted',
      driver_id: driver.id
    }).eq('id', rideId)
    
    await supabase.from('drivers').update({ status: 'busy' }).eq('id', driver.id)
    setDriver({ ...driver, status: 'busy' })
    // Refresh rides
    loadPendingRides(driver.account_id)
  }

  if (!user || !driver) {
    return <div className="p-8 text-center">Loading Driver App...</div>
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="bg-black text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Driver Portal</h1>
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <button 
            onClick={async () => {
              const newStatus = driver.status === 'online' ? 'offline' : 'online'
              await supabase.from('drivers').update({ status: newStatus }).eq('id', driver.id)
              setDriver({ ...driver, status: newStatus })
            }}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              driver.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
            }`}
          >
            {driver.status.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Available Rides</h2>
        {driver.status === 'offline' ? (
          <div className="bg-yellow-100 p-4 rounded-lg text-yellow-800 text-sm">
            Go online to see available ride requests.
          </div>
        ) : pendingRides.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No ride requests nearby.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRides.map(ride => (
              <div key={ride.id} className="bg-white p-4 rounded-xl shadow border">
                <div className="font-medium text-lg mb-2">₹{ride.estimated_price}</div>
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                    <div>{ride.pickup_address}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2"></div>
                    <div>{ride.dropoff_address}</div>
                  </div>
                </div>
                <button 
                  onClick={() => acceptRide(ride.id)}
                  className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800"
                >
                  Accept Ride
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
