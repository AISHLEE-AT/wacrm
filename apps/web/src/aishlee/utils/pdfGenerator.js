import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generateAppointmentOrder = async (application) => {
  // Create a hidden container for the PDF content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = 'white';
  container.style.color = '#1f2937';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.padding = '60px';
  container.style.boxSizing = 'border-box';
  
  // Create the HTML structure
  container.innerHTML = `
    <div style="border: 2px solid #10B981; padding: 40px; border-radius: 8px; position: relative;">
      <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 40px;">
        <h1 style="color: #064E3B; margin: 0 0 10px 0; font-size: 32px; font-weight: 900; letter-spacing: 2px;">AISHLEE TECH</h1>
        <p style="color: #4b5563; margin: 0; font-size: 14px;">Technology Innovation StartUp</p>
        <p style="color: #4b5563; margin: 5px 0 0 0; font-size: 12px;">Chennai, Tamil Nadu, India | hr@aishlee.com</p>
      </div>

      <div style="text-align: right; margin-bottom: 40px;">
        <p style="margin: 0; font-weight: bold;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
        <p style="margin: 5px 0 0 0; color: #6b7280;">Ref: AT-HR-${Math.floor(Math.random() * 10000)}</p>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="margin: 0 0 5px 0;">To,</p>
        <p style="margin: 0; font-weight: bold; font-size: 18px;">${application.profiles?.full_name || 'Candidate'}</p>
        <p style="margin: 5px 0 0 0;">${application.profiles?.location || ''}</p>
      </div>

      <h2 style="text-align: center; text-decoration: underline; margin-bottom: 40px;">APPOINTMENT ORDER</h2>

      <div style="line-height: 1.8;">
        <p>Dear <strong>${application.profiles?.full_name || 'Candidate'}</strong>,</p>
        <p>
          We are pleased to offer you the position of <strong>${application.job_title}</strong> 
          in the <strong>${application.category}</strong> division at Aishlee Tech. 
        </p>
        <p>
          Your qualifications and experience have impressed our administrative team, and we are confident that you will make a significant contribution to our mission of empowering the digital ecosystem.
        </p>
        
        <h4 style="margin-top: 30px; margin-bottom: 10px;">Terms and Conditions:</h4>
        <ul style="margin-top: 0; padding-left: 20px;">
          <li><strong>Role:</strong> ${application.job_title}</li>
          <li><strong>Department:</strong> ${application.category}</li>
          <li><strong>Start Date:</strong> To be mutually agreed upon.</li>
        </ul>
        
        <p style="margin-top: 30px;">
          Please sign and return a copy of this letter to indicate your acceptance of this offer. We look forward to welcoming you to the team.
        </p>
      </div>

      <div style="margin-top: 80px; display: flex; justify-content: space-between;">
        <div>
          <div style="border-bottom: 1px solid #000; width: 200px; margin-bottom: 10px;"></div>
          <p style="margin: 0; font-weight: bold;">Authorized Signatory</p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Super Admin, Aishlee Tech</p>
        </div>
        <div>
          <div style="border-bottom: 1px solid #000; width: 200px; margin-bottom: 10px;"></div>
          <p style="margin: 0; font-weight: bold;">Candidate Signature</p>
        </div>
      </div>
      
      <!-- Watermark -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(16, 185, 129, 0.05); font-weight: 900; z-index: -1; white-space: nowrap; pointer-events: none;">
        OFFICIAL DOCUMENT
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [800, canvas.height * (800 / canvas.width)]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
    
    // Save the PDF
    const fileName = `Appointment_Order_${application.profiles?.full_name?.replace(/\s+/g, '_') || 'Candidate'}.pdf`;
    pdf.save(fileName);
    
    return fileName;
  } catch (err) {
    console.error("Error generating PDF", err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
};
