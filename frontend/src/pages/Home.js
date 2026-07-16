import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={styles.hero}>
        <div style={styles.badge}>100% Verified Job Listings</div>
        <h1 style={styles.title}>Find Real Jobs.<br />Zero Fake Listings.</h1>
        <p style={styles.subtitle}>
          Every job on TrueJobs comes directly from verified company sources.
          No scams. No spam. Just real opportunities from real companies.
        </p>
        <div style={styles.searchBox}>
          <input
            style={styles.searchInput}
            placeholder="Job title, skill, or company..."
          />
          <select style={styles.searchSelect}>
            <option>All locations</option>
            <option>India</option>
            <option>Remote</option>
            <option>USA</option>
            <option>UK</option>
          </select>
          <button
            style={styles.searchBtn}
            onClick={() => navigate('/jobs')}
          >
            Search Jobs
          </button>
        </div>
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statNum}>12,400+</span>
            <span style={styles.statLabel}>Verified Jobs</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNum}>500+</span>
            <span style={styles.statLabel}>Companies</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNum}>100%</span>
            <span style={styles.statLabel}>Real Listings</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNum}>Daily</span>
            <span style={styles.statLabel}>Updated</span>
          </div>
        </div>
      </div>

      <div style={styles.companies}>
  <p style={styles.companiesLabel}>Trusted by top companies worldwide</p>
  <div style={styles.marqueeWrapper}>
    <div style={styles.marqueeTrack}>
      {[
        'Airbnb', 'Stripe', 'Notion', 'Figma', 'Shopify',
        'Canva', 'GitLab', 'Atlassian', 'Discord', 'Twilio',
        'Datadog', 'HubSpot', 'Intercom', 'Linear', 'Loom',
        'Miro', 'Zapier', 'Brex', 'Gusto', 'Rippling',
        'Plaid', 'Coinbase', 'DoorDash', 'Instacart', 'Buffer',
        'Airbnb', 'Stripe', 'Notion', 'Figma', 'Shopify',
        'Canva', 'GitLab', 'Atlassian', 'Discord', 'Twilio',
        'Datadog', 'HubSpot', 'Intercom', 'Linear', 'Loom',
        'Miro', 'Zapier', 'Brex', 'Gusto', 'Rippling',
        'Plaid', 'Coinbase', 'DoorDash', 'Instacart', 'Buffer',
      ].map((c, i) => (
        <span key={i} style={styles.companyChip}>{c}</span>
      ))}
    </div>
  </div>
</div>

      <div style={styles.features}>
        {[
          { icon: '✅', title: 'Zero fake jobs', desc: 'Every listing comes directly from company ATS systems or verified job APIs.' },
          { icon: '🔄', title: 'Updated daily', desc: 'Jobs refresh every 24 hours so you never apply to an expired listing.' },
          { icon: '🌍', title: 'Global reach', desc: 'Jobs from India, USA, UK, Australia and 50+ countries in one place.' },
          { icon: '⚡', title: 'Apply instantly', desc: 'One click takes you directly to the official company application page.' },
        ].map(f => (
          <div key={f.title} style={styles.featureCard}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Start your job search today</h2>
        <p style={styles.ctaDesc}>Join thousands of job seekers who trust TrueJobs for verified listings.</p>
        <button style={styles.ctaBtn} onClick={() => navigate('/jobs')}>
          Browse All Jobs →
        </button>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
    padding: '72px 40px 52px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  badge: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  title: {
    fontSize: '52px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.15',
    marginBottom: '20px',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    maxWidth: '560px',
    margin: '0 auto 36px',
    lineHeight: '1.7',
  },
  searchBox: {
    display: 'flex',
    gap: '10px',
    maxWidth: '660px',
    margin: '0 auto 36px',
    background: 'white',
    padding: '8px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    fontSize: '15px',
    color: '#1e293b',
    background: 'transparent',
  },
  searchSelect: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#64748b',
    background: 'white',
  },
  searchBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '32px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNum: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  statDivider: {
    width: '1px',
    height: '36px',
    background: '#e2e8f0',
  },
  companies: {
    padding: '32px 0',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
    background: 'white',
    overflow: 'hidden',
  },
  companiesLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  marqueeWrapper: {
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
  },
  marqueeTrack: {
    display: 'flex',
    gap: '16px',
    animation: 'marquee 30s linear infinite',
    width: 'max-content',
  },
  companyChip: {
    padding: '8px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#475569',
    background: '#f8fafc',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    padding: '52px 40px',
    background: '#f8fafc',
  },
  featureCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '28px 24px',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '14px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  cta: {
    background: '#2563eb',
    padding: '64px 40px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '12px',
  },
  ctaDesc: {
    fontSize: '16px',
    color: '#bfdbfe',
    marginBottom: '28px',
  },
  ctaBtn: {
    background: 'white',
    color: '#2563eb',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
  },
};

export default Home;