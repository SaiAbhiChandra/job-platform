import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>TrueJobs</Link>
      <div style={styles.links}>
        <Link to="/jobs" style={styles.link}>Browse Jobs</Link>
        <a href="#companies" style={styles.link}>Companies</a>
        <button style={styles.btnOutline}>Log in</button>
        <button style={styles.btnPrimary} onClick={() => navigate('/auth')}>
          Sign up free
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 40px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2563eb',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
  },
  btnOutline: {
    background: 'transparent',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  btnPrimary: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default Navbar;