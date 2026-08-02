// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../AuthContext';

// function Navbar() {
//   const navigate = useNavigate();
//   const { user, signOut } = useAuth();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const handleSignOut = async () => {
//     await signOut();
//     navigate('/');
//     setMenuOpen(false);
//   };

//   return (
//     <nav style={styles.nav}>
//       <div style={styles.navLeft}>
//         <Link to="/" style={styles.logo}>TrueJobs</Link>
//       </div>

//       <div style={styles.navRight}>
//         {/* Desktop links */}
//         <div style={styles.desktopLinks} className="desktop-links">
//           <Link to="/jobs" style={styles.link}>Browse Jobs</Link>
//           {user && <Link to="/saved" style={styles.link}>Saved Jobs</Link>}
//           {user && <Link to="/alerts" style={styles.link}>Job Alerts</Link>}
//           {user && <Link to="/applications" style={styles.link}>My Applications</Link>}
//           <Link to="/smart-search" style={styles.link}>🤖 AI Search</Link>
//           <Link to="/resume-builder" style={styles.link}>Resume Builder</Link>
//           <Link to="/interview-prep" style={styles.link}>Interview Prep</Link>
//           {user ? (
//             <>
//               <span
//                 style={styles.userBadge}
//                 onClick={() => navigate('/profile')}
//                 title="View your profile"
//               >
//                 {user.user_metadata?.full_name || user.email.split('@')[0]}
//               </span>
//               <button style={styles.btnOutline} onClick={handleSignOut}>Log out</button>
//             </>
//           ) : (
//             <>
//               <button style={styles.btnOutline} onClick={() => navigate('/auth')}>Log in</button>
//               <button style={styles.btnPrimary} onClick={() => navigate('/auth')}>Sign up free</button>
//             </>
//           )}
//         </div>

//         {/* Mobile hamburger */}
//         <button style={styles.hamburger} className="hamburger-btn"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? '✕' : '☰'}
//         </button>
//       </div>

//       {/* Mobile menu */}
//       {menuOpen && (
//         <div style={styles.mobileMenu} className="mobile-menu">
//           <Link to="/jobs" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
//           {user && <Link to="/saved" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Saved Jobs</Link>}
//           {user && <Link to="/alerts" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Job Alerts 🔔</Link>}
//           {user && <Link to="/applications" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Applications</Link>}
//           {user && <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>}
//           <Link to="/smart-search" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🤖 AI Search</Link>
//           <Link to="/resume-builder" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📄 Resume Builder</Link>
//           <Link to="/interview-prep" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>💬 Interview Prep</Link>
//           {user ? (
//             <button style={styles.mobileBtnOutline} onClick={handleSignOut}>Log out</button>
//           ) : (
//             <>
//               <button style={styles.mobileBtnOutline} onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Log in</button>
//               <button style={styles.mobileBtnPrimary} onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Sign up free</button>
//             </>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }

// const styles = {
//   nav: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '14px 20px',
//     background: '#ffffff',
//     borderBottom: '1px solid #e2e8f0',
//     position: 'sticky',
//     top: 0,
//     zIndex: 100,
//     flexWrap: 'wrap',
//   },
//   navLeft: {
//     display: 'flex',
//     alignItems: 'center',
//   },
//   navRight: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//   },
//   logo: {
//     fontSize: '22px',
//     fontWeight: '700',
//     color: '#2563eb',
//     textDecoration: 'none',
//   },
//   desktopLinks: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '20px',
//     '@media(maxWidth:768px)': { display: 'none' },
//   },
//   link: {
//     color: '#64748b',
//     textDecoration: 'none',
//     fontSize: '15px',
//     fontWeight: '500',
//   },
//   userBadge: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#2563eb',
//     background: '#dbeafe',
//     padding: '6px 14px',
//     borderRadius: '20px',
//     cursor: 'pointer',
//   },
//   btnOutline: {
//     background: 'transparent',
//     color: '#1e293b',
//     border: '1px solid #cbd5e1',
//     padding: '8px 16px',
//     borderRadius: '8px',
//     fontSize: '14px',
//     fontWeight: '500',
//     cursor: 'pointer',
//   },
//   btnPrimary: {
//     background: '#2563eb',
//     color: 'white',
//     border: 'none',
//     padding: '8px 16px',
//     borderRadius: '8px',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//   },
//   hamburger: {
//     display: 'none',
//     background: 'transparent',
//     border: 'none',
//     fontSize: '22px',
//     cursor: 'pointer',
//     color: '#1e293b',
//     padding: '4px 8px',
//   },
//   mobileMenu: {
//     display: 'none',
//     flexDirection: 'column',
//     width: '100%',
//     borderTop: '1px solid #e2e8f0',
//     paddingTop: '12px',
//     gap: '8px',
//   },
//   mobileLink: {
//     color: '#1e293b',
//     textDecoration: 'none',
//     fontSize: '16px',
//     fontWeight: '500',
//     padding: '10px 4px',
//     borderBottom: '1px solid #f1f5f9',
//   },
//   mobileBtnOutline: {
//     background: 'transparent',
//     color: '#1e293b',
//     border: '1px solid #cbd5e1',
//     padding: '10px',
//     borderRadius: '8px',
//     fontSize: '15px',
//     fontWeight: '500',
//     cursor: 'pointer',
//     marginTop: '4px',
//   },
//   mobileBtnPrimary: {
//     background: '#2563eb',
//     color: 'white',
//     border: 'none',
//     padding: '10px',
//     borderRadius: '8px',
//     fontSize: '15px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     marginTop: '4px',
//   },
// };

