// import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';

// function Home() {
//   const navigate = useNavigate();

// useEffect(() => {
//     document.title = 'TrueJobs — Find Real Jobs, Zero Fake Listings';
//   }, []);

//   return (
//     <div>
//       <div style={styles.hero}>
//         <div style={styles.badge}>100% Verified Job Listings</div>
//         <h1 style={styles.title}>Find Real Jobs.<br />Zero Fake Listings.</h1>
//         <p style={styles.subtitle}>
//           Every job on TrueJobs comes directly from verified company sources.
//           No scams. No spam. Just real opportunities from real companies.
//         </p>
//         <div style={styles.searchBox}>
//           <input
//             style={styles.searchInput}
//             placeholder="Job title, skill, or company..."
//           />
//           <select style={styles.searchSelect}>
//             <option>All locations</option>
//             <option>India</option>
//             <option>Remote</option>
//             <option>USA</option>
//             <option>UK</option>
//           </select>
//           <button
//             style={styles.searchBtn}
//             onClick={() => navigate('/jobs')}
//           >
//             Search Jobs
//           </button>
//         </div>
//         <div style={styles.stats}>
//           <div style={styles.stat}>
//             <span style={styles.statNum}>12,400+</span>
//             <span style={styles.statLabel}>Verified Jobs</span>
//           </div>
//           <div style={styles.statDivider} />
//           <div style={styles.stat}>
//             <span style={styles.statNum}>500+</span>
//             <span style={styles.statLabel}>Companies</span>
//           </div>
//           <div style={styles.statDivider} />
//           <div style={styles.stat}>
//             <span style={styles.statNum}>100%</span>
//             <span style={styles.statLabel}>Real Listings</span>
//           </div>
//           <div style={styles.statDivider} />
//           <div style={styles.stat}>
//             <span style={styles.statNum}>Daily</span>
//             <span style={styles.statLabel}>Updated</span>
//           </div>
//         </div>
//       </div>

//       <div style={styles.companies}>
//   <p style={styles.companiesLabel}>Trusted by top companies worldwide</p>
//   <div style={styles.marqueeWrapper}>
//     <div style={styles.marqueeTrack}>
//       {[
//         { name: 'Airbnb', color: '#FF5A5F', bg: '#fff0f0' },
//         { name: 'Stripe', color: '#635BFF', bg: '#f0efff' },
//         { name: 'Notion', color: '#000000', bg: '#f5f5f5' },
//         { name: 'Figma', color: '#F24E1E', bg: '#fff2ef' },
//         { name: 'Shopify', color: '#96BF48', bg: '#f4faed' },
//         { name: 'Canva', color: '#00C4CC', bg: '#edfcfc' },
//         { name: 'GitLab', color: '#FC6D26', bg: '#fff3ee' },
//         { name: 'Atlassian', color: '#0052CC', bg: '#eef3ff' },
//         { name: 'Discord', color: '#5865F2', bg: '#f0f1ff' },
//         { name: 'Twilio', color: '#F22F46', bg: '#fff0f1' },
//         { name: 'Datadog', color: '#632CA6', bg: '#f5f0ff' },
//         { name: 'HubSpot', color: '#FF7A59', bg: '#fff3f0' },
//         { name: 'Intercom', color: '#1F8DED', bg: '#eef6ff' },
//         { name: 'Loom', color: '#625DF5', bg: '#f0f0ff' },
//         { name: 'Miro', color: '#FFD02F', bg: '#fffbea' },
//         { name: 'Zapier', color: '#FF4A00', bg: '#fff1ec' },
//         { name: 'Coinbase', color: '#0052FF', bg: '#eef2ff' },
//         { name: 'DoorDash', color: '#FF3008', bg: '#fff0ee' },
//         { name: 'Brex', color: '#F93549', bg: '#fff0f2' },
//         { name: 'Rippling', color: '#F2A900', bg: '#fffbf0' },
//         // Duplicate for seamless loop
//         { name: 'Airbnb', color: '#FF5A5F', bg: '#fff0f0' },
//         { name: 'Stripe', color: '#635BFF', bg: '#f0efff' },
//         { name: 'Notion', color: '#000000', bg: '#f5f5f5' },
//         { name: 'Figma', color: '#F24E1E', bg: '#fff2ef' },
//         { name: 'Shopify', color: '#96BF48', bg: '#f4faed' },
//         { name: 'Canva', color: '#00C4CC', bg: '#edfcfc' },
//         { name: 'GitLab', color: '#FC6D26', bg: '#fff3ee' },
//         { name: 'Atlassian', color: '#0052CC', bg: '#eef3ff' },
//         { name: 'Discord', color: '#5865F2', bg: '#f0f1ff' },
//         { name: 'Twilio', color: '#F22F46', bg: '#fff0f1' },
//         { name: 'Datadog', color: '#632CA6', bg: '#f5f0ff' },
//         { name: 'HubSpot', color: '#FF7A59', bg: '#fff3f0' },
//         { name: 'Intercom', color: '#1F8DED', bg: '#eef6ff' },
//         { name: 'Loom', color: '#625DF5', bg: '#f0f0ff' },
//         { name: 'Miro', color: '#FFD02F', bg: '#fffbea' },
//         { name: 'Zapier', color: '#FF4A00', bg: '#fff1ec' },
//         { name: 'Coinbase', color: '#0052FF', bg: '#eef2ff' },
//         { name: 'DoorDash', color: '#FF3008', bg: '#fff0ee' },
//         { name: 'Brex', color: '#F93549', bg: '#fff0f2' },
//         { name: 'Rippling', color: '#F2A900', bg: '#fffbf0' },
//       ].map((c, i) => (
//         <div key={i} style={styles.companyChip}>
//           <div style={{
//             ...styles.companyLogo,
//             background: c.bg,
//             color: c.color,
//           }}>
//             {c.name.substring(0, 2).toUpperCase()}
//           </div>
//           <span style={styles.companyName}>{c.name}</span>
//         </div>
//       ))}
//     </div>
//   </div>
// </div>

