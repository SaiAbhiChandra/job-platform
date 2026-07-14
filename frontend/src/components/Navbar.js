import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>TrueJobs</Link>
      <div style={styles.links}>
        <Link to="/jobs" style={styles.link}>Browse Jobs</Link>
        <button style={styles.btn}>Sign Up Free</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    background: '#0f172a',
    color: 'white',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#38bdf8',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
  },
  btn: {
    background: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
  }
};

export default Navbar;