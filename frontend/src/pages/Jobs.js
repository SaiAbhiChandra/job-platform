import { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const COMPANIES = [
  'airbnb', 'stripe', 'notion', 'figma', 'shopify',
  'canva', 'atlassian', 'hubspot', 'gitlab', 'intercom'
];

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('software engineer');
  const [company, setCompany] = useState('airbnb');
  const [source, setSource] = useState('greenhouse');
  const [filter, setFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  const filters = ['All', 'Full-time', 'Internship', 'Remote'];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let url = source === 'greenhouse'
          ? `${API}/api/jobs/greenhouse?company=${company}`
          : `${API}/api/jobs/jsearch?keyword=${keyword}`;
        const res = await axios.get(url);
        if (res.data.success) setJobs(res.data.jobs);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setJobs([]);
    try {
      let url = source === 'greenhouse'
        ? `${API}/api/jobs/greenhouse?company=${searchInput || company}`
        : `${API}/api/jobs/jsearch?keyword=${searchInput || keyword}`;
      const res = await axios.get(url);
      if (res.data.success) setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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
          placeholder="Job title, skill, or company..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <select
          style={styles.select}
          value={source}
          onChange={e => setSource(e.target.value)}
        >
          <option value="greenhouse">Top Companies</option>
          <option value="jsearch">All Platforms</option>
        </select>
        {source === 'greenhouse' && (
          <select
            style={styles.select}
            value={company}
            onChange={e => setCompany(e.target.value)}
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
            <p style={styles.sidebarTitle}>Source</p>
            {['All Sources', 'Greenhouse', 'JSearch', 'Adzuna'].map(s => (
              <div key={s} style={styles.sidebarItem}>{s}</div>
            ))}
          </div>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarTitle}>Company</p>
            {COMPANIES.map(c => (
              <div
                key={c}
                style={{
                  ...styles.sidebarItem,
                  color: company === c ? '#2563eb' : '#64748b',
                  fontWeight: company === c ? '600' : '400',
                }}
                onClick={() => {
                  setCompany(c);
                  setSource('greenhouse');
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
              {filtered.length} jobs found
            </span>
          </div>

          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Finding verified jobs...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={styles.empty}>
              <p style={{ fontSize: '40px' }}>🔍</p>
              <p style={styles.emptyTitle}>No jobs found</p>
              <p style={styles.emptyDesc}>Try a different keyword or company</p>
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
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    minHeight: 'calc(100vh - 130px)',
  },
  sidebar: {
    background: 'white',
    borderRight: '1px solid #e2e8f0',
    padding: '24px 20px',
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
    marginBottom: '12px',
  },
  sidebarItem: {
    fontSize: '14px',
    color: '#64748b',
    padding: '7px 0',
    cursor: 'pointer',
    borderRadius: '6px',
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