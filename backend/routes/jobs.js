const express = require('express');
const axios = require('axios');
const router = express.Router();

// SOURCE 1: Greenhouse (no key needed - 500+ real companies)
router.get('/greenhouse', async (req, res) => {
  try {
    const company = req.query.company || 'airbnb';
    const response = await axios.get(
      `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`,
      { timeout: 10000 }
    );
    const jobs = response.data.jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: company,
      location: job.location.name,
      posted_date: job.updated_at,
      apply_url: job.absolute_url,
      source: 'Greenhouse'
    }));
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SOURCE 2: JSearch via RapidAPI
router.get('/jsearch', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'software developer';

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search-v2',
      params: {
        query: keyword,
        num_pages: '1',
        country: 'us',
        date_posted: 'all'
      },
      headers: {
        'x-rapidapi-key': 'c91f2262e7msh3b76754c5d4aed4p17154ejsn1182dc1d76a9',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.request(options);
    console.log('JSearch response keys:', JSON.stringify(Object.keys(response.data)));
console.log('JSearch data sample:', JSON.stringify(response.data).substring(0, 500));

    const rawJobs = response.data.data?.jobs || response.data.jobs || response.data.data || [];

const jobs = rawJobs.map(job => ({
  id: job.job_id,
  title: job.job_title,
  company: job.employer_name,
  location: `${job.job_city || ''} ${job.job_country || ''}`.trim(),
  employment_type: job.job_employment_type,
  posted_date: job.job_posted_at_datetime_utc,
  apply_url: job.job_apply_link,
  source: 'JSearch'
}));

res.json({ success: true, count: jobs.length, jobs });

    res.json({ success: true, count: jobs.length, jobs });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      detail: error.response ? error.response.data : 'no response'
    });
  }
});

