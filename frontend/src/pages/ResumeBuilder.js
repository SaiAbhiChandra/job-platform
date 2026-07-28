import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

function ResumeBuilder() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [existingResume, setExistingResume] = useState('');
  const [userName, setUserName] = useState(user?.user_metadata?.full_name || '');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste the job description');
      return;
    }
    if (!existingResume.trim()) {
      setError('Please provide your existing resume or details');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/jobs/create-resume`, {
        jobDescription,
        existingResume,
        userName,
        targetRole,
      });

      if (res.data.success) {
        setGeneratedResume(res.data.resume);
        setStep(3);
      }
    } catch (err) {
      setError('Error generating resume. Please try again.');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName || 'resume'}_${targetRole || 'resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.aiBadge}>🤖 AI Powered</div>
          <h1 style={styles.title}>Resume Builder</h1>
          <p style={styles.subtitle}>
            Paste any job description + your existing resume.
            Get a perfectly tailored ATS-optimized resume in seconds.
          </p>
        </div>

        {/* Progress Steps */}
        <div style={styles.steps}>
          {[
            { num: 1, label: 'Your Details' },
            { num: 2, label: 'Job Description' },
            { num: 3, label: 'Generated Resume' },
          ].map(s => (
            <div key={s.num} style={styles.stepItem}>
              <div style={{
                ...styles.stepCircle,
                background: step >= s.num ? '#2563eb' : '#e2e8f0',
                color: step >= s.num ? 'white' : '#94a3b8',
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{
                ...styles.stepLabel,
                color: step >= s.num ? '#0f172a' : '#94a3b8',
                fontWeight: step === s.num ? '600' : '400',
              }}>
                {s.label}
              </span>
              {s.num < 3 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Step 1 — Your Details */}
        {step === 1 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 1 — Your Details</h2>
            <p style={styles.sectionDesc}>
              Tell us about yourself and paste your existing resume or key details
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Your Full Name</label>
              <input
                style={styles.input}
                placeholder="e.g. Sai Abhi Chandra"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Target Job Role</label>
              <input
                style={styles.input}
                placeholder="e.g. Machine Learning Engineer, Full Stack Developer"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Your Existing Resume / Key Information *
              </label>
              <p style={styles.fieldHint}>
                Paste your current resume text, or just type your key details:
                education, skills, experience, projects, achievements
              </p>
              <textarea
                style={styles.textarea}
                placeholder={`Example:
Name: Sai Abhi Chandra
Email: abhi@gmail.com
Education: M.Tech AI/ML, LPU, CGPA 7.7
Skills: Python, TensorFlow, PyTorch, React, Node.js, SQL
Experience: NXT Wave - Full Stack Developer Intern (6 months)
Projects: CNN Traffic Sign Recognition (96% accuracy), Pneumonia Detection (95% accuracy)
Publications: 2 IEEE papers
Patent: AI Sales Forecasting System`}
                value={existingResume}
                onChange={e => setExistingResume(e.target.value)}
                rows={12}
              />
            </div>

            <button
              style={styles.nextBtn}
              onClick={() => {
                if (!existingResume.trim()) {
                  setError('Please add your resume details');
                  return;
                }
                setError('');
                setStep(2);
              }}
            >
              Next — Add Job Description →
            </button>
          </div>
        )}

        {/* Step 2 — Job Description */}
        {step === 2 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 2 — Job Description</h2>
            <p style={styles.sectionDesc}>
              Paste the complete job description you want to apply for
            </p>

            <div style={styles.field}>
              <label style={styles.label}>
                Job Description *
              </label>
              <p style={styles.fieldHint}>
                Copy the full job posting including requirements, responsibilities,
                and qualifications. The more detail, the better your resume will be.
              </p>
              <textarea
                style={styles.textarea}
                placeholder={`Paste the full job description here...

Example:
We are looking for a Machine Learning Engineer to join our team.

Requirements:
- 2+ years experience with Python and ML frameworks
- Experience with TensorFlow or PyTorch
- Strong understanding of statistical modeling
- Experience deploying ML models to production
- Good communication skills

Responsibilities:
- Build and deploy ML models
- Collaborate with data scientists
- Optimize model performance...`}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={16}
              />
            </div>

            <div style={styles.btnRow}>
              <button
                style={styles.backBtn}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                style={styles.generateBtn}
                onClick={generateResume}
                disabled={loading}
              >
                {loading
                  ? '⏳ Generating your resume...'
                  : '✨ Generate ATS Resume'}
              </button>
            </div>

            {loading && (
              <div style={styles.loadingBox}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>
                  AI is crafting your perfect resume...
                </p>
                <p style={styles.loadingSubtext}>
                  Analyzing job requirements, matching your skills,
                  optimizing for ATS systems
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Generated Resume */}
        {step === 3 && generatedResume && (
          <div style={styles.section}>
            <div style={styles.resumeHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  ✅ Your ATS-Optimized Resume
                </h2>
                <p style={styles.sectionDesc}>
                  Tailored specifically for: <strong>{targetRole || 'your target role'}</strong>
                </p>
              </div>
              <div style={styles.resumeActions}>
                <button
                  style={styles.copyBtn}
                  onClick={handleCopy}
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button
                  style={styles.downloadBtn}
                  onClick={handleDownload}
                >
                  ⬇️ Download
                </button>
                <button
                  style={styles.regenerateBtn}
                  onClick={() => setStep(2)}
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>

            <div style={styles.tipBox}>
              <p style={styles.tipText}>
                💡 <strong>Tips:</strong> Copy this text and paste into Google Docs or Word.
                Format with proper fonts and spacing. Save as PDF before submitting.
                Do not use tables or columns — plain text is more ATS friendly.
              </p>
            </div>

            <div style={styles.resumeBox}>
              <pre style={styles.resumeText}>{generatedResume}</pre>
            </div>

            <div style={styles.bottomActions}>
              <button
                style={styles.newResumeBtn}
                onClick={() => {
                  setStep(1);
                  setJobDescription('');
                  setGeneratedResume('');
                  setTargetRole('');
                  setError('');
                }}
              >
                + Create Another Resume
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        {step === 1 && (
          <div style={styles.howSection}>
            <h2 style={styles.howTitle}>Why use TrueHire Resume Builder?</h2>
            <div style={styles.howGrid}>
              {[
                { icon: '🎯', title: 'Job-specific tailoring', desc: 'Every resume is customized for the exact job you\'re applying for' },
                { icon: '✅', title: 'ATS optimized', desc: 'Uses exact keywords from the job description to pass automated screening' },
                { icon: '📊', title: 'Quantified achievements', desc: 'AI adds impact metrics to make your experience stand out' },
                { icon: '⚡', title: 'Ready in 30 seconds', desc: 'No more spending hours tweaking your resume for each application' },
              ].map(item => (
                <div key={item.title} style={styles.howCard}>
                  <p style={styles.howIcon}>{item.icon}</p>
                  <h3 style={styles.howCardTitle}>{item.title}</h3>
                  <p style={styles.howCardDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    background: '#f8fafc',
    minHeight: '100vh',
    padding: '36px 20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  aiBadge: {
    display: 'inline-block',
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
    maxWidth: '560px',
    margin: '0 auto',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '28px',
    gap: '0',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  stepLine: {
    width: '40px',
    height: '1px',
    background: '#e2e8f0',
    margin: '0 8px',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  section: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  sectionDesc: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  fieldHint: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1e293b',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    resize: 'vertical',
    lineHeight: '1.6',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  nextBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '13px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '13px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
  },
  generateBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '13px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    flex: 1,
  },
  loadingBox: {
    textAlign: 'center',
    padding: '32px 0 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '6px',
  },
  loadingSubtext: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },
  resumeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  resumeActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  copyBtn: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  downloadBtn: {
    background: '#dbeafe',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  regenerateBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tipBox: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  tipText: {
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '1.6',
  },
  resumeBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '28px',
    marginBottom: '16px',
  },
  resumeText: {
    fontSize: '13px',
    color: '#1e293b',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },
  bottomActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  newResumeBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  howSection: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '28px',
  },
  howTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '20px',
    textAlign: 'center',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  howCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  howIcon: { fontSize: '28px', marginBottom: '10px' },
  howCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  howCardDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },
};

export default ResumeBuilder;