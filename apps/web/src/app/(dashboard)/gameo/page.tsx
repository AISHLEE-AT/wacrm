'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Map as MapIcon, Trophy, Bike, Activity, Play, Settings, Wallet, RefreshCw, ShoppingBag, Gift, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { RewardsService, OfflineSyncService, UserBalance, Coupon } from '@/lib/gameo-supabase/services';
import { toast } from 'sonner'; // Assuming sonner is used for toasts based on typical Next.js setups

// Rewards Catalog
const REWARDS_CATALOG = [
  {
    id: 'reward_1',
    name: '₹50 SuprO Discount',
    description: 'Get ₹50 off your next Agro order',
    points_cost: 500,
    value: 50,
    currency: 'INR',
    type: 'discount'
  },
  {
    id: 'reward_2',
    name: '10% RideO Promo',
    description: '10% off your next RideO trip',
    points_cost: 300,
    value: 10,
    currency: 'PERCENT',
    type: 'discount'
  },
  {
    id: 'reward_3',
    name: 'Free Teacho Course',
    description: 'Unlock one premium Teacho course',
    points_cost: 1500,
    value: 100,
    currency: 'PERCENT',
    type: 'freebie'
  }
];

export default function GameOPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'game' | 'hub'>('game');
  
  // Game State
  const [activeMode, setActiveMode] = useState<'bike' | 'run'>('bike');
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hub State
  const [balance, setBalance] = useState<UserBalance>({ testoPoints: 0, farmPoints: 0 });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data Loading
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const bal = await RewardsService.getUserBalance(user.id);
      setBalance(bal);
      
      const userCoupons = await RewardsService.getUserCoupons(user.id);
      setCoupons(userCoupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'hub' && user) {
      loadData();
    }
  }, [activeTab, user]);

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    const success = await OfflineSyncService.syncPointsToServer(user.id);
    if (success) {
      toast?.success?.('Points Synced Successfully!');
      await loadData();
    } else {
      toast?.error?.('Sync failed');
    }
    setIsSyncing(false);
  };

  const handleRedeem = async (reward: typeof REWARDS_CATALOG[0]) => {
    if (!user) return;
    const totalPoints = balance.testoPoints + balance.farmPoints;
    if (totalPoints < reward.points_cost) {
      toast?.error?.('Not enough points');
      return;
    }

    setIsRedeeming(reward.id);
    const code = await RewardsService.redeemReward(user.id, reward);
    setIsRedeeming(null);

    if (code) {
      toast?.success?.(`Successfully redeemed! Code: ${code}`);
      await loadData();
    } else {
      toast?.error?.('Failed to redeem reward');
    }
  };

  // Mock Game Loop Scaffold for MapRacer India
  useEffect(() => {
    if (activeTab !== 'game' || !gameStarted || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const renderLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw mock road
      ctx.fillStyle = '#334155';
      ctx.fillRect(canvas.width / 4, 0, canvas.width / 2, canvas.height);

      // Draw dashed center line
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 10;
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Draw Player Avatar
      ctx.fillStyle = activeMode === 'bike' ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height - 100, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Add text label to avatar
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeMode === 'bike' ? '🏍️' : '🏃', canvas.width / 2, canvas.height - 130);

      // Speed up offset to simulate movement
      offset += activeMode === 'bike' ? 15 : 5;
      
      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => cancelAnimationFrame(animationId);
  }, [gameStarted, activeMode, activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Gamepad2 className="w-8 h-8" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              MapRacer India <span className="text-xs bg-purple-500/20 text-purple-300 font-normal px-2.5 py-0.5 rounded-full border border-purple-500/30">GameO விளையாட்டு</span>
            </h1>
            <p className="text-sm text-slate-400">Mobile Racing + Fitness built with Antigravity SDK</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button 
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'game' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Play Game
          </button>
          <button 
            onClick={() => setActiveTab('hub')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'hub' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Wallet className="w-4 h-4" /> Rewards Hub
          </button>
        </div>
      </div>

      {activeTab === 'game' ? (
        !gameStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Modes */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> Select Game Mode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveMode('bike')}
                  className={cursor-pointer transition-all rounded-xl p-4 border flex flex-col items-center justify-center text-center gap-3 \}
                >
                  <div className="p-3 bg-red-500/20 text-red-400 rounded-full">
                    <Bike className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Bike Racing</h4>
                    <p className="text-xs text-slate-400 mt-1">High-speed street racing</p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveMode('run')}
                  className={cursor-pointer transition-all rounded-xl p-4 border flex flex-col items-center justify-center text-center gap-3 \}
                >
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Fitness Run</h4>
                    <p className="text-xs text-slate-400 mt-1">Real-world stamina mapping</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setGameStarted(true)}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-purple-600/30 mt-4 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" fill="currentColor" /> Start Engine
              </button>
            </div>

            {/* Leaderboard / Stats */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <MapIcon className="w-5 h-5 text-blue-400" /> Active Tournaments (Tamil Nadu)
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="text-sm font-bold text-white">Chennai Coastline Sprint</p>
                      <p className="text-xs text-slate-400">Live • 1,240 Racers</p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-medium">HOT</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="text-sm font-bold text-white">Madurai Heritage Run</p>
                      <p className="text-xs text-slate-400">Starts in 2 hours</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-medium">FITNESS</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Game Engine View */
          <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden relative" style={{ height: '70vh' }}>
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
              width={800}
              height={1200}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-lg pointer-events-auto">
                <p className="text-xs text-slate-400 uppercase">Speed</p>
                <p className="text-2xl font-black text-white font-mono">{activeMode === 'bike' ? '124' : '12'}<span className="text-sm text-slate-500 ml-1">km/h</span></p>
              </div>
              
              <button 
                onClick={() => setGameStarted(false)}
                className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-lg pointer-events-auto"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 pointer-events-none">
              <div className="w-24 h-24 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm pointer-events-auto active:bg-white/30 transition-colors">
                <span className="text-white/50 text-xs uppercase font-bold">Steer</span>
              </div>
              <div className="w-24 h-24 rounded-full border-2 border-purple-500/40 bg-purple-500/20 flex items-center justify-center backdrop-blur-sm pointer-events-auto active:bg-purple-500/50 transition-colors">
                <span className="text-purple-300 text-xs uppercase font-bold">Boost</span>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Rewards Hub */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Balances Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-400" /> My Wallet
                </h3>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={\w-4 h-4 \\} /> 
                  Sync Points
                </button>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-slate-800 rounded-xl" />
                  <div className="h-16 bg-slate-800 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-sm">Testo Points</p>
                      <p className="text-2xl font-bold text-white">{balance.testoPoints}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-indigo-400 text-xl font-black">T</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-sm">Farm Points</p>
                      <p className="text-2xl font-bold text-white">{balance.farmPoints}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-xl font-black">F</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* My Coupons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[350px]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Gift className="w-5 h-5 text-emerald-400" /> My Coupons
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loading ? (
                   <div className="animate-pulse h-20 bg-slate-800 rounded-xl" />
                ) : coupons.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Gift className="w-10 h-10 mb-2 opacity-20" />
                    <p>No coupons yet</p>
                  </div>
                ) : (
                  coupons.map(coupon => (
                    <div key={coupon.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-slate-300">Reward #{coupon.reward_id.substring(0,6)}</span>
                        <span className="text-xs text-slate-500">{new Date(coupon.issued_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-bold">{coupon.coupon_code}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Rewards Store */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ShoppingBag className="w-5 h-5 text-purple-400" /> Rewards Store
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REWARDS_CATALOG.map(reward => {
                const totalPoints = balance.testoPoints + balance.farmPoints;
                const canAfford = totalPoints >= reward.points_cost;
                const redeeming = isRedeeming === reward.id;

                return (
                  <div key={reward.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors rounded-xl p-5 flex flex-col">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">{reward.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">{reward.description}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-amber-400">{reward.points_cost}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">pts</span>
                      </div>
                      
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || redeeming || loading}
                        className={\px-4 py-2 rounded-lg text-sm font-bold transition-all \\}
                      >
                        {redeeming ? 'Redeeming...' : 'Redeem'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: \
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      \}} />
    </div>
  );
}
