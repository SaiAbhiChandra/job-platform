import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchSavedJobsCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchSavedJobsCount = async () => {
    const { count } = await supabase
      .from('saved_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setSavedJobsCount(count || 0);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Max size is 5MB.');
      return;
    }

    const allowed = ['application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PDF and Word documents allowed.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/resume.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      await supabase.from('profiles').update({
        resume_url: urlData?.signedUrl,
        resume_name: file.name,
      }).eq('id', user.id);

      setUploadSuccess(`✅ ${file.name} uploaded successfully!`);
      fetchProfile();
    } catch (err) {
      setUploadError(err.message);
    }

    setUploading(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
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

      await supabase.from('profiles').update({
        resume_url: null,
        resume_name: null,
      }).eq('id', user.id);

      setProfile({ ...profile, resume_url: null, resume_name: null });
      setUploadSuccess('Resume deleted successfully.');
    } catch (err) {
      setUploadError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
          <button style={styles.signOutBtn} onClick={handleSignOut}>
            Log out
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{savedJobsCount}</p>
            <p style={styles.statLabel}>Saved Jobs</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>
              {profile?.resume_name ? '✅' : '❌'}
            </p>
            <p style={styles.statLabel}>Resume Uploaded</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>🟢</p>
            <p style={styles.statLabel}>Profile Active</p>
          </div>
        </div>

        {/* Resume Upload */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📄 Your Resume</h2>
          <p style={styles.sectionDesc}>
            Upload your CV/Resume (PDF or Word). Max size 5MB.
          </p>

          {uploadError && (
            <div style={styles.error}>{uploadError}</div>
          )}
          {uploadSuccess && (
            <div style={styles.success}>{uploadSuccess}</div>
          )}

          {profile?.resume_name ? (
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
                <button
                  style={styles.deleteBtn}
                  onClick={handleDeleteResume}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : null}

          <div
            style={{
              ...styles.dropZone,
              ...(dragOver ? styles.dropZoneActive : {}),
            }}
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resumeInput').click()}
          >
            <input
              id="resumeInput"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
            {uploading ? (
              <>
                <div style={styles.uploadSpinner} />
                <p style={styles.dropText}>Uploading...</p>
              </>
            ) : (
              <>
                <p style={styles.uploadIcon}>☁️</p>
                <p style={styles.dropText}>
                  {profile?.resume_name
                    ? 'Drop new file to replace current resume'
                    : 'Drag & drop your resume here'}
                </p>
                <p style={styles.dropSubtext}>or click to browse files</p>
                <p style={styles.dropFormats}>PDF, DOC, DOCX — Max 5MB</p>
              </>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Links</h2>
          <div style={styles.quickLinks}>
            <button
              style={styles.quickBtn}
              onClick={() => navigate('/jobs')}
            >
              🔍 Browse Jobs
            </button>
            <button
              style={styles.quickBtn}
              onClick={() => navigate('/saved')}
            >
              🔖 Saved Jobs
            </button>
            <button
              style={styles.quickBtn}
              onClick={() => navigate('/')}
            >
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
  profileInfo: {
    flex: 1,
  },
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
  },
  resumeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  resumeIcon: {
    fontSize: '28px',
  },
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
  dropZone: {
    border: '2px dashed #e2e8f0',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
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