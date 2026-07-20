'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppProvider';

const AdminBulkUpload = ({ onUploadSuccess }) => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    // Defines the CSV format
    const csvContent = "type,title,description,price,detail_1_key,detail_1_value,detail_2_key,detail_2_value\n"
      + "Course,Advanced Math,Grade 10 Syllabus,500,Duration,6 Months,Level,High School\n"
      + "Product,Organic Honey,Fresh from farm,350,Quantity,1 kg,Origin,Ooty\n"
      + "Loan,Student Laptop Loan,No collateral,100000,Interest,5%,Tenure,24 Months";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "thamizhan_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data;
        let successCount = 0;
        let errorCount = 0;

        const payload = rows.map(row => {
          const details = {};
          if (row.detail_1_key && row.detail_1_value) details[row.detail_1_key] = row.detail_1_value;
          if (row.detail_2_key && row.detail_2_value) details[row.detail_2_key] = row.detail_2_value;

          return {
            lister_id: currentUser.id,
            type: row.type || 'Product',
            title: row.title,
            description: row.description,
            price: parseFloat(row.price) || 0,
            status: 'PENDING', // Send to approval queue
            details: Object.keys(details).length > 0 ? details : null
          };
        });

        try {
          // Chunk inserts if too large, but for now simple insert
          const { error } = await supabase.from('listings').insert(payload);
          if (error) throw error;
          
          successCount = payload.length;
          setResults({ success: successCount, error: 0 });
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        } catch (err) {
          console.error("Bulk upload error", err);
          setResults({ success: 0, error: payload.length, message: err.message });
        } finally {
          setLoading(false);
          e.target.value = null; // Reset input
        }
      },
      error: (error) => {
        console.error(error);
        setResults({ success: 0, error: 1, message: "Failed to parse CSV file." });
        setLoading(false);
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--tech-cyan)', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="var(--tech-cyan)" /> Universal Bulk Injector
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--cool-gray)' }}>
            Upload thousands of items (Courses, Loans, Land, Products) directly. Items will be sent to the Approval Queue.
          </p>
        </div>
        
        <button onClick={downloadTemplate} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px' }}>
          <FileDown size={16} /> Download CSV Template
        </button>
      </div>

      <div style={{ padding: '20px', border: '2px dashed var(--surface-border)', borderRadius: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="bulk-upload-input"
          disabled={loading}
        />
        <label htmlFor="bulk-upload-input" style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--tech-cyan)', color: 'black', padding: '12px', borderRadius: '50%' }}>
              <Upload size={24} />
            </div>
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              {loading ? 'Processing File...' : 'Click to Upload Completed CSV'}
            </span>
          </div>
        </label>
      </div>

      {results && (
        <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', background: results.error > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${results.error > 0 ? '#EF4444' : '#10B981'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: results.error > 0 ? '#EF4444' : '#10B981', marginBottom: '4px' }}>
            {results.error > 0 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            {results.error > 0 ? 'Upload Failed' : 'Upload Successful'}
          </div>
          <div style={{ fontSize: '13px', color: 'white' }}>
            {results.success > 0 && <div>Successfully injected {results.success} items into the live ecosystem.</div>}
            {results.error > 0 && <div style={{ color: '#EF4444' }}>Error: {results.message}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBulkUpload;
