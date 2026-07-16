import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function SavedJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSavedJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (!error) setJobs(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('saved_jobs').delete().eq('id', id);
    setJobs(jobs.filter(j => j.id !== id));
  };

  if (loading) return (
    <div style={styles.center}>
      <p style={styles.loadingText}>Loading saved jobs...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Saved Jobs</h1>
        <p style={styles.subtitle}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {jobs.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🔖</p>
          <p style={styles.emptyTitle}>No saved jobs yet</p>
          <p style={styles.emptyDesc}>
            Click the Save button on any job to bookmark it here
          </p>
          <button
            style={styles.browseBtn}
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {jobs.map(job => (
            <div key={job.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.logoBox}>
                  {job.company?.substring(0, 2).toUpperCase()}
                </div>
                <div style={styles.info}>
                  <h3 style={styles.jobTitle}>{job.job_title}</h3>
                  <p style={styles.company}>{job.company}</p>
                </div>
                <span style={styles.source}>{job.source}</span>
              </div>

              {job.location && (
                <p style={styles.location}>📍 {job.location}</p>
              )}

              <p style={styles.savedAt}>
                Saved on {new Date(job.saved_at).toLocaleDateString()}
              </p>

              <div style={styles.cardActions}>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.applyBtn}
                >
                  Apply Now →
                </a>
                <button
                  style={styles.removeBtn}
                  onClick={() => handleDelete(job.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: '#f8fafc',
    minHeight: '100vh',
    padding: '36px 40px',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  loadingText: {
    fontSize: '16px',
    color: '#64748b',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '24px',
  },
  browseBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 24px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  jobTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '3px',
  },
  company: {
    fontSize: '13px',
    color: '#2563eb',
    fontWeight: '500',
  },
  source: {
    fontSize: '12px',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '3px 10px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  location: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
  },
  savedAt: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '14px',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },
  applyBtn: {
    background: '#2563eb',
    color: 'white',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default SavedJobs;