// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import JobCard from '../components/JobCard';

// const API = 'https://job-platform-production-ad1a.up.railway.app';

// const COMPANIES = [
//   'airbnb', 'stripe', 'notion', 'figma', 'shopify',
//   'canva', 'atlassian', 'hubspot', 'gitlab', 'intercom',
//   'linear', 'discord', 'twilio', 'datadog', 'segment',
//   'brex', 'gusto', 'rippling', 'plaid', 'coinbase',
//   'doordash', 'zapier', 'automattic', 'loom', 'miro'
// ];

// const INDUSTRIES = [
//   { label: '🌍 All Industries', value: 'all' },
//   { label: '💻 Tech', value: 'tech' },
//   { label: '💰 Finance', value: 'finance' },
//   { label: '🛒 E-Commerce', value: 'ecommerce' },
//   { label: '🏥 Healthcare', value: 'healthcare' },
//   { label: '🌐 Remote Only', value: 'remote' },
// ];

// const INDIA_KEYWORDS = [
//   'Software Engineer', 'Data Scientist', 'Product Manager',
//   'UI/UX Designer', 'DevOps', 'Python Developer',
//   'React Developer', 'Machine Learning', 'Full Stack',
//   'Business Analyst'
// ];

// function Jobs() {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filter, setFilter] = useState('All');
//   const [activeTab, setActiveTab] = useState('global');
//   const [searchInput, setSearchInput] = useState('');
//   const [industry, setIndustry] = useState('all');
//   const [company, setCompany] = useState('airbnb');
//   const [indiaKeyword, setIndiaKeyword] = useState('software engineer');
//   const [indiaLocation, setIndiaLocation] = useState('India');
//   const [source, setSource] = useState('companies');
//   const [totalCompanies, setTotalCompanies] = useState(0);
//   const [loadingMsg, setLoadingMsg] = useState('');

//   const filters = ['All', 'Full-time', 'Internship', 'Remote', 'Government'];

//   useEffect(() => {
//     if (activeTab === 'global') fetchGlobalJobs();
//     else if (activeTab === 'india') fetchIndiaJobs();
//     else if (activeTab === 'govt') fetchGovtJobs();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab]);

//   useEffect(() => {
//     document.title = 'Browse Jobs — TrueJobs | Real Verified Job Listings';
//     return () => { document.title = 'TrueJobs — Find Real Jobs'; };
//   }, []);

//   const fetchGlobalJobs = async (ind, kw, src, comp) => {
//     setLoading(true);
//     setJobs([]);
//     setLoadingMsg('Fetching jobs from 50+ global companies...');
//     try {
//       const currentSource = src || source;
//       const currentIndustry = ind || industry;
//       const currentKeyword = kw || searchInput;
//       const currentCompany = comp || company;

//       let url = '';
//       if (currentSource === 'companies') {
//         url = `${API}/api/jobs/companies?industry=${currentIndustry}&keyword=${currentKeyword}`;
//       } else if (currentSource === 'greenhouse') {
//         url = `${API}/api/jobs/greenhouse?company=${currentCompany}`;
//       } else if (currentSource === 'jsearch') {
//         url = `${API}/api/jobs/jsearch?keyword=${currentKeyword || 'software engineer'}`;
//       } else if (currentSource === 'adzuna') {
//         url = `${API}/api/jobs/adzuna?keyword=${currentKeyword || 'software engineer'}&country=gb`;
//       }

