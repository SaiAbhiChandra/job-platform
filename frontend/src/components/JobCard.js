import { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function JobCard({ job }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);

  const initials = job.company
    ? job.company.substring(0, 2).toUpperCase()
    : 'JB';

  const colors = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe'];
  const textColors = ['#1d4ed8', '#15803d', '#854d0e', '#be185d', '#6d28d9'];
  const colorIndex = job.company
    ? job.company.charCodeAt(0) % colors.length
    : 0;

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.floor(
      (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff > 30) return null;
    return `${diff} days ago`;
  };

  const daysAgo = getDaysAgo(job.posted_date);
  const isExpired = job.posted_date &&
    (new Date() - new Date(job.posted_date)) / (1000 * 60 * 60 * 24) > 30;

  const handleApply = async () => {
    if (user && !applied) {
      try {
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
      } catch (err) {
        console.error(err);
      }
    }
    window.open(job.apply_url, '_blank');
  };

  const handleSave = async () => {
    if (!user) { navigate('/auth'); return; }
    setSaving(true);
    try {
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
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (isExpired) return null;

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div style={{
          ...styles.logo,
          background: colors[colorIndex],
          color: textColors[colorIndex],
        }}>
          {initials}
        </div>
        <div style={styles.info}>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        <div style={styles.verified}>✅ Verified</div>
      </div>

      <div style={styles.meta}>
        {job.location && (
          <span style={styles.metaItem}>📍 {job.location}</span>
        )}
        {job.employment_type && (
          <span style={styles.metaItem}>💼 {job.employment_type}</span>
        )}
        {daysAgo && (
          <span style={{
            ...styles.metaItem,
            color: daysAgo === 'Today' ? '#16a34a' : '#64748b',
            fontWeight: daysAgo === 'Today' ? '600' : '400',
          }}>
            🕐 {daysAgo}
          </span>
        )}
      </div>

      <div style={styles.tags}>
        {job.employment_type && (
          <span style={styles.tagType}>{job.employment_type}</span>
        )}
        <span style={styles.tagSource}>{job.source}</span>
        {daysAgo === 'Today' && (
          <span style={styles.tagNew}>🔥 New today</span>
        )}
        {applied && (
          <span style={styles.tagApplied}>✅ Applied</span>
        )}
      </div>

      <div style={styles.bottom}>
        <div style={styles.actions}>
          <button
            style={{
              ...styles.applyBtn,
              ...(applied ? styles.applyBtnDone : {}),
            }}
            onClick={handleApply}
          >
            {applied ? '✅ Applied' : 'Apply Now →'}
          </button>
          <button
            style={{
              ...styles.saveBtn,
              ...(saved ? styles.saveBtnSaved : {}),
            }}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? '✅ Saved' : saving ? '...' : '🔖 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 24px',
  },
  top: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '14px',
  },
  logo: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  info: { flex: 1 },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '4px',
    lineHeight: '1.3',
  },
  company: {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '500',
  },
  verified: {
    fontSize: '12px',
    color: '#15803d',
    background: '#dcfce7',
    padding: '3px 10px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '14px',
  },
  metaItem: {
    fontSize: '13px',
    color: '#64748b',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  tagType: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: '500',
  },
  tagSource: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
  },
  tagNew: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    background: '#fef9c3',
    color: '#854d0e',
    fontWeight: '500',
  },
  tagApplied: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    background: '#dcfce7',
    color: '#15803d',
    fontWeight: '500',
  },
  bottom: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  applyBtn: {
    background: '#2563eb',
    color: 'white',
    padding: '9px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  applyBtnDone: {
    background: '#15803d',
  },
  saveBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveBtnSaved: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
  },
};

export default JobCard;