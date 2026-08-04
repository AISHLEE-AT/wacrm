'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Car, Navigation, MapPin, Phone, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

const RIDE_TYPES = [
  { id: 'auto', name: 'Auto Rickshaw', fare: '₹40 base + ₹15/km', eta: '3 mins away', icon: '🛺' },
  { id: 'mini', name: 'Mini Cab / Hatchback', fare: '₹80 base + ₹18/km', eta: '5 mins away', icon: '🚗' },
  { id: 'sedan', name: 'Prime Sedan', fare: '₹120 base + ₹22/km', eta: '7 mins away', icon: '🚘' },
  { id: 'outstation', name: 'Outstation Travels', fare: '₹14/km (Roundtrip)', eta: 'On Demand', icon: '🚐' },
];

export default function RideOPage() {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [selectedRide, setSelectedRide] = useState('auto');
  const [booked, setBooked] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">🛺</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            RideO <span className="text-xs bg-yellow-500/20 text-yellow-300 font-normal px-2.5 py-0.5 rounded-full border border-yellow-500/30">பயணி & டாக்ஸி சவாரி</span>
          </h1>
          <p className="text-sm text-slate-400">Instant Local Auto, Cab & Outstation Rides with Direct Driver Connection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ride Search Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-yellow-400" /> Book a Ride
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Enter Pickup Location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Drop Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-rose-400" />
                <input
                  type="text"
                  placeholder="Enter Destination / Drop Location"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!pickup || !drop) {
                alert('Please enter both Pickup and Drop location');
                return;
              }
              setBooked(true);
            }}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/20 mt-2"
          >
            {booked ? 'Finding Nearby Driver...' : 'Search Available Drivers'}
          </button>

          {booked && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-4 h-4" /> Driver Dispatched!
              </div>
              <p className="text-xs text-slate-300">
                Driver: <span className="font-semibold text-white">M. Selvam (Auto TN 59 AX 2049)</span>
              </p>
              <p className="text-xs text-slate-400">Estimated Arrival: 3 Minutes</p>
            </div>
          )}
        </div>

        {/* Vehicle Options */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Available Ride Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RIDE_TYPES.map((ride) => (
              <div
                key={ride.id}
                onClick={() => setSelectedRide(ride.id)}
                className={`cursor-pointer bg-slate-900/90 border transition-all rounded-2xl p-5 flex flex-col justify-between space-y-3 ${
                  selectedRide === ride.id
                    ? 'border-yellow-500 ring-1 ring-yellow-500/50 bg-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{ride.icon}</span>
                  <span className="text-xs font-semibold bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                    {ride.eta}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{ride.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{ride.fare}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
