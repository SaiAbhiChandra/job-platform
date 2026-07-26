import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    totalSavedJobs: 0,
    totalAlerts: 0,
    totalResumes: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [topKeywords, setTopKeywords] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    checkAdmin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!data) {
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchAllStats();
  };

  const fetchAllStats = async () => {
    setLoading(true);

    const [
      usersRes,
      applicationsRes,
      savedRes,
      alertsRes,
      resumesRes,
      recentUsersRes,
      recentAppsRes,
      keywordsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('saved_jobs').select('*', { count: 'exact', head: true }),
      supabase.from('job_alerts').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('resume_name', 'is', null),
      supabase.from('profiles').select('id, email, full_name, created_at, resume_name').order('created_at', { ascending: false }).limit(10),
      supabase.from('applications').select('job_title, company, status, applied_at').order('applied_at', { ascending: false }).limit(10),
      supabase.from('job_alerts').select('keyword'),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalApplications: applicationsRes.count || 0,
      totalSavedJobs: savedRes.count || 0,
      totalAlerts: alertsRes.count || 0,
      totalResumes: resumesRes.count || 0,
    });

    setRecentUsers(recentUsersRes.data || []);
    setRecentApplications(recentAppsRes.data || []);

    // Count keyword frequency
    const keywordCount = {};
    (keywordsRes.data || []).forEach(a => {
      keywordCount[a.keyword] = (keywordCount[a.keyword] || 0) + 1;
    });
    const sorted = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    setTopKeywords(sorted);

    setLoading(false);
  };

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: '16px' }}>Loading dashboard...</p>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h1 style={styles.title}>⚡ Admin Dashboard</h1>
          <p style={styles.subtitle}>TrueJobs platform analytics</p>
          <button style={styles.refreshBtn} onClick={fetchAllStats}>
            🔄 Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#dbeafe', textColor: '#1d4ed8' },
            { label: 'Applications', value: stats.totalApplications, icon: '📋', color: '#dcfce7', textColor: '#15803d' },
            { label: 'Saved Jobs', value: stats.totalSavedJobs, icon: '🔖', color: '#fef9c3', textColor: '#854d0e' },
            { label: 'Job Alerts', value: stats.totalAlerts, icon: '🔔', color: '#ede9fe', textColor: '#6d28d9' },
            { label: 'Resumes Uploaded', value: stats.totalResumes, icon: '📄', color: '#fce7f3', textColor: '#be185d' },
            { label: 'Resume Rate', value: stats.totalUsers > 0 ? Math.round((stats.totalResumes / stats.totalUsers) * 100) + '%' : '0%', icon: '📊', color: '#f0fdf4', textColor: '#15803d' },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: stat.color, color: stat.textColor }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ ...styles.statValue, color: stat.textColor }}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>

          {/* Recent Users */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>👥 Recent Users</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Resume</th>
                    <th style={styles.th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.full_name || '—'}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        {u.resume_name
                          ? <span style={styles.badgeGreen}>✅ Yes</span>
                          : <span style={styles.badgeGray}>❌ No</span>
                        }
                      </td>
                      <td style={styles.td}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Keywords */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🔍 Top Alert Keywords</h2>
            {topKeywords.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No alerts created yet</p>
            ) : (
              <div style={styles.keywordsList}>
                {topKeywords.map(([keyword, count]) => (
                  <div key={keyword} style={styles.keywordRow}>
                    <span style={styles.keywordText}>{keyword}</span>
                    <div style={styles.keywordBar}>
                      <div style={{
                        ...styles.keywordFill,
                        width: `${(count / topKeywords[0][1]) * 100}%`
                      }} />
                    </div>
                    <span style={styles.keywordCount}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ ...styles.sectionTitle, marginTop: '24px' }}>📊 Platform Health</h2>
            {[
              { label: 'Avg applications per user', value: stats.totalUsers > 0 ? (stats.totalApplications / stats.totalUsers).toFixed(1) : 0 },
              { label: 'Users with alerts', value: stats.totalAlerts },
              { label: 'Resume upload rate', value: stats.totalUsers > 0 ? Math.round((stats.totalResumes / stats.totalUsers) * 100) + '%' : '0%' },
            ].map(item => (
              <div key={item.label} style={styles.healthRow}>
                <span style={styles.healthLabel}>{item.label}</span>
                <span style={styles.healthValue}>{item.value}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Recent Applications */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Recent Applications</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Job Title</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{app.job_title}</td>
                    <td style={styles.td}>{app.company}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: app.status === 'Offer' ? '#dcfce7'
                          : app.status === 'Interview' ? '#fef9c3'
                          : app.status === 'Rejected' ? '#fee2e2'
                          : '#dbeafe',
                        color: app.status === 'Offer' ? '#15803d'
                          : app.status === 'Interview' ? '#854d0e'
                          : app.status === 'Rejected' ? '#dc2626'
                          : '#1d4ed8',
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    maxWidth: '1100px',
    margin: '0 auto',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    flex: 1,
  },
  refreshBtn: {
    background: 'white',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  section: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '16px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px',
    color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
  },
  badgeGreen: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  badgeGray: {
    background: '#f1f5f9',
    color: '#64748b',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  keywordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  keywordRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  keywordText: {
    fontSize: '13px',
    color: '#1e293b',
    width: '140px',
    flexShrink: 0,
  },
  keywordBar: {
    flex: 1,
    height: '8px',
    background: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  keywordFill: {
    height: '100%',
    background: '#2563eb',
    borderRadius: '4px',
  },
  keywordCount: {
    fontSize: '13px',
    color: '#64748b',
    width: '24px',
    textAlign: 'right',
  },
  healthRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  healthLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
  healthValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
  },
};

export default Admin;