'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShieldCheck, ShieldAlert, Car, Phone, FileText, CheckCircle2, XCircle, Search, RefreshCw, MessageSquare, Download } from 'lucide-react';

interface DriverProfile {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  rc_number: string;
  vehicle_category: string;
  status: string;
  created_at: string;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDrivers(data);
      }
    } catch (e) {
      console.error('Error fetching drivers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const updateDriverStatus = async (driver: DriverProfile, newStatus: string) => {
    setUpdatingId(driver.id);
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', driver.id);

      if (!error) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driver.id ? { ...d, status: newStatus } : d))
        );

        // Send Automated WhatsApp Notification upon Approval
        if (newStatus === 'active') {
          const cleanPhone = driver.phone.replace(/[^\d]/g, '');
          const message = encodeURIComponent(
            `🎉 *Congratulations ${driver.full_name}!*\n\nYour vehicle registration (${driver.rc_number}) and Driving License (${driver.license_number}) have been *VERIFIED & APPROVED* on DriveO!\n\nYou can now go online in your DriveO app and start accepting ride requests in your area.`
          );
          window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportDriversCSV = () => {
    if (drivers.length === 0) return;
    const headers = ['Full Name', 'Phone', 'Vehicle Category', 'License Number', 'RC Number', 'Status', 'Created At'];
    const rows = drivers.map(d => [
      `"${d.full_name}"`,
      `"${d.phone}"`,
      `"${d.vehicle_category}"`,
      `"${d.license_number}"`,
      `"${d.rc_number}"`,
      `"${d.status}"`,
      `"${d.created_at}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wacrm_driver_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.license_number.toLowerCase().includes(search.toLowerCase()) ||
      d.rc_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            DRIV O VERIFICATION & WHATSAPP CRM ENGINE
          </div>
          <h1 className="text-2xl font-black mt-1">Driver & Vehicle Management Portal</h1>
          <p className="text-slate-400 text-xs mt-1">
            Review driver KYC documents, license numbers, RC details, toggle approval & send automated WhatsApp alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportDriversCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchDrivers}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver by name, phone, DL, or RC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
          />
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600">VERIFIED DRIVERS</p>
            <p className="text-xl font-black text-emerald-900">
              {drivers.filter((d) => d.status === 'active').length}
            </p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600">PENDING VERIFICATION</p>
            <p className="text-xl font-black text-amber-900">
              {drivers.filter((d) => d.status === 'pending').length}
            </p>
          </div>
          <ShieldAlert className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      {/* Driver List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading registered drivers...</div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No driver records found. New driver registrations will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Driver Details</th>
                  <th className="p-4">Vehicle Category</th>
                  <th className="p-4">License (DL) & RC</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{driver.full_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {driver.phone}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold border border-slate-200">
                        <Car className="w-3.5 h-3.5 text-orange-500" />
                        {driver.vehicle_category.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-mono text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        DL: <span className="font-bold">{driver.license_number}</span>
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        RC: <span className="font-semibold text-slate-700">{driver.rc_number}</span>
                      </p>
                    </td>
                    <td className="p-4">
                      {driver.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          VERIFIED ACTIVE
                        </span>
                      ) : driver.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          PENDING APPROVAL
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          const cleanPhone = driver.phone.replace(/[^\d]/g, '');
                          const msg = encodeURIComponent(`Hi ${driver.full_name}, checking in from DriveO support regarding your vehicle registration.`);
                          window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                        }}
                        title="Chat on WhatsApp"
                        className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                      {driver.status !== 'active' && (
                        <button
                          disabled={updatingId === driver.id}
                          onClick={() => updateDriverStatus(driver, 'active')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          APPROVE
                        </button>
                      )}
                      {driver.status !== 'suspended' && (
                        <button
                          disabled={updatingId === driver.id}
                          onClick={() => updateDriverStatus(driver, 'suspended')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          SUSPEND
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
