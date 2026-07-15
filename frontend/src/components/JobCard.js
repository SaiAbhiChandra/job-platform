function JobCard({ job }) {
  const initials = job.company
    ? job.company.substring(0, 2).toUpperCase()
    : 'JB';

  const colors = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe'];
  const textColors = ['#1d4ed8', '#15803d', '#854d0e', '#be185d', '#6d28d9'];
  const colorIndex = job.company
    ? job.company.charCodeAt(0) % colors.length
    : 0;

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
        {job.salary_min && job.salary_min !== 'Not disclosed' && (
          <span style={styles.metaItem}>
            💰 {job.salary_min}
          </span>
        )}
        {job.posted_date && (
          <span style={styles.metaItem}>
            🕐 {new Date(job.posted_date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div style={styles.tags}>
        {job.employment_type && (
          <span style={styles.tagType}>{job.employment_type}</span>
        )}
        <span style={styles.tagSource}>{job.source}</span>
      </div>

      <div style={styles.bottom}>
        <div style={styles.actions}>
        <a
          href={job.apply_url}
          target="_blank"
          rel="noreferrer"
          style={styles.applyBtn}
        >
          Apply Now
        </a>
        <button style={styles.saveBtn}>Save</button>
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
  info: {
    flex: 1,
  },
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
    textDecoration: 'none',
    display: 'inline-block',
  },
  saveBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
};

export default JobCard;