//       <div style={styles.features}>
//         {[
//           { icon: '✅', title: 'Zero fake jobs', desc: 'Every listing comes directly from company ATS systems or verified job APIs.' },
//           { icon: '🔄', title: 'Updated daily', desc: 'Jobs refresh every 24 hours so you never apply to an expired listing.' },
//           { icon: '🌍', title: 'Global reach', desc: 'Jobs from India, USA, UK, Australia and 50+ countries in one place.' },
//           { icon: '⚡', title: 'Apply instantly', desc: 'One click takes you directly to the official company application page.' },
//         ].map(f => (
//           <div key={f.title} style={styles.featureCard}>
//             <div style={styles.featureIcon}>{f.icon}</div>
//             <h3 style={styles.featureTitle}>{f.title}</h3>
//             <p style={styles.featureDesc}>{f.desc}</p>
//           </div>
//         ))}
//       </div>

//       <div style={styles.cta}>
//         <h2 style={styles.ctaTitle}>Start your job search today</h2>
//         <p style={styles.ctaDesc}>Join thousands of job seekers who trust TrueJobs for verified listings.</p>
//         <button style={styles.ctaBtn} onClick={() => navigate('/jobs')}>
//           Browse All Jobs →
//         </button>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   hero: {
//     background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
//     padding: '72px 40px 52px',
//     textAlign: 'center',
//     borderBottom: '1px solid #e2e8f0',
//   },
//   badge: {
//     display: 'inline-block',
//     background: '#dbeafe',
//     color: '#1d4ed8',
//     padding: '6px 16px',
//     borderRadius: '20px',
//     fontSize: '13px',
//     fontWeight: '600',
//     marginBottom: '20px',
//   },
//   title: {
//     fontSize: '52px',
//     fontWeight: '800',
//     color: '#0f172a',
//     lineHeight: '1.15',
//     marginBottom: '20px',
//     letterSpacing: '-1px',
//   },
//   subtitle: {
//     fontSize: '18px',
//     color: '#64748b',
//     maxWidth: '560px',
//     margin: '0 auto 36px',
//     lineHeight: '1.7',
//   },
//   searchBox: {
//     display: 'flex',
//     gap: '10px',
//     maxWidth: '660px',
//     margin: '0 auto 36px',
//     background: 'white',
//     padding: '8px',
//     borderRadius: '12px',
//     border: '1px solid #e2e8f0',
//     boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
//     flexWrap: 'wrap',
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: '200px',
//     padding: '10px 16px',
//     border: 'none',
//     fontSize: '15px',
//     color: '#1e293b',
//     background: 'transparent',
//   },
//   searchSelect: {
//     padding: '10px 14px',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     fontSize: '14px',
//     color: '#64748b',
//     background: 'white',
//   },
//   searchBtn: {
//     background: '#2563eb',
//     color: 'white',
//     border: 'none',
//     padding: '10px 24px',
//     borderRadius: '8px',
//     fontSize: '15px',
//     fontWeight: '600',
//     whiteSpace: 'nowrap',
//     width: '100%',
//     cursor: 'pointer',
//   },
//   stats: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '32px',
//     flexWrap: 'wrap',
//   },
//   stat: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   statNum: {
//     fontSize: '28px',
//     fontWeight: '700',
//     color: '#2563eb',
//   },
//   statLabel: {
//     fontSize: '13px',
//     color: '#64748b',
//     marginTop: '4px',
//   },
//   statDivider: {
//     width: '1px',
//     height: '36px',
//     background: '#e2e8f0',
//   },
//   companies: {
//     padding: '32px 0',
//     textAlign: 'center',
//     borderBottom: '1px solid #e2e8f0',
//     background: 'white',
//     overflow: 'hidden',
//   },
//   companiesLabel: {
//     fontSize: '13px',
//     color: '#94a3b8',
//     marginBottom: '20px',
//     textTransform: 'uppercase',
//     letterSpacing: '0.05em',
//   },
//   marqueeWrapper: {
//     overflow: 'hidden',
//     width: '100%',
//   },
//   marqueeTrack: {
//     display: 'flex',
//     gap: '12px',
//     animation: 'marquee 35s linear infinite',
//     width: 'max-content',
//   },
//   companyChip: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '10px',
//     padding: '10px 20px',
//     border: '1px solid #e2e8f0',
//     borderRadius: '12px',
//     background: 'white',
//     flexShrink: 0,
//     boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
//   },
//   companyLogo: {
//     width: '32px',
//     height: '32px',
//     borderRadius: '8px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '11px',
//     fontWeight: '800',
//     flexShrink: 0,
//   },
//   companyName: {
//     fontSize: '14px',
//     color: '#1e293b',
//     fontWeight: '600',
//     whiteSpace: 'nowrap',
//   },
//   features: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//     gap: '24px',
//     padding: '52px 40px',
//     background: '#f8fafc',
//   },
//   featureCard: {
//     background: 'white',
//     border: '1px solid #e2e8f0',
//     borderRadius: '12px',
//     padding: '28px 24px',
//   },
//   featureIcon: {
//     fontSize: '28px',
//     marginBottom: '14px',
//   },
//   featureTitle: {
//     fontSize: '16px',
//     fontWeight: '700',
//     color: '#0f172a',
//     marginBottom: '8px',
//   },
//   featureDesc: {
//     fontSize: '14px',
//     color: '#64748b',
//     lineHeight: '1.6',
//   },
//   cta: {
//     background: '#2563eb',
//     padding: '64px 40px',
//     textAlign: 'center',
//   },
//   ctaTitle: {
//     fontSize: '32px',
//     fontWeight: '700',
//     color: 'white',
//     marginBottom: '12px',
//   },
//   ctaDesc: {
//     fontSize: '16px',
//     color: '#bfdbfe',
//     marginBottom: '28px',
//   },
//   ctaBtn: {
//     background: 'white',
//     color: '#2563eb',
//     border: 'none',
//     padding: '14px 32px',
//     borderRadius: '8px',
//     fontSize: '16px',
//     fontWeight: '700',
//   },
// };

