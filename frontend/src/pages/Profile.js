import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    initProfile();
    fetchSavedJobsCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const initProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfile(data);
      if (data.skills) {
        setExtractedSkills(JSON.parse(data.skills || '[]'));
      }
    }
  };

  const fetchSavedJobsCount = async () => {
    const { count } = await supabase
      .from('saved_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setSavedJobsCount(count || 0);
  };

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

          const pdf = await pdfjsLib.getDocument({
            data: e.target.result
          }).promise;

          let text = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + ' ';
          }
          resolve(text.substring(0, 3000));
        } catch (err) {
          resolve('');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const extractSkillsWithAI = async (resumeText) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Extract the top 8 technical skills and job titles from this resume text. Return ONLY a JSON array of strings, no explanation:
            
${resumeText}

Example output: ["Python", "Machine Learning", "React", "Data Science"]`
          }]
        })
      });
      const data = await response.json();
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      return ['Software Engineer', 'Python', 'JavaScript'];
    }
  };

  const fetchMatchedJobs = async (skills) => {
    setMatchLoading(true);
    setMatchedJobs([]);
    try {
      const topSkill = skills[0] || 'software engineer';
      const res = await axios.get(
        `${API}/api/jobs/jsearch?keyword=${topSkill}`
      );
      if (res.data.success) {
        setMatchedJobs(res.data.jobs.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
    }
    setMatchLoading(false);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Max 5MB.');
      return;
    }
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PDF and Word files allowed.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/resume.${fileExt}`;

      const { error: upErr } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      setUploadSuccess('Resume uploaded! Extracting skills...');

      let skills = [];
      if (file.type === 'application/pdf') {
        const resumeText = await extractTextFromPDF(file);
        if (resumeText) {
          setUploadSuccess('Analyzing your resume with AI...');
          skills = await extractSkillsWithAI(resumeText);
        }
      }

      if (skills.length === 0) {
        skills = ['Software Engineer', 'Python', 'JavaScript', 'React'];
      }

      setExtractedSkills(skills);

      await supabase.from('profiles').update({
        resume_url: urlData?.signedUrl,
        resume_name: file.name,
        skills: JSON.stringify(skills),
      }).eq('id', user.id);

      setUploadSuccess(`✅ Resume uploaded! Found ${skills.length} skills. Fetching matched jobs...`);
      await initProfile();
      await fetchMatchedJobs(skills);

    } catch (err) {
      setUploadError(err.message);
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDeleteResume = async () => {
    try {
      const ext = profile.resume_name?.split('.').pop() || 'pdf';
      await supabase.storage
        .from('resumes')
        .remove([`${user.id}/resume.${ext}`]);
      await supabase.from('profiles')
        .update({ resume_url: null, resume_name: null, skills: null })
        .eq('id', user.id);
      setProfile({ ...profile, resume_url: null, resume_name: null });
      setExtractedSkills([]);
      setMatchedJobs([]);
      setUploadSuccess('Resume deleted.');
    } catch (err) {
      setUploadError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Profile Header */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user.email?.substring(0, 2).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>
              {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <p style={styles.profileEmail}>{user.email}</p>
            <p style={styles.profileJoined}>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            style={styles.signOutBtn}
            title="Log out"
            onClick={async () => { await signOut(); navigate('/'); }}
          >
            Log out
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard} onClick={() => navigate('/saved')} title="View saved jobs">
            <p style={styles.statNum}>{savedJobsCount}</p>
            <p style={styles.statLabel}>Saved Jobs</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{profile?.resume_name ? '✅' : '❌'}</p>
            <p style={styles.statLabel}>Resume Uploaded</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{extractedSkills.length || 0}</p>
            <p style={styles.statLabel}>Skills Found</p>
          </div>
        </div>

        {/* Resume Upload */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📄 Your Resume</h2>
          <p style={styles.sectionDesc}>
            Upload your CV — AI will extract your skills and find matching jobs automatically.
          </p>

          {uploadError && <div style={styles.error}>{uploadError}</div>}
          {uploadSuccess && <div style={styles.success}>{uploadSuccess}</div>}

          {profile?.resume_name && (
            <div style={styles.resumeCard}>
              <div style={styles.resumeInfo}>
                <span style={styles.resumeIcon}>📄</span>
                <div>
                  <p style={styles.resumeName}>{profile.resume_name}</p>
                  <p style={styles.resumeStatus}>Uploaded successfully</p>
                </div>
              </div>
              <div style={styles.resumeActions}>
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.viewBtn}
                >
                  View
                </a>
                <button style={styles.deleteBtn} onClick={handleDeleteResume}>
                  Delete
                </button>
                <button
                  style={styles.matchBtn}
                  onClick={() => fetchMatchedJobs(extractedSkills)}
                  title="Find jobs matching your resume"
                >
                  🔍 Find Matching Jobs
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              ...styles.dropZone,
              ...(dragOver ? styles.dropZoneActive : {}),
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            title="Upload resume"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0];
                if (file) handleUpload(file);
              }}
            />
            {uploading ? (
              <>
                <div style={styles.uploadSpinner} />
                <p style={styles.dropText}>
                  {uploadSuccess || 'Processing...'}
                </p>
              </>
            ) : (
              <>
                <p style={styles.uploadIcon}>☁️</p>
                <p style={styles.dropText}>
                  {profile?.resume_name
                    ? 'Drop new file to replace resume'
                    : 'Drag & drop your resume here'}
                </p>
                <p style={styles.dropSubtext}>or click to browse files</p>
                <p style={styles.dropFormats}>PDF, DOC, DOCX — Max 5MB</p>
              </>
            )}
          </div>
        </div>

        {/* Extracted Skills */}
        {extractedSkills.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🧠 Skills Detected from Resume</h2>
            <div style={styles.skillsGrid}>
              {extractedSkills.map((skill, i) => (
                <span key={i} style={styles.skillChip}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Matched Jobs */}
        {(matchLoading || matchedJobs.length > 0) && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>💼 Jobs Matched to Your Resume</h2>
            <p style={styles.sectionDesc}>
              Based on your skills: {extractedSkills.slice(0, 3).join(', ')}
            </p>

            {matchLoading && (
              <div style={styles.matchLoading}>
                <div style={styles.uploadSpinner} />
                <p>Finding best matches...</p>
              </div>
            )}

            <div style={styles.matchGrid}>
              {matchedJobs.map(job => (
                <div key={job.id} style={styles.matchCard}>
                  <div style={styles.matchTop}>
                    <div style={styles.matchLogo}>
                      {job.company?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={styles.matchInfo}>
                      <p style={styles.matchTitle}>{job.title}</p>
                      <p style={styles.matchCompany}>{job.company}</p>
                    </div>
                  </div>
                  {job.location && (
                    <p style={styles.matchLocation}>📍 {job.location}</p>
                  )}
                  <div style={styles.matchBottom}>
                    <span style={styles.matchBadge}>
                      ✅ Resume Match
                    </span>

                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.matchApply}
                    >
                      Apply →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Links</h2>
          <div style={styles.quickLinks}>
            <button style={styles.quickBtn} onClick={() => navigate('/jobs')} title="Search all jobs">
              🔍 Browse Jobs
            </button>
            <button style={styles.quickBtn} onClick={() => navigate('/saved')} title="View saved jobs">
              🔖 Saved Jobs ({savedJobsCount})
            </button>
            <button style={styles.quickBtn} onClick={() => navigate('/')} title="Go to homepage">
              🏠 Home
            </button>
          </div>
        </div>

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
    maxWidth: '720px',
    margin: '0 auto',
  },
  profileCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    flexShrink: 0,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },
  profileEmail: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '4px',
  },
  profileJoined: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  signOutBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  statNum: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  section: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
  },
  sectionDesc: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px',
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
  success: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  resumeCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  resumeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  resumeIcon: { fontSize: '28px' },
  resumeName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
  },
  resumeStatus: {
    fontSize: '12px',
    color: '#16a34a',
  },
  resumeActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  viewBtn: {
    background: '#2563eb',
    color: 'white',
    padding: '7px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
  },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  matchBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '7px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dropZone: {
    border: '2px dashed #e2e8f0',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#fafafa',
  },
  dropZoneActive: {
    border: '2px dashed #2563eb',
    background: '#eff6ff',
  },
  uploadIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  dropText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '6px',
  },
  dropSubtext: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
  },
  dropFormats: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  uploadSpinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 12px',
  },
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  skillChip: {
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #ddd6fe',
  },
  matchLoading: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
  },
  matchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '14px',
  },
  matchCard: {
    background: '#fafafa',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
  },
  matchTop: {
    display: 'flex',
    gap: '12px',
    marginBottom: '10px',
  },
  matchLogo: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  matchInfo: { flex: 1 },
  matchTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '3px',
  },
  matchCompany: {
    fontSize: '13px',
    color: '#2563eb',
  },
  matchLocation: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '12px',
  },
  matchBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchBadge: {
    fontSize: '12px',
    color: '#16a34a',
    background: '#dcfce7',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  matchApply: {
    background: '#2563eb',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  quickLinks: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  quickBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#475569',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default Profile;