import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  'Applied':     { bg: '#dbeafe', color: '#1d4ed8' },
  'Interview':   { bg: '#fef9c3', color: '#854d0e' },
  'Offer':       { bg: '#dcfce7', color: '#15803d' },
  'Rejected':    { bg: '#fee2e2', color: '#dc2626' },
  'No Response': { bg: '#f1f5f9', color: '#64748b' },
};

function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false });
    if (data) setApplications(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);
    setApplications(applications.map(a =>
      a.id === id ? { ...a, status } : a
    ));
  };

  const deleteApplication = async (id) => {
    await supabase.from('applications').delete().eq('id', id);
    setApplications(applications.filter(a => a.id !== id));
  };

  const filtered = filter === 'All'
    ? applications
    : applications.filter(a => a.status === filter);

  const stats = {
    total: applications.length,
    interview: applications.filter(a => a.status === 'Interview').length,
    offer: applications.filter(a => a.status === 'Offer').length,
    thisWeek: applications.filter(a => {
      const diff = (new Date() - new Date(a.applied_at)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length,
  };

  if (loading) return (
    <div style={styles.center}>
      <p style={{ color: '#64748b' }}>Loading applications...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Application Tracker</h1>
          <p style={styles.subtitle}>Track every job you apply to</p>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { num: stats.total, label: 'Total Applied' },
            { num: stats.thisWeek, label: 'This Week' },
            { num: stats.interview, label: 'Interviews' },
            { num: stats.offer, label: 'Offers' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={styles.statNum}>{s.num}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={styles.tabs}>
          {['All', ...Object.keys(STATUS_COLORS)].map(f => (
            <button
              key={f}
              style={{
                ...styles.tab,
                ...(filter === f ? styles.tabActive : {}),
              }}
              onClick={() => setFilter(f)}
            >
              {f} {f !== 'All' && `(${applications.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: '40px' }}>📋</p>
            <p style={styles.emptyTitle}>No applications yet</p>
            <p style={styles.emptyDesc}>
              Click "Apply Now" on any job to track it here automatically
            </p>
            <button
              style={styles.browseBtn}
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
            </button>
          </div>
        )}

        {/* Applications list */}
        <div style={styles.list}>
          {filtered.map(app => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.logoBox}>
                  {app.company?.substring(0, 2).toUpperCase()}
                </div>
                <div style={styles.info}>
                  <p style={styles.jobTitle}>{app.job_title}</p>
                  <p style={styles.company}>{app.company}</p>
                  {app.location && (
                    <p style={styles.location}>📍 {app.location}</p>
                  )}
                </div>
                <div style={styles.cardRight}>
                  <span style={{
                    ...styles.statusBadge,
                    background: STATUS_COLORS[app.status]?.bg || '#f1f5f9',
                    color: STATUS_COLORS[app.status]?.color || '#64748b',
                  }}>
                    {app.status}
                  </span>
                  <p style={styles.date}>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={styles.cardActions}>
                <span style={styles.updateLabel}>Update status:</span>
                {Object.keys(STATUS_COLORS).map(s => (
                  <button
                    key={s}
                    style={{
                      ...styles.statusBtn,
                      background: app.status === s
                        ? STATUS_COLORS[s].bg : 'transparent',
                      color: app.status === s
                        ? STATUS_COLORS[s].color : '#94a3b8',
                      border: `1px solid ${app.status === s
                        ? STATUS_COLORS[s].color : '#e2e8f0'}`,
                    }}
                    onClick={() => updateStatus(app.id, s)}
                  >
                    {s}
                  </button>
                ))}
                <a
                  href={app.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.viewBtn}
                >
                  View Job
                </a>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteApplication(app.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
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
    maxWidth: '900px',
    margin: '0 auto',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  header: { marginBottom: '24px' },
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
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
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
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '7px 16px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#64748b',
    background: 'white',
    cursor: 'pointer',
    fontWeight: '500',
  },
  tabActive: {
    background: '#dbeafe',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#0f172a',
    marginTop: '12px',
  },
  emptyDesc: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '24px',
    marginTop: '8px',
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 24px',
  },
  cardTop: {
    display: 'flex',
    gap: '14px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  logoBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  info: { flex: 1 },
  jobTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '3px',
  },
  company: {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: '3px',
  },
  location: {
    fontSize: '13px',
    color: '#64748b',
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  date: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },
  updateLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginRight: '4px',
  },
  statusBtn: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  viewBtn: {
    marginLeft: 'auto',
    background: '#2563eb',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default Applications;