//       const res = await axios.get(url, { timeout: 30000 });
//       if (res.data.success) {
//         setJobs(res.data.jobs);
//         setTotalCompanies(res.data.companies_fetched || 0);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   const fetchIndiaJobs = async (kw, loc) => {
//     setLoading(true);
//     setJobs([]);
//     setLoadingMsg('Fetching jobs from LinkedIn, Indeed & Glassdoor India...');
//     try {
//       const keyword = kw || indiaKeyword;
//       const location = loc || indiaLocation;
//       const res = await axios.get(
//         `${API}/api/jobs/india?keyword=${keyword}&location=${location}`,
//         { timeout: 20000 }
//       );
//       if (res.data.success) setJobs(res.data.jobs);
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   const fetchGovtJobs = async (kw) => {
//     setLoading(true);
//     setJobs([]);
//     setLoadingMsg('Fetching government job listings...');
//     try {
//       const keyword = kw || searchInput;
//       const res = await axios.get(
//         `${API}/api/jobs/govtjobs?keyword=${keyword}`,
//         { timeout: 15000 }
//       );
//       if (res.data.success) setJobs(res.data.jobs);
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   const handleSearch = () => {
//     if (activeTab === 'global') fetchGlobalJobs(industry, searchInput, source, company);
//     else if (activeTab === 'india') fetchIndiaJobs(indiaKeyword, indiaLocation);
//     else if (activeTab === 'govt') fetchGovtJobs(searchInput);
//   };

//   const filtered = filter === 'All' ? jobs
//     : filter === 'Remote' ? jobs.filter(j =>
//         j.is_remote || j.location?.toLowerCase().includes('remote'))
//     : filter === 'Internship' ? jobs.filter(j =>
//         j.employment_type === 'Internship' ||
//         j.title?.toLowerCase().includes('intern'))
//     : filter === 'Government' ? jobs.filter(j =>
//         j.employment_type === 'Government' ||
//         j.source?.toLowerCase().includes('govt'))
//     : filter === 'Full-time' ? jobs.filter(j =>
//         j.employment_type === 'Full-time' ||
//         (!j.title?.toLowerCase().includes('intern') &&
//          j.employment_type !== 'Government'))
//     : jobs;

//   return (
//     <div style={styles.page}>
//       {/* Tab Bar */}
//       <div style={styles.tabBar}>
//         {[
//           { label: '🌍 Global Jobs', value: 'global' },
//           { label: '🇮🇳 India Jobs', value: 'india' },
//           { label: '🏛️ Govt Jobs', value: 'govt' },
//         ].map(tab => (
//           <button
//             key={tab.value}
//             style={{
//               ...styles.tab,
//               ...(activeTab === tab.value ? styles.tabActive : {})
//             }}
//             onClick={() => setActiveTab(tab.value)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Search Bar */}
//       <div style={styles.searchBar}>
//         {activeTab === 'india' ? (
//           <>
//             <select
//               style={styles.select}
//               value={indiaKeyword}
//               onChange={e => setIndiaKeyword(e.target.value)}
//             >
//               {INDIA_KEYWORDS.map(k => (
//                 <option key={k} value={k}>{k}</option>
//               ))}
//             </select>
//             <select
//               style={styles.select}
//               value={indiaLocation}
//               onChange={e => setIndiaLocation(e.target.value)}
//             >
//               {['India', 'Hyderabad', 'Bangalore', 'Mumbai',
//                 'Chennai', 'Delhi', 'Pune', 'Kolkata', 'Remote India'
//               ].map(l => (
//                 <option key={l} value={l}>{l}</option>
//               ))}
//             </select>
//           </>
//         ) : (
//           <>
//             <input
//               style={styles.input}
//               placeholder={
//                 activeTab === 'govt'
//                   ? 'Search govt jobs (UPSC, SSC, Banking...)'
//                   : 'Job title, skill, or keyword...'
//               }
//               value={searchInput}
//               onChange={e => setSearchInput(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && handleSearch()}
//             />
//             {activeTab === 'global' && (
//               <select
//                 style={styles.select}
//                 value={source}
//                 onChange={e => {
//                   setSource(e.target.value);
//                   fetchGlobalJobs(industry, searchInput, e.target.value, company);
//                 }}
//               >
//                 <option value="companies">50+ Top Companies</option>
//                 <option value="jsearch">JSearch (Global)</option>
//                 <option value="adzuna">Adzuna (UK/Global)</option>
//                 <option value="greenhouse">Single Company</option>
//               </select>
//             )}
//           </>
//         )}
//         <button style={styles.searchBtn} onClick={handleSearch}>
//           Search Jobs
//         </button>
//       </div>

//       <div style={styles.layout}>
//         {/* Sidebar */}
//         <div style={styles.sidebar}>
//           {activeTab === 'global' && (
//             <>
//               <div style={styles.sidebarSection}>
//                 <p style={styles.sidebarTitle}>Industry</p>
//                 {INDUSTRIES.map(ind => (
//                   <div
//                     key={ind.value}
//                     style={{
//                       ...styles.sidebarItem,
//                       ...(industry === ind.value ? styles.sidebarItemActive : {})
//                     }}
//                     onClick={() => {
//                       setIndustry(ind.value);
//                       fetchGlobalJobs(ind.value, searchInput, 'companies', company);
//                       setSource('companies');
//                     }}
//                   >
//                     {ind.label}
//                   </div>
//                 ))}
//               </div>
//               <div style={styles.sidebarSection}>
//                 <p style={styles.sidebarTitle}>Top Companies</p>
//                 {COMPANIES.slice(0, 15).map(c => (
//                   <div
//                     key={c}
//                     style={{
//                       ...styles.sidebarItem,
//                       ...(company === c && source === 'greenhouse'
//                         ? styles.sidebarItemActive : {})
//                     }}
//                     onClick={() => {
//                       setCompany(c);
//                       setSource('greenhouse');
//                       fetchGlobalJobs(industry, searchInput, 'greenhouse', c);
//                     }}
//                   >
//                     {c.charAt(0).toUpperCase() + c.slice(1)}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {activeTab === 'india' && (
//             <div style={styles.sidebarSection}>
//               <p style={styles.sidebarTitle}>Popular Searches</p>
//               {INDIA_KEYWORDS.map(k => (
//                 <div
//                   key={k}
//                   style={{
//                     ...styles.sidebarItem,
//                     ...(indiaKeyword === k ? styles.sidebarItemActive : {})
//                   }}
//                   onClick={() => {
//                     setIndiaKeyword(k);
//                     fetchIndiaJobs(k, indiaLocation);
//                   }}
//                 >
//                   {k}
//                 </div>
//               ))}
//             </div>
//           )}

//           {activeTab === 'govt' && (
//             <div style={styles.sidebarSection}>
//               <p style={styles.sidebarTitle}>Job Categories</p>
//               {[
//                 'UPSC / IAS', 'SSC / CGL', 'Banking / IBPS',
//                 'Railway / RRB', 'Defence / Army', 'Teaching / TET',
//                 'Police / PSC', 'PSU Jobs', 'State Govt'
//               ].map(k => (
//                 <div
//                   key={k}
//                   style={styles.sidebarItem}
//                   onClick={() => {
//                     setSearchInput(k);
//                     fetchGovtJobs(k);
//                   }}
//                 >
//                   {k}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Main Content */}
//         <div style={styles.main}>
//           <div style={styles.topBar}>
//             <div style={styles.filters}>
//               {filters.map(f => (
//                 <button
//                   key={f}
//                   style={{
//                     ...styles.chip,
//                     ...(filter === f ? styles.chipActive : {}),
//                   }}
//                   onClick={() => setFilter(f)}
//                 >
//                   {f}
//                 </button>
//               ))}
//             </div>
//             <span style={styles.count}>
//               {loading ? loadingMsg : `${filtered.length} jobs found`}
//               {totalCompanies > 0 && !loading && activeTab === 'global' && (
//                 <span style={styles.companyCount}>
//                   {' '}from {totalCompanies} companies
//                 </span>
//               )}
//             </span>
//           </div>

//           {loading && (
//             <div style={styles.loading}>
//               <div style={styles.spinner} />
//               <p style={styles.loadingText}>{loadingMsg}</p>
//               {activeTab === 'global' && (
//                 <p style={styles.loadingSubtext}>
//                   Checking 50+ companies simultaneously...
//                 </p>
//               )}
//             </div>
//           )}

//           {!loading && filtered.length === 0 && (
//             <div style={styles.empty}>
//               <p style={{ fontSize: '40px' }}>🔍</p>
//               <p style={styles.emptyTitle}>No jobs found</p>
//               <p style={styles.emptyDesc}>
//                 {activeTab === 'india'
//                   ? 'Try a different keyword or city'
//                   : activeTab === 'govt'
//                   ? 'Try searching UPSC, SSC, Banking, Railway'
//                   : 'Try a different keyword or industry'}
//               </p>
//             </div>
//           )}

//           <div style={styles.grid}>
//             {filtered.map(job => (
//               <JobCard key={job.id} job={job} />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page: {
//     background: '#f8fafc',
//     minHeight: '100vh',
//   },
//   tabBar: {
//     display: 'flex',
//     background: 'white',
//     borderBottom: '1px solid #e2e8f0',
//     padding: '0 32px',
//     gap: '4px',
//   },
//   tab: {
//     padding: '14px 24px',
//     border: 'none',
//     background: 'transparent',
//     fontSize: '15px',
//     color: '#64748b',
//     fontWeight: '500',
//     cursor: 'pointer',
//     borderBottom: '2px solid transparent',
//   },
//   tabActive: {
//     color: '#2563eb',
//     borderBottom: '2px solid #2563eb',
//     fontWeight: '600',
//   },
//   searchBar: {
//     display: 'flex',
//     gap: '10px',
//     padding: '16px 32px',
//     background: 'white',
//     borderBottom: '1px solid #e2e8f0',
//     flexWrap: 'wrap',
//   },
//   input: {
//     flex: 1,
//     padding: '11px 16px',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     fontSize: '15px',
//     color: '#1e293b',
//     minWidth: '200px',
//   },
//   select: {
//     padding: '11px 14px',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     fontSize: '14px',
//     color: '#475569',
//     background: 'white',
//   },
//   searchBtn: {
//     background: '#2563eb',
//     color: 'white',
//     border: 'none',
//     padding: '11px 28px',
//     borderRadius: '8px',
//     fontWeight: '600',
//     fontSize: '15px',
//     cursor: 'pointer',
//   },
//   layout: {
//     display: 'grid',
//     gridTemplateColumns: '220px 1fr',
//     minHeight: 'calc(100vh - 180px)',
//   },
//   sidebar: {
//     background: 'white',
//     borderRight: '1px solid #e2e8f0',
//     padding: '24px 16px',
//     overflowY: 'auto',
//   },
//   sidebarSection: {
//     marginBottom: '28px',
//   },
//   sidebarTitle: {
//     fontSize: '11px',
//     fontWeight: '700',
//     color: '#94a3b8',
//     textTransform: 'uppercase',
//     letterSpacing: '0.07em',
//     marginBottom: '8px',
//     padding: '0 10px',
//   },
//   sidebarItem: {
//     fontSize: '13px',
//     color: '#64748b',
//     cursor: 'pointer',
//     padding: '7px 10px',
//     borderRadius: '6px',
//     marginBottom: '2px',
//   },
//   sidebarItemActive: {
//     color: '#2563eb',
//     fontWeight: '600',
//     background: '#eff6ff',
//   },
//   main: {
//     padding: '24px 28px',
//   },
//   topBar: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '20px',
//     flexWrap: 'wrap',
//     gap: '12px',
//   },
//   filters: {
//     display: 'flex',
//     gap: '8px',
//     flexWrap: 'wrap',
//   },
//   chip: {
//     padding: '6px 16px',
//     borderRadius: '20px',
//     border: '1px solid #e2e8f0',
//     fontSize: '13px',
//     color: '#64748b',
//     background: 'white',
//     fontWeight: '500',
//     cursor: 'pointer',
//   },
//   chipActive: {
//     background: '#dbeafe',
//     color: '#1d4ed8',
//     border: '1px solid #bfdbfe',
//   },
//   count: {
//     fontSize: '14px',
//     color: '#94a3b8',
//   },
//   companyCount: {
//     fontSize: '13px',
//     color: '#2563eb',
//     fontWeight: '500',
//   },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
//     gap: '16px',
//   },
//   loading: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     padding: '80px 0',
//     gap: '12px',
//   },
//   spinner: {
//     width: '40px',
//     height: '40px',
//     border: '3px solid #e2e8f0',
//     borderTop: '3px solid #2563eb',
//     borderRadius: '50%',
//     animation: 'spin 0.8s linear infinite',
//   },
//   loadingText: {
//     color: '#1e293b',
//     fontSize: '16px',
//     fontWeight: '500',
//   },
//   loadingSubtext: {
//     color: '#94a3b8',
//     fontSize: '13px',
//   },
//   empty: {
//     textAlign: 'center',
//     padding: '80px 0',
//   },
//   emptyTitle: {
//     fontSize: '20px',
//     fontWeight: '600',
//     color: '#1e293b',
//     marginTop: '12px',
//   },
//   emptyDesc: {
//     fontSize: '14px',
//     color: '#94a3b8',
//     marginTop: '8px',
//   },
// };

// export default Jobs;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const COMPANIES = [
  'airbnb', 'stripe', 'notion', 'figma', 'shopify',
  'canva', 'atlassian', 'hubspot', 'gitlab', 'intercom',
  'linear', 'discord', 'twilio', 'datadog', 'segment',
  'brex', 'gusto', 'rippling', 'plaid', 'coinbase',
  'doordash', 'zapier', 'automattic', 'loom', 'miro'
];

const COMPANY_COLORS = {
  airbnb: '#FF5A5F', stripe: '#635BFF', notion: '#000000',
  figma: '#F24E1E', shopify: '#96BF48', canva: '#00C4CC',
  atlassian: '#0052CC', hubspot: '#FF7A59', gitlab: '#FC6D26',
  intercom: '#1F8DED', linear: '#5E6AD2', discord: '#5865F2',
  twilio: '#F22F46', datadog: '#632CA6', segment: '#52BD95',
  brex: '#F93549', gusto: '#F45D48', rippling: '#F2A900',
  plaid: '#00C866', coinbase: '#0052FF', doordash: '#FF3008',
  zapier: '#FF4A00', automattic: '#0087BE', loom: '#625DF5',
  miro: '#FFD02F',
};

const INDIA_CITIES = ['All India', 'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Pune', 'Kolkata', 'Noida', 'Gurgaon'];

const INDUSTRIES = [
  { label: '🌍 All Industries', value: 'all' },
  { label: '💻 Tech', value: 'tech' },
  { label: '💰 Finance', value: 'finance' },
  { label: '🛒 E-Commerce', value: 'ecommerce' },
  { label: '🏥 Healthcare', value: 'healthcare' },
  { label: '🌐 Remote Only', value: 'remote' },
];

function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const [filter, setFilter] = useState('All');
  const [industry, setIndustry] = useState('all');
  const [company, setCompany] = useState('airbnb');
  const [source, setSource] = useState('companies');
  const [searchInput, setSearchInput] = useState('');
  const [indiaKeyword, setIndiaKeyword] = useState('software engineer');
  const [indiaCity, setIndiaCity] = useState('All India');
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [savedIds, setSavedIds] = useState({});
  const [hoveredJob, setHoveredJob] = useState(null);
  const [hoveredCompany, setHoveredCompany] = useState(null);

  const JOB_TABS = [
    { id: 'global', label: '🌍 Global Jobs', desc: '50+ top companies' },
    { id: 'india', label: '🇮🇳 India Jobs', desc: 'LinkedIn, Indeed, Glassdoor' },
    { id: 'govt', label: '🏛️ Govt Jobs', desc: 'UPSC, SSC, Banking, Railway' },
  ];

  const TYPE_FILTERS = ['All', 'Full-time', 'Internship', 'Remote', 'Government'];

  useEffect(() => {
    document.title = 'Browse Jobs — TrueHire | Real Verified Job Listings';
    if (activeTab === 'global') fetchGlobalJobs();
    else if (activeTab === 'india') fetchIndiaJobs();
    else fetchGovtJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchGlobalJobs = async (ind, kw, src, comp) => {
    setLoading(true); setJobs([]);
    try {
      const currentSource = src || source;
      const currentIndustry = ind || industry;
      const currentKeyword = kw || searchInput;
      const currentCompany = comp || company;
      let url = currentSource === 'companies'
        ? `${API}/api/jobs/companies?industry=${currentIndustry}&keyword=${currentKeyword}`
        : currentSource === 'greenhouse'
        ? `${API}/api/jobs/greenhouse?company=${currentCompany}`
        : `${API}/api/jobs/jsearch?keyword=${currentKeyword || 'software engineer'}`;
      const res = await axios.get(url, { timeout: 30000 });
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotalCompanies(res.data.companies_fetched || 0);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchIndiaJobs = async (kw, city) => {
    setLoading(true); setJobs([]);
    try {
      const keyword = kw || indiaKeyword;
      const location = city || indiaCity;
      const res = await axios.get(
        `${API}/api/jobs/india?keyword=${keyword}&location=${location !== 'All India' ? location : 'India'}`,
        { timeout: 20000 }
      );
      if (res.data.success) setJobs(res.data.jobs);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchGovtJobs = async () => {
    setLoading(true); setJobs([]);
    try {
      const res = await axios.get(`${API}/api/jobs/govtjobs`, { timeout: 15000 });
      if (res.data.success) setJobs(res.data.jobs);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSearch = () => {
    if (activeTab === 'global') fetchGlobalJobs(industry, searchInput, source, company);
    else if (activeTab === 'india') fetchIndiaJobs(indiaKeyword, indiaCity);
    else fetchGovtJobs();
  };

  const handleSave = async (job) => {
    if (!user) { navigate('/auth'); return; }
    try {
      await supabase.from('saved_jobs').insert({
        user_id: user.id,
        job_id: String(job.id),
        job_title: job.title,
        company: job.company,
        location: job.location,
        apply_url: job.apply_url,
        source: job.source,
      });
      setSavedIds(prev => ({ ...prev, [job.id]: true }));
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'All' ? jobs
    : filter === 'Remote' ? jobs.filter(j => j.is_remote || j.location?.toLowerCase().includes('remote'))
    : filter === 'Internship' ? jobs.filter(j => j.employment_type === 'Internship' || j.title?.toLowerCase().includes('intern'))
    : filter === 'Government' ? jobs.filter(j => j.employment_type === 'Government')
    : jobs.filter(j => j.employment_type?.toLowerCase().includes(filter.toLowerCase()));

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1d ago';
    if (diff <= 30) return `${diff}d ago`;
    return null;
  };

  return (
    <div style={styles.page}>

      {/* TOP TAB BAR */}
      <div style={styles.tabSection}>
        <div style={styles.tabContainer}>
          <div style={styles.tabBar}>
            {JOB_TABS.map(tab => (
              <button
                key={tab.id}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === tab.id ? styles.tabBtnActive : {}),
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={styles.tabLabel}>{tab.label}</span>
                <span style={{
                  ...styles.tabDesc,
                  color: activeTab === tab.id ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                }}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={styles.searchRow}>
            {activeTab === 'india' ? (
              <>
                <input
                  style={styles.searchInput}
                  placeholder="Job title or skill..."
                  value={indiaKeyword}
                  onChange={e => setIndiaKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <select
                  style={styles.searchSelect}
                  value={indiaCity}
                  onChange={e => setIndiaCity(e.target.value)}
                >
                  {INDIA_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </>
            ) : activeTab === 'govt' ? (
              <input
                style={{ ...styles.searchInput, flex: 1 }}
                placeholder="Search govt jobs (UPSC, SSC, Banking, Railway...)"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            ) : (
              <>
                <input
                  style={styles.searchInput}
                  placeholder="Job title, skill, or keyword..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <select
                  style={styles.searchSelect}
                  value={source}
                  onChange={e => {
                    setSource(e.target.value);
                    fetchGlobalJobs(industry, searchInput, e.target.value, company);
                  }}
                >
                  <option value="companies">50+ Top Companies</option>
                  <option value="jsearch">All Platforms (Global)</option>
                  <option value="greenhouse">Single Company</option>
                </select>
                {source === 'greenhouse' && (
                  <select
                    style={styles.searchSelect}
                    value={company}
                    onChange={e => {
                      setCompany(e.target.value);
                      fetchGlobalJobs(industry, searchInput, 'greenhouse', e.target.value);
                    }}
                  >
                    {COMPANIES.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
            <button style={styles.searchBtn} onClick={handleSearch}>
              Search Jobs
            </button>
          </div>

          {/* Type Filters */}
          <div style={styles.typeFilters}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f}
                style={{
                  ...styles.typeFilter,
                  ...(filter === f ? styles.typeFilterActive : {}),
                }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
            <span style={styles.jobCount}>
              {loading ? 'Loading...' : `${filtered.length} jobs found`}
              {totalCompanies > 0 && !loading && activeTab === 'global' && (
                <span style={{ color: '#2563eb', marginLeft: '6px', fontWeight: '600' }}>
                  from {totalCompanies} companies
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={styles.mainLayout}>

        {/* SIDEBAR */}
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
                      ...(industry === ind.value ? styles.sidebarItemActive : {}),
                    }}
                    onClick={() => {
                      setIndustry(ind.value);
                      fetchGlobalJobs(ind.value, searchInput, 'companies', company);
                      setSource('companies');
                    }}
                    onMouseEnter={e => {
                      if (industry !== ind.value) {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.paddingLeft = '14px';
                      }
                    }}
                    onMouseLeave={e => {
                      if (industry !== ind.value) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '10px';
                      }
                    }}
                  >
                    {ind.label}
                  </div>
                ))}
              </div>

              <div style={styles.sidebarSection}>
                <p style={styles.sidebarTitle}>Top Companies</p>
                {COMPANIES.slice(0, 15).map(c => {
                  const color = COMPANY_COLORS[c] || '#2563eb';
                  const isActive = company === c && source === 'greenhouse';
                  const isHovered = hoveredCompany === c;
                  return (
                    <div
                      key={c}
                      style={{
                        ...styles.companyItem,
                        background: isActive ? color + '15' : isHovered ? '#f8fafc' : 'transparent',
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        transition: 'all 0.15s ease',
                        boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      }}
                      onClick={() => {
                        setCompany(c);
                        setSource('greenhouse');
                        fetchGlobalJobs(industry, searchInput, 'greenhouse', c);
                      }}
                      onMouseEnter={() => setHoveredCompany(c)}
                      onMouseLeave={() => setHoveredCompany(null)}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: color + '20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: '800', color,
                        flexShrink: 0,
                      }}>
                        {c.substring(0, 2).toUpperCase()}
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: isActive ? '600' : '400',
                        color: isActive ? color : '#475569',
                        flex: 1,
                      }}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </span>
                      {isHovered && (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'india' && (
            <div style={styles.sidebarSection}>
              <p style={styles.sidebarTitle}>Popular Searches</p>
              {['Software Engineer', 'Data Scientist', 'Product Manager', 'UI/UX Designer',
                'Python Developer', 'React Developer', 'Machine Learning', 'DevOps Engineer',
                'Full Stack', 'Business Analyst'].map(kw => (
                <div
                  key={kw}
                  style={{
                    ...styles.sidebarItem,
                    ...(indiaKeyword === kw ? styles.sidebarItemActive : {}),
                  }}
                  onClick={() => {
                    setIndiaKeyword(kw);
                    fetchIndiaJobs(kw, indiaCity);
                  }}
                  onMouseEnter={e => {
                    if (indiaKeyword !== kw) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    if (indiaKeyword !== kw) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  🔍 {kw}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'govt' && (
            <div style={styles.sidebarSection}>
              <p style={styles.sidebarTitle}>Job Categories</p>
              {['UPSC / IAS', 'SSC / CGL', 'Banking / IBPS', 'Railway / RRB',
                'Defence / Army', 'Teaching / TET', 'Police / PSC', 'PSU Jobs', 'State Govt'].map(kw => (
                <div
                  key={kw}
                  style={styles.sidebarItem}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.paddingLeft = '14px';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '10px';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  🏛️ {kw}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* JOBS GRID */}
        <div style={styles.jobsArea}>
          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>
                {activeTab === 'global' ? 'Fetching jobs from 50+ companies...'
                  : activeTab === 'india' ? 'Searching LinkedIn, Indeed, Glassdoor India...'
                  : 'Loading government job listings...'}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={{ fontSize: '48px' }}>🔍</p>
              <p style={styles.emptyTitle}>No jobs found</p>
              <p style={styles.emptyDesc}>Try a different keyword, company, or filter</p>
            </div>
          ) : (
            <div style={styles.jobsGrid}>
              {filtered.map(job => {
                const color = COMPANY_COLORS[job.company?.toLowerCase()] || '#2563eb';
                const daysAgo = getDaysAgo(job.posted_date);
                const isNew = daysAgo === 'Today';
                const isHovered = hoveredJob === job.id;
                const isSaved = savedIds[job.id];

                return (
                  <div
                    key={job.id}
                    style={{
                      ...styles.jobCard,
                      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                      boxShadow: isHovered
                        ? `0 20px 40px rgba(0,0,0,0.1), 0 0 0 2px ${color}30`
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      borderColor: isHovered ? color + '40' : '#e2e8f0',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={() => setHoveredJob(job.id)}
                    onMouseLeave={() => setHoveredJob(null)}
                  >
                    {/* Card Top */}
                    <div style={styles.cardTop}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: color + '15',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: '800', color,
                        flexShrink: 0,
                        border: `1px solid ${color}20`,
                      }}>
                        {job.company?.substring(0, 2).toUpperCase() || 'JB'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            ...styles.jobTitle,
                            color: isHovered ? color : '#0f172a',
                          }}
                          onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                        >
                          {job.title}
                        </h3>
                        <p style={{ fontSize: '13px', color, fontWeight: '600' }}>
                          {job.company?.charAt(0).toUpperCase() + job.company?.slice(1)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{
                          fontSize: '11px', color: '#15803d',
                          background: '#dcfce7', padding: '2px 8px',
                          borderRadius: '20px', fontWeight: '500',
                        }}>✅ Verified</span>
                        {isNew && (
                          <span style={{
                            fontSize: '11px', color: '#854d0e',
                            background: '#fef9c3', padding: '2px 8px',
                            borderRadius: '20px', fontWeight: '600',
                          }}>🔥 New</span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={styles.cardMeta}>
                      {job.location && (
                        <span style={styles.metaChip}>📍 {job.location}</span>
                      )}
                      {job.employment_type && (
                        <span style={styles.metaChip}>💼 {job.employment_type}</span>
                      )}
                      {daysAgo && (
                        <span style={{
                          ...styles.metaChip,
                          color: isNew ? '#15803d' : '#64748b',
                          fontWeight: isNew ? '600' : '400',
                        }}>
                          🕐 {daysAgo}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div style={styles.cardTags}>
                      {job.employment_type && (
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: '600',
                          background: color + '15', color,
                        }}>
                          {job.employment_type}
                        </span>
                      )}
                      <span style={styles.sourceTag}>{job.source}</span>
                    </div>

                    {/* Actions */}
                    <div style={styles.cardActions}>
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          ...styles.applyBtn,
                          background: isHovered
                            ? `linear-gradient(135deg, ${color}, ${color}cc)`
                            : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        }}
                        onClick={async () => {
                          if (user) {
                            await supabase.from('applications').insert({
                              user_id: user.id,
                              job_id: String(job.id),
                              job_title: job.title,
                              company: job.company,
                              location: job.location,
                              apply_url: job.apply_url,
                              source: job.source,
                              status: 'Applied',
                            }).then(() => {});
                          }
                        }}
                      >
                        Apply Now →
                      </a>
                      <button
                        style={{
                          ...styles.saveBtn,
                          background: isSaved ? '#f0fdf4' : 'transparent',
                          borderColor: isSaved ? '#bbf7d0' : '#e2e8f0',
                          color: isSaved ? '#16a34a' : '#64748b',
                        }}
                        onClick={() => handleSave(job)}
                        title={isSaved ? 'Saved!' : 'Save job'}
                      >
                        {isSaved ? '✅ Saved' : '🔖 Save'}
                      </button>
                      <button
                        style={styles.prepBtn}
                        onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                        title="View AI match score and interview prep"
                      >
                        🎯 Match
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f1f5f9', minHeight: '100vh', paddingTop: '64px' },
  tabSection: {
    background: 'linear-gradient(135deg, #0A1628, #0f2347)',
    padding: '24px 0 0',
    position: 'sticky', top: '64px', zIndex: 90,
  },
  tabContainer: { maxWidth: '1400px', margin: '0 auto', padding: '0 24px' },
  tabBar: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  tabBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    padding: '10px 20px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    border: '1px solid transparent',
    boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
  },
  tabLabel: { fontSize: '14px', fontWeight: '600', color: 'white' },
  tabDesc: { fontSize: '11px', marginTop: '2px' },
  searchRow: {
    display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1, minWidth: '200px',
    padding: '11px 16px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    fontSize: '14px', color: 'white',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
  },
  searchSelect: {
    padding: '11px 14px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    fontSize: '13px', color: 'white',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
  },
  searchBtn: {
    padding: '11px 24px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white', border: 'none',
    fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
    cursor: 'pointer',
  },
  typeFilters: {
    display: 'flex', gap: '6px', paddingBottom: '14px',
    alignItems: 'center', flexWrap: 'wrap',
  },
  typeFilter: {
    padding: '6px 16px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  typeFilterActive: {
    background: 'white', color: '#0f172a',
    border: '1px solid white', fontWeight: '600',
  },
  jobCount: { marginLeft: 'auto', fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    gap: '20px',
  },
  sidebar: {
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    height: 'fit-content',
    position: 'sticky',
    top: '200px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  sidebarSection: { marginBottom: '24px' },
  sidebarTitle: {
    fontSize: '11px', fontWeight: '700',
    color: '#94a3b8', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '10px',
    padding: '0 10px',
  },
  sidebarItem: {
    fontSize: '13px', color: '#475569',
    padding: '8px 10px', borderRadius: '8px',
    cursor: 'pointer', marginBottom: '2px',
    transition: 'all 0.15s ease',
  },
  sidebarItemActive: {
    background: '#eff6ff', color: '#2563eb',
    fontWeight: '600',
  },
  companyItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '7px 10px', borderRadius: '8px',
    cursor: 'pointer', marginBottom: '2px',
    border: '1px solid transparent',
  },
  jobsArea: { minHeight: '60vh' },
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: '44px', height: '44px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '16px',
  },
  loadingText: { fontSize: '15px', color: '#64748b', fontWeight: '500' },
  emptyBox: { textAlign: 'center', padding: '80px 0' },
  emptyTitle: { fontSize: '22px', fontWeight: '700', color: '#0f172a', marginTop: '16px' },
  emptyDesc: { fontSize: '14px', color: '#94a3b8', marginTop: '8px' },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '14px',
  },
  jobCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '18px',
    cursor: 'default',
  },
  cardTop: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' },
  jobTitle: {
    fontSize: '15px', fontWeight: '700',
    marginBottom: '3px', lineHeight: '1.3',
    cursor: 'pointer', transition: 'color 0.15s',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  metaChip: { fontSize: '12px', color: '#64748b' },
  cardTags: { display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' },
  sourceTag: {
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', background: '#f1f5f9',
    color: '#64748b', border: '1px solid #e2e8f0',
  },
  cardActions: { display: 'flex', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' },
  applyBtn: {
    flex: 1, padding: '9px 0',
    borderRadius: '8px', border: 'none',
    color: 'white', fontSize: '13px', fontWeight: '700',
    textDecoration: 'none', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
    transition: 'all 0.15s',
  },
  saveBtn: {
    padding: '9px 12px', borderRadius: '8px',
    border: '1px solid', fontSize: '12px',
    fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  prepBtn: {
    padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'transparent', color: '#7c3aed',
    fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.15s',
  },
};

export default Jobs;