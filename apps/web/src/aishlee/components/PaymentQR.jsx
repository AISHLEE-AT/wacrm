'use client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const PaymentQR = ({ amount, upiId = "9486335870@hdfcbank", payeeName = "RAJAKUMARAN S P" }) => {
  // Format the UPI URL
  // upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=INR
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
      
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.3)', 
        padding: '12px 16px', 
        borderRadius: '8px', 
        color: '#EF4444', 
        fontSize: '13px', 
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ STRICT RULE ⚠️</strong>
        Please pay the <strong>exact full amount</strong> of ₹{amount}. Partial payments are strictly prohibited, will cause significant delays requiring manual verification, and partial amounts below the required price will not be refunded.
      </div>

      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        display: 'inline-block',
        margin: '0 auto',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <QRCodeSVG 
          value={upiUrl} 
          size={200}
          level={"H"}
          includeMargin={true}
        />
      </div>

      <div style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '13px', 
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid var(--surface-border)'
      }}>
        After successful payment, please enter your exact <strong>12-digit UPI Reference Number</strong> below to unlock access immediately.
      </div>

    </div>
  );
};