// export default Home;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FLOATING_JOBS = [
  { title: 'ML Engineer', company: 'Google', location: 'Hyderabad', color: '#4285F4' },
  { title: 'Full Stack Dev', company: 'Stripe', location: 'Remote', color: '#635BFF' },
  { title: 'Data Scientist', company: 'Amazon', location: 'Bangalore', color: '#FF9900' },
  { title: 'UI/UX Designer', company: 'Airbnb', location: 'Mumbai', color: '#FF5A5F' },
  { title: 'DevOps Engineer', company: 'Microsoft', location: 'Pune', color: '#00A4EF' },
];

const STATS = [
  { num: '50,000+', label: 'Active Jobs', icon: '💼' },
  { num: '500+', label: 'Companies', icon: '🏢' },
  { num: '100%', label: 'Verified', icon: '✅' },
  { num: '0', label: 'Fake Listings', icon: '🚫' },
];

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Resume Builder',
    desc: 'Generate ATS-optimized resumes tailored to any job description in 30 seconds.',
    link: '/resume-builder',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    icon: '🎯',
    title: 'Smart Job Matching',
    desc: 'AI analyzes your resume and shows your match score for every job.',
    link: '/jobs',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    icon: '💬',
    title: 'Interview Prep',
    desc: 'Real interview questions from Google, Amazon, TCS, Infosys and 10+ companies.',
    link: '/interview-prep',
    color: '#059669',
    bg: '#d1fae5',
  },
  {
    icon: '🔔',
    title: 'Job Alerts',
    desc: 'Get daily email alerts when new jobs matching your skills are posted.',
    link: '/alerts',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    icon: '📋',
    title: 'Application Tracker',
    desc: 'Track every application you submit. Never lose track of your job search.',
    link: '/applications',
    color: '#dc2626',
    bg: '#fee2e2',
  },
  {
    icon: '🏛️',
    title: 'Govt Jobs',
    desc: 'Browse UPSC, SSC, Banking, Railway and all central & state government jobs.',
    link: '/jobs',
    color: '#0ea5e9',
    bg: '#e0f2fe',
  },
];