// export default Navbar;

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const navBg = isHome && !scrolled
    ? 'rgba(10, 22, 40, 0.85)'
    : 'rgba(255,255,255,0.97)';
  const textColor = isHome && !scrolled ? '#fff' : '#0f172a';
  const linkColor = isHome && !scrolled ? 'rgba(255,255,255,0.8)' : '#475569';
  const borderColor = isHome && !scrolled
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.08)';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: navBg,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${borderColor}`,
      transition: 'all 0.3s ease',
      padding: '0 32px',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '800', color: 'white',
          }}>T</div>
          <span style={{
            fontSize: '20px', fontWeight: '800',
            color: textColor, letterSpacing: '-0.5px',
            transition: 'color 0.3s',
          }}>
            TrueHire
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-links" style={{ alignItems: 'center', gap: '4px' }}>
          {[
            { to: '/jobs', label: 'Jobs' },
            { to: '/interview-prep', label: 'Interview Prep' },
            { to: '/resume-builder', label: 'Resume Builder' },
            { to: '/smart-search', label: 'AI Search' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500',
                color: location.pathname === item.to ? '#2563eb' : linkColor,
                background: location.pathname === item.to ? 'rgba(37,99,235,0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <>
              <Link to="/saved" style={{
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', color: linkColor,
              }}>Saved</Link>
              <Link to="/applications" style={{
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', color: linkColor,
              }}>Applications</Link>
              <Link to="/alerts" style={{
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', color: linkColor,
              }}>Alerts</Link>
            </>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="desktop-links" style={{ alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 14px', borderRadius: '20px',
                  background: 'linear-gradient(135deg, #2563eb22, #7c3aed22)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', color: 'white',
                }}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                  {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '8px 18px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '500',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  color: linkColor,
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '8px 18px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '500',
                  background: 'transparent',
                  border: `1px solid ${isHome && !scrolled ? 'rgba(255,255,255,0.3)' : '#e2e8f0'}`,
                  color: textColor,
                }}
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '8px 20px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: 'white',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
                }}
              >
                Sign up free
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'transparent', border: 'none',
            fontSize: '24px', color: textColor, padding: '4px',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className="mobile-menu"
        style={{
          flexDirection: 'column',
          background: 'white',
          padding: '16px 20px',
          gap: '4px',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        {[
          { to: '/jobs', label: '🔍 Browse Jobs' },
          { to: '/interview-prep', label: '💬 Interview Prep' },
          { to: '/resume-builder', label: '📄 Resume Builder' },
          { to: '/smart-search', label: '🤖 AI Search' },
          ...(user ? [
            { to: '/saved', label: '🔖 Saved Jobs' },
            { to: '/applications', label: '📋 My Applications' },
            { to: '/alerts', label: '🔔 Job Alerts' },
            { to: '/profile', label: '👤 Profile' },
          ] : []),
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              padding: '12px 16px', borderRadius: '8px',
              fontSize: '15px', fontWeight: '500',
              color: '#0f172a', display: 'block',
              borderBottom: '1px solid #f1f5f9',
            }}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <button
            onClick={handleSignOut}
            style={{
              padding: '12px 16px', borderRadius: '8px',
              fontSize: '15px', fontWeight: '500',
              color: '#dc2626', background: '#fef2f2',
              border: 'none', width: '100%', textAlign: 'left',
              marginTop: '8px',
            }}
          >
            🚪 Log out
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => { navigate('/auth'); setMenuOpen(false); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px',
                fontSize: '15px', fontWeight: '600',
                border: '1px solid #e2e8f0', background: 'white',
                color: '#0f172a',
              }}
            >
              Log in
            </button>
            <button
              onClick={() => { navigate('/auth'); setMenuOpen(false); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px',
                fontSize: '15px', fontWeight: '600',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none', color: 'white',
              }}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;