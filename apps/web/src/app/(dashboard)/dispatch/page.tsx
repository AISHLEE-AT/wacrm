import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dispatch | wacrm',
}

export default async function DispatchPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch pending rides for the user's account
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  let rides = []
  if (profile?.account_id) {
    const { data } = await supabase
      .from('rides')
      .select('*, contacts(name, phone), drivers(status)')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false })
      .limit(50)
    rides = data || []
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Dispatch Dashboard</h1>
        <div className="text-sm text-gray-500">Live monitoring</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-gray-100 rounded-lg h-[600px] flex items-center justify-center border border-gray-200">
          <p className="text-gray-500">Google Maps Live View (Pending Integration)</p>
        </div>

        {/* Ride List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-[600px] overflow-y-auto">
          <h2 className="font-medium text-lg mb-4">Active & Pending Rides</h2>
          {rides.length === 0 ? (
            <p className="text-gray-500 text-sm">No rides found.</p>
          ) : (
            <div className="space-y-4">
              {rides.map((ride: any) => (
                <div key={ride.id} className="p-4 border rounded-md shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{ride.contacts?.name || ride.contacts?.phone || 'Unknown'}</span>
                    <div className="flex gap-2">
                      {ride.is_flagged && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-bold border border-red-300">
                          FLAGGED: {ride.flag_reason}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ride.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Pickup:</span> {ride.pickup_address}</p>
                    <p><span className="font-medium">Dropoff:</span> {ride.dropoff_address}</p>
                    <p><span className="font-medium">Fare:</span> ₹{ride.estimated_price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
