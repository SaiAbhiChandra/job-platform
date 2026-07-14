function JobCard({ job }) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        <span style={styles.source}>{job.source}</span>
      </div>
      <p style={styles.location}>📍 {job.location}</p>
      {job.employment_type && (
        <span style={styles.badge}>{job.employment_type}</span>
      )}
      <a href={job.apply_url} target="_blank" rel="noreferrer" style={styles.btn}>
        Apply Now →
      </a>
    </div>
  );
}

const styles = {
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: 'white',
    margin: '0 0 4px',
    fontSize: '17px',
    fontWeight: '600',
  },
  company: {
    color: '#38bdf8',
    margin: '0',
    fontSize: '14px',
  },
  source: {
    background: '#0f172a',
    color: '#94a3b8',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  location: {
    color: '#94a3b8',
    margin: '0',
    fontSize: '14px',
  },
  badge: {
    background: '#1d4ed8',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    width: 'fit-content',
  },
  btn: {
    background: '#38bdf8',
    color: '#0f172a',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '14px',
  }
};

export default JobCard;