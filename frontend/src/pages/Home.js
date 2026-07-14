import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Find Real Jobs.<br />Zero Fake Listings.</h1>
        <p style={styles.subtitle}>
          Every job on TrueJobs comes directly from verified company sources.
          No scams. No fake posts. Just real opportunities.
        </p>
        <button style={styles.btn} onClick={() => navigate('/jobs')}>
          Browse Jobs Now
        </button>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <h2 style={styles.statNum}>10,000+</h2>
          <p style={styles.statLabel}>Verified Jobs</p>
        </div>
        <div style={styles.stat}>
          <h2 style={styles.statNum}>500+</h2>
          <p style={styles.statLabel}>Companies</p>
        </div>
        <div style={styles.stat}>
          <h2 style={styles.statNum}>100%</h2>
          <p style={styles.statLabel}>Real Listings</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '90vh',
    background: '#0f172a',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  hero: {
    textAlign: 'center',
    maxWidth: '700px',
  },
  title: {
    fontSize: '52px',
    fontWeight: 'bold',
    lineHeight: '1.2',
    marginBottom: '20px',
    color: 'white',
  },
  subtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    marginBottom: '36px',
    lineHeight: '1.7',
  },
  btn: {
    background: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    padding: '14px 36px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  stats: {
    display: 'flex',
    gap: '60px',
    marginTop: '80px',
  },
  stat: {
    textAlign: 'center',
  },
  statNum: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#38bdf8',
    margin: '0',
  },
  statLabel: {
    color: '#94a3b8',
    margin: '4px 0 0',
  }
};

export default Home;