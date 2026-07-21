'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/aishlee/context/AppProvider';
import { profileSyncService } from '@/aishlee/services/profileSyncService';
import { UserCircle, BadgeIcon, FileText, History, LogOut, CheckCircle, Smartphone, MapPin, Share2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function Profile() {
  const { currentUser, logout, updateProfile } = useApp();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadHistory();
    }
  }, [currentUser]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [txs, ords] = await Promise.all([
        profileSyncService.getTransactions(currentUser.id),
        profileSyncService.getOrders(currentUser.id)
      ]);
      setTransactions(txs);
      setOrders(ords);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!currentUser) {
    return <div className="p-8 text-center text-white">Loading profile...</div>;
  }

  const renderTabs = () => (
    <div className="flex overflow-x-auto border-b border-slate-700 mb-6 pb-2 no-scrollbar">
      {[
        { id: 'profile', icon: UserCircle, label: 'Profile' },
        { id: 'digital_id', icon: BadgeIcon, label: 'Digital ID' },
        { id: 'resume', icon: FileText, label: 'Resume' },
        { id: 'history', icon: History, label: 'History' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-t-lg transition-colors
            ${activeTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50' : 'text-gray-400 hover:text-white'}`}
        >
          <tab.icon size={18} />
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        {currentUser.avatar_url ? (
          <img src={currentUser.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full mx-auto border-2 border-slate-600 object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto border-2 border-slate-600 bg-slate-800 flex items-center justify-center">
            <UserCircle size={48} className="text-gray-400" />
          </div>
        )}
        <h2 className="text-2xl font-bold mt-4 text-white">{currentUser.fullName}</h2>
        <p className="text-cyan-400">{currentUser.role || 'User'}</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-4 text-white">
          <Smartphone className="text-cyan-400" size={20} />
          <div>
            <p className="text-xs text-gray-400">WhatsApp</p>
            <p>{currentUser.whatsapp || 'Not provided'}</p>
          </div>
        </div>
        <hr className="border-slate-700" />
        <div className="flex items-center gap-4 text-white">
          <MapPin className="text-cyan-400" size={20} />
          <div>
            <p className="text-xs text-gray-400">Location</p>
            <p>{currentUser.location || 'Not provided'}</p>
          </div>
        </div>
        <hr className="border-slate-700" />
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <BadgeIcon className="text-cyan-400" size={20} />
            <div>
              <p className="text-xs text-gray-400">UPI ID</p>
              {editingUpi ? (
                <div className="flex gap-2 mt-1">
                  <input 
                    type="text" 
                    value={upiValue} 
                    onChange={e => setUpiValue(e.target.value)}
                    placeholder="e.g. name@bank"
                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button 
                    onClick={async () => {
                      if(upiValue.trim()) {
                        await profileSyncService.updateProfile(currentUser.id, { upi_id: upiValue.trim() });
                        updateProfile({ ...currentUser, upi_id: upiValue.trim() });
                        setEditingUpi(false);
                      }
                    }}
                    className="text-cyan-400 text-sm font-bold"
                  >Save</button>
                  <button onClick={() => setEditingUpi(false)} className="text-gray-400 text-sm">Cancel</button>
                </div>
              ) : (
                <p>{currentUser.upi_id || 'Not provided'}</p>
              )}
            </div>
          </div>
          {!editingUpi && (
             <button onClick={() => { setUpiValue(currentUser.upi_id || ''); setEditingUpi(true); }} className="text-gray-400 hover:text-cyan-400">Edit</button>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => {
          logout();
          router.push('/login');
        }}
        className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );

  const renderDigitalId = () => {
    const qrData = currentUser.digital_id_hash || `fago-id-${currentUser.id}`;
    
    return (
      <div className="flex justify-center items-center py-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-400/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-cyan-400 font-bold text-lg">Aishlee ID</span>
            <CheckCircle className="text-cyan-400" size={24} />
          </div>
          
          <div className="bg-white p-4 rounded-xl flex justify-center mb-6">
            <QRCodeSVG value={qrData} size={200} />
          </div>
          
          <div className="text-center">
            <h3 className="text-white text-xl font-bold tracking-wider">{currentUser.fullName?.toUpperCase()}</h3>
            <p className="text-gray-400 text-sm tracking-widest mt-1">{currentUser.role?.toUpperCase()}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderResume = () => {
    const skills: string[] = currentUser.skills ? String(currentUser.skills).split(',').map((s: string) => s.trim()) : [];
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">My Resume</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800 text-cyan-400 rounded-lg hover:bg-slate-700" title="Share URL">
              <Share2 size={20} />
            </button>
            <button className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-slate-700" title="Download PDF">
              <Download size={20} />
            </button>
          </div>
        </div>
        
        {skills.length > 0 && (
          <div>
            <h3 className="text-cyan-400 font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-slate-800 text-white rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div>
           <h3 className="text-cyan-400 font-semibold mb-3">Education</h3>
           <p className="text-white bg-slate-800 p-4 rounded-xl border border-slate-700">
             {currentUser.education_level || 'No education data provided.'}
           </p>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="max-w-4xl mx-auto">
      {loading ? (
        <div className="text-center text-cyan-400">Loading history...</div>
      ) : transactions.length === 0 && orders.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No transactions or history yet.</div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-cyan-400 font-bold text-lg mb-4">Transactions</h3>
          {transactions.map((tx: any) => (
            <div key={tx.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {tx.type === 'CREDIT' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="text-white">{tx.description || 'Transaction'}</p>
                  <p className="text-xs text-gray-400">{tx.reference_module} • {new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 pt-20 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
        {renderTabs()}
        
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'digital_id' && renderDigitalId()}
          {activeTab === 'resume' && renderResume()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </div>
    </div>
  );
}
