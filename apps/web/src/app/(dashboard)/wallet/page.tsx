"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, Wallet as WalletIcon, TrendingUp, History, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFunds, setAddingFunds] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (user?.id) {
      loadWallet();
    }
  }, [user]);

  const loadWallet = async () => {
    setLoading(true);
    
    // Get or create wallet
    const { data: wData } = await supabase
      .rpc("get_or_create_wallet", { uid: user?.id })
      .single();
      
    if (wData) {
      setWallet(wData);
      
      // Get transactions
      const { data: tData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", wData.id)
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (tData) setTransactions(tData);
    }
    setLoading(false);
  };

  const handleAddFunds = async (amount: number) => {
    if (!wallet) return;
    setAddingFunds(true);
    
    // Add transaction
    await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount,
      type: "credit",
      description: "Added funds via card"
    });
    
    // Update wallet balance
    await supabase.from("wallets").update({
      balance: parseFloat(wallet.balance) + amount
    }).eq("id", wallet.id);
    
    await loadWallet();
    setAddingFunds(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your digital balance and rewards.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {/* Balance Card - Glassmorphism style */}
        <div className="col-span-1 lg:col-span-2 relative overflow-hidden rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-200 font-medium mb-1">Total Balance</p>
                <h2 className="text-5xl font-bold tracking-tight">₹{wallet?.balance || "0.00"}</h2>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => handleAddFunds(500)}
                disabled={addingFunds}
                className="flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2.5 text-sm font-semibold transition-all"
              >
                {addingFunds ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add ₹500
              </button>
            </div>
          </div>
        </div>

        {/* Rewards Card */}
        <div className="col-span-1 relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-emerald-600 to-emerald-400 shadow-xl text-white">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 font-medium mb-1">Loyalty Points</p>
                <h2 className="text-4xl font-bold">{wallet?.loyalty_points || 0}</h2>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm text-emerald-100">Earn points on every ride & service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-6 bg-muted/30">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold">Recent Transactions</h3>
        </div>
        
        <div className="divide-y divide-border">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No transactions yet.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.description || (tx.type === 'credit' ? 'Fund Added' : 'Payment')}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${tx.type === 'credit' ? 'text-emerald-600' : 'text-foreground'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
