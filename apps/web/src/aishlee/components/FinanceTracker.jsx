'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { Database, Link as LinkIcon, Copy, CheckCircle, TrendingUp, TrendingDown, DollarSign, Loader, Calendar, FileText, Tag, ArrowRight } from 'lucide-react';

export default function FinanceTracker() {
  const { currentUser } = useApp();
  const [webAppUrl, setWebAppUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  const [activeView, setActiveView] = useState('Entry'); // Entry, Dashboard
  const [loading, setLoading] = useState(false);
  
  // Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryType, setEntryType] = useState('Expense');
  const [entryCategory, setEntryCategory] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDesc, setEntryDesc] = useState('');

  // Dashboard State
  const [transactions, setTransactions] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('All'); // All, This Month, This Year

  useEffect(() => {
    const savedUrl = localStorage.getItem(`finance_sheet_url_${currentUser?.id}`);
    if (savedUrl) {
      setWebAppUrl(savedUrl);
      setIsConfigured(true);
    }
  }, [currentUser?.id]);

  const handleSaveUrl = () => {
    if (!webAppUrl.trim()) return alert("Please enter a valid Google Apps Script Web App URL.");
    localStorage.setItem(`finance_sheet_url_${currentUser?.id}`, webAppUrl.trim());
    setIsConfigured(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(`finance_sheet_url_${currentUser?.id}`);
    setWebAppUrl('');
    setIsConfigured(false);
  };

  const copyScript = () => {
    const script = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var timestamp = new Date();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Date", "Type", "Category", "Amount", "Description"]);
  }
  
  sheet.appendRow([
    timestamp,
    data.date,
    data.type,
    data.category,
    data.amount,
    data.description
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var result = [];
  var headers = ["timestamp", "date", "type", "category", "amount", "description"];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
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
    if (!entryDate || !entryAmount || !entryCategory) return alert("Please fill required fields");

    setLoading(true);
    try {
      const payload = {
        date: entryDate,
        type: entryType,
        category: entryCategory,
        amount: parseFloat(entryAmount),
        description: entryDesc
      };

      const res = await fetch(webAppUrl, {
        method: 'POST',
        // Omitting Content-Type header to send as text/plain and avoid CORS OPTIONS preflight
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (resData.status === 'success') {
        alert("Entry Added Successfully!");
        setEntryAmount('');
        setEntryDesc('');
        setEntryCategory('');
      } else {
        alert("Failed to save entry.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: Make sure your Web App URL is correct and deployed for 'Anyone'.");
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
    } catch (err) {
      console.error("Failed to fetch", err);
      alert("Error fetching data. Check Web App URL.");
    } finally {
      setFetchingData(false);
    }
  };

  const filterTransactions = () => {
    if (filterPeriod === 'All') return transactions;
    
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (filterPeriod === 'This Month') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (filterPeriod === 'This Year') {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filtered = filterTransactions();
  const totalIncome = filtered.filter(t => t.type === 'Income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpense = filtered.filter(t => t.type === 'Expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  if (!isConfigured) {
    return (
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database color="var(--tech-cyan)" /> Connect Google Sheets Backend
        </h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '24px' }}>
          Use your own personal Google Sheet as a free, unlimited database for tracking Income and Expenses. No backend required!
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>Step 1: Create the Web App</h3>
          <ol style={{ color: 'var(--cool-gray)', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Create a blank Google Sheet.</li>
            <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Delete any code there and paste the script below.</li>
            <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
            <li>Select type: <strong>Web App</strong>.</li>
            <li>Set "Who has access" to <strong>Anyone</strong>, then click Deploy.</li>
            <li>Copy the <strong>Web App URL</strong> it gives you.</li>
          </ol>

          <div style={{ position: 'relative', marginTop: '16px' }}>
            <button 
              onClick={copyScript}
              style={{ position: 'absolute', right: '8px', top: '8px', background: 'var(--tech-cyan)', color: 'black', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copiedScript ? <><CheckCircle size={14}/> Copied!</> : <><Copy size={14}/> Copy Script</>}
            </button>
            <pre style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', color: '#d4d4d4', border: '1px solid #333' }}>
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var timestamp = new Date();
  if (sheet.getLastRow() === 0) sheet.appendRow(["Timestamp", "Date", "Type", "Category", "Amount", "Description"]);
  sheet.appendRow([timestamp, data.date, data.type, data.category, data.amount, data.description]);
  return ContentService.createTextOutput(JSON.stringify({"status":"success"})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  var result = [];
  var headers = ["timestamp", "date", "type", "category", "amount", "description"];
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
              <input 
                type="text" 
                value={webAppUrl}
                onChange={e => setWebAppUrl(e.target.value)}
                placeholder="Paste your Web App URL here..."
                className="input-field"
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>
            <button className="btn-primary" onClick={handleSaveUrl} disabled={!webAppUrl}>
              Connect
            </button>
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
          <button 
            onClick={() => setActiveView('Entry')}
            className={activeView === 'Entry' ? 'btn-primary' : 'btn-outline'}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
          >
            Add Entry
          </button>
          <button 
            onClick={loadDashboard}
            className={activeView === 'Dashboard' ? 'btn-primary' : 'btn-outline'}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
          >
            Balance Sheet
          </button>
        </div>
        <button onClick={handleDisconnect} className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444', fontSize: '12px', padding: '4px 12px' }}>
          Disconnect Sheet
        </button>
      </div>

      {activeView === 'Entry' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '24px' }}>Add Transaction</h2>
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
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setEntryType('Income')} className={entryType === 'Income' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, background: entryType === 'Income' ? '#25D366' : 'transparent', borderColor: '#25D366', color: entryType === 'Income' ? 'white' : '#25D366' }}>
                    <TrendingUp size={16} style={{ marginRight: '8px' }} /> Income
                  </button>
                  <button type="button" onClick={() => setEntryType('Expense')} className={entryType === 'Expense' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, background: entryType === 'Expense' ? '#EF4444' : 'transparent', borderColor: '#EF4444', color: entryType === 'Expense' ? 'white' : '#EF4444' }}>
                    <TrendingDown size={16} style={{ marginRight: '8px' }} /> Expense
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Category</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" className="input-field" required placeholder="e.g. Groceries, Salary..." value={entryCategory} onChange={e => setEntryCategory(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="number" step="0.01" className="input-field" required placeholder="0.00" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '8px' }}>Description / Notes</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <textarea className="input-field" placeholder="Any details..." value={entryDesc} onChange={e => setEntryDesc(e.target.value)} style={{ paddingLeft: '40px', width: '100%', minHeight: '80px', resize: 'vertical' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--tech-cyan)', color: 'black' }}>
              {loading ? <Loader className="spin" size={20} /> : <><ArrowRight size={20} /> Save Transaction</>}
            </button>

          </form>
        </div>
      )}

      {activeView === 'Dashboard' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Balance Sheet</h2>
            <select className="input-field" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
              <option>All</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          {fetchingData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tech-cyan)' }}><Loader className="spin" size={32} /></div>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#25D366', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Income</div>
                  <div style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>₹{totalIncome.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#EF4444', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Expenses</div>
                  <div style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>₹{totalExpense.toLocaleString()}</div>
                </div>
                <div style={{ background: netBalance >= 0 ? 'rgba(0, 229, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: netBalance >= 0 ? '1px solid var(--tech-cyan)' : '1px solid #EF4444', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: netBalance >= 0 ? 'var(--tech-cyan)' : '#EF4444', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Net Balance</div>
                  <div style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>₹{netBalance.toLocaleString()}</div>
                </div>
              </div>

              {/* Transactions Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.5)', textAlign: 'left' }}>
                      <th style={{ padding: '12px', color: 'var(--cool-gray)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date</th>
                      <th style={{ padding: '12px', color: 'var(--cool-gray)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Category</th>
                      <th style={{ padding: '12px', color: 'var(--cool-gray)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Description</th>
                      <th style={{ padding: '12px', color: 'var(--cool-gray)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--cool-gray)' }}>No transactions found for this period.</td></tr>
                    ) : (
                      filtered.map((t, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>{new Date(t.date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              background: t.type === 'Income' ? 'rgba(37,211,102,0.1)' : 'rgba(239,68,68,0.1)', 
                              color: t.type === 'Income' ? '#25D366' : '#EF4444',
                              padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', marginRight: '8px'
                            }}>{t.type}</span>
                            {t.category}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--cool-gray)' }}>{t.description || '-'}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: t.type === 'Income' ? '#25D366' : '#EF4444' }}>
                            {t.type === 'Income' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
