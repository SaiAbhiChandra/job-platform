import { useState, useRef } from 'react';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [existingResumeText, setExistingResumeText] = useState('');
  const [userName, setUserName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef(null);
  const printRef = useRef(null);

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          resolve(text);
        } catch (err) {
          resolve('');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    setError('');
    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        if (text) {
          setExistingResumeText(text);
        } else {
          setError('Could not extract text from PDF. Please paste your resume text manually below.');
        }
      } else {
        setError('Please upload a PDF file. For DOC/DOCX, paste your resume text in the box below.');
      }
    } catch (err) {
      setError('Error reading file. Please paste your resume text manually.');
    }
    setExtracting(false);
  };

  const generateResume = async () => {
    if (!jobDescription.trim()) { setError('Please paste the job description'); return; }
    if (!existingResumeText.trim()) { setError('Please upload your resume or paste your details'); return; }
    if (!userName.trim()) { setError('Please enter your name'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API}/api/jobs/create-resume-structured`, {
        jobDescription,
        existingResume: existingResumeText,
        userName,
        targetRole,
      });

      if (res.data.success) {
        setResumeData(res.data.resumeData);
        setStep(3);
      }
    } catch (err) {
      setError('Error generating resume. Please try again.');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateResumeHTML(resumeData));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateResumeHTML = (data) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.name} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 10.5pt; color: #1a1a1a; background: white; }
  .resume { max-width: 750px; margin: 0 auto; padding: 28px 32px; }
  .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #1a3a6b; padding-bottom: 10px; }
  .name { font-size: 22pt; font-weight: 700; color: #1a3a6b; letter-spacing: 1px; text-transform: uppercase; }
  .contact { font-size: 9pt; color: #444; margin-top: 5px; line-height: 1.6; }
  .contact a { color: #1a3a6b; text-decoration: none; }
  .section { margin-bottom: 12px; }
  .section-title { font-size: 11pt; font-weight: 700; color: #1a3a6b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1a3a6b; padding-bottom: 2px; margin-bottom: 6px; }
  .summary { font-size: 10pt; line-height: 1.6; color: #333; }
  .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
  .skill-row { font-size: 9.5pt; line-height: 1.7; }
  .skill-cat { font-weight: 700; color: #1a3a6b; }
  .exp-item { margin-bottom: 10px; }
  .exp-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .exp-role { font-weight: 700; font-size: 10.5pt; color: #1a1a1a; }
  .exp-company { font-weight: 600; color: #1a3a6b; font-size: 10pt; }
  .exp-date { font-size: 9.5pt; color: #555; white-space: nowrap; }
  .exp-bullets { margin-top: 3px; padding-left: 16px; }
  .exp-bullets li { font-size: 9.5pt; line-height: 1.6; color: #333; margin-bottom: 1px; }
  .proj-item { margin-bottom: 8px; }
  .proj-title { font-weight: 700; font-size: 10pt; color: #1a1a1a; }
  .proj-tech { font-size: 9pt; color: #1a3a6b; font-style: italic; }
  .proj-bullets { padding-left: 16px; margin-top: 2px; }
  .proj-bullets li { font-size: 9.5pt; line-height: 1.6; color: #333; }
  .edu-item { margin-bottom: 6px; }
  .edu-header { display: flex; justify-content: space-between; }
  .edu-degree { font-weight: 700; font-size: 10pt; }
  .edu-school { font-size: 9.5pt; color: #1a3a6b; }
  .edu-grade { font-size: 9.5pt; color: #555; }
  .cert-list { padding-left: 16px; }
  .cert-list li { font-size: 9.5pt; line-height: 1.7; }
  .pub-item { margin-bottom: 5px; font-size: 9.5pt; line-height: 1.5; color: #333; }
  @media print {
    body { font-size: 10pt; }
    .resume { padding: 15px 20px; }
    @page { margin: 0.5in; size: A4; }
  }
</style>
</head>
<body>
<div class="resume">
  <div class="header">
    <div class="name">${data.name}</div>
    <div class="contact">${data.contact}</div>
  </div>

  ${data.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">${data.summary}</div>
  </div>` : ''}

  ${data.skills && data.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      ${data.skills.map(s => `<div class="skill-row"><span class="skill-cat">${s.category}:</span> ${s.items}</div>`).join('')}
    </div>
  </div>` : ''}

  ${data.experience && data.experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${data.experience.map(exp => `
    <div class="exp-item">
      <div class="exp-header">
        <div>
          <div class="exp-role">${exp.role}</div>
          <div class="exp-company">${exp.company}</div>
        </div>
        <div class="exp-date">${exp.date}</div>
      </div>
      <ul class="exp-bullets">
        ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>`).join('')}
  </div>` : ''}

  ${data.projects && data.projects.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${data.projects.map(proj => `
    <div class="proj-item">
      <div class="proj-title">${proj.title} <span class="proj-tech">| ${proj.tech}</span></div>
      <ul class="proj-bullets">
        ${proj.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>`).join('')}
  </div>` : ''}

  ${data.education && data.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${data.education.map(edu => `
    <div class="edu-item">
      <div class="edu-header">
        <div>
          <div class="edu-degree">${edu.degree}</div>
          <div class="edu-school">${edu.school}</div>
        </div>
        <div class="edu-grade">${edu.grade} | ${edu.year}</div>
      </div>
    </div>`).join('')}
  </div>` : ''}

  ${data.certifications && data.certifications.length > 0 ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    <ul class="cert-list">
      ${data.certifications.map(c => `<li>${c}</li>`).join('')}
    </ul>
  </div>` : ''}

  ${data.publications && data.publications.length > 0 ? `
  <div class="section">
    <div class="section-title">Publications & Patents</div>
    ${data.publications.map(p => `<div class="pub-item">• ${p}</div>`).join('')}
  </div>` : ''}

  ${data.achievements && data.achievements.length > 0 ? `
  <div class="section">
    <div class="section-title">Achievements</div>
    <ul class="cert-list">
      ${data.achievements.map(a => `<li>${a}</li>`).join('')}
    </ul>
  </div>` : ''}
</div>
</body>
</html>`;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div style={styles.aiBadge}>🤖 AI Powered • ATS Optimized</div>
          <h1 style={styles.title}>Resume Builder</h1>
          <p style={styles.subtitle}>
            Upload your resume + paste job description.
            Get a professional ATS-friendly PDF resume in 30 seconds.
          </p>
        </div>

        {/* Steps */}
        <div style={styles.steps}>
          {[
            { num: 1, label: 'Your Resume' },
            { num: 2, label: 'Job Description' },
            { num: 3, label: 'Download PDF' },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={styles.stepItem}>
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
              </div>
              {i < 2 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Step 1 */}
        {step === 1 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 1 — Upload Your Resume</h2>

            <div style={styles.field}>
              <label style={styles.label}>Your Full Name *</label>
              <input
                style={styles.input}
                placeholder="e.g. Sai Abhi Chandra Muchhakarla"
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
              <label style={styles.label}>Upload Your Resume (PDF) *</label>
              <div
                style={styles.uploadZone}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                {extracting ? (
                  <>
                    <div style={styles.spinner} />
                    <p style={styles.uploadText}>Extracting text from PDF...</p>
                  </>
                ) : existingResumeText ? (
                  <>
                    <p style={{ fontSize: '28px' }}>✅</p>
                    <p style={styles.uploadText}>Resume uploaded successfully!</p>
                    <p style={styles.uploadHint}>Click to upload a different file</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '36px' }}>📄</p>
                    <p style={styles.uploadText}>Click to upload your resume</p>
                    <p style={styles.uploadHint}>PDF format • Max 5MB</p>
                  </>
                )}
              </div>
            </div>

            <div style={styles.divider}>
              <span style={styles.dividerText}>OR paste your resume text / key details below</span>
            </div>

            <div style={styles.field}>
              <textarea
                style={styles.textarea}
                placeholder={`Paste your resume text here, or enter your key details:

Name: Your Name
Email: email@gmail.com
Phone: +91-XXXXXXXXXX
LinkedIn: linkedin.com/in/yourname

Education: M.Tech AI/ML, LPU, CGPA 7.7

Skills: Python, TensorFlow, PyTorch, React, Node.js

Experience:
- Full Stack Developer Intern at NXT Wave (Jan 2023 - June 2023)

Projects:
- CNN Traffic Sign Recognition (96% accuracy)
- Pneumonia Detection using CNN + Random Forest (95% accuracy)

Certifications: AWS Cloud Computing, Building Websites

Publications: 2 IEEE papers at IETACS 2025
Patent: AI Sales Forecasting System (App No. 202511098438)`}
                value={existingResumeText}
                onChange={e => setExistingResumeText(e.target.value)}
                rows={12}
              />
            </div>

            <button
              style={styles.nextBtn}
              onClick={() => {
                if (!userName.trim()) { setError('Please enter your name'); return; }
                if (!existingResumeText.trim()) { setError('Please upload your resume or paste your details'); return; }
                setError('');
                setStep(2);
              }}
            >
              Next — Add Job Description →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 2 — Paste Job Description</h2>
            <p style={styles.sectionDesc}>
              Copy the complete job posting and paste it below
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Job Description *</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '320px' }}
                placeholder={`Paste the complete job description here...

We are looking for a Machine Learning Engineer to join our team.

Requirements:
- 2+ years experience with Python and ML frameworks
- Experience with TensorFlow or PyTorch
- Strong understanding of statistical modeling
- Experience deploying ML models to production

Responsibilities:
- Build and deploy ML models
- Collaborate with data scientists
- Optimize model performance
...`}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={16}
              />
            </div>

            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
              <button
                style={styles.generateBtn}
                onClick={generateResume}
                disabled={loading}
              >
                {loading ? '⏳ Generating...' : '✨ Generate ATS Resume'}
              </button>
            </div>

            {loading && (
              <div style={styles.loadingBox}>
                <div style={{ ...styles.spinner, borderTopColor: '#7c3aed' }} />
                <p style={styles.loadingText}>AI is crafting your perfect resume...</p>
                <p style={styles.loadingSubtext}>
                  Analyzing job requirements · Matching your skills · Optimizing for ATS
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Preview and Download */}
        {step === 3 && resumeData && (
          <div style={styles.section}>
            <div style={styles.resumeHeader}>
              <div>
                <h2 style={styles.sectionTitle}>✅ Your Resume is Ready!</h2>
                <p style={styles.sectionDesc}>
                  ATS-optimized for: <strong>{targetRole || 'your target role'}</strong>
                </p>
              </div>
              <div style={styles.resumeActions}>
                <button style={styles.downloadBtn} onClick={handlePrint}>
                  ⬇️ Download PDF
                </button>
                <button style={styles.regenerateBtn} onClick={() => setStep(2)}>
                  🔄 Regenerate
                </button>
                <button style={styles.newBtn} onClick={() => {
                  setStep(1);
                  setJobDescription('');
                  setExistingResumeText('');
                  setResumeData(null);
                  setTargetRole('');
                  setUserName('');
                }}>
                  + New Resume
                </button>
              </div>
            </div>

            <div style={styles.tipBox}>
              <p style={styles.tipText}>
                💡 Click <strong>Download PDF</strong> → browser opens print dialog → select <strong>"Save as PDF"</strong> as destination → click Save. Your professional resume will download as PDF.
              </p>
            </div>

            {/* Resume Preview */}
            <div style={styles.previewBox} ref={printRef}>
              <div style={styles.resumePreview}>
                <div style={styles.rHeader}>
                  <div style={styles.rName}>{resumeData.name}</div>
                  <div style={styles.rContact}>{resumeData.contact}</div>
                </div>

                {resumeData.summary && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Professional Summary</div>
                    <p style={styles.rText}>{resumeData.summary}</p>
                  </div>
                )}

                {resumeData.skills?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Technical Skills</div>
                    <div style={styles.skillsGrid}>
                      {resumeData.skills.map((s, i) => (
                        <div key={i} style={styles.skillRow}>
                          <strong style={{ color: '#1a3a6b' }}>{s.category}:</strong> {s.items}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.experience?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Work Experience</div>
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} style={styles.expItem}>
                        <div style={styles.expHeader}>
                          <div>
                            <div style={styles.expRole}>{exp.role}</div>
                            <div style={styles.expCompany}>{exp.company}</div>
                          </div>
                          <div style={styles.expDate}>{exp.date}</div>
                        </div>
                        <ul style={styles.bullets}>
                          {exp.bullets.map((b, j) => <li key={j} style={styles.bullet}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.projects?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Projects</div>
                    {resumeData.projects.map((proj, i) => (
                      <div key={i} style={styles.projItem}>
                        <div style={styles.projTitle}>
                          {proj.title} <span style={styles.projTech}>| {proj.tech}</span>
                        </div>
                        <ul style={styles.bullets}>
                          {proj.bullets.map((b, j) => <li key={j} style={styles.bullet}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.education?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Education</div>
                    {resumeData.education.map((edu, i) => (
                      <div key={i} style={styles.eduItem}>
                        <div style={styles.eduHeader}>
                          <div>
                            <div style={styles.eduDegree}>{edu.degree}</div>
                            <div style={styles.eduSchool}>{edu.school}</div>
                          </div>
                          <div style={styles.eduGrade}>{edu.grade} | {edu.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.certifications?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Certifications</div>
                    <ul style={styles.bullets}>
                      {resumeData.certifications.map((c, i) => <li key={i} style={styles.bullet}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {resumeData.publications?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Publications & Patents</div>
                    {resumeData.publications.map((p, i) => (
                      <div key={i} style={{ fontSize: '12px', marginBottom: '4px', lineHeight: '1.5' }}>• {p}</div>
                    ))}
                  </div>
                )}

                {resumeData.achievements?.length > 0 && (
                  <div style={styles.rSection}>
                    <div style={styles.rSectionTitle}>Achievements</div>
                    <ul style={styles.bullets}>
                      {resumeData.achievements.map((a, i) => <li key={i} style={styles.bullet}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={styles.howSection}>
            <h2 style={styles.howTitle}>How it works</h2>
            <div style={styles.howGrid}>
              {[
                { icon: '📄', title: 'Upload resume', desc: 'Upload your existing resume PDF or paste your details' },
                { icon: '📋', title: 'Paste job description', desc: 'Copy the full job posting you want to apply for' },
                { icon: '🤖', title: 'AI tailors it', desc: 'Claude AI optimizes your resume for that specific job' },
                { icon: '⬇️', title: 'Download PDF', desc: 'Get a professional ATS-friendly PDF resume instantly' },
              ].map(item => (
                <div key={item.title} style={styles.howCard}>
                  <p style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</p>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{item.desc}</p>
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
  page: { background: '#f8fafc', minHeight: '100vh', padding: '36px 20px' },
  container: { maxWidth: '860px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '28px' },
  aiBadge: { display: 'inline-block', background: '#ede9fe', color: '#6d28d9', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '16px', color: '#64748b', lineHeight: '1.6', maxWidth: '560px', margin: '0 auto' },
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '4px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  stepCircle: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  stepLabel: { fontSize: '13px', whiteSpace: 'nowrap' },
  stepLine: { width: '40px', height: '1px', background: '#e2e8f0', margin: '0 8px' },
  error: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', marginBottom: '16px' },
  section: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', marginBottom: '20px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' },
  sectionDesc: { fontSize: '14px', color: '#64748b', marginBottom: '20px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', color: '#1e293b', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit', boxSizing: 'border-box' },
  uploadZone: { border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' },
  uploadText: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px', marginTop: '8px' },
  uploadHint: { fontSize: '13px', color: '#94a3b8' },
  divider: { textAlign: 'center', margin: '16px 0', position: 'relative' },
  dividerText: { background: 'white', padding: '0 12px', fontSize: '13px', color: '#94a3b8', position: 'relative', zIndex: 1 },
  nextBtn: { background: '#2563eb', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  backBtn: { background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '13px 20px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  generateBtn: { background: '#7c3aed', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', flex: 1 },
  loadingBox: { textAlign: 'center', padding: '32px 0 0' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' },
  loadingText: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' },
  loadingSubtext: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
  resumeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  resumeActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  downloadBtn: { background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  regenerateBtn: { background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  newBtn: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  tipBox: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' },
  tipText: { fontSize: '13px', color: '#92400e', lineHeight: '1.6' },
  previewBox: { border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: 'white' },
  resumePreview: { padding: '32px 36px', fontFamily: 'Georgia, serif', fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6' },
  rHeader: { textAlign: 'center', borderBottom: '2px solid #1a3a6b', paddingBottom: '12px', marginBottom: '14px' },
  rName: { fontSize: '22px', fontWeight: '700', color: '#1a3a6b', letterSpacing: '1px', textTransform: 'uppercase' },
  rContact: { fontSize: '12px', color: '#444', marginTop: '4px', lineHeight: '1.6' },
  rSection: { marginBottom: '14px' },
  rSectionTitle: { fontSize: '12px', fontWeight: '700', color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #1a3a6b', paddingBottom: '2px', marginBottom: '8px' },
  rText: { fontSize: '12px', lineHeight: '1.6', color: '#333' },
  skillsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' },
  skillRow: { fontSize: '12px', lineHeight: '1.7' },
  expItem: { marginBottom: '10px' },
  expHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
  expRole: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
  expCompany: { fontSize: '12px', fontWeight: '600', color: '#1a3a6b' },
  expDate: { fontSize: '11px', color: '#555', whiteSpace: 'nowrap' },
  bullets: { paddingLeft: '18px', marginTop: '2px' },
  bullet: { fontSize: '12px', lineHeight: '1.6', color: '#333', marginBottom: '1px' },
  projItem: { marginBottom: '8px' },
  projTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '3px' },
  projTech: { fontSize: '11px', color: '#1a3a6b', fontStyle: 'italic', fontWeight: '400' },
  eduItem: { marginBottom: '8px' },
  eduHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  eduDegree: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
  eduSchool: { fontSize: '12px', color: '#1a3a6b' },
  eduGrade: { fontSize: '11px', color: '#555', whiteSpace: 'nowrap' },
  howSection: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' },
  howTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', textAlign: 'center' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  howCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', textAlign: 'center' },
};

export default ResumeBuilder;