// SOURCE 3: Adzuna (GB working, IN has server issues)
router.get('/adzuna', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'software engineer';
    const country = req.query.country || 'gb';
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what: keyword,
          results_per_page: 20
        },
        timeout: 10000
      }
    );
    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary_min: job.salary_min || 'Not disclosed',
      salary_max: job.salary_max || 'Not disclosed',
      posted_date: job.created,
      apply_url: job.redirect_url,
      source: 'Adzuna'
    }));
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// MULTI-COMPANY: Fetch jobs from multiple companies at once
router.get('/companies', async (req, res) => {
  try {
    const { industry = 'all', keyword = '' } = req.query;

    const allCompanies = {
      tech: [
        'airbnb', 'stripe', 'notion', 'figma', 'shopify',
        'canva', 'atlassian', 'hubspot', 'gitlab', 'intercom',
        'linear', 'discord', 'twilio', 'datadog', 'segment',
        'mixpanel', 'amplitude', 'loom', 'miro', 'front'
      ],
      finance: [
        'brex', 'gusto', 'rippling', 'plaid', 'carta',
        'greenhouse', 'checkr', 'lattice', 'lever', 'namely'
      ],
      ecommerce: [
        'doordash', 'instacart', 'faire', 'shipbob', 'klaviyo',
        'yotpo', 'gorgias', 'rechargepayments', 'postscript', 'attentive'
      ],
      healthcare: [
        'hims', 'headspace', 'calm', 'noom', 'zocdoc',
        'included-health', 'lyra', 'spring-health', 'sword-health', 'cerebral'
      ],
      remote: [
        'doist', 'buffer', 'zapier', 'automattic', 'invisionapp',
        'hotjar', 'close', 'basecamp', 'wildbit', 'convertkit'
      ]
    };

    let companies = [];
    if (industry === 'all') {
      companies = Object.values(allCompanies).flat();
    } else {
      companies = allCompanies[industry] || allCompanies.tech;
    }

    const results = await Promise.allSettled(
      companies.map(company =>
        axios.get(
          `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`,
          { timeout: 8000 }
        )
      )
    );

    let allJobs = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        let jobs = result.value.data.jobs || [];

        if (keyword) {
          jobs = jobs.filter(job =>
            job.title.toLowerCase().includes(keyword.toLowerCase())
          );
        }

        const mapped = jobs.map(job => {
          const title = job.title.toLowerCase();
          let employment_type = 'Full-time';
          if (title.includes('intern') || title.includes('internship')) {
            employment_type = 'Internship';
          } else if (title.includes('part-time') || title.includes('part time')) {
            employment_type = 'Part-time';
          } else if (title.includes('contract')) {
            employment_type = 'Contract';
          }

          const location = job.location.name || '';
          const isRemote = location.toLowerCase().includes('remote') ||
            title.includes('remote');

          return {
            id: job.id,
            title: job.title,
            company: companies[index],
            location: location || 'Remote / Global',
            employment_type,
            is_remote: isRemote,
            apply_url: job.absolute_url,
            posted_date: job.updated_at,
            source: 'Greenhouse'
          };
        });
        allJobs = [...allJobs, ...mapped];
      }
    });

    allJobs.sort((a, b) =>
      new Date(b.posted_date) - new Date(a.posted_date)
    );

    res.json({
      success: true,
      count: allJobs.length,
      companies_fetched: companies.length,
      jobs: allJobs
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// India specific jobs
router.get('/india', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'software engineer';
    const location = req.query.location || 'India';

    // Try JSearch first
    try {
      const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search-v2',
        params: {
          query: `${keyword} ${location}`,
          num_pages: '1',
          date_posted: 'all',
          country: 'in',
          language: 'en'
        },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      };

      const response = await axios.request(options);
      const rawJobs = response.data.data?.jobs ||
        response.data.jobs ||
        response.data.data || [];

      if (rawJobs.length > 0) {
        const jobs = rawJobs.map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: `${job.job_city || ''} ${job.job_state || ''} India`.trim(),
          employment_type: job.job_employment_type || 'Full-time',
          posted_date: job.job_posted_at_datetime_utc,
          apply_url: job.job_apply_link,
          source: 'LinkedIn / Indeed / Glassdoor'
        }));
        return res.json({ success: true, count: jobs.length, jobs });
      }
    } catch (jsearchError) {
      console.log('JSearch failed, trying Adzuna India...');
    }

    // Fallback to Adzuna India
    try {
      const adzunaRes = await axios.get(
        'https://api.adzuna.com/v1/api/jobs/in/search/1',
        {
          params: {
            app_id: process.env.ADZUNA_APP_ID,
            app_key: process.env.ADZUNA_APP_KEY,
            what: keyword,
            where: location !== 'India' ? location : '',
            results_per_page: 20
          },
          timeout: 10000
        }
      );

      const jobs = adzunaRes.data.results.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        employment_type: 'Full-time',
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        posted_date: job.created,
        apply_url: job.redirect_url,
        source: 'Adzuna India'
      }));

      return res.json({ success: true, count: jobs.length, jobs });
    } catch (adzunaError) {
      console.log('Adzuna India failed too');
    }

    // Final fallback — Adzuna GB with India filter
    const gbRes = await axios.get(
      'https://api.adzuna.com/v1/api/jobs/gb/search/1',
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what: keyword,
          results_per_page: 20
        },
        timeout: 10000
      }
    );

    const jobs = gbRes.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      employment_type: 'Full-time',
      posted_date: job.created,
      apply_url: job.redirect_url,
      source: 'Adzuna Global'
    }));

    res.json({ success: true, count: jobs.length, jobs });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Government jobs India via NCS API
router.get('/govtjobs', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';

    // NCS (National Career Service) - Government of India
    const response = await axios.get(
      'https://www.ncs.gov.in/api/jobs',
      {
        params: {
          keyword,
          pageNo: 1,
          pageSize: 20,
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const jobs = (response.data.jobs || response.data || []).map(job => ({
      id: job.jobId || job.id,
      title: job.jobTitle || job.title,
      company: job.organizationName || job.company || 'Government',
      location: job.jobLocation || job.location || 'India',
      employment_type: 'Government',
      posted_date: job.postedDate || job.createdDate,
      apply_url: job.applyUrl || 'https://www.ncs.gov.in',
      source: 'Govt (NCS India)'
    }));

    res.json({ success: true, count: jobs.length, jobs });

  } catch (error) {
    // Fallback to static govt job boards if NCS API fails
    const fallbackJobs = [
      {
        id: 'upsc-2026',
        title: 'Civil Services Examination 2026',
        company: 'UPSC',
        location: 'All India',
        employment_type: 'Government',
        apply_url: 'https://upsc.gov.in',
        source: 'Govt (Central)'
      },
      {
        id: 'ssc-cgl-2026',
        title: 'SSC CGL 2026',
        company: 'Staff Selection Commission',
        location: 'All India',
        employment_type: 'Government',
        apply_url: 'https://ssc.nic.in',
        source: 'Govt (Central)'
      },
      {
        id: 'ibps-2026',
        title: 'IBPS PO/Clerk 2026',
        company: 'IBPS',
        location: 'All India',
        employment_type: 'Government',
        apply_url: 'https://www.ibps.in',
        source: 'Govt (Banking)'
      },
      {
        id: 'railway-2026',
        title: 'Railway Recruitment 2026',
        company: 'Indian Railways (RRB)',
        location: 'All India',
        employment_type: 'Government',
        apply_url: 'https://www.rrbcdg.gov.in',
        source: 'Govt (Central)'
      },
      {
        id: 'nit-faculty',
        title: 'Faculty Positions',
        company: 'NITs / IITs',
        location: 'All India',
        employment_type: 'Government',
        apply_url: 'https://www.nits.ac.in',
        source: 'Govt (Education)'
      }
    ];

    res.json({
      success: true,
      count: fallbackJobs.length,
      jobs: fallbackJobs,
      note: 'Showing major govt recruitment portals'
    });
  }
});

// AI Resume Analysis
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, error: 'No resume text provided' });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Extract skills from this resume. Return ONLY a JSON object with two arrays:
1. "skills": top 10 technical skills (programming languages, frameworks, tools)
2. "jobTitles": top 3 suitable job titles for this person

