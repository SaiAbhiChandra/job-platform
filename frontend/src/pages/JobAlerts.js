import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const KEYWORDS = [
  'Software Engineer', 'Data Scientist', 'Python Developer',
  'React Developer', 'Machine Learning', 'Full Stack Developer',
  'DevOps Engineer', 'UI/UX Designer', 'Product Manager',
  'Business Analyst', 'Java Developer', 'Node.js Developer'
];

function JobAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('India');
  const [adding, setAdding] = useState(false);
  const [testLoading, setTestLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  };

  const addAlert = async () => {
    if (!keyword) { setMessage('Please enter a keyword'); return; }
    setAdding(true);
    const { error } = await supabase.from('job_alerts').insert({
      user_id: user.id,
      email: user.email,
      keyword,
      location,
      is_active: true,
    });
    if (!error) {
      setMessage(`✅ Alert created for "${keyword}" jobs!`);
      setKeyword('');
      fetchAlerts();
    } else {
      setMessage('Error creating alert: ' + error.message);
    }
    setAdding(false);
  };

  const toggleAlert = async (id, currentState) => {
    await supabase
      .from('job_alerts')
      .update({ is_active: !currentState })
      .eq('id', id);
    setAlerts(alerts.map(a =>
      a.id === id ? { ...a, is_active: !currentState } : a
    ));
  };

  const deleteAlert = async (id) => {
    await supabase.from('job_alerts').delete().eq('id', id);
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const sendTestAlert = async (alert) => {
    setTestLoading(alert.id);
    setMessage('');
    try {
      const jobsRes = await axios.get(
        `${API}/api/jobs/jsearch?keyword=${alert.keyword}`
      );
      if (jobsRes.data.success && jobsRes.data.jobs.length > 0) {
        const res = await axios.post(`${API}/api/jobs/send-alert`, {
          to: user.email,
          keyword: alert.keyword,
          jobs: jobsRes.data.jobs.slice(0, 5),
          userName: user.user_metadata?.full_name || user.email.split('@')[0],
        });
        if (res.data.success) {
          setMessage(`✅ Test email sent to ${user.email}! Check your inbox.`);
        }
      } else {
        setMessage('No jobs found for this keyword to send.');
      }
    } catch (err) {
      setMessage('Error sending test: ' + err.message);
    }
    setTestLoading(null);
  };

  if (loading) return (
    <div style={styles.center}>
      <p style={{ color: '#64748b' }}>Loading alerts...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h1 style={styles.title}>🔔 Job Alerts</h1>
          <p style={styles.subtitle}>
            Get notified by email when new jobs match your keywords
          </p>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            background: message.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
            color: message.startsWith('✅') ? '#16a34a' : '#dc2626',
            border: `1px solid ${message.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {message}
          </div>
        )}

        {/* Create Alert */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Create New Alert</h2>
          <p style={styles.sectionDesc}>
            We'll email you daily when new matching jobs are posted
          </p>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Job keyword</label>
              <input
                style={styles.input}
                placeholder="e.g. Python Developer"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAlert()}
              />
              <div style={styles.suggestions}>
                {KEYWORDS.filter(k =>
                  k.toLowerCase().includes(keyword.toLowerCase()) && keyword
                ).slice(0, 4).map(k => (
                  <span
                    key={k}
                    style={styles.suggestion}
                    onClick={() => setKeyword(k)}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <select
                style={styles.select}
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                {['India', 'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai',
                  'Delhi', 'Pune', 'Remote', 'USA', 'UK'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <button
              style={styles.addBtn}
              onClick={addAlert}
              disabled={adding}
            >
              {adding ? 'Creating...' : '+ Create Alert'}
            </button>
          </div>

          <div style={styles.popularSection}>
            <p style={styles.popularLabel}>Popular alerts:</p>
            <div style={styles.popularChips}>
              {KEYWORDS.slice(0, 6).map(k => (
                <span
                  key={k}
                  style={styles.popularChip}
                  onClick={() => setKeyword(k)}
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Your Alerts ({alerts.length})
          </h2>

          {alerts.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '36px' }}>🔔</p>
              <p style={styles.emptyTitle}>No alerts yet</p>
              <p style={styles.emptyDesc}>
                Create your first alert above to start getting job notifications
              </p>
            </div>
          ) : (
            <div style={styles.alertsList}>
              {alerts.map(alert => (
                <div key={alert.id} style={styles.alertCard}>
                  <div style={styles.alertLeft}>
                    <div style={styles.alertIcon}>🔔</div>
                    <div>
                      <p style={styles.alertKeyword}>{alert.keyword}</p>
                      <p style={styles.alertMeta}>
                        📍 {alert.location} · Daily · {alert.email}
                      </p>
                      {alert.last_sent && (
                        <p style={styles.alertLastSent}>
                          Last sent: {new Date(alert.last_sent).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={styles.alertRight}>
                    <span style={{
                      ...styles.statusBadge,
                      background: alert.is_active ? '#dcfce7' : '#f1f5f9',
                      color: alert.is_active ? '#16a34a' : '#64748b',
                    }}>
                      {alert.is_active ? '● Active' : '○ Paused'}
                    </span>

                    <button
                      style={styles.testBtn}
                      onClick={() => sendTestAlert(alert)}
                      disabled={testLoading === alert.id}
                      title="Send a test email now"
                    >
                      {testLoading === alert.id ? '⏳' : '📧 Test'}
                    </button>

                    <button
                      style={styles.toggleBtn}
                      onClick={() => toggleAlert(alert.id, alert.is_active)}
                    >
                      {alert.is_active ? 'Pause' : 'Resume'}
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteAlert(alert.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>How job alerts work</h2>
          <div style={styles.howItWorks}>
            {[
              { step: '1', title: 'Set your keyword', desc: 'Enter any job title, skill, or company name' },
              { step: '2', title: 'We search daily', desc: 'Every morning we scan 50+ companies for matching jobs' },
              { step: '3', title: 'You get an email', desc: 'Fresh job matches delivered to your inbox daily' },
            ].map(item => (
              <div key={item.step} style={styles.howCard}>
                <div style={styles.howStep}>{item.step}</div>
                <h3 style={styles.howTitle}>{item.title}</h3>
                <p style={styles.howDesc}>{item.desc}</p>
              </div>
            ))}
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
    maxWidth: '800px',
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
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
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
  formRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  formGroup: {
    flex: 1,
    minWidth: '180px',
    position: 'relative',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1e293b',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    zIndex: 10,
    marginTop: '4px',
  },
  suggestion: {
    display: 'block',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1e293b',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  select: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#475569',
    background: 'white',
  },
  addBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '11px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  popularSection: { marginTop: '8px' },
  popularLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '8px',
  },
  popularChips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  popularChip: {
    padding: '5px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#475569',
    cursor: 'pointer',
    background: '#f8fafc',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 0',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    marginTop: '12px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '8px',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  alertCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  alertLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  alertIcon: {
    fontSize: '24px',
  },
  alertKeyword: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '4px',
  },
  alertMeta: {
    fontSize: '13px',
    color: '#64748b',
  },
  alertLastSent: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  alertRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  testBtn: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  toggleBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
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
  howItWorks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  howCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  howStep: {
    width: '36px',
    height: '36px',
    background: '#2563eb',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 auto 12px',
  },
  howTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '6px',
  },
  howDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },
};

export default JobAlerts;