const COMPANIES = [
  { name: 'Google', color: '#4285F4', bg: '#e8f0fe' },
  { name: 'Amazon', color: '#FF9900', bg: '#fff3e0' },
  { name: 'Microsoft', color: '#00A4EF', bg: '#e0f4ff' },
  { name: 'Airbnb', color: '#FF5A5F', bg: '#ffe8e8' },
  { name: 'Stripe', color: '#635BFF', bg: '#eeeeff' },
  { name: 'Notion', color: '#000000', bg: '#f5f5f5' },
  { name: 'Figma', color: '#F24E1E', bg: '#fff2ef' },
  { name: 'Shopify', color: '#96BF48', bg: '#f4faed' },
  { name: 'Canva', color: '#00C4CC', bg: '#edfcfc' },
  { name: 'GitLab', color: '#FC6D26', bg: '#fff3ee' },
  { name: 'Atlassian', color: '#0052CC', bg: '#eef3ff' },
  { name: 'Discord', color: '#5865F2', bg: '#f0f1ff' },
  { name: 'Twilio', color: '#F22F46', bg: '#fff0f1' },
  { name: 'Loom', color: '#625DF5', bg: '#f0f0ff' },
  { name: 'Miro', color: '#FFD02F', bg: '#fffbea' },
  { name: 'Zapier', color: '#FF4A00', bg: '#fff1ec' },
  { name: 'Coinbase', color: '#0052FF', bg: '#eef2ff' },
  { name: 'DoorDash', color: '#FF3008', bg: '#fff0ee' },
  { name: 'Brex', color: '#F93549', bg: '#fff0f2' },
  { name: 'HubSpot', color: '#FF7A59', bg: '#fff3f0' },
];

