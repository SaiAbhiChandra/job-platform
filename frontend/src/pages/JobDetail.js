import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

function JobDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const job = location.state?.job;

  const [skills, setSkills] = useState([]);
  const [userName, setUserName] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('match');

  useEffect(() => {
    if (!job) { navigate('/jobs'); return; }
    if (user) fetchUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('skills, full_name')
      .eq('id', user.id)
      .single();

    if (data?.skills) {
      const parsed = JSON.parse(data.skills);
      setSkills(parsed);
      setUserName(data.full_name || '');
      fetchMatchScore(parsed);
    }
  };

  const fetchMatchScore = async (userSkills) => {
    setMatchLoading(true);
    try {
      const res = await axios.post(`${API}/api/jobs/match-score`, {
        jobTitle: job.title,
        jobDescription: job.description || '',
        userSkills,
      });
      if (res.data.success) setMatchData(res.data);
    } catch (err) {
      console.error(err);
    }
    setMatchLoading(false);
  };

  const fetchCoverLetter = async () => {
    setCoverLoading(true);
    try {
      const res = await axios.post(`${API}/api/jobs/cover-letter`, {
        jobTitle: job.title,
        company: job.company,
        userSkills: skills,
        userName,
      });
      if (res.data.success) setCoverLetter(res.data.coverLetter);
    } catch (err) {
      console.error(err);
    }
    setCoverLoading(false);
  };

  const handleApply = async () => {
    if (user) {
      await supabase.from('applications').insert({
        user_id: user.id,
        job_id: String(job.id),
        job_title: job.title,
        company: job.company,
        location: job.location,
        apply_url: job.apply_url,
        source: job.source,
        status: 'Applied',
      });
      setApplied(true);
    }
    window.open(job.apply_url, '_blank');
  };

  const handleSave = async () => {
    if (!user) { navigate('/auth'); return; }
    await supabase.from('saved_jobs').insert({
      user_id: user.id,
      job_id: String(job.id),
      job_title: job.title,
      company: job.company,
      location: job.location,
      apply_url: job.apply_url,
      source: job.source,
    });
    setSaved(true);
  };

  if (!job) return null;

  const scoreColor = matchData?.score >= 70 ? '#16a34a'
    : matchData?.score >= 40 ? '#d97706' : '#dc2626';

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back to jobs
        </button>

        {/* Job Header */}
        <div style={styles.jobHeader}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>
              {job.company?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={styles.jobTitle}>{job.title}</h1>
              <p style={styles.company}>{job.company}</p>
              <div style={styles.jobMeta}>
                {job.location && <span style={styles.metaItem}>📍 {job.location}</span>}
                {job.employment_type && <span style={styles.metaItem}>💼 {job.employment_type}</span>}
                <span style={styles.metaItem}>🔗 {job.source}</span>
              </div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              style={{...styles.applyBtn, ...(applied ? styles.applyBtnDone : {})}}
              onClick={handleApply}
            >
              {applied ? '✅ Applied' : 'Apply Now →'}
            </button>
            <button
              style={{...styles.saveBtn, ...(saved ? styles.saveBtnDone : {})}}
              onClick={handleSave}
            >
              {saved ? '✅ Saved' : '🔖 Save'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'match', label: '🎯 Resume Match' },
            { key: 'interview', label: '💬 Interview Prep' },
            { key: 'cover', label: '✉️ Cover Letter' },
          ].map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(activeTab === tab.key ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Match Score Tab */}
        {activeTab === 'match' && (
          <div style={styles.section}>
            {!user && (
              <div style={styles.loginPrompt}>
                <p style={styles.loginText}>
                  Upload your resume to see how well you match this job
                </p>
                <button
                  style={styles.loginBtn}
                  onClick={() => navigate('/auth')}
                >
                  Login to see match score
                </button>
              </div>
            )}

            {user && skills.length === 0 && (
              <div style={styles.loginPrompt}>
                <p style={styles.loginText}>
                  Upload your resume first to see your match score
                </p>
                <button
                  style={styles.loginBtn}
                  onClick={() => navigate('/profile')}
                >
                  Upload Resume →
                </button>
              </div>
            )}

            {matchLoading && (
              <div style={styles.loading}>
                <div style={styles.spinner} />
                <p>Analyzing your resume against this job...</p>
              </div>
            )}

            {matchData && !matchLoading && (
              <div>
                <div style={styles.scoreCard}>
                  <div style={styles.scoreCircle}>
                    <span style={{...styles.scoreNum, color: scoreColor}}>
                      {matchData.score}%
                    </span>
                    <span style={styles.scoreLabel}>Match</span>
                  </div>
                  <div style={styles.scoreInfo}>
                    <p style={{...styles.verdict, color: scoreColor}}>
                      {matchData.verdict}
                    </p>
                    <p style={styles.scoreDesc}>
                      Based on your resume skills vs job requirements
                    </p>
                  </div>
                </div>

                <div style={styles.skillsRow}>
                  <div style={styles.skillsCol}>
                    <p style={styles.skillsTitle}>✅ Your matching skills</p>
                    <div style={styles.skillsList}>
                      {matchData.matchedSkills?.map((s, i) => (
                        <span key={i} style={styles.skillMatch}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={styles.skillsCol}>
                    <p style={styles.skillsTitle}>❌ Skills to learn</p>
                    <div style={styles.skillsList}>
                      {matchData.missingSkills?.map((s, i) => (
                        <span key={i} style={styles.skillMissing}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview Prep Tab */}
        {activeTab === 'interview' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              💬 Likely interview questions for this role
            </h2>
            <p style={styles.sectionDesc}>
              AI-generated based on the job title and your skills
            </p>

            {matchLoading && (
              <div style={styles.loading}>
                <div style={styles.spinner} />
                <p>Generating questions...</p>
              </div>
            )}

            {matchData?.interviewQuestions && (
              <div style={styles.questionsList}>
                {matchData.interviewQuestions.map((q, i) => (
                  <div key={i} style={styles.questionCard}>
                    <span style={styles.questionNum}>Q{i + 1}</span>
                    <p style={styles.questionText}>{q}</p>
                  </div>
                ))}
              </div>
            )}

            {!user && (
              <div style={styles.loginPrompt}>
                <p style={styles.loginText}>Login and upload resume to get personalized questions</p>
                <button style={styles.loginBtn} onClick={() => navigate('/auth')}>
                  Login →
                </button>
              </div>
            )}

            {user && skills.length === 0 && (
              <div style={styles.loginPrompt}>
                <p style={styles.loginText}>Upload your resume to get personalized interview questions</p>
                <button style={styles.loginBtn} onClick={() => navigate('/profile')}>
                  Upload Resume →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cover Letter Tab */}
        {activeTab === 'cover' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>✉️ AI Cover Letter Generator</h2>
            <p style={styles.sectionDesc}>
              Generate a personalized cover letter for {job.title} at {job.company}
            </p>

            {!user ? (
              <div style={styles.loginPrompt}>
                <p style={styles.loginText}>Login to generate a cover letter</p>
                <button style={styles.loginBtn} onClick={() => navigate('/auth')}>
                  Login →
                </button>
              </div>
            ) : skills.length === 0 ? (
              <div style={styles.loginPrompt}>
                <p style={styles.loginText}>Upload your resume first to generate a cover letter</p>
                <button style={styles.loginBtn} onClick={() => navigate('/profile')}>
                  Upload Resume →
                </button>
              </div>
            ) : (
              <>
                <button
                  style={styles.generateBtn}
                  onClick={fetchCoverLetter}
                  disabled={coverLoading}
                >
                  {coverLoading ? '⏳ Generating...' : '✨ Generate Cover Letter'}
                </button>

                {coverLetter && (
                  <div style={styles.coverLetterBox}>
                    <div style={styles.coverLetterActions}>
                      <button
                        style={styles.copyBtn}
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetter);
                          alert('Copied to clipboard!');
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <p style={styles.coverLetterText}>{coverLetter}</p>
                  </div>
                )}
              </>
            )}
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
    padding: '24px 20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 0 16px',
  },
  jobHeader: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerLeft: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  logo: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  jobTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },
  company: {
    fontSize: '16px',
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: '8px',
  },
  jobMeta: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '13px',
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  applyBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  applyBtnDone: { background: '#15803d' },
  saveBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
  },
  saveBtnDone: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    background: 'white',
    cursor: 'pointer',
  },
  tabActive: {
    background: '#2563eb',
    color: 'white',
    border: '1px solid #2563eb',
  },
  section: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '28px',
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
    marginBottom: '24px',
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '40px 0',
  },
  loginText: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '16px',
  },
  loginBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#64748b',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 12px',
  },
  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  scoreCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '4px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scoreNum: {
    fontSize: '28px',
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  scoreInfo: { flex: 1 },
  verdict: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  scoreDesc: {
    fontSize: '14px',
    color: '#64748b',
  },
  skillsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  skillsCol: {},
  skillsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '12px',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  skillMatch: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  skillMissing: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionCard: {
    display: 'flex',
    gap: '14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    alignItems: 'flex-start',
  },
  questionNum: {
    background: '#2563eb',
    color: 'white',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  questionText: {
    fontSize: '15px',
    color: '#1e293b',
    lineHeight: '1.6',
  },
  generateBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  coverLetterBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '24px',
  },
  coverLetterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  coverLetterText: {
    fontSize: '15px',
    color: '#1e293b',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
  },
};

export default JobDetail;