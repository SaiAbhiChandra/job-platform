import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API = 'https://job-platform-production-ad1a.up.railway.app';

const COMPANIES = ['All', 'Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Wipro',
  'Flipkart', 'Zomato', 'Swiggy', 'Stripe', 'Airbnb', 'Accenture', 'Cognizant'];
const ROLES = ['All', 'Software Engineer', 'ML Engineer', 'Data Scientist', 'Data Analyst', 'Full Stack Developer'];
const CATEGORIES = ['All', 'DSA', 'System Design', 'ML', 'Behavioral', 'Technical', 'SQL', 'HR'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const DIFF_COLORS = {
  Easy: { bg: '#dcfce7', color: '#15803d' },
  Medium: { bg: '#fef9c3', color: '#854d0e' },
  Hard: { bg: '#fee2e2', color: '#dc2626' },
};

const CAT_COLORS = {
  DSA: '#dbeafe', 'System Design': '#ede9fe', ML: '#fce7f3',
  Behavioral: '#dcfce7', Technical: '#fff7ed', SQL: '#fef9c3', HR: '#f1f5f9',
};

function InterviewQuestions() {
//   const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [filters, setFilters] = useState({ company: 'All', role: 'All', category: 'All', difficulty: 'All', search: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [upvoted, setUpvoted] = useState({});
  const [aiQuestions, setAiQuestions] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiForm, setAiForm] = useState({ company: 'Google', role: 'Software Engineer', category: 'DSA' });
//   const [stats, setStats] = useState({ total: 0, companies: 0 });

//   useEffect(() => { fetchQuestions(); }, [filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.company !== 'All') params.company = filters.company;
      if (filters.role !== 'All') params.role = filters.role;
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.difficulty !== 'All') params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;

      const res = await axios.get(`${API}/api/jobs/interview-questions`, { params });
      if (res.data.success) {
        setQuestions(res.data.questions);
        // setStats({ total: res.data.count, companies: COMPANIES.length - 1 });
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const generateAIQuestions = async () => {
    setAiLoading(true);
    setAiQuestions([]);
    try {
      const res = await axios.post(`${API}/api/jobs/generate-interview-questions`, aiForm);
      if (res.data.success) setAiQuestions(res.data.questions);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  };

  const handleUpvote = async (id) => {
    if (upvoted[id]) return;
    try {
      await axios.post(`${API}/api/jobs/upvote-question`, { questionId: id });
      setUpvoted({ ...upvoted, [id]: true });
      setQuestions(questions.map(q => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q));
    } catch (err) { console.error(err); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.aiBadge}>📚 Real Interview Questions</div>
          <h1 style={styles.title}>Interview Question Bank</h1>
          <p style={styles.subtitle}>
            Real interview questions from top companies. Filter by company, role, and difficulty.
            Prepare smarter, get hired faster.
          </p>
          <div style={styles.headerStats}>
            <div style={styles.headerStat}>
              <span style={styles.headerStatNum}>{questions.length}+</span>
              <span style={styles.headerStatLabel}>Questions</span>
            </div>
            <div style={styles.headerStat}>
              <span style={styles.headerStatNum}>{COMPANIES.length - 1}</span>
              <span style={styles.headerStatLabel}>Companies</span>
            </div>
            <div style={styles.headerStat}>
              <span style={styles.headerStatNum}>{CATEGORIES.length - 1}</span>
              <span style={styles.headerStatLabel}>Categories</span>
            </div>
          </div>
        </div>

        {/* AI Generate Panel */}
        <div style={styles.aiPanel}>
          <div style={styles.aiPanelHeader} onClick={() => setShowAiPanel(!showAiPanel)}>
            <span style={styles.aiPanelTitle}>🤖 Generate AI Interview Questions for Any Company & Role</span>
            <span>{showAiPanel ? '▲' : '▼'}</span>
          </div>
          {showAiPanel && (
            <div style={styles.aiPanelBody}>
              <p style={styles.aiPanelDesc}>
                Don't see your company? Let AI generate realistic questions tailored to any company and role.
              </p>
              <div style={styles.aiFormRow}>
                <div style={styles.aiFormGroup}>
                  <label style={styles.label}>Company</label>
                  <input
                    style={styles.aiInput}
                    value={aiForm.company}
                    onChange={e => setAiForm({ ...aiForm, company: e.target.value })}
                    placeholder="e.g. Razorpay, PhonePe, Meesho"
                  />
                </div>
                <div style={styles.aiFormGroup}>
                  <label style={styles.label}>Role</label>
                  <input
                    style={styles.aiInput}
                    value={aiForm.role}
                    onChange={e => setAiForm({ ...aiForm, role: e.target.value })}
                    placeholder="e.g. Backend Developer"
                  />
                </div>
                <div style={styles.aiFormGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.aiInput}
                    value={aiForm.category}
                    onChange={e => setAiForm({ ...aiForm, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button
                  style={styles.aiGenBtn}
                  onClick={generateAIQuestions}
                  disabled={aiLoading}
                >
                  {aiLoading ? '⏳ Generating...' : '✨ Generate Questions'}
                </button>
              </div>

              {aiLoading && (
                <div style={styles.aiLoading}>
                  <div style={styles.spinner} />
                  <p>AI is generating interview questions...</p>
                </div>
              )}

              {aiQuestions.length > 0 && (
                <div style={styles.aiQuestions}>
                  <p style={styles.aiQuestionsTitle}>
                    Generated {aiQuestions.length} questions for {aiForm.role} at {aiForm.company}:
                  </p>
                  {aiQuestions.map((q, i) => (
                    <div key={i} style={styles.aiQuestionCard}>
                      <div style={styles.aiQTop}>
                        <span style={styles.aiQNum}>Q{i + 1}</span>
                        <p style={styles.aiQText}>{q.question}</p>
                        <span style={{
                          ...styles.diffBadge,
                          background: DIFF_COLORS[q.difficulty]?.bg || '#f1f5f9',
                          color: DIFF_COLORS[q.difficulty]?.color || '#64748b',
                        }}>
                          {q.difficulty}
                        </span>
                      </div>
                      {q.hint && (
                        <p style={styles.aiHint}>💡 {q.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={styles.filtersSection}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search questions..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div style={styles.filterRow}>
            <select style={styles.filterSelect} value={filters.company}
              onChange={e => setFilters({ ...filters, company: e.target.value })}>
              {COMPANIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select style={styles.filterSelect} value={filters.role}
              onChange={e => setFilters({ ...filters, role: e.target.value })}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select style={styles.filterSelect} value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select style={styles.filterSelect} value={filters.difficulty}
              onChange={e => setFilters({ ...filters, difficulty: e.target.value })}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
            <button style={styles.resetBtn}
              onClick={() => setFilters({ company: 'All', role: 'All', category: 'All', difficulty: 'All', search: '' })}>
              Reset
            </button>
          </div>

          {/* Company chips */}
          <div style={styles.companyChips}>
            {COMPANIES.filter(c => c !== 'All').map(c => (
              <button
                key={c}
                style={{
                  ...styles.companyChip,
                  background: filters.company === c ? '#2563eb' : 'white',
                  color: filters.company === c ? 'white' : '#475569',
                  border: `1px solid ${filters.company === c ? '#2563eb' : '#e2e8f0'}`,
                }}
                onClick={() => setFilters({ ...filters, company: filters.company === c ? 'All' : c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={styles.resultsBar}>
          <span style={styles.resultsCount}>
            {loading ? 'Loading...' : `${questions.length} questions found`}
          </span>
          <div style={styles.categoryChips}>
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <button
                key={c}
                style={{
                  ...styles.catChip,
                  background: filters.category === c ? CAT_COLORS[c] : 'white',
                  fontWeight: filters.category === c ? '600' : '400',
                }}
                onClick={() => setFilters({ ...filters, category: filters.category === c ? 'All' : c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b' }}>Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '40px' }}>🤔</p>
            <p style={styles.emptyTitle}>No questions found</p>
            <p style={styles.emptyDesc}>Try different filters or use AI to generate questions above</p>
          </div>
        ) : (
          <div style={styles.questionsList}>
            {questions.map((q, i) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={styles.qTop}>
                  <div style={styles.qLeft}>
                    <span style={styles.qNum}>#{i + 1}</span>
                    <div style={styles.qMeta}>
                      <span style={styles.qCompany}>{q.company}</span>
                      <span style={styles.qSep}>·</span>
                      <span style={styles.qRole}>{q.role}</span>
                    </div>
                  </div>
                  <div style={styles.qBadges}>
                    <span style={{
                      ...styles.catBadge,
                      background: CAT_COLORS[q.category] || '#f1f5f9',
                    }}>
                      {q.category}
                    </span>
                    <span style={{
                      ...styles.diffBadge,
                      background: DIFF_COLORS[q.difficulty]?.bg || '#f1f5f9',
                      color: DIFF_COLORS[q.difficulty]?.color || '#64748b',
                    }}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                <p
                  style={styles.qText}
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  {q.question}
                </p>

                {expandedId === q.id && (
                  <div style={styles.qExpanded}>
                    {q.tags?.length > 0 && (
                      <div style={styles.qTags}>
                        {q.tags.map(tag => (
                          <span key={tag} style={styles.qTag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div style={styles.qHints}>
                      <p style={styles.qHintTitle}>💡 How to approach this:</p>
                      <ul style={styles.qHintList}>
                        {q.category === 'DSA' && <>
                          <li>Clarify the problem and constraints first</li>
                          <li>Think about brute force, then optimize</li>
                          <li>Discuss time and space complexity</li>
                          <li>Test with edge cases</li>
                        </>}
                        {q.category === 'System Design' && <>
                          <li>Start with requirements clarification</li>
                          <li>Estimate scale — users, requests per second</li>
                          <li>Design high-level components first</li>
                          <li>Discuss tradeoffs for each design decision</li>
                        </>}
                        {q.category === 'Behavioral' && <>
                          <li>Use the STAR method: Situation, Task, Action, Result</li>
                          <li>Be specific with real examples from your experience</li>
                          <li>Focus on your personal contribution</li>
                          <li>Quantify results wherever possible</li>
                        </>}
                        {q.category === 'ML' && <>
                          <li>Start with the business problem context</li>
                          <li>Discuss data collection and preprocessing</li>
                          <li>Explain model selection rationale</li>
                          <li>Talk about evaluation metrics and deployment</li>
                        </>}
                        {!['DSA', 'System Design', 'Behavioral', 'ML'].includes(q.category) && <>
                          <li>Understand the concept deeply before answering</li>
                          <li>Give a real-world example</li>
                          <li>Be concise and structured</li>
                        </>}
                      </ul>
                    </div>
                  </div>
                )}

                <div style={styles.qBottom}>
                  <button
                    style={{
                      ...styles.upvoteBtn,
                      background: upvoted[q.id] ? '#dbeafe' : 'transparent',
                      color: upvoted[q.id] ? '#2563eb' : '#64748b',
                    }}
                    onClick={() => handleUpvote(q.id)}
                  >
                    👍 {q.upvotes + (upvoted[q.id] ? 1 : 0)}
                  </button>
                  <button
                    style={styles.expandBtn}
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  >
                    {expandedId === q.id ? '▲ Hide tips' : '▼ Show tips'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f8fafc', minHeight: '100vh', padding: '36px 20px' },
  container: { maxWidth: '900px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '28px' },
  aiBadge: { display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#64748b', lineHeight: '1.6', maxWidth: '560px', margin: '0 auto 20px' },
  headerStats: { display: 'flex', justifyContent: 'center', gap: '32px' },
  headerStat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  headerStatNum: { fontSize: '24px', fontWeight: '700', color: '#2563eb' },
  headerStatLabel: { fontSize: '12px', color: '#94a3b8' },
  aiPanel: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' },
  aiPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', background: 'linear-gradient(135deg, #ede9fe, #dbeafe)' },
  aiPanelTitle: { fontSize: '14px', fontWeight: '600', color: '#4c1d95' },
  aiPanelBody: { padding: '20px' },
  aiPanelDesc: { fontSize: '14px', color: '#64748b', marginBottom: '16px' },
  aiFormRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' },
  aiFormGroup: { flex: 1, minWidth: '150px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' },
  aiInput: { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', boxSizing: 'border-box' },
  aiGenBtn: { background: '#7c3aed', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  aiLoading: { textAlign: 'center', padding: '20px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' },
  aiQuestions: { marginTop: '16px' },
  aiQuestionsTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' },
  aiQuestionCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '10px' },
  aiQTop: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  aiQNum: { background: '#7c3aed', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 },
  aiQText: { flex: 1, fontSize: '14px', color: '#1e293b', lineHeight: '1.5' },
  aiHint: { fontSize: '12px', color: '#64748b', marginTop: '8px', fontStyle: 'italic' },
  filtersSection: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' },
  searchBox: { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', marginBottom: '12px', background: '#f8fafc' },
  searchIcon: { marginRight: '8px', fontSize: '16px' },
  searchInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: '#1e293b', outline: 'none' },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  filterSelect: { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#475569', background: 'white' },
  resetBtn: { padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#64748b', background: 'white', cursor: 'pointer' },
  companyChips: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  companyChip: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  resultsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  resultsCount: { fontSize: '14px', color: '#64748b', fontWeight: '500' },
  categoryChips: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  catChip: { padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: 'white', color: '#475569' },
  loadingBox: { textAlign: 'center', padding: '60px 0' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#0f172a', marginTop: '12px' },
  emptyDesc: { fontSize: '14px', color: '#64748b', marginTop: '8px' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  questionCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' },
  qTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' },
  qLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  qNum: { fontSize: '12px', color: '#94a3b8', fontWeight: '600' },
  qMeta: { display: 'flex', alignItems: 'center', gap: '6px' },
  qCompany: { fontSize: '13px', fontWeight: '700', color: '#2563eb' },
  qSep: { color: '#94a3b8' },
  qRole: { fontSize: '13px', color: '#64748b' },
  qBadges: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  catBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: '#1e293b' },
  diffBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  qText: { fontSize: '15px', color: '#0f172a', lineHeight: '1.6', cursor: 'pointer', fontWeight: '500', marginBottom: '12px' },
  qExpanded: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '12px' },
  qTags: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  qTag: { fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px' },
  qHints: {},
  qHintTitle: { fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
  qHintList: { paddingLeft: '16px' },
  qBottom: { display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' },
  upvoteBtn: { padding: '5px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  expandBtn: { fontSize: '13px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' },
};

export default InterviewQuestions;