function Home() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [activeJobIdx, setActiveJobIdx] = useState(0);

  useEffect(() => {
    document.title = 'TrueHire — Find Real Jobs, Zero Fake Listings';
    const interval = setInterval(() => {
      setActiveJobIdx(prev => (prev + 1) % FLOATING_JOBS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#f1f5f9' }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0f2347 40%, #1a1040 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '64px',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 50%)',
        }} />

        {/* Floating job cards */}
        {FLOATING_JOBS.map((job, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              opacity: activeJobIdx === i ? 1 : 0.3,
              transition: 'opacity 0.5s ease',
              ...[
                { top: '15%', left: '5%' },
                { top: '25%', right: '5%' },
                { bottom: '30%', left: '3%' },
                { bottom: '20%', right: '4%' },
                { top: '60%', left: '50%', transform: 'translateX(-50%)' },
              ][i],
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: job.color + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: job.color,
            }}>
              {job.company.substring(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{job.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{job.company} • {job.location}</div>
            </div>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#22c55e',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
          </div>
        ))}

        {/* Hero content */}
        <div style={{
          textAlign: 'center',
          maxWidth: '760px',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.8s ease',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            borderRadius: '20px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: '500' }}>
              Live jobs updated daily from 500+ companies
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: '900',
            color: 'white',
            lineHeight: '1.1',
            marginBottom: '20px',
            letterSpacing: '-2px',
          }}>
            Find Your Dream Job.<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Zero Fake Listings.
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.65)',
            marginBottom: '36px',
            lineHeight: '1.7',
            maxWidth: '540px',
            margin: '0 auto 36px',
          }}>
            Every job verified directly from company sources. AI-powered resume matching, interview prep, and application tracking — all free.
          </p>

          {/* Search */}
          <div style={{
            display: 'flex',
            background: 'white',
            borderRadius: '14px',
            padding: '6px',
            maxWidth: '580px',
            margin: '0 auto 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <input
              style={{
                flex: 1, padding: '12px 16px',
                border: 'none', background: 'transparent',
                fontSize: '15px', color: '#0f172a',
              }}
              placeholder="Job title, skill, or company..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate('/jobs')}
            />
            <button
              onClick={() => navigate('/jobs')}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', border: 'none',
                borderRadius: '10px',
                fontSize: '15px', fontWeight: '700',
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
              }}
            >
              Search Jobs
            </button>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🇮🇳 India Jobs', '🏛️ Govt Jobs', '💻 Remote Jobs', '🎓 Fresher Jobs'].map(tag => (
              <button
                key={tag}
                onClick={() => navigate('/jobs')}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '20px',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '60px',
          flexWrap: 'wrap',
        }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>
                {stat.icon} {stat.num}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPANY LOGOS MARQUEE */}
      <div style={{
        background: 'white',
        padding: '28px 0',
        borderBottom: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}>
          Jobs from top companies worldwide
        </p>
        <div style={{ display: 'flex', gap: '12px', animation: 'marquee 35s linear infinite', width: 'max-content' }}>
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              background: 'white',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '800', color: c.color,
              }}>
                {c.name.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap' }}>
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{
            display: 'inline-block',
            background: '#dbeafe', color: '#1d4ed8',
            padding: '6px 16px', borderRadius: '20px',
            fontSize: '13px', fontWeight: '600',
            marginBottom: '16px',
          }}>
            Everything you need
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '800', color: '#0f172a',
            letterSpacing: '-1px', marginBottom: '14px',
          }}>
            More than just a job board
          </h2>
          <p style={{ fontSize: '17px', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            AI-powered tools to help you land your dream job faster
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              onClick={() => navigate(feature.link)}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = feature.color + '40';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: feature.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '16px',
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '17px', fontWeight: '700',
                color: '#0f172a', marginBottom: '8px',
              }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {feature.desc}
              </p>
              <span style={{
                fontSize: '13px', fontWeight: '600', color: feature.color,
              }}>
                Try it now →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST SECTION */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: '800', color: '#0f172a',
            marginBottom: '16px', letterSpacing: '-0.5px',
          }}>
            Why students trust TrueHire
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '48px' }}>
            Built specifically for Indian job seekers — freshers, students, and experienced professionals
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
          }}>
            {[
              { icon: '🚫', title: 'Zero fake jobs', desc: 'Every listing from verified company APIs' },
              { icon: '🇮🇳', title: 'India focused', desc: 'Jobs in Hyderabad, Bangalore, Mumbai & more' },
              { icon: '🤖', title: 'AI powered', desc: 'Smart matching, resume builder, prep tools' },
              { icon: '🆓', title: '100% free', desc: 'All core features free, always' },
            ].map(item => (
              <div key={item.title} style={{
                background: '#f8fafc', borderRadius: '14px',
                padding: '24px', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1628, #1a1040)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(37,99,235,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(124,58,237,0.2) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: '800', color: 'white',
            marginBottom: '16px', letterSpacing: '-1px',
          }}>
            Start your job search today
          </h2>
          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.6)',
            marginBottom: '32px', lineHeight: '1.6',
          }}>
            Join thousands of students who found their dream jobs through TrueHire
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/jobs')}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: '700',
                boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
              }}
            >
              Browse Jobs →
            </button>
            <button
              onClick={() => navigate('/resume-builder')}
              style={{
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                fontSize: '16px', fontWeight: '600',
              }}
            >
              Build Resume
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        background: '#0A1628',
        padding: '40px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: 'white',
            }}>T</div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>TrueHire</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Browse Jobs', to: '/jobs' },
              { label: 'Interview Prep', to: '/interview-prep' },
              { label: 'Resume Builder', to: '/resume-builder' },
              { label: 'Job Alerts', to: '/alerts' },
            ].map(item => (
              <a key={item.to} href={item.to} style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.5)',
                fontWeight: '500',
              }}>
                {item.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 TrueHire. Zero fake listings.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;