Resume text:
${resumeText.substring(0, 3000)}

Return ONLY valid JSON like: {"skills": ["Python", "React"], "jobTitles": ["Software Engineer", "Data Scientist"]}`
      }]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ success: true, ...parsed });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch jobs by multiple keywords
router.get('/matched-jobs', async (req, res) => {
  try {
    const { skills } = req.query;
    const skillList = skills ? skills.split(',') : ['software engineer'];
    const topSkill = skillList[0];

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search-v2',
      params: {
        query: `${topSkill} jobs`,
        num_pages: '1',
        date_posted: 'all',
        country: 'us',
        language: 'en'
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.request(options);
    const rawJobs = response.data.data?.jobs ||
      response.data.jobs ||
      response.data.data || [];

    const jobs = rawJobs.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''} ${job.job_country || ''}`.trim(),
      employment_type: job.job_employment_type || 'Full-time',
      posted_date: job.job_posted_at_datetime_utc,
      apply_url: job.job_apply_link,
      source: 'JSearch'
    }));

    res.json({ success: true, count: jobs.length, jobs });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/match-score', async (req, res) => {
  try {
    const { jobTitle, jobDescription, userSkills } = req.body;

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a job matching expert. Analyze this job and candidate.

Job Title: ${jobTitle}
Job Description: ${jobDescription || 'Not provided'}
Candidate Skills: ${userSkills.join(', ')}

Return ONLY a JSON object:
{
  "score": 75,
  "matchedSkills": ["Python", "React"],
  "missingSkills": ["Docker", "Kubernetes"],
  "interviewQuestions": [
    "Tell me about your experience with Python?",
    "How do you handle state management in React?",
    "Describe a challenging project you completed.",
    "How do you approach debugging complex issues?",
    "Where do you see yourself in 5 years?"
  ],
  "verdict": "Strong match — apply now"
}`
      }]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({ success: true, ...parsed });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/cover-letter', async (req, res) => {
  try {
    const { jobTitle, company, userSkills, userName } = req.body;

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Write a professional cover letter for:
Name: ${userName || 'Candidate'}
Job: ${jobTitle} at ${company}
Skills: ${userSkills.join(', ')}

Write a compelling 3-paragraph cover letter. Be specific, confident, and professional. Do not use placeholders.`
      }]
    });

    res.json({
      success: true,
      coverLetter: message.content[0].text
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/match-score', async (req, res) => {
  try {
    const { jobTitle, jobDescription, userSkills } = req.body;
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a job matching expert.
Job Title: ${jobTitle}
Candidate Skills: ${(userSkills || []).join(', ')}
Return ONLY this JSON:
{"score":75,"matchedSkills":["Python"],"missingSkills":["Docker"],"interviewQuestions":["Tell me about yourself?","Why this role?","Describe a challenge?","Your strengths?","Where in 5 years?"],"verdict":"Good match"}`
      }]
    });
    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({ success: true, ...parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/cover-letter', async (req, res) => {
  try {
    const { jobTitle, company, userSkills, userName } = req.body;
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Write a professional 3-paragraph cover letter for ${userName || 'the candidate'} applying for ${jobTitle} at ${company}. Their skills: ${(userSkills || []).join(', ')}. Be specific and confident.`
      }]
    });
    res.json({ success: true, coverLetter: message.content[0].text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;