'use client';
import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Award, CheckCircle, ChevronLeft, Loader, Share2, XCircle, AlertTriangle, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppProvider';
import { lmsService } from '../services/lmsService';

export default function TestSeriesRunner({ course, onBack }) {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Attempt Tracking State
  const [completedTests, setCompletedTests] = useState(() => JSON.parse(localStorage.getItem(`completed_tests_${currentUser?.id}`) || '[]'));
  
  useEffect(() => {
    if (currentUser?.id) {
      setCompletedTests(JSON.parse(localStorage.getItem(`completed_tests_${currentUser.id}`) || '[]'));
    }
  }, [currentUser?.id]);

  const [permissionCode, setPermissionCode] = useState('');



  const config = course.curriculum?.[0] || {};
  const { test_source, url, start, end, is_proctored, limit_attempts = true } = config;

  const hasAttempted = limit_attempts && completedTests.includes(course.id);

  // Proctoring State
  const [testStarted, setTestStarted] = useState(!is_proctored);
  const [warningsCount, setWarningsCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (test_source === 'Google Form') {
      setLoading(false);
      return;
    }

    if (!url) {
      setError('Test URL is missing.');
      setLoading(false);
      return;
    }

    const fetchSheet = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let data = results.data;
            if (start && end) {
              const startIdx = parseInt(start) - 1;
              const endIdx = parseInt(end);
              data = data.slice(Math.max(0, startIdx), endIdx);
            }
            setQuestions(data);
            setLoading(false);
          },
          error: (err) => {
            setError('Failed to parse sheet. Make sure it is a public CSV. Error: ' + err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Failed to fetch test data.');
        setLoading(false);
      }
    };
    fetchSheet();
  }, [test_source, url, start, end]);

  // Proctoring Effects
  useEffect(() => {
    if (!testStarted || submitted || !is_proctored) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleWarning("You switched tabs or minimized the window!");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleWarning("You exited Fullscreen mode!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testStarted, submitted, warningsCount]);

  const handleWarning = (msg) => {
    const newCount = warningsCount + 1;
    setWarningsCount(newCount);
    if (newCount >= 3) {
      setWarningMessage("Maximum warnings exceeded. Your test has been auto-submitted.");
      autoSubmit();
    } else {
      setWarningMessage(`${msg} Warning ${newCount} of 3.`);
    }
  };

  const startProctoredTest = async () => {
    try {
      // Request Camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      // Request Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      
      setTestStarted(true);
      
      // Attach stream to video element slightly delayed to ensure rendering
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 500);

    } catch (err) {
      alert("You must allow Camera access to start this proctored test!");
      console.error(err);
    }
  };

  const cleanupProctoring = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleSelectOption = (qIndex, optionKey) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: optionKey });
  };

  const calculateScore = () => {
    let newScore = 0;
    questions.forEach((q, idx) => {
      const correctAns = q['Answer']?.trim().toUpperCase();
      const userAns = answers[idx]; // 'A', 'B', 'C', 'D'
      if (userAns === correctAns) {
        newScore += 1;
      }
    });
    setScore(newScore);
  };

  const autoSubmit = () => {
    calculateScore();
    setSubmitted(true);
    cleanupProctoring();
    // Save completion for attempt limiting
    if (limit_attempts && !completedTests.includes(course.id)) {
      const updated = [...completedTests, course.id];
      setCompletedTests(updated);
      localStorage.setItem(`completed_tests_${currentUser?.id}`, JSON.stringify(updated));
    }
  };

  const handleUnlockRetake = async () => {
    if (permissionCode.trim().toUpperCase() === (course.access_code || 'RESET123').toUpperCase()) {
      const updated = completedTests.filter(id => id !== course.id);
      setCompletedTests(updated);
      localStorage.setItem(`completed_tests_${currentUser?.id}`, JSON.stringify(updated));
      setPermissionCode('');
      
      try {
        if (course.access_code) {
          await lmsService.updateCourseAccessCode(course.id, null);
        }
      } catch (err) {
        console.error("Failed to consume retake code:", err);
      }
      
      alert("Retake Unlocked Successfully! The Permission Code has been consumed.");
    } else {
      alert("Invalid Permission Code.");
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("You have unanswered questions. Submit anyway?")) return;
    }
    autoSubmit();
  };

  const handleBack = () => {
    cleanupProctoring();
    onBack();
  };

  const handleShareWhatsApp = () => {
    const adminNum = course.profiles?.whatsapp ? course.profiles.whatsapp.replace(/\D/g, '') : '';
    if (!adminNum) {
      alert("The Instructor hasn't linked a WhatsApp number to their profile yet.");
      return;
    }
    const msg = `Hi Admin, I just completed the Test Series: ${course.title} and scored ${score} out of ${questions.length}!`;
    window.open(`https://wa.me/${(String(adminNum).replace(/\D/g, '').length === 10 ? '91' + String(adminNum).replace(/\D/g, '') : String(adminNum).replace(/\D/g, ''))}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadCertificate = async (type) => {
    setDownloadingCert(true);
    const element = document.getElementById('test-certificate-node');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      if (type === 'image') {
        const link = document.createElement('a');
        link.download = `Certificate_${course.title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (type === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'px', [canvas.width, canvas.height]);
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err) {
      console.error("Certificate download failed", err);
    } finally {
      setDownloadingCert(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tech-cyan)' }}><Loader className="spin" size={32} style={{ margin: '0 auto 16px' }} /> Loading Test Series...</div>;
  if (error) return <div style={{ color: '#EF4444', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>;

  // Render Attempt Limit Screen
  if (hasAttempted) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <XCircle size={64} color="#EF4444" style={{ margin: '0 auto 24px auto' }} />
        <h2 style={{ color: 'white', margin: '0 0 16px 0' }}>Attempt Limit Reached</h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '32px' }}>
          Taking tests on our portal is limited to one attempt to maintain integrity. You have already completed this test.
        </p>
        
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ color: 'white', margin: '0 0 16px 0' }}>Need to retake?</h4>
          <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '16px' }}>Ask the creator for a Retake Permission Code.</p>
          <button 
            onClick={() => {
              const num = course.profiles?.whatsapp ? course.profiles.whatsapp.replace(/\D/g, '') : '';
              if (!num) {
                alert("The Instructor hasn't linked a WhatsApp number to their profile yet. Please contact support.");
                return;
              }
              window.open(`https://wa.me/${(String(num).replace(/\D/g, '').length === 10 ? '91' + String(num).replace(/\D/g, '') : String(num).replace(/\D/g, ''))}?text=Hi Admin, I have reached the maximum attempts for Test Series: ${course.title}. Can you please share the Retake Permission Code?`, '_blank');
            }}
            className="btn-outline" 
            style={{ color: '#25D366', borderColor: '#25D366', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            Ask Creator Permission
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Enter Permission Code" 
            value={permissionCode}
            onChange={(e) => setPermissionCode(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.3)', color: 'white', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase' }}
          />
          <button onClick={handleUnlockRetake} className="btn-primary" style={{ width: '100%' }}>
            Unlock Retake
          </button>
        </div>
        
        <button onClick={onBack} className="btn-outline" style={{ marginTop: '24px', border: 'none' }}>
          <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Back to Academy
        </button>
      </div>
    );
  }

  // Render Start Screen if Proctored
  if (!testStarted && !submitted) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <Camera size={64} color="var(--tech-cyan)" style={{ margin: '0 auto 24px auto' }} />
        <h2 style={{ color: 'white', margin: '0 0 16px 0' }}>Proctored Test Environment</h2>
        <div style={{ color: 'var(--cool-gray)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 12px 0' }}><strong>Strict Anti-Cheat measures are active for this test:</strong></p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Your camera will be activated for live monitoring.</li>
            <li style={{ marginBottom: '8px' }}>The test will enter Fullscreen mode. Exiting fullscreen will trigger a warning.</li>
            <li style={{ marginBottom: '8px' }}>Switching tabs or minimizing the window will trigger a warning.</li>
            <li style={{ marginBottom: '8px' }}>Copy, Paste, and Right-Click are disabled.</li>
            <li style={{ color: '#EF4444' }}><strong>Receiving 3 warnings will result in auto-submission and failure.</strong></li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={handleBack} className="btn-outline">Cancel</button>
          <button onClick={startProctoredTest} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Agree & Start Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', userSelect: (testStarted && is_proctored) ? 'none' : 'auto' }}
      onCopy={e => { if(testStarted && is_proctored) { e.preventDefault(); handleWarning("Copying is disabled!"); } }}
      onPaste={e => { if(testStarted && is_proctored) { e.preventDefault(); } }}
      onCut={e => { if(testStarted && is_proctored) { e.preventDefault(); } }}
      onContextMenu={e => { if(testStarted && is_proctored) { e.preventDefault(); } }}
    >
      
      {testStarted && !submitted && is_proctored && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '200px', height: '150px', background: '#000', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--tech-cyan)', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          <div style={{ position: 'absolute', bottom: '4px', left: '8px', color: 'white', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>🔴 Live Proctoring</div>
        </div>
      )}

      {warningMessage && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: 'white', padding: '16px 24px', borderRadius: '8px', zIndex: 2000, display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)', animation: 'slideDown 0.3s ease-out' }}>
          <AlertTriangle size={24} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Proctoring Alert</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{warningMessage}</p>
          </div>
          <button onClick={() => setWarningMessage(null)} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '16px' }}>Dismiss</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={handleBack} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', padding: 0 }}>
          <ChevronLeft size={20} /> Back to Academy
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'var(--tech-gold)', color: 'black', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>
            Test Series
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <h2 style={{ color: 'white', margin: '0 0 8px 0' }}>{course.title}</h2>
        <p style={{ color: 'var(--cool-gray)', margin: '0 0 24px 0', fontSize: '14px' }}>{course.content}</p>

        {test_source === 'Google Form' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '800px' }}>
            <iframe src={url} width="100%" height="100%" frameBorder="0" marginHeight="0" marginWidth="0" title="Google Form Test">Loading…</iframe>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button onClick={autoSubmit} className="btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
                <CheckCircle size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> I have submitted the form
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--tech-cyan)', marginRight: '8px' }}>Q{idx + 1}.</span> 
                  {q['Question']}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['A', 'B', 'C', 'D'].map(optKey => {
                    const optionText = q[`Option ${optKey}`];
                    if (!optionText) return null;
                    
                    const isSelected = answers[idx] === optKey;
                    const isCorrect = q['Answer']?.trim().toUpperCase() === optKey;
                    
                    let bg = 'rgba(255,255,255,0.05)';
                    let border = '1px solid var(--surface-border)';
                    
                    if (submitted) {
                      if (isCorrect) {
                        bg = 'rgba(16, 185, 129, 0.2)';
                        border = '1px solid #10B981';
                      } else if (isSelected && !isCorrect) {
                        bg = 'rgba(239, 68, 68, 0.2)';
                        border = '1px solid #EF4444';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(0, 229, 255, 0.2)';
                      border = '1px solid var(--tech-cyan)';
                    }

                    return (
                      <div 
                        key={optKey} 
                        onClick={() => handleSelectOption(idx, optKey)}
                        style={{ 
                          padding: '12px 16px', 
                          background: bg, 
                          border: border,
                          borderRadius: '8px', 
                          cursor: submitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          color: 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--cool-gray)' }}>
                          {optKey}
                        </div>
                        {optionText}
                        
                        {submitted && isCorrect && <CheckCircle size={18} color="#10B981" style={{ marginLeft: 'auto' }} />}
                        {submitted && isSelected && !isCorrect && <XCircle size={18} color="#EF4444" style={{ marginLeft: 'auto' }} />}
                      </div>
                    )
                  })}
                </div>

                {submitted && q['Explanation'] && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--tech-gold)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--tech-gold)', fontSize: '14px' }}>Explanation</h4>
                    <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.6' }}>{q['Explanation']}</p>
                  </div>
                )}
              </div>
            ))}

            {!submitted && questions.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button onClick={handleSubmit} className="btn-primary" style={{ padding: '16px 40px', fontSize: '18px' }}>
                  Submit Test Series
                </button>
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div style={{ marginTop: '40px', padding: '40px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--surface-border)' }}>
            <Award size={64} color="var(--tech-gold)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '28px' }}>Test Completed!</h2>
            
            {test_source === 'Google Sheet' && (
              <p style={{ color: 'var(--tech-cyan)', fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px 0' }}>
                You scored {score} out of {questions.length}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={handleShareWhatsApp} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25D366', borderColor: '#25D366' }}>
                <Share2 size={18} /> Share Results with Admin
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '40px 0' }} />

            {/* Certificate Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                id="test-certificate-node"
                style={{ 
                  width: '800px', 
                  height: '560px', 
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                  border: '8px solid var(--tech-gold)', 
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                  transform: 'scale(0.8)',
                  transformOrigin: 'top center',
                  marginBottom: '-112px' // offset the scale
                }}
              >
                <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderTop: '4px solid var(--tech-cyan)', borderLeft: '4px solid var(--tech-cyan)' }}></div>
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderTop: '4px solid var(--tech-cyan)', borderRight: '4px solid var(--tech-cyan)' }}></div>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '40px', height: '40px', borderBottom: '4px solid var(--tech-cyan)', borderLeft: '4px solid var(--tech-cyan)' }}></div>
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '40px', height: '40px', borderBottom: '4px solid var(--tech-cyan)', borderRight: '4px solid var(--tech-cyan)' }}></div>

                <Award size={64} color="var(--tech-gold)" style={{ marginBottom: '16px' }} />
                
                <h1 style={{ color: 'white', fontSize: '42px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '4px' }}>Certificate of Achievement</h1>
                <p style={{ color: 'var(--tech-teal)', fontSize: '18px', margin: '0 0 32px 0', letterSpacing: '2px' }}>THAMIZHAN TECHNOLOGY LTD</p>
                
                <p style={{ color: 'var(--cool-gray)', fontSize: '16px', margin: '0 0 16px 0' }}>This proudly certifies that</p>
                <h2 style={{ color: 'white', fontSize: '36px', margin: '0 0 24px 0', fontFamily: 'serif', borderBottom: '2px solid var(--tech-gold)', paddingBottom: '8px', minWidth: '400px' }}>
                  {currentUser?.fullName}
                </h2>
                
                <p style={{ color: 'var(--cool-gray)', fontSize: '16px', margin: '0 0 16px 0' }}>has successfully completed the Test Series:</p>
                <h3 style={{ color: 'var(--tech-cyan)', fontSize: '24px', margin: '0 0 24px 0', maxWidth: '600px' }}>{course.title}</h3>
                
                {test_source === 'Google Sheet' && (
                  <p style={{ color: 'var(--tech-gold)', fontSize: '18px', margin: '0 0 24px 0' }}>Score: {score} / {questions.length}</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', padding: '0 40px' }}>
                  <div style={{ textAlign: 'center', borderTop: '1px solid var(--cool-gray)', paddingTop: '8px', width: '150px' }}>
                    <p style={{ color: 'white', margin: 0, fontSize: '14px' }}>{new Date().toLocaleDateString()}</p>
                    <p style={{ color: 'var(--cool-gray)', margin: 0, fontSize: '12px' }}>Date Completed</p>
                  </div>
                  <div style={{ textAlign: 'center', borderTop: '1px solid var(--cool-gray)', paddingTop: '8px', width: '150px' }}>
                    <p style={{ color: 'white', margin: 0, fontSize: '14px', fontFamily: 'cursive' }}>Thamizhan Platform</p>
                    <p style={{ color: 'var(--cool-gray)', margin: 0, fontSize: '12px' }}>Authorized Issuer</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button onClick={() => handleDownloadCertificate('pdf')} disabled={downloadingCert} className="btn-primary">
                  {downloadingCert ? 'Generating...' : 'Download Certificate PDF'}
                </button>
                <button onClick={() => handleDownloadCertificate('image')} disabled={downloadingCert} className="btn-outline">
                  {downloadingCert ? 'Generating...' : 'Download Image'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
