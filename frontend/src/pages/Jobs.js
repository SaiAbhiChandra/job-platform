import { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const COMPANIES = [
  'airbnb', 'stripe', 'notion', 'figma', 'shopify',
  'canva', 'atlassian', 'hubspot', 'gitlab', 'intercom',
  'linear', 'discord', 'twilio', 'datadog', 'segment',
  'brex', 'gusto', 'rippling', 'plaid', 'coinbase',
  'doordash', 'zapier', 'automattic', 'loom', 'miro'
];

const INDUSTRIES = [
  { label: '🌍 All Industries', value: 'all' },
  { label: '💻 Tech', value: 'tech' },
  { label: '💰 Finance', value: 'finance' },
  { label: '🛒 E-Commerce', value: 'ecommerce' },
  { label: '🏥 Healthcare', value: 'healthcare' },
  { label: '🌐 Remote Only', value: 'remote' },
];

const INDIA_KEYWORDS = [
  'Software Engineer', 'Data Scientist', 'Product Manager',
  'UI/UX Designer', 'DevOps', 'Python Developer',
  'React Developer', 'Machine Learning', 'Full Stack',
  'Business Analyst'
];

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('global');
  const [searchInput, setSearchInput] = useState('');
  const [industry, setIndustry] = useState('all');
  const [company, setCompany] = useState('airbnb');
  const [indiaKeyword, setIndiaKeyword] = useState('software engineer');
  const [indiaLocation, setIndiaLocation] = useState('India');
  const [source, setSource] = useState('companies');
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState('');

  const filters = ['All', 'Full-time', 'Internship', 'Remote', 'Government'];

  useEffect(() => {
    if (activeTab === 'global') fetchGlobalJobs();
    else if (activeTab === 'india') fetchIndiaJobs();
    else if (activeTab === 'govt') fetchGovtJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchGlobalJobs = async (ind, kw, src, comp) => {
    setLoading(true);
    setJobs([]);
    setLoadingMsg('Fetching jobs from 50+ global companies...');
    try {
      const currentSource = src || source;
      const currentIndustry = ind || industry;
      const currentKeyword = kw || searchInput;
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

      const res = await axios.get(url, { timeout: 30000 });
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotalCompanies(res.data.companies_fetched || 0);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchIndiaJobs = async (kw, loc) => {
    setLoading(true);
    setJobs([]);
    setLoadingMsg('Fetching jobs from LinkedIn, Indeed & Glassdoor India...');
    try {
      const keyword = kw || indiaKeyword;
      const location = loc || indiaLocation;
      const res = await axios.get(
        `${API}/api/jobs/india?keyword=${keyword}&location=${location}`,
        { timeout: 20000 }
      );
      if (res.data.success) setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchGovtJobs = async (kw) => {
    setLoading(true);
    setJobs([]);
    setLoadingMsg('Fetching government job listings...');
    try {
      const keyword = kw || searchInput;
      const res = await axios.get(
        `${API}/api/jobs/govtjobs?keyword=${keyword}`,
        { timeout: 15000 }
      );
      if (res.data.success) setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (activeTab === 'global') fetchGlobalJobs(industry, searchInput, source, company);
    else if (activeTab === 'india') fetchIndiaJobs(indiaKeyword, indiaLocation);
    else if (activeTab === 'govt') fetchGovtJobs(searchInput);
  };

  const filtered = filter === 'All' ? jobs
    : filter === 'Remote' ? jobs.filter(j =>
        j.is_remote || j.location?.toLowerCase().includes('remote'))
    : filter === 'Internship' ? jobs.filter(j =>
        j.employment_type === 'Internship' ||
        j.title?.toLowerCase().includes('intern'))
    : filter === 'Government' ? jobs.filter(j =>
        j.employment_type === 'Government' ||
        j.source?.toLowerCase().includes('govt'))
    : filter === 'Full-time' ? jobs.filter(j =>
        j.employment_type === 'Full-time' ||
        (!j.title?.toLowerCase().includes('intern') &&
         j.employment_type !== 'Government'))
    : jobs;

  return (
    <div style={styles.page}>
      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {[
          { label: '🌍 Global Jobs', value: 'global' },
          { label: '🇮🇳 India Jobs', value: 'india' },
          { label: '🏛️ Govt Jobs', value: 'govt' },
        ].map(tab => (
          <button
            key={tab.value}
            style={{
              ...styles.tab,
              ...(activeTab === tab.value ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        {activeTab === 'india' ? (
          <>
            <select
              style={styles.select}
              value={indiaKeyword}
              onChange={e => setIndiaKeyword(e.target.value)}
            >
              {INDIA_KEYWORDS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              style={styles.select}
              value={indiaLocation}
              onChange={e => setIndiaLocation(e.target.value)}
            >
              {['India', 'Hyderabad', 'Bangalore', 'Mumbai',
                'Chennai', 'Delhi', 'Pune', 'Kolkata', 'Remote India'
              ].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <input
              style={styles.input}
              placeholder={
                activeTab === 'govt'
                  ? 'Search govt jobs (UPSC, SSC, Banking...)'
                  : 'Job title, skill, or keyword...'
              }
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {activeTab === 'global' && (
              <select
                style={styles.select}
                value={source}
                onChange={e => {
                  setSource(e.target.value);
                  fetchGlobalJobs(industry, searchInput, e.target.value, company);
                }}
              >
                <option value="companies">50+ Top Companies</option>
                <option value="jsearch">JSearch (Global)</option>
                <option value="adzuna">Adzuna (UK/Global)</option>
                <option value="greenhouse">Single Company</option>
              </select>
            )}
          </>
        )}
        <button style={styles.searchBtn} onClick={handleSearch}>
          Search Jobs
        </button>
      </div>

      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {activeTab === 'global' && (
            <>
              <div style={styles.sidebarSection}>
                <p style={styles.sidebarTitle}>Industry</p>
                {INDUSTRIES.map(ind => (
                  <div
                    key={ind.value}
                    style={{
                      ...styles.sidebarItem,
                      ...(industry === ind.value ? styles.sidebarItemActive : {})
                    }}
                    onClick={() => {
                      setIndustry(ind.value);
                      fetchGlobalJobs(ind.value, searchInput, 'companies', company);
                      setSource('companies');
                    }}
                  >
                    {ind.label}
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
                      ...(company === c && source === 'greenhouse'
                        ? styles.sidebarItemActive : {})
                    }}
                    onClick={() => {
                      setCompany(c);
                      setSource('greenhouse');
                      fetchGlobalJobs(industry, searchInput, 'greenhouse', c);
                    }}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'india' && (
            <div style={styles.sidebarSection}>
              <p style={styles.sidebarTitle}>Popular Searches</p>
              {INDIA_KEYWORDS.map(k => (
                <div
                  key={k}
                  style={{
                    ...styles.sidebarItem,
                    ...(indiaKeyword === k ? styles.sidebarItemActive : {})
                  }}
                  onClick={() => {
                    setIndiaKeyword(k);
                    fetchIndiaJobs(k, indiaLocation);
                  }}
                >
                  {k}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'govt' && (
            <div style={styles.sidebarSection}>
              <p style={styles.sidebarTitle}>Job Categories</p>
              {[
                'UPSC / IAS', 'SSC / CGL', 'Banking / IBPS',
                'Railway / RRB', 'Defence / Army', 'Teaching / TET',
                'Police / PSC', 'PSU Jobs', 'State Govt'
              ].map(k => (
                <div
                  key={k}
                  style={styles.sidebarItem}
                  onClick={() => {
                    setSearchInput(k);
                    fetchGovtJobs(k);
                  }}
                >
                  {k}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
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
              {loading ? loadingMsg : `${filtered.length} jobs found`}
              {totalCompanies > 0 && !loading && activeTab === 'global' && (
                <span style={styles.companyCount}>
                  {' '}from {totalCompanies} companies
                </span>
              )}
            </span>
          </div>

          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>{loadingMsg}</p>
              {activeTab === 'global' && (
                <p style={styles.loadingSubtext}>
                  Checking 50+ companies simultaneously...
                </p>
              )}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={styles.empty}>
              <p style={{ fontSize: '40px' }}>🔍</p>
              <p style={styles.emptyTitle}>No jobs found</p>
              <p style={styles.emptyDesc}>
                {activeTab === 'india'
                  ? 'Try a different keyword or city'
                  : activeTab === 'govt'
                  ? 'Try searching UPSC, SSC, Banking, Railway'
                  : 'Try a different keyword or industry'}
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
  tabBar: {
    display: 'flex',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 32px',
    gap: '4px',
  },
  tab: {
    padding: '14px 24px',
    border: 'none',
    background: 'transparent',
    fontSize: '15px',
    color: '#64748b',
    fontWeight: '500',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
    fontWeight: '600',
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
    padding: '16px 32px',
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
    minHeight: 'calc(100vh - 180px)',
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
    padding: '7px 10px',
    borderRadius: '6px',
    marginBottom: '2px',
  },
  sidebarItemActive: {
    color: '#2563eb',
    fontWeight: '600',
    background: '#eff6ff',
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
    gap: '12px',
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
    color: '#1e293b',
    fontSize: '16px',
    fontWeight: '500',
  },
  loadingSubtext: {
    color: '#94a3b8',
    fontSize: '13px',
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