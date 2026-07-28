import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const EXAMPLE_SEARCHES = [
  'Remote Python developer job at a startup',
  'Machine learning engineer in Bangalore with good salary',
  'Frontend React developer fully remote',
  'Data scientist at a product company not services',
  'Entry level software engineer fresher friendly',
  'DevOps engineer with Kubernetes experience',
];

function SmartSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [indexing, setIndexing] = useState(false);
  const [indexMsg, setIndexMsg] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await axios.post(`${API}/api/jobs/smart-search`, {
        query,
        limit: 10,
      });
      if (res.data.success) setResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleIndexJobs = async () => {
    setIndexing(true);
    setIndexMsg('Fetching jobs to index...');
    try {
      const jobsRes = await axios.get(`${API}/api/jobs/greenhouse?company=airbnb`);
      if (jobsRes.data.success) {
        setIndexMsg(`Indexing ${jobsRes.data.jobs.length} jobs...`);
        const res = await axios.post(`${API}/api/jobs/embed-jobs`, {
          jobs: jobsRes.data.jobs,
        });
        setIndexMsg(`✅ Indexed ${res.data.embedded} jobs successfully!`);
      }
    } catch (err) {
      setIndexMsg('Error: ' + err.message);
    }
    setIndexing(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.hero}>
          <div style={styles.aiBadge}>🤖 Powered by AI + RAG</div>
          <h1 style={styles.title}>Smart Job Search</h1>
          <p style={styles.subtitle}>
            Describe your dream job in plain English. Our AI understands
            what you mean — not just keywords.
          </p>

          <div style={styles.searchBox}>
            <textarea
              style={styles.textarea}
              placeholder="Describe your ideal job... e.g. 'I want a remote machine learning job at a product company, not a services company, with good work-life balance'"
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) handleSearch();
              }}
            />
            <button
              style={styles.searchBtn}
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? '🔍 Searching...' : '🔍 Smart Search'}
            </button>
          </div>

          <div style={styles.examples}>
            <p style={styles.examplesLabel}>Try these:</p>
            <div style={styles.exampleChips}>
              {EXAMPLE_SEARCHES.map(ex => (
                <span
                  key={ex}
                  style={styles.exampleChip}
                  onClick={() => setQuery(ex)}
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>AI is analyzing your request...</p>
            <p style={styles.loadingSubtext}>
              Finding semantically similar jobs across our database
            </p>
          </div>
        )}

        {results && (
          <div style={styles.results}>
            <div style={styles.aiSummary}>
              <span style={styles.aiIcon}>🤖</span>
              <p style={styles.aiText}>{results.aiSummary}</p>
            </div>

            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>
                {results.count} jobs matched your search
              </h2>
              <span style={styles.queryBadge}>"{results.query}"</span>
            </div>

            <div style={styles.jobsList}>
              {results.jobs.map(job => (
                <div key={job.id} style={styles.jobCard}>
                  <div style={styles.jobTop}>
                    <div style={styles.jobLogo}>
                      {job.company?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={styles.jobInfo}>
                      <h3
                        style={styles.jobTitle}
                        onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                      >
                        {job.title}
                      </h3>
                      <p style={styles.jobCompany}>{job.company}</p>
                      {job.location && (
                        <p style={styles.jobLocation}>📍 {job.location}</p>
                      )}
                    </div>
                    <div style={styles.matchScore}>
                      <span style={styles.matchNum}>{job.similarity}%</span>
                      <span style={styles.matchLabel}>match</span>
                    </div>
                  </div>

                  <div style={styles.jobBottom}>
                    <span style={styles.sourceBadge}>{job.source}</span>
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.applyBtn}
                    >
                      Apply Now →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!results && !loading && (
          <div style={styles.howItWorks}>
            <h2 style={styles.howTitle}>How Smart Search works</h2>
            <div style={styles.howGrid}>
              {[
                { icon: '🧠', title: 'Understands intent', desc: 'AI understands what you mean, not just what you type' },
                { icon: '🔍', title: 'Semantic matching', desc: 'Finds jobs similar in meaning, not just keyword matches' },
                { icon: '📊', title: 'Ranked by relevance', desc: 'Jobs ranked by how well they match your description' },
                { icon: '⚡', title: 'Instant results', desc: 'Searches thousands of jobs in milliseconds' },
              ].map(item => (
                <div key={item.title} style={styles.howCard}>
                  <p style={styles.howIcon}>{item.icon}</p>
                  <h3 style={styles.howCardTitle}>{item.title}</h3>
                  <p style={styles.howDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.adminSection}>
          <p style={styles.adminLabel}>Admin: Index jobs for smart search</p>
          <button
            style={styles.indexBtn}
            onClick={handleIndexJobs}
            disabled={indexing}
          >
            {indexing ? '⏳ Indexing...' : '⚙️ Index Jobs'}
          </button>
          {indexMsg && <p style={styles.indexMsg}>{indexMsg}</p>}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    background: '#f8fafc',
    minHeight: '100vh',
    padding: '36px 20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  hero: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  aiBadge: {
    display: 'inline-block',
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '28px',
    lineHeight: '1.6',
    maxWidth: '560px',
    margin: '0 auto 28px',
  },
  searchBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '640px',
    margin: '0 auto 20px',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#1e293b',
    resize: 'none',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    lineHeight: '1.6',
  },
  searchBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  examples: {
    marginTop: '20px',
  },
  examplesLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '10px',
  },
  exampleChips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  exampleChip: {
    padding: '6px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#475569',
    cursor: 'pointer',
    background: 'white',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 0',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  loadingSubtext: {
    fontSize: '14px',
    color: '#64748b',
  },
  results: {},
  aiSummary: {
    display: 'flex',
    gap: '14px',
    background: '#ede9fe',
    border: '1px solid #ddd6fe',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    alignItems: 'flex-start',
  },
  aiIcon: { fontSize: '24px', flexShrink: 0 },
  aiText: {
    fontSize: '15px',
    color: '#4c1d95',
    lineHeight: '1.6',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  queryBadge: {
    background: '#f1f5f9',
    color: '#64748b',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  jobCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
  },
  jobTop: {
    display: 'flex',
    gap: '14px',
    marginBottom: '14px',
    alignItems: 'flex-start',
  },
  jobLogo: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '4px',
    cursor: 'pointer',
  },
  jobCompany: {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: '4px',
  },
  jobLocation: {
    fontSize: '13px',
    color: '#64748b',
  },
  matchScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '8px 14px',
    flexShrink: 0,
  },
  matchNum: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#16a34a',
  },
  matchLabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  jobBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  sourceBadge: {
    background: '#f1f5f9',
    color: '#64748b',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  applyBtn: {
    background: '#2563eb',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  howItWorks: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '20px',
  },
  howTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '24px',
    textAlign: 'center',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  howCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  howIcon: { fontSize: '28px', marginBottom: '10px' },
  howCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  howDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },
  adminSection: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  adminLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    flex: 1,
  },
  indexBtn: {
    background: '#1e293b',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  indexMsg: {
    fontSize: '13px',
    color: '#64748b',
    width: '100%',
  },
};

export default SmartSearch;