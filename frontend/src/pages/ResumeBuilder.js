import { useState, useRef } from 'react';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Professional',
    desc: 'Clean, traditional layout. Best for corporate & MNC jobs.',
    color: '#1a3a6b',
    preview: '📄',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    desc: 'Clean lines, modern look. Best for tech startups & product companies.',
    color: '#0ea5e9',
    preview: '🎨',
  },
  {
    id: 'executive',
    name: 'Executive Bold',
    desc: 'Strong, bold design. Best for senior roles & leadership positions.',
    color: '#1e1e2e',
    preview: '💼',
  },
];

function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const fileInputRef = useRef(null);

  // const readFileAsBase64 = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = (e) => resolve(e.target.result.split(',')[1]);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // };

  const extractTextFromFile = async (file) => {
    setExtracting(true);
    setError('');
    try {
      if (file.type === 'application/pdf') {
        // Use pdfjs with correct worker
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => { script.onload = resolve; });

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }

        if (text.trim().length > 50) {
          setResumeText(text.trim());
          setFileUploaded(true);
          setError('');
        } else {
          setError('Could not extract text. Please paste your resume text in the box below.');
        }
      } else {
        setError('Please upload a PDF file, or paste your resume text below.');
      }
    } catch (err) {
      setError('Could not read the file. Please paste your resume text in the box below.');
    }
    setExtracting(false);
  };

  const generateResume = async () => {
    if (!jobDescription.trim()) { setError('Please paste the job description'); return; }
    if (!resumeText.trim()) { setError('Please upload your resume or paste your details below'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/jobs/create-resume-structured`, {
        jobDescription,
        existingResume: resumeText,
        userName: '',
        targetRole: '',
        template: selectedTemplate,
      });

      if (res.data.success) {
        setResumeData(res.data.resumeData);
        setStep(4);
      } else {
        setError('Error generating resume. Please try again.');
      }
    } catch (err) {
      setError('Error generating resume. Please try again.');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const html = generateResumeHTML(resumeData, selectedTemplate);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 800);
  };

  const generateResumeHTML = (data, template) => {
    const styles = getTemplateStyles(template);
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.name} - Resume</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:${styles.font}; font-size:10pt; color:#1a1a1a; background:white; -webkit-print-color-adjust:exact; }
.resume { max-width:780px; margin:0 auto; padding:${styles.padding}; }
${styles.headerCSS}
.contact { font-size:9pt; color:#444; margin-top:5px; line-height:1.7; }
.section { margin-bottom:13px; }
.section-title { font-size:10.5pt; font-weight:700; text-transform:uppercase; letter-spacing:1px; ${styles.sectionTitleCSS} }
.summary { font-size:10pt; line-height:1.65; color:#333; }
.skills-grid { display:grid; grid-template-columns:1fr 1fr; gap:3px 20px; }
.skill-row { font-size:9.5pt; line-height:1.7; }
.skill-cat { font-weight:700; color:${styles.accent}; }
.exp-item,.proj-item,.edu-item { margin-bottom:10px; }
.exp-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:3px; }
.exp-role { font-weight:700; font-size:10.5pt; }
.exp-company { font-weight:600; color:${styles.accent}; font-size:10pt; }
.exp-date { font-size:9.5pt; color:#555; white-space:nowrap; padding-left:8px; }
ul.bullets { padding-left:17px; margin-top:3px; }
ul.bullets li { font-size:9.5pt; line-height:1.65; color:#333; margin-bottom:1px; }
.proj-title { font-weight:700; font-size:10pt; }
.proj-tech { font-size:9pt; color:${styles.accent}; font-style:italic; font-weight:400; }
.edu-top { display:flex; justify-content:space-between; }
.edu-degree { font-weight:700; font-size:10pt; }
.edu-school { font-size:9.5pt; color:${styles.accent}; }
.edu-grade { font-size:9.5pt; color:#555; white-space:nowrap; }
.cert-list,.ach-list { padding-left:17px; }
.cert-list li,.ach-list li { font-size:9.5pt; line-height:1.7; }
.pub-item { font-size:9.5pt; line-height:1.55; margin-bottom:4px; }
.ats-note { display:none; }
@media print {
  body { font-size:10pt; }
  .resume { padding:12px 18px; }
  @page { margin:0.45in; size:A4; }
}
</style>
</head>
<body>
<div class="resume">
${styles.headerHTML(data)}
${data.summary ? `
<div class="section">
  <div class="section-title">Professional Summary</div>
  <div class="summary">${data.summary}</div>
</div>` : ''}
${data.skills?.length ? `
<div class="section">
  <div class="section-title">Technical Skills</div>
  <div class="skills-grid">
    ${data.skills.map(s => `<div class="skill-row"><span class="skill-cat">${s.category}:</span> ${s.items}</div>`).join('')}
  </div>
</div>` : ''}
${data.experience?.length ? `
<div class="section">
  <div class="section-title">Work Experience</div>
  ${data.experience.map(e => `
  <div class="exp-item">
    <div class="exp-top">
      <div><div class="exp-role">${e.role}</div><div class="exp-company">${e.company}</div></div>
      <div class="exp-date">${e.date}</div>
    </div>
    <ul class="bullets">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
  </div>`).join('')}
</div>` : ''}
${data.projects?.length ? `
<div class="section">
  <div class="section-title">Projects</div>
  ${data.projects.map(p => `
  <div class="proj-item">
    <div class="proj-title">${p.title} <span class="proj-tech">| ${p.tech}</span></div>
    <ul class="bullets">${p.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
  </div>`).join('')}
</div>` : ''}
${data.education?.length ? `
<div class="section">
  <div class="section-title">Education</div>
  ${data.education.map(e => `
  <div class="edu-item">
    <div class="edu-top">
      <div><div class="edu-degree">${e.degree}</div><div class="edu-school">${e.school}</div></div>
      <div class="edu-grade">${e.grade} | ${e.year}</div>
    </div>
  </div>`).join('')}
</div>` : ''}
${data.certifications?.length ? `
<div class="section">
  <div class="section-title">Certifications</div>
  <ul class="cert-list">${data.certifications.map(c => `<li>${c}</li>`).join('')}</ul>
</div>` : ''}
${data.publications?.length ? `
<div class="section">
  <div class="section-title">Publications & Patents</div>
  ${data.publications.map(p => `<div class="pub-item">• ${p}</div>`).join('')}
</div>` : ''}
${data.achievements?.length ? `
<div class="section">
  <div class="section-title">Achievements</div>
  <ul class="ach-list">${data.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
</div>` : ''}
</div>
</body>
</html>`;
  };

  const getTemplateStyles = (template) => {
    if (template === 'modern') return {
      font: "'Segoe UI', Arial, sans-serif",
      accent: '#0ea5e9',
      padding: '28px 32px',
      headerCSS: `.header { border-left:4px solid #0ea5e9; padding-left:16px; margin-bottom:16px; }
.name { font-size:20pt; font-weight:700; color:#0f172a; letter-spacing:0.5px; }`,
      sectionTitleCSS: `color:#0ea5e9; border-bottom:1px solid #e2e8f0; padding-bottom:3px; margin-bottom:7px;`,
      headerHTML: (d) => `<div class="header"><div class="name">${d.name}</div><div class="contact">${d.contact}</div></div>`,
    };
    if (template === 'executive') return {
      font: "'Georgia', serif",
      accent: '#374151',
      padding: '28px 32px',
      headerCSS: `.header { background:#1e1e2e; color:white; padding:18px 20px; margin:-28px -32px 16px; }
.name { font-size:21pt; font-weight:700; color:white; letter-spacing:1px; text-transform:uppercase; }
.contact { color:#94a3b8; }`,
      sectionTitleCSS: `color:#1e1e2e; border-bottom:2px solid #1e1e2e; padding-bottom:3px; margin-bottom:7px;`,
      headerHTML: (d) => `<div class="header"><div class="name">${d.name}</div><div class="contact">${d.contact}</div></div>`,
    };
    // Classic (default)
    return {
      font: "'Calibri', Arial, sans-serif",
      accent: '#1a3a6b',
      padding: '28px 32px',
      headerCSS: `.header { text-align:center; border-bottom:2px solid #1a3a6b; padding-bottom:10px; margin-bottom:14px; }
.name { font-size:22pt; font-weight:700; color:#1a3a6b; letter-spacing:1px; text-transform:uppercase; }`,
      sectionTitleCSS: `color:#1a3a6b; border-bottom:1px solid #1a3a6b; padding-bottom:2px; margin-bottom:6px;`,
      headerHTML: (d) => `<div class="header"><div class="name">${d.name}</div><div class="contact">${d.contact}</div></div>`,
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div style={styles.aiBadge}>🤖 AI Powered • 90+ ATS Score</div>
          <h1 style={styles.title}>Resume Builder</h1>
          <p style={styles.subtitle}>
            Upload your resume + paste any job description.
            AI creates a perfectly tailored ATS-friendly resume in your chosen template.
          </p>
        </div>

        {/* Progress */}
        <div style={styles.steps}>
          {['Upload Resume', 'Job Description', 'Choose Template', 'Download PDF'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={styles.stepItem}>
                <div style={{
                  ...styles.stepCircle,
                  background: step > i + 1 ? '#16a34a' : step === i + 1 ? '#2563eb' : '#e2e8f0',
                  color: step >= i + 1 ? 'white' : '#94a3b8',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{
                  ...styles.stepLabel,
                  color: step >= i + 1 ? '#0f172a' : '#94a3b8',
                  fontWeight: step === i + 1 ? '600' : '400',
                }}>{label}</span>
              </div>
              {i < 3 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* STEP 1 — Upload Resume */}
        {step === 1 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 1 — Upload Your Resume</h2>
            <p style={styles.sectionDesc}>
              Upload your existing resume PDF — AI will extract all your information automatically
            </p>

            <div
              style={{
                ...styles.uploadZone,
                borderColor: fileUploaded ? '#16a34a' : '#e2e8f0',
                background: fileUploaded ? '#f0fdf4' : '#fafafa',
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) await extractTextFromFile(file);
                }}
              />
              {extracting ? (
                <>
                  <div style={styles.spinner} />
                  <p style={styles.uploadText}>Reading your resume...</p>
                </>
              ) : fileUploaded ? (
                <>
                  <p style={{ fontSize: '40px' }}>✅</p>
                  <p style={{ ...styles.uploadText, color: '#16a34a' }}>Resume uploaded successfully!</p>
                  <p style={styles.uploadHint}>Click to upload a different file</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '48px' }}>📄</p>
                  <p style={styles.uploadText}>Click to upload your resume PDF</p>
                  <p style={styles.uploadHint}>PDF format only • Max 5MB</p>
                </>
              )}
            </div>

            <div style={styles.orDivider}>
              <div style={styles.orLine} />
              <span style={styles.orText}>OR paste your resume text / key details</span>
              <div style={styles.orLine} />
            </div>

            <textarea
              style={styles.textarea}
              placeholder={`Paste your resume text here or enter your details:

Name: Sai Abhi Chandra Muchhakarla
Email: abhimuchhakarla@gmail.com
Phone: +91-7794080711
LinkedIn: linkedin.com/in/sai-abhi-chandra-muchhakarla
GitHub: github.com/SaiAbhiChandra

Education:
- M.Tech AI/ML, LPU, CGPA 7.7 (2024-Present)
- B.Tech EEE, Sri Vasavi Engineering College, CGPA 8.0 (2020-2024)

Skills: Python, TensorFlow, PyTorch, React, Node.js, SQL, Power BI

Experience:
- Full Stack Developer Intern, NXT Wave (Jan 2023 – Jun 2023)

Projects:
- CNN Traffic Sign Recognition – 96% accuracy (TensorFlow, Keras, OpenCV)
- Pneumonia Detection CNN+Random Forest – 95% accuracy
- AI Sales Forecasting System (Python, TensorFlow, Scikit-Learn)

Publications: 2 IEEE IETACS 2025 papers
Patent: AI Sales Forecasting System (App No. 202511098438)
Certifications: AWS Cloud Computing, Building Responsive Websites`}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={14}
            />

            <button
              style={styles.nextBtn}
              onClick={() => {
                if (!resumeText.trim()) { setError('Please upload your resume or paste your details'); return; }
                setError('');
                setStep(2);
              }}
            >
              Next → Paste Job Description
            </button>
          </div>
        )}

        {/* STEP 2 — Job Description */}
        {step === 2 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 2 — Paste Job Description</h2>
            <p style={styles.sectionDesc}>
              Copy the complete job posting. AI will match your resume to every requirement.
            </p>

            <textarea
              style={{ ...styles.textarea, minHeight: '360px' }}
              placeholder={`Paste the full job description here...

Example:
Machine Learning Engineer — Google

We are looking for an ML Engineer to join our team.

Responsibilities:
- Design and implement ML models
- Collaborate with data scientists
- Deploy models to production

Requirements:
- 2+ years Python experience
- Strong knowledge of TensorFlow or PyTorch
- Experience with model deployment
- Good communication skills
- Bachelor's/Master's degree in CS or related field`}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={18}
            />

            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
              <button
                style={styles.nextBtn2}
                onClick={() => {
                  if (!jobDescription.trim()) { setError('Please paste the job description'); return; }
                  setError('');
                  setStep(3);
                }}
              >
                Next → Choose Template
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Choose Template */}
        {step === 3 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Step 3 — Choose Your Resume Template</h2>
            <p style={styles.sectionDesc}>
              All templates are ATS-friendly and score 90+ on ATS scanners
            </p>

            <div style={styles.templatesGrid}>
              {TEMPLATES.map(tmpl => (
                <div
                  key={tmpl.id}
                  style={{
                    ...styles.templateCard,
                    border: selectedTemplate === tmpl.id
                      ? `2px solid ${tmpl.color}`
                      : '2px solid #e2e8f0',
                    background: selectedTemplate === tmpl.id ? '#f0f7ff' : 'white',
                  }}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                >
                  <div style={{ ...styles.templatePreview, background: tmpl.color + '15' }}>
                    <span style={{ fontSize: '40px' }}>{tmpl.preview}</span>
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ width: '60px', height: '4px', background: tmpl.color, borderRadius: '2px', margin: '0 auto 4px' }} />
                      <div style={{ width: '100px', height: '3px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 3px' }} />
                      <div style={{ width: '80px', height: '3px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto' }} />
                    </div>
                  </div>
                  <div style={styles.templateInfo}>
                    <div style={styles.templateName}>{tmpl.name}</div>
                    <div style={styles.templateDesc}>{tmpl.desc}</div>
                    {selectedTemplate === tmpl.id && (
                      <div style={{ ...styles.selectedBadge, background: tmpl.color }}>✓ Selected</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.atsBadge}>
              🏆 All templates score <strong>90+ on ATS scanners</strong> — clean text structure, no tables or columns, keyword-rich formatting
            </div>

            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
              <button
                style={styles.generateBtn}
                onClick={generateResume}
                disabled={loading}
              >
                {loading ? '⏳ AI is generating your resume...' : '✨ Generate My Resume'}
              </button>
            </div>

            {loading && (
              <div style={styles.loadingBox}>
                <div style={{ ...styles.spinner, borderTopColor: '#7c3aed', width: '48px', height: '48px' }} />
                <p style={styles.loadingText}>AI is crafting your perfect resume...</p>
                <p style={styles.loadingSubtext}>
                  ✓ Analyzing job requirements &nbsp; ✓ Matching your skills &nbsp; ✓ Optimizing keywords &nbsp; ✓ ATS formatting
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Download */}
        {step === 4 && resumeData && (
          <div style={styles.section}>
            <div style={styles.doneHeader}>
              <div>
                <h2 style={styles.sectionTitle}>✅ Your Resume is Ready!</h2>
                <p style={styles.sectionDesc}>
                  Template: <strong>{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong>
                  &nbsp;•&nbsp; Estimated ATS Score: <strong style={{ color: '#16a34a' }}>90+</strong>
                </p>
              </div>
              <div style={styles.doneActions}>
                <button style={styles.downloadBtn} onClick={downloadPDF}>
                  ⬇️ Download PDF
                </button>
                <button style={styles.regenBtn} onClick={() => setStep(3)}>
                  🔄 Change Template
                </button>
                <button style={styles.newBtn} onClick={() => {
                  setStep(1);
                  setJobDescription('');
                  setResumeText('');
                  setResumeData(null);
                  setFileUploaded(false);
                  setError('');
                }}>
                  + New Resume
                </button>
              </div>
            </div>

            <div style={styles.downloadTip}>
              💡 Click <strong>Download PDF</strong> → print dialog opens → set destination to <strong>"Save as PDF"</strong> → click Save
            </div>

            {/* Live Preview */}
            <div style={styles.previewWrapper}>
              <ResumePreview data={resumeData} template={selectedTemplate} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={styles.howSection}>
            <h2 style={styles.howTitle}>Why TrueHire Resume Builder?</h2>
            <div style={styles.howGrid}>
              {[
                { icon: '🎯', title: '90+ ATS Score', desc: 'Optimized to pass any ATS screening system automatically' },
                { icon: '🤖', title: 'AI-tailored', desc: 'Uses exact keywords from the job description you paste' },
                { icon: '🎨', title: '3 Pro Templates', desc: 'Choose from Classic, Modern, or Executive design' },
                { icon: '⬇️', title: 'PDF Download', desc: 'Download a professional PDF ready to submit anywhere' },
              ].map(item => (
                <div key={item.title} style={styles.howCard}>
                  <p style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</p>
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

function ResumePreview({ data, template }) {
  const accent = template === 'modern' ? '#0ea5e9' : template === 'executive' ? '#1e1e2e' : '#1a3a6b';

  return (
    <div style={{
      fontFamily: template === 'executive' ? 'Georgia, serif' : 'Calibri, Arial, sans-serif',
      fontSize: '12px',
      color: '#1a1a1a',
      lineHeight: '1.6',
      padding: '24px 28px',
      background: 'white',
    }}>
      {/* Header */}
      <div style={{
        textAlign: template === 'modern' ? 'left' : 'center',
        borderBottom: template === 'executive' ? 'none' : `2px solid ${accent}`,
        background: template === 'executive' ? accent : 'transparent',
        color: template === 'executive' ? 'white' : 'inherit',
        padding: template === 'executive' ? '14px 16px' : '0 0 10px',
        marginBottom: '12px',
        ...(template === 'modern' ? { borderLeft: `4px solid ${accent}`, paddingLeft: '12px', borderBottom: 'none' } : {}),
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: template === 'executive' ? 'white' : accent, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {data.name}
        </div>
        <div style={{ fontSize: '11px', color: template === 'executive' ? '#94a3b8' : '#444', marginTop: '4px' }}>
          {data.contact}
        </div>
      </div>

      {data.summary && (
        <Section title="Professional Summary" accent={accent}>
          <p style={{ fontSize: '11px', lineHeight: '1.65', color: '#333' }}>{data.summary}</p>
        </Section>
      )}

      {data.skills?.length > 0 && (
        <Section title="Technical Skills" accent={accent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
            {data.skills.map((s, i) => (
              <div key={i} style={{ fontSize: '11px', lineHeight: '1.7' }}>
                <strong style={{ color: accent }}>{s.category}:</strong> {s.items}
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.experience?.length > 0 && (
        <Section title="Work Experience" accent={accent}>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px' }}>{exp.role}</div>
                  <div style={{ fontWeight: '600', color: accent, fontSize: '11px' }}>{exp.company}</div>
                </div>
                <div style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap', paddingLeft: '8px' }}>{exp.date}</div>
              </div>
              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                {exp.bullets.map((b, j) => <li key={j} style={{ fontSize: '11px', lineHeight: '1.6', color: '#333' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {data.projects?.length > 0 && (
        <Section title="Projects" accent={accent}>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '12px' }}>
                {proj.title} <span style={{ fontSize: '10px', color: accent, fontStyle: 'italic', fontWeight: '400' }}>| {proj.tech}</span>
              </div>
              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                {proj.bullets.map((b, j) => <li key={j} style={{ fontSize: '11px', lineHeight: '1.6', color: '#333' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {data.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px' }}>{edu.degree}</div>
                  <div style={{ fontSize: '11px', color: accent }}>{edu.school}</div>
                </div>
                <div style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap' }}>{edu.grade} | {edu.year}</div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {data.certifications?.length > 0 && (
        <Section title="Certifications" accent={accent}>
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            {data.certifications.map((c, i) => <li key={i} style={{ fontSize: '11px', lineHeight: '1.7' }}>{c}</li>)}
          </ul>
        </Section>
      )}

      {data.publications?.length > 0 && (
        <Section title="Publications & Patents" accent={accent}>
          {data.publications.map((p, i) => (
            <div key={i} style={{ fontSize: '11px', lineHeight: '1.55', marginBottom: '4px' }}>• {p}</div>
          ))}
        </Section>
      )}

      {data.achievements?.length > 0 && (
        <Section title="Achievements" accent={accent}>
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            {data.achievements.map((a, i) => <li key={i} style={{ fontSize: '11px', lineHeight: '1.7' }}>{a}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, accent, children }) {
  return (
    <div style={{ marginBottom: '13px' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '700',
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: `1px solid ${accent}`,
        paddingBottom: '2px',
        marginBottom: '6px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const styles = {
  page: { background: '#f1f5f9', minHeight: '100vh', padding: '84px 20px 40px' },
  container: { maxWidth: '960px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '28px' },
  aiBadge: { display: 'inline-block', background: '#ede9fe', color: '#6d28d9', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '16px', color: '#64748b', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto' },
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '4px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  stepCircle: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 },
  stepLabel: { fontSize: '12px', whiteSpace: 'nowrap' },
  stepLine: { width: '28px', height: '1px', background: '#e2e8f0', margin: '0 6px' },
  error: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', marginBottom: '16px' },
  section: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', marginBottom: '20px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' },
  sectionDesc: { fontSize: '14px', color: '#64748b', marginBottom: '20px' },
  uploadZone: { border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s' },
  uploadText: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px', marginTop: '10px' },
  uploadHint: { fontSize: '13px', color: '#94a3b8' },
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  orDivider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  orLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  orText: { fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' },
  textarea: { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#1e293b', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px' },
  nextBtn: { background: '#2563eb', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  backBtn: { background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '13px 20px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  nextBtn2: { background: '#2563eb', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', flex: 1 },
  templatesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' },
  templateCard: { borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' },
  templatePreview: { padding: '24px', textAlign: 'center' },
  templateInfo: { padding: '14px 16px', background: 'white' },
  templateName: { fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  templateDesc: { fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '8px' },
  selectedBadge: { display: 'inline-block', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  atsBadge: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#15803d', marginBottom: '20px', textAlign: 'center' },
  generateBtn: { background: '#7c3aed', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', flex: 1 },
  loadingBox: { textAlign: 'center', padding: '28px 0 0' },
  loadingText: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  loadingSubtext: { fontSize: '13px', color: '#64748b', lineHeight: '1.8' },
  doneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  doneActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  downloadBtn: { background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  regenBtn: { background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  newBtn: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  downloadTip: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#92400e', lineHeight: '1.6' },
  previewWrapper: { border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' },
  howSection: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' },
  howTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', textAlign: 'center' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  howCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', textAlign: 'center' },
  howCardTitle: { fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' },
  howCardDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
};

export default ResumeBuilder;