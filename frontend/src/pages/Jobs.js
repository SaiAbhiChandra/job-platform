import { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const COMPANIES = [
  'airbnb', 'stripe', 'notion', 'figma', 'shopify',
  'canva', 'atlassian', 'hubspot', 'gitlab', 'intercom',
  'linear', 'vercel', 'discord', 'twilio', 'datadog',
  'brex', 'gusto', 'rippling', 'plaid', 'coinbase',
  'doordash', 'instacart', 'zapier', 'automattic', 'loom',
  'miro', 'front', 'close', 'buffer', 'doist'
];

const INDUSTRIES = [
  { label: 'All Industries', value: 'all' },
  { label: 'Tech', value: 'tech' },
  { label: 'Finance', value: 'finance' },
  { label: 'E-Commerce', value: 'ecommerce' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Remote Only', value: 'remote' },
];

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [company, setCompany] = useState('airbnb');
  const [source, setSource] = useState('companies');
  const [industry, setIndustry] = useState('all');
  const [filter, setFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [totalCompanies, setTotalCompanies] = useState(0);

  const filters = ['All', 'Full-time', 'Internship', 'Remote'];

  useEffect(() => {
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async (kw, ind, src, comp) => {
    setLoading(true);
    setJobs([]);
    try {
      const currentSource = src || source;
      const currentKeyword = kw !== undefined ? kw : keyword;
      const currentIndustry = ind || industry;
      const currentCompany = comp || company;

      let url = '';
      if (currentSource === 'companies') {
        url = `${API}/api/jobs/companies?industry=${currentIndustry}&keyword=${currentKeyword}`;
      } else if (currentSource === 'greenhouse') {
        url = `${API}/api/jobs/greenhouse?company=${currentCompany}`;
      } else if (currentSource === 'jsearch') {
        url = `${API}/api/jobs/jsearch?keyword=${currentKeyword || 'software engineer'}`;
      } else if (currentSource === 'adzuna') {
        url = `${API}/api/jobs/adzuna?keyword=${currentKeyword || 'software engineer'}&country=gb`;
      }

      const res = await axios.get(url);
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotalCompanies(res.data.companies_fetched || 0);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    fetchJobs(searchInput, industry, source, company);
  };

  const handleIndustry = (ind) => {
    setIndustry(ind);
    fetchJobs(keyword, ind, 'companies', company);
    setSource('companies');
  };

  const filtered = filter === 'All'
    ? jobs
    : jobs.filter(j =>
        j.employment_type?.toLowerCase().includes(filter.toLowerCase()) ||
        j.location?.toLowerCase().includes(filter.toLowerCase())
      );

  return (
    <div style={styles.page}>
      <div style={styles.searchBar}>
        <input
          style={styles.input}
          placeholder="Job title, skill, or keyword..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <select
          style={styles.select}
          value={source}
          onChange={e => {
            setSource(e.target.value);
            fetchJobs(keyword, industry, e.target.value, company);
          }}
        >
          <option value="companies">50+ Top Companies</option>
          <option value="greenhouse">Single Company</option>
          <option value="jsearch">All Platforms (JSearch)</option>
          <option value="adzuna">Adzuna (UK/Global)</option>
        </select>

        {source === 'greenhouse' && (
          <select
            style={styles.select}
            value={company}
            onChange={e => {
              setCompany(e.target.value);
              fetchJobs(keyword, industry, 'greenhouse', e.target.value);
            }}
          >
            {COMPANIES.map(c => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        )}

        <button style={styles.searchBtn} onClick={handleSearch}>
          Search Jobs
        </button>
      </div>

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarTitle}>Industry</p>
            {INDUSTRIES.map(ind => (
              <div
                key={ind.value}
                style={{
                  ...styles.sidebarItem,
                  color: industry === ind.value ? '#2563eb' : '#64748b',
                  fontWeight: industry === ind.value ? '600' : '400',
                  background: industry === ind.value ? '#eff6ff' : 'transparent',
                  borderRadius: '6px',
                  padding: '7px 10px',
                }}
                onClick={() => handleIndustry(ind.value)}
              >
                {ind.label}
              </div>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <p style={styles.sidebarTitle}>Source</p>
            {[
              { label: '50+ Companies', value: 'companies' },
              { label: 'JSearch', value: 'jsearch' },
              { label: 'Adzuna', value: 'adzuna' },
            ].map(s => (
              <div
                key={s.value}
                style={{
                  ...styles.sidebarItem,
                  color: source === s.value ? '#2563eb' : '#64748b',
                  fontWeight: source === s.value ? '600' : '400',
                  background: source === s.value ? '#eff6ff' : 'transparent',
                  borderRadius: '6px',
                  padding: '7px 10px',
                }}
                onClick={() => {
                  setSource(s.value);
                  fetchJobs(keyword, industry, s.value, company);
                }}
              >
                {s.label}
              </div>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <p style={styles.sidebarTitle}>Top Companies</p>
            {COMPANIES.slice(0, 15).map(c => (
              <div
                key={c}
                style={{
                  ...styles.sidebarItem,
                  color: company === c && source === 'greenhouse'
                    ? '#2563eb' : '#64748b',
                  padding: '6px 10px',
                  borderRadius: '6px',
                }}
                onClick={() => {
                  setCompany(c);
                  setSource('greenhouse');
                  fetchJobs(keyword, industry, 'greenhouse', c);
                }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.main}>
          <div style={styles.topBar}>
            <div style={styles.filters}>
              {filters.map(f => (
                <button
                  key={f}
                  style={{
                    ...styles.chip,
                    ...(filter === f ? styles.chipActive : {}),
                  }}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <span style={styles.count}>
              {loading ? 'Loading...' : `${filtered.length} jobs found`}
              {totalCompanies > 0 && !loading && (
                <span style={styles.companyCount}>
                  {' '}from {totalCompanies} companies
                </span>
              )}
            </span>
          </div>

          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>
                Fetching jobs from 50+ companies...
              </p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={styles.empty}>
              <p style={{ fontSize: '40px' }}>🔍</p>
              <p style={styles.emptyTitle}>No jobs found</p>
              <p style={styles.emptyDesc}>
                Try a different keyword or industry
              </p>
            </div>
          )}

          <div style={styles.grid}>
            {filtered.map(job => (
              <JobCard key={job.id} job={job} />
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
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
    padding: '20px 32px',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    padding: '11px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1e293b',
    minWidth: '200px',
  },
  select: {
    padding: '11px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#475569',
    background: 'white',
  },
  searchBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '11px 28px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    minHeight: 'calc(100vh - 130px)',
  },
  sidebar: {
    background: 'white',
    borderRight: '1px solid #e2e8f0',
    padding: '24px 16px',
    overflowY: 'auto',
  },
  sidebarSection: {
    marginBottom: '28px',
  },
  sidebarTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '8px',
    padding: '0 10px',
  },
  sidebarItem: {
    fontSize: '13px',
    color: '#64748b',
    cursor: 'pointer',
    marginBottom: '2px',
  },
  main: {
    padding: '24px 28px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  filters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  chip: {
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#64748b',
    background: 'white',
    fontWeight: '500',
    cursor: 'pointer',
  },
  chipActive: {
    background: '#dbeafe',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  count: {
    fontSize: '14px',
    color: '#94a3b8',
  },
  companyCount: {
    fontSize: '13px',
    color: '#2563eb',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '15px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginTop: '12px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    marginTop: '8px',
  },
};

export default Jobs;