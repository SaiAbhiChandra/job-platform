import { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('software engineer');
  const [company, setCompany] = useState('airbnb');
  const [source, setSource] = useState('greenhouse');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let url = '';
        if (source === 'greenhouse') {
          url = `https://job-platform-production-ad1a.up.railway.app/api/jobs/greenhouse?company=${company}`;
        } else if (source === 'jsearch') {
          url = `https://job-platform-production-ad1a.up.railway.app/api/jobs/jsearch?keyword=${keyword}`;
        }
        const res = await axios.get(url);
        if (res.data.success) {
          setJobs(res.data.jobs);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchJobs();
  }, [source, company, keyword]);

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <select
          style={styles.select}
          value={source}
          onChange={e => setSource(e.target.value)}
        >
          <option value="greenhouse">Greenhouse (Company Jobs)</option>
          <option value="jsearch">JSearch (All Platforms)</option>
        </select>

        {source === 'greenhouse' ? (
          <input
            style={styles.input}
            placeholder="Company slug (e.g. airbnb, stripe, figma)"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        ) : (
          <input
            style={styles.input}
            placeholder="Job title (e.g. python developer)"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        )}

        <button style={styles.btn} onClick={() => {
  setJobs([]);
  setLoading(true);
  const url = source === 'greenhouse'
    ? `https://job-platform-production-ad1a.up.railway.app/api/jobs/greenhouse?company=${company}`
    : `https://job-platform-production-ad1a.up.railway.app/api/jobs/jsearch?keyword=${keyword}`;
  axios.get(url).then(res => {
    if (res.data.success) setJobs(res.data.jobs);
    setLoading(false);
  }).catch(() => setLoading(false));
}}>
          Search Jobs
        </button>
      </div>

      {loading && <p style={styles.msg}>Loading jobs...</p>}

      {!loading && jobs.length === 0 && (
        <p style={styles.msg}>No jobs found. Try a different search.</p>
      )}

      <div style={styles.grid}>
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#0f172a',
    minHeight: '90vh',
    padding: '40px',
    color: 'white',
  },
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  input: {
    flex: '1',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#1e293b',
    color: 'white',
    fontSize: '15px',
    minWidth: '200px',
  },
  select: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#1e293b',
    color: 'white',
    fontSize: '15px',
  },
  btn: {
    background: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  msg: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: '16px',
  }
};

export default Jobs;