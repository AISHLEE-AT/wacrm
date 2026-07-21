// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { Users, Shield, UserCheck, Database, Copy, CheckCircle, Loader, Download, FileText, ClipboardCheck } from 'lucide-react';
import { ecosystemService } from '@/aishlee/services/ecosystemService';
import { marketplaceSheetsService } from '@/aishlee/services/marketplaceSheetsService';
import { dashboardSheetsService } from '@/aishlee/services/dashboardSheetsService';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { purchaseService } from '@/aishlee/services/purchaseService';

export default function AdminO() {
  const { currentUser, allUsers, assignUserToAdmin } = useApp();
  const [loadingId, setLoadingId] = useState<any>(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };
  
  // Backup URL (Push to Sheets)
  const [backupUrl, setBackupUrl] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // CSV Import URLs (Pull from Sheets)
  const [csvUrls, setCsvUrls] = useState({
    lms: '', marketplace: '', finance: '', jobs: '', media: '', lmsYoutube: ''
  });
  const [csvConfigured, setCsvConfigured] = useState({
    lms: false, marketplace: false, finance: false, jobs: false, media: false, lmsYoutube: false
  });
  const [syncing, setSyncing] = useState(false);
  const [syncingLms, setSyncingLms] = useState(false);

  // Report State
  const [reportCategory, setReportCategory] = useState('All');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [uniqueCategories, setUniqueCategories] = useState<any[]>([]);
  
  // Payment Approvals
  const [paymentApprovalInput, setPaymentApprovalInput] = useState<string>('');
  const [approvingPayments, setApprovingPayments] = useState(false);
  const [pendingPurchasesList, setPendingPurchasesList] = useState<any[]>([]);

  const [salesStats, setSalesStats] = useState({ lms: 0, products: 0 });

  const loadSalesStats = async () => {
    try {
      const { data, error } = await supabase.from('purchases').select('item_type').eq('status', 'APPROVED');
      if (!error && data) {
        const lmsCount = data.filter(p => p.item_type && p.item_type.toLowerCase() === 'course').length;
        const productsCount = data.filter(p => p.item_type && p.item_type.toLowerCase() !== 'course').length;
        setSalesStats({ lms: lmsCount, products: productsCount });
      }
    } catch (e) {
      console.error("Failed to load sales stats", e);
    }
  };

  const loadPendingPurchases = async () => {
    try {
      const data = await purchaseService.getPendingPurchases();
      setPendingPurchasesList(data || []);
    } catch (e) {
      console.error("Failed to load pending purchases", e);
    }
  };

  useEffect(() => {
    loadPendingPurchases();
    loadSalesStats();
  }, []);

  const handleApprovePayments = async () => {
    if (!paymentApprovalInput.trim()) return showToast("Please enter payment IDs to approve.", 'error');
    setApprovingPayments(true);
    try {
      const ids = paymentApprovalInput.split(',').map(id => id.trim()).filter(Boolean);
      const res = await purchaseService.bulkApprovePayments(ids);
      showToast(`Successfully approved ${res.updatedCount} payments!`, 'success');
      setPaymentApprovalInput('');
      loadPendingPurchases(); // Reload list after approval
    } catch (e) {
      showToast(`Error approving payments: ${e.message}`, 'error');
    }
    setApprovingPayments(false);
  };

  useEffect(() => {
    const savedBackup = localStorage.getItem('master_backup_url');
    if (savedBackup) {
      setBackupUrl(savedBackup);
      setIsConfigured(true);
    }

    const loadCsvUrl = (key) => {
      const url = localStorage.getItem(`csv_url_${key}`);
      if (url) {
        setCsvUrls(prev => ({ ...prev, [key]: url }));
        setCsvConfigured(prev => ({ ...prev, [key]: true }));
      }
    };
    ['lms', 'marketplace', 'finance', 'jobs', 'media', 'lmsYoutube'].forEach(loadCsvUrl);
    
    Promise.all([
      ecosystemService.getListings(),
      marketplaceSheetsService.fetchListings().catch(() => [])
    ]).then(([dbListings, sheetListings]) => {
      const allListings = [...dbListings, ...sheetListings];
      const cats = [...new Set(allListings.map(l => l.category).filter(Boolean))];
      setUniqueCategories(cats);
    });
  }, []);

  if (currentUser?.role !== 'Super Admin') {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Access Denied. Super Admins only.</div>;
  }

  const localAdmins = allUsers.filter(u => u.role === 'Admin' || u.role === 'Local Admin');
  const standardUsers = allUsers.filter(u => u.role === 'User');

  // Calculate allocations
  const adminAllocationCount = {};
  localAdmins.forEach(admin => {
    adminAllocationCount[admin.id] = allUsers.filter(u => u.allotted_to === admin.id).length;
  });

  const handleAssign = async (userId, adminId) => {
    setLoadingId(userId);
    try {
      await assignUserToAdmin(userId, adminId);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to assign user.", 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveUrl = () => {
    if (!backupUrl.trim()) return showToast("Please enter a Google Sheet URL.", 'error');
    localStorage.setItem('master_backup_url', backupUrl.trim());
    setIsConfigured(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('master_backup_url');
    setBackupUrl('');
    setIsConfigured(false);
  };

  const handleSaveCsvUrl = (key) => {
    if (!csvUrls[key].trim()) return showToast(`Please enter a valid CSV URL for ${key}`, 'error');
    localStorage.setItem(`csv_url_${key}`, csvUrls[key].trim());
    setCsvConfigured(prev => ({ ...prev, [key]: true }));
  };

  const handleDisconnectCsv = (key) => {
    localStorage.removeItem(`csv_url_${key}`);
    setCsvUrls(prev => ({ ...prev, [key]: '' }));
    setCsvConfigured(prev => ({ ...prev, [key]: false }));
  };

  const copyScript = () => {
    const scriptCode = `function doPost(e) {
  var data;
  try {
    // Try reading from form data first (CORS safe method)
    data = JSON.parse(e.parameter.data);
  } catch (err: any) {
    // Fallback for raw JSON payload
    data = JSON.parse(e.postData.contents);
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.action === 'custom_report') {
    var reportSheet = ss.getSheetByName('Custom Report');
    if (!reportSheet) { reportSheet = ss.insertSheet('Custom Report'); }
    reportSheet.clear();
    
    if (data.reportData && data.reportData.length > 0) {
      var headers = Object.keys(data.reportData[0]);
      var rows = [headers];
      for (var i = 0; i < data.reportData.length; i++) {
        var row = [];
        for (var h = 0; h < headers.length; h++) {
          row.push(data.reportData[i][headers[h]]);
        }
        rows.push(row);
      }
      reportSheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    }
    return ContentService.createTextOutput(JSON.stringify({"status":"success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'sync_all') {
    
    // Process Users Sheet
    var usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) {
      usersSheet = ss.insertSheet('Users');
    }
    usersSheet.clear();
    
    if (data.users && data.users.length > 0) {
      var userHeaders = Object.keys(data.users[0]);
      var userRows = [userHeaders];
      for (var i = 0; i < data.users.length; i++) {
        var row = [];
        for (var h = 0; h < userHeaders.length; h++) {
          row.push(data.users[i][userHeaders[h]]);
        }
        userRows.push(row);
      }
      usersSheet.getRange(1, 1, userRows.length, userRows[0].length).setValues(userRows);
    }

    // Process Listings Sheet
    var listingsSheet = ss.getSheetByName('Listings');
    if (!listingsSheet) {
      listingsSheet = ss.insertSheet('Listings');
    }
    listingsSheet.clear();
    
    if (data.listings && data.listings.length > 0) {
      var listHeaders = Object.keys(data.listings[0]);
      var listRows = [listHeaders];
      for (var i = 0; i < data.listings.length; i++) {
        var row = [];
        for (var h = 0; h < listHeaders.length; h++) {
          row.push(data.listings[i][listHeaders[h]]);
        }
        listRows.push(row);
      }
      listingsSheet.getRange(1, 1, listRows.length, listRows[0].length).setValues(listRows);
    }

    return ContentService.createTextOutput(JSON.stringify({"status":"success"})).setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSyncDatabase = async () => {
    if (!backupUrl) return showToast("Please connect Master Database Backup first.", 'error');
    setSyncing(true);
    try {
      // 1. Fetch Users
      const { data: users, error: usersErr } = await supabase.from('profiles').select('*');
      if (usersErr) throw usersErr;

      // 2. Fetch Listings
      const { data: listings, error: listingsErr } = await supabase.from('listings').select('*');
      if (listingsErr) throw listingsErr;

      // 3. Push to Google Sheets Web App
      const payload = { action: 'sync_all', users, listings };
      await fetch(backupUrl, { 
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: JSON.stringify(payload) })
      });
      
      showToast("Database successfully backed up to Master Google Sheet! (Request sent)", 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Error syncing to Google Sheets: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncLMS = async () => {
    setSyncingLms(true);
    try {
      const stats = await dashboardSheetsService.importToSupabase(supabase);
      if (stats.success) {
        showToast("LMS Data successfully synced from Google Sheets!", 'success');
      } else {
        showToast(`Failed to sync LMS data: ${stats.message}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error syncing LMS: ${err.message}`, 'error');
    } finally {
      setSyncingLms(false);
    }
  };

  const getFilteredReportData = async () => {
    const dbListings = await ecosystemService.getListings();
    const sheetListings = await marketplaceSheetsService.fetchListings().catch(() => []);
    
    const allListings = [...dbListings, ...sheetListings];
    const filtered = reportCategory === 'All' 
      ? allListings 
      : allListings.filter(l => l.category === reportCategory);

    return filtered.map(l => ({
      ID: l.id || '',
      Title: l.title || '',
      Category: l.category || '',
      Status: l.status || 'PUBLISHED',
      Price: l.price || '',
      Owner: l.profiles?.full_name || l.origin || 'Unknown',
      Contact: l.profiles?.whatsapp || l.contact_info || '',
      Description: l.description || '',
      Date_Listed: l.created_at ? new Date(l.created_at).toLocaleString() : new Date().toLocaleString()
    }));
  };

  const handleGenerateReport = async () => {
     if (!backupUrl) return showToast("Please connect Master Database Backup first.", 'error');
     setGeneratingReport(true);
     try {
       const reportData = await getFilteredReportData();
       if (reportData.length === 0) return showToast("No data found for this category.", 'error');

       const payload = { action: 'custom_report', reportData };
       await fetch(backupUrl, { 
         method: 'POST',
         mode: 'no-cors',
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         body: new URLSearchParams({ data: JSON.stringify(payload) })
       });
       
       showToast("Custom Report successfully pushed to Google Sheets (Tab: 'Custom Report')! (Request sent)", 'success');
     } catch (err: any) {
       console.error(err);
       showToast("Error generating report.", 'error');
     } finally {
       setGeneratingReport(false);
     }
  };

  const handleDownloadCsv = async () => {
    const reportData = await getFilteredReportData();
    if (reportData.length === 0) return showToast("No data found for this category.", 'error');

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${reportCategory}_Listings_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCsvTemplate = (module) => {
    let csvContent = "";
    let filename = "";
    if (module === 'lms') {
      csvContent = "Title_Name,Description_Purpose,Category,Pincode,ApprovalStatus,Language,Links_Data,Additional_Info,Price,Coach_Guide_Name,Contact_Whatsapp\nPython for Beginners,Learn basic Python programming,IT Training,600001,PUBLISHED,English,https://youtube.com/watch?v=demo,Intro course,999,Aishlee Tech,919344532738";
      filename = "Thamizhan_LMS_Template.csv";
    } else if (module === 'marketplace') {
      csvContent = "Title_Name,Description_Purpose,Category,Permanent_Pincode,ApprovalStatus,Language,Links_Data,Additional_Info\nArduino Kit,Basic electronics kit for students,Hardware,641001,PUBLISHED,Tamil,https://example.com/buy,Includes 10 sensors";
      filename = "Thamizhan_LocalMarket_Template.csv";
    } else if (module === 'finance') {
      csvContent = "Title_Name,Description_Purpose,Category,Permanent_Pincode,ApprovalStatus,Language,Links_Data,Additional_Info\nPersonal Loan,Low interest personal loans,Finance,600001,PUBLISHED,English,https://bank.com,Up to 5 Lakhs";
      filename = "Thamizhan_Finance_Template.csv";
    } else if (module === 'jobs') {
      csvContent = "JobTitle,Category,Location,ApplyLink,DateAdded\nTNPSC Group 4 VAO,Government,Tamil Nadu,https://tnpsc.gov.in,2026-06-26";
      filename = "Thamizhan_Jobs_Template.csv";
    } else if (module === 'media') {
      csvContent = "News_TN_Headline,News_TN_Source,News_TN_Date,News_TN_URL,News_India_Headline,News_India_Source,News_India_Date,News_India_URL,News_World_Headline,News_World_Source,News_World_Date,News_World_URL,Poll_Question,Poll_Opt1,Poll_Opt2,Poll_Opt3,Thirukkural,Thirukkural_Meaning,Quote,Quote_Author,GK_Question,GK_Answer\nTN Govt launches new scheme,BBC Tamil,2026-06-26,https://bbc.com,India wins World Cup,BBC News,2026-06-26,https://bbc.com,Global Tech Summit 2026,Reuters,2026-06-26,https://reuters.com,How do you feel about Digital ID?,It's amazing!,Needs work,Not sure,அகர முதல,Meaning,The best way to predict the future is to create it.,Peter Drucker,Longest river in TN?,Kaveri";
      filename = "Thamizhan_Media_Template.csv";
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="var(--tech-cyan)" size={36} />
          <div>
            <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0 }}>Aishlee Super Admin</h1>
            <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Allot Users to Local Admins (Max 100/Admin recommended)</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => window.location.href = '/admin/ai-notes-generator'}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--tech-gold)', color: 'black' }}
          >
            <FileText size={20} />
            AI Notes
          </button>
          <button 
            onClick={() => window.location.href = '/testo/admin'}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--tech-teal)', color: 'black' }}
          >
            <ClipboardCheck size={20} />
            Manage O-Tests
          </button>
        </div>
      </div>

      {/* WhatsApp CRM & Partner Management Quick Links */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users color="var(--tech-cyan)" size={24} /> Partner & CRM Management
        </h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '24px' }}>
          Quick access to the management interfaces for RidO Drivers, DrivO Providers, and WhatsApp CRM.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn-outline hover-glow" onClick={() => showToast("Opening WhatsApp CRM Interface...", 'info')} style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
            <div style={{ padding: '12px', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', borderRadius: '50%' }}>
              <Users size={32} />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>WhatsApp CRM</div>
            <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>Manage broadcast lists and automated replies</div>
          </button>
          
          <button className="btn-outline hover-glow" onClick={() => showToast("Opening Driver Management...", 'info')} style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', borderRadius: '50%' }}>
              <Users size={32} />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>Driver Management</div>
            <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>Approve and track RidO & DrivO drivers</div>
          </button>
          
          <button className="btn-outline hover-glow" onClick={() => showToast("Opening Provider Management...", 'info')} style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%' }}>
              <Users size={32} />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>Provider Management</div>
            <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>Manage TradeO local businesses & service providers</div>
          </button>
        </div>
      </div>

      {/* Sales Report */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database color="var(--tech-cyan)" size={24} /> Sales Report
        </h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '24px' }}>
          Overview of platform sales and enrollments (Approved Payments).
        </p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            <h3 style={{ color: 'var(--cool-gray)', margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase' }}>LMS Course Enrollments</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--tech-cyan)' }}>
              {salesStats.lms}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--cool-gray)' }}>Total Users Enrolled</p>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            <h3 style={{ color: 'var(--cool-gray)', margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase' }}>Products / Services</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--tech-teal)' }}>
              {salesStats.products}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--cool-gray)' }}>Total Purchased</p>
          </div>
        </div>
      </div>

      {/* Admin Payment Approvals */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle color="var(--tech-cyan)" size={24} /> Bulk Payment Approvals
        </h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '16px' }}>
          Paste comma-separated Payment IDs here (e.g. T2023051422, TXN9876543) that you have verified from your bank. This will immediately unlock the purchased Courses and Marketplace Assets for the users.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Paste Payment IDs here..." 
            value={paymentApprovalInput}
            onChange={e => setPaymentApprovalInput(e.target.value)}
            className="input-field"
            style={{ flex: 1, padding: '12px' }}
          />
          <button 
            onClick={handleApprovePayments} 
            disabled={approvingPayments || !paymentApprovalInput.trim()} 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '16px' }}
          >
            {approvingPayments ? <Loader size={20} className="spin" /> : <CheckCircle size={20} />}
            {approvingPayments ? 'Approving...' : 'Approve IDs'}
          </button>
        </div>

        <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {pendingPurchasesList.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px', color: 'var(--cool-gray)', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '12px', color: 'var(--cool-gray)', fontWeight: '600' }}>User Name</th>
                  <th style={{ padding: '12px', color: 'var(--cool-gray)', fontWeight: '600' }}>Payment ID</th>
                  <th style={{ padding: '12px', color: 'var(--cool-gray)', fontWeight: '600' }}>Item</th>
                  <th style={{ padding: '12px', color: 'var(--cool-gray)', fontWeight: '600' }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {pendingPurchasesList.map(p => {
                  const bName = p.buyer_name || p.profiles?.full_name || 'Unknown';
                  const bContact = p.buyer_contact || p.profiles?.whatsapp || null;

                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: 'white' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', color: 'white' }}>{bName}</td>
                      <td style={{ padding: '12px', color: 'var(--tech-cyan)', fontWeight: 'bold' }}>{p.payment_id}</td>
                      <td style={{ padding: '12px', color: 'white' }}>{p.item_type} ID: {p.item_id}</td>
                      <td style={{ padding: '12px' }}>
                        {bContact ? (
                          <a href={`https://wa.me/${(String(bContact).replace(/\D/g, '').length === 10 ? '91' + String(bContact).replace(/\D/g, '') : String(bContact).replace(/\D/g, ''))}?text=Hello ${bName}, regarding your payment ${p.payment_id}...`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            WhatsApp
                          </a>
                        ) : (
                          <span style={{ color: 'var(--cool-gray)' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cool-gray)' }}>
              No pending payments found. When users submit a Payment ID, it will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Database Backup Hub (App to Sheets) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database color="var(--tech-cyan)" size={24} /> Master Database Backup (App to Sheets)
            </h2>
            <p style={{ color: 'var(--cool-gray)', marginBottom: '24px' }}>
              Instantly backup all Users (profiles, courses, tests) and Ecosystem Listings to a Master Google Sheet.
            </p>
          </div>
        </div>

        {!isConfigured ? (
          <div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
              <h3 style={{ color: 'white', marginTop: 0 }}>Step 1: Create Master Sheet</h3>
              <ol style={{ color: 'var(--cool-gray)', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '16px' }}>
                <li>Create a blank Google Sheet.</li>
                <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Paste the script below and Deploy as a <strong>Web App</strong> (Access: Anyone).</li>
                <li>Copy the Web App URL.</li>
              </ol>
              <button onClick={copyScript} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                {copiedScript ? <><CheckCircle size={14}/> Copied!</> : <><Copy size={14}/> Copy Master Script</>}
              </button>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ color: 'white', marginTop: 0 }}>Step 2: Connect</h3>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <input 
                  type="text" 
                  value={backupUrl}
                  onChange={e => setBackupUrl(e.target.value)}
                  placeholder="Paste Master Web App URL here..."
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={handleSaveUrl} disabled={!backupUrl}>Connect</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '24px', borderRadius: '8px', border: '1px solid var(--tech-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--tech-cyan)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Backup Connected
                </h3>
                <div style={{ color: 'var(--cool-gray)', fontSize: '13px', wordBreak: 'break-all' }}>URL: {backupUrl}</div>
              </div>
              <button onClick={handleDisconnect} className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }}>Disconnect</button>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                onClick={handleSyncDatabase} 
                disabled={syncing}
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', background: 'linear-gradient(90deg, var(--tech-cyan) 0%, var(--tech-blue) 100%)', color: 'white', border: 'none' }}
              >
                {syncing ? <Loader className="spin" size={24} /> : <Database size={24} />}
                {syncing ? 'Syncing Database... Please Wait' : 'Sync Entire Database Now'}
              </button>
              <p style={{ textAlign: 'center', color: 'var(--cool-gray)', fontSize: '12px', marginTop: '12px' }}>
                This will overwrite the Master Google Sheet with a fresh snapshot of all users and listings.
              </p>
            </div>
          </div>
        )}

        {isConfigured && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="var(--tech-cyan)" size={20} /> Custom Category Reports
            </h3>
            <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '16px' }}>
              Select a specific category (e.g., Agriculture, Scrap/Waste) to extract targeted data.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <select 
                className="input-field" 
                value={reportCategory}
                onChange={e => setReportCategory(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button 
                onClick={handleGenerateReport} 
                disabled={generatingReport}
                className="btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tech-cyan)', borderColor: 'var(--tech-cyan)' }}
              >
                {generatingReport ? <Loader className="spin" size={18} /> : <Database size={18} />}
                Push to Google Sheets
              </button>

              <button 
                onClick={handleDownloadCsv} 
                className="btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}
              >
                <Download size={18} /> Download CSV
              </button>
            </div>
            <p style={{ color: 'var(--cool-gray)', fontSize: '12px', marginTop: '12px' }}>
              * 'Push to Google Sheets' creates/updates a "Custom Report" tab in your connected Master sheet.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left Pane: Local Admins Overview */}
        <div className="glass-panel" style={{ width: '300px', padding: '24px' }}>
          <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--tech-cyan)" /> Local Admins
          </h2>
          {localAdmins.length === 0 ? (
            <p style={{ color: 'var(--cool-gray)' }}>No Local Admins found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {localAdmins.map(admin => (
                <div key={admin.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{admin.full_name}</div>
                  <div style={{ color: 'var(--cool-gray)', fontSize: '12px' }}>{admin.whatsapp || 'No WhatsApp'}</div>
                  <div style={{ marginTop: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--tech-gold)' }}>Allotted Users:</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{adminAllocationCount[admin.id]} / 100</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px' }}>
                    <div style={{ width: `${Math.min((adminAllocationCount[admin.id] / 100) * 100, 100)}%`, height: '100%', background: 'var(--tech-cyan)', borderRadius: '2px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: User Assignment */}
        <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
          <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--tech-teal)" /> Standard Users ({standardUsers.length})
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', padding: '0 16px 8px 16px', color: 'var(--cool-gray)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              <div style={{ flex: 1 }}>User Details</div>
              <div style={{ width: '250px' }}>Assigned Local Admin</div>
            </div>

            {standardUsers.map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: user.allotted_to ? '3px solid var(--tech-green)' : '3px solid var(--tech-gold)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{user.full_name}</div>
                  <div style={{ color: 'var(--cool-gray)', fontSize: '13px' }}>{user.whatsapp || 'No contact info'}</div>
                </div>
                <div style={{ width: '250px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select 
                    className="input-field" 
                    value={user.allotted_to || ''} 
                    onChange={(e: any) => handleAssign(user.id, e.target.value)}
                    disabled={loadingId === user.id}
                    style={{ padding: '8px', fontSize: '13px' }}
                  >
                    <option value="">-- Unassigned --</option>
                    {localAdmins.map(admin => (
                      <option key={admin.id} value={admin.id}>{admin.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast.show && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '14px 28px', borderRadius: '14px', zIndex: 99999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'success' ? '#10B981' : 'var(--tech-cyan)',
          color: '#fff', fontWeight: '700', fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.3s ease-out',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
