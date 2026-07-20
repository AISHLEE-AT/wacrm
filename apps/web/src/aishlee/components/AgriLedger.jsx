'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppProvider';
import { Database, Link as LinkIcon, Copy, CheckCircle, ArrowRight, Loader, Calendar, User, Package, Clock, DollarSign, Download, Share2, CheckSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AgriLedger() {
  const { currentUser } = useApp();
  const [webAppUrl, setWebAppUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  const [activeView, setActiveView] = useState('Entry'); // Entry, Dashboard
  const [loading, setLoading] = useState(false);
  
  // Ledger Mode
  const [mode, setMode] = useState('Farmer'); // 'Farmer' (Supplying) or 'Vendor' (Receiving)

  // Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyName, setPartyName] = useState('');
  const [commodity, setCommodity] = useState('Milk');
  const [shift, setShift] = useState('Morning');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');

  // Dashboard State
  const [transactions, setTransactions] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [selectedParty, setSelectedParty] = useState('All');
  
  // Adjustment Modal State
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjType, setAdjType] = useState('Payment Received');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjDesc, setAdjDesc] = useState('');
  
  const dashboardRef = useRef(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem(`agri_sheet_url_${currentUser?.id}`);
    if (savedUrl) {
      setWebAppUrl(savedUrl);
      setIsConfigured(true);
    }
  }, [currentUser?.id]);

  const handleSaveUrl = () => {
    if (!webAppUrl.trim()) return alert("Please enter a valid Google Apps Script Web App URL.");
    localStorage.setItem(`agri_sheet_url_${currentUser?.id}`, webAppUrl.trim());
    setIsConfigured(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(`agri_sheet_url_${currentUser?.id}`);
    setWebAppUrl('');
    setIsConfigured(false);
  };

  const copyScript = () => {
    const script = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var timestamp = new Date();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Date", "PartyName", "Commodity", "Shift", "Quantity", "Rate", "Total", "Status"]);
  }
  
  sheet.appendRow([timestamp, data.date, data.partyName, data.commodity, data.shift, data.quantity, data.rate, data.total, data.status]);
  return ContentService.createTextOutput(JSON.stringify({"status":"success"})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var result = [];
  var headers = ["timestamp", "date", "partyName", "commodity", "shift", "quantity", "rate", "total", "status"];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
    result.push(obj);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!entryDate || !partyName || !quantity || !rate) return alert("Please fill all required fields");

    setLoading(true);
    try {
      const payload = {
        date: entryDate,
        partyName: partyName,
        commodity: commodity,
        shift: shift,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        total: parseFloat(quantity) * parseFloat(rate),
        status: 'Unpaid' // Default status for new supplies
      };

      const res = await fetch(webAppUrl, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (resData.status === 'success') {
        alert("Supply Logged Successfully!");
        setQuantity('');
      } else {
        alert("Failed to save entry.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving entry. Make sure Web App URL is deployed as 'Anyone'.");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    setActiveView('Dashboard');
    setFetchingData(true);
    try {
      const res = await fetch(webAppUrl);
      const data = await res.json();
      setTransactions(data);
      if (data.length > 0 && selectedParty === 'All') {
        const uniqueParties = [...new Set(data.filter(t => t.partyName).map(t => t.partyName))];
        if (uniqueParties.length > 0) setSelectedParty(uniqueParties[0]);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching data. Check Web App URL.");
    } finally {
      setFetchingData(false);
    }
  };

  const handleRecordAdjustment = async (e) => {
    e.preventDefault();
    if (selectedParty === 'All') return alert("Select a specific party first.");
    if (!adjAmount) return alert("Please enter an adjustment amount.");

    setLoading(true);
    try {
      const amountValue = parseFloat(adjAmount);
      const payload = {
        date: new Date().toISOString().split('T')[0],
        partyName: selectedParty,
        commodity: adjType + (adjDesc ? ` (${adjDesc})` : ''),
        shift: '-',
        quantity: '-',
        rate: '-',
        total: -amountValue, // Subtract from balance
        status: 'Adjustment'
      };

      const res = await fetch(webAppUrl, { method: 'POST', body: JSON.stringify(payload) });
      const resData = await res.json();
      if (resData.status === 'success') {
        alert("Adjustment Recorded Successfully!");
        setShowAdjModal(false);
        setAdjAmount('');
        setAdjDesc('');
        loadDashboard(); // Refresh data
      }
    } catch (err) {
      console.error(err);
      alert("Failed to record adjustment.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Ledger_Statement_${selectedParty}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const msg = `Hello ${selectedParty},\n\nHere is our supply statement.\nTotal Pending Balance: ₹${pendingBalance.toLocaleString()}\n\nPlease review and process the payout.\n\nThank you!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const partyList = [...new Set(transactions.filter(t => t.partyName).map(t => t.partyName))];
  const partyTransactions = transactions.filter(t => selectedParty === 'All' || t.partyName === selectedParty);
  
  // Calculate Pending Balance (Sum of all 'total' columns for the party. Payouts are negative totals.)
  const pendingBalance = partyTransactions.reduce((sum, t) => sum + (parseFloat(t.total) || 0), 0);

  if (!isConfigured) {
    return (
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database color="var(--tech-cyan)" /> Connect Agri Ledger Backend
        </h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '24px' }}>
          Use a dedicated Google Sheet to track your daily agricultural supplies (Milk, Flowers, etc.) and vendor payouts securely.
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>Step 1: Create the Web App</h3>
          <ol style={{ color: 'var(--cool-gray)', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Create a new blank Google Sheet.</li>
            <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Delete any code there and paste the script below.</li>
            <li>Click <strong>Deploy &gt; New deployment</strong> (Select Web App).</li>
            <li>Set "Who has access" to <strong>Anyone</strong>, then click Deploy.</li>
            <li>Copy the <strong>Web App URL</strong>.</li>
          </ol>

          <div style={{ position: 'relative', marginTop: '16px' }}>
            <button onClick={copyScript} style={{ position: 'absolute', right: '8px', top: '8px', background: 'var(--tech-cyan)', color: 'black', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {copiedScript ? <><CheckCircle size={14}/> Copied!</> : <><Copy size={14}/> Copy Script</>}
            </button>
            <pre style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', color: '#d4d4d4', border: '1px solid #333' }}>
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var timestamp = new Date();
  if (sheet.getLastRow() === 0) sheet.appendRow(["Timestamp", "Date", "PartyName", "Commodity", "Shift", "Quantity", "Rate", "Total", "Status"]);
  sheet.appendRow([timestamp, data.date, data.partyName, data.commodity, data.shift, data.quantity, data.rate, data.total, data.status]);
  return ContentService.createTextOutput(JSON.stringify({"status":"success"})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  var result = [];
  var headers = ["timestamp", "date", "partyName", "commodity", "shift", "quantity", "rate", "total", "status"];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
    result.push(obj);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}`}
            </pre>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '24px' }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>Step 2: Connect</h3>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <LinkIcon size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input type="text" value={webAppUrl} onChange={e => setWebAppUrl(e.target.value)} placeholder="Paste your Web App URL here..." className="input-field" style={{ paddingLeft: '40px', width: '100%' }} />
            </div>
            <button className="btn-primary" onClick={handleSaveUrl} disabled={!webAppUrl}>Connect</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveView('Entry')} className={activeView === 'Entry' ? 'btn-primary' : 'btn-outline'} style={{ borderRadius: '20px', padding: '6px 16px' }}>
            Daily Dispatch
          </button>
          <button onClick={loadDashboard} className={activeView === 'Dashboard' ? 'btn-primary' : 'btn-outline'} style={{ borderRadius: '20px', padding: '6px 16px' }}>
            Payout Dashboard
          </button>
        </div>
        <button onClick={handleDisconnect} className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444', fontSize: '12px', padding: '4px 12px' }}>
          Disconnect Sheet
        </button>
      </div>

      {activeView === 'Entry' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Record Supply</h2>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setMode('Farmer')} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: mode === 'Farmer' ? 'var(--tech-cyan)' : 'transparent', color: mode === 'Farmer' ? 'black' : 'var(--cool-gray)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>I am a Farmer</button>
              <button onClick={() => setMode('Vendor')} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: mode === 'Vendor' ? 'var(--tech-cyan)' : 'transparent', color: mode === 'Vendor' ? 'black' : 'var(--cool-gray)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>I am a Vendor</button>
            </div>
          </div>
          
          <form onSubmit={handleAddEntry} style={{ display: 'grid', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="date" className="input-field" required value={entryDate} onChange={e => setEntryDate(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>
                  {mode === 'Farmer' ? 'Vendor / Buyer Name' : 'Farmer / Supplier Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" className="input-field" required placeholder={mode === 'Farmer' ? 'e.g. Aavin Society' : 'e.g. Ramesh'} value={partyName} onChange={e => setPartyName(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Commodity</label>
                <div style={{ position: 'relative' }}>
                  <Package size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" className="input-field" required placeholder="e.g. Milk, Flowers..." value={commodity} onChange={e => setCommodity(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Shift</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <select className="input-field" value={shift} onChange={e => setShift(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }}>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Quantity</label>
                <input type="number" step="0.01" className="input-field" required placeholder="e.g. 10.5 (Liters/Kgs)" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Rate per Unit (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="number" step="0.01" className="input-field" required placeholder="e.g. 36.00" value={rate} onChange={e => setRate(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--tech-cyan)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--tech-cyan)', fontWeight: 'bold' }}>Total Value:</span>
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>₹{((parseFloat(quantity) || 0) * (parseFloat(rate) || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--tech-cyan)', color: 'black' }}>
              {loading ? <Loader className="spin" size={20} /> : <><ArrowRight size={20} /> Log Supply</>}
            </button>
          </form>
        </div>
      )}

      {activeView === 'Dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ color: 'var(--cool-gray)' }}>Select Party:</label>
              <select className="input-field" value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)} style={{ minWidth: '200px' }}>
                <option value="All">-- Select Party --</option>
                {partyList.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
              </select>
            </div>
            
            {selectedParty !== 'All' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleShareWhatsApp} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#25D366', borderColor: '#25D366' }}>
                  <Share2 size={16} /> WhatsApp
                </button>
                <button onClick={handleExportPDF} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} /> Export PDF
                </button>
              </div>
            )}
          </div>

          {fetchingData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tech-cyan)' }}><Loader className="spin" size={32} /></div>
          ) : selectedParty === 'All' ? (
             <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--cool-gray)' }}>
               Please select a specific Party (Vendor or Farmer) from the dropdown above to view their statement.
             </div>
          ) : (
            <div ref={dashboardRef} className="glass-panel" style={{ padding: '40px', background: 'white', color: 'black' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111' }}>Supply Statement</h1>
                  <div style={{ color: '#555', fontSize: '14px' }}>Statement For: <strong>{selectedParty}</strong></div>
                  <div style={{ color: '#555', fontSize: '14px' }}>Date Printed: {new Date().toLocaleDateString()}</div>
                </div>
                
                <div style={{ background: pendingBalance > 0 ? '#FEF2F2' : '#F0FDF4', padding: '16px 24px', borderRadius: '8px', border: pendingBalance > 0 ? '1px solid #FECACA' : '1px solid #BBF7D0', textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: pendingBalance > 0 ? '#DC2626' : '#16A34A', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Pending Balance</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: pendingBalance > 0 ? '#B91C1C' : '#15803D' }}>
                    ₹{pendingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '32px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>Item</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>Shift</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>Rate</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {partyTransactions.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No records found.</td></tr>
                  ) : (
                    partyTransactions.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: t.total < 0 ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ padding: '12px', color: '#334155' }}>{new Date(t.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', color: '#334155' }}>
                          {t.total < 0 ? <span style={{ color: '#16A34A', fontWeight: 'bold' }}>{t.commodity}</span> : t.commodity}
                        </td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{t.shift}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>{t.total < 0 ? '-' : t.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>{t.total < 0 ? '-' : `₹${t.rate}`}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: t.total < 0 ? '#16A34A' : '#0f172a' }}>
                          {t.total < 0 ? '-' : ''}₹{Math.abs(t.total).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Action Buttons */}
              <div data-html2canvas-ignore style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
                {!showAdjModal ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setShowAdjModal(true)}
                      className="btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#25D366', border: 'none', color: 'white' }}
                    >
                      <CheckSquare size={16} />
                      Record Payment / Deduction / Advance
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '16px', color: '#1e293b' }}>Record Adjustment</h3>
                    <form onSubmit={handleRecordAdjustment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</label>
                        <select className="input-field" value={adjType} onChange={e => setAdjType(e.target.value)} style={{ width: '100%', background: 'white', color: 'black' }}>
                          <option value="Payment Received">Payment Received</option>
                          <option value="Payment Given">Payment Given</option>
                          <option value="Advance Received">Advance Taken</option>
                          <option value="Advance Given">Advance Given</option>
                          <option value="Feed/Material Purchase">Feed / Material Purchased</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Amount (₹)</label>
                        <input type="number" step="0.01" className="input-field" required value={adjAmount} onChange={e => setAdjAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', background: 'white', color: 'black' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description (Optional)</label>
                        <input type="text" className="input-field" value={adjDesc} onChange={e => setAdjDesc(e.target.value)} placeholder="e.g. 2 bags of feed" style={{ width: '100%', background: 'white', color: 'black' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => setShowAdjModal(false)} className="btn-outline" style={{ color: '#64748b', borderColor: '#cbd5e1' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'var(--tech-cyan)', color: 'black', border: 'none' }}>
                           {loading ? <Loader className="spin" size={16} /> : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
