const express = require('express');
const axios = require('axios');
const router = express.Router();

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

router.get('/jsearch', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'software developer';
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search-v2',
      params: { query: keyword, num_pages: '1', country: 'us', date_posted: 'all' },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };
    const response = await axios.request(options);
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
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, detail: error.response ? error.response.data : 'no response' });
  }
});

router.get('/adzuna', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'software engineer';
    const country = req.query.country || 'gb';
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: { app_id: process.env.ADZUNA_APP_ID, app_key: process.env.ADZUNA_APP_KEY, what: keyword, results_per_page: 20 },
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

router.get('/companies', async (req, res) => {
  try {
    const { industry = 'all', keyword = '' } = req.query;
    const allCompanies = {
      tech: ['airbnb','stripe','notion','figma','shopify','canva','atlassian','hubspot','gitlab','intercom','linear','discord','twilio','datadog','segment','mixpanel','amplitude','loom','miro','front'],
      finance: ['brex','gusto','rippling','plaid','carta','checkr','lattice','namely'],
      ecommerce: ['doordash','instacart','faire','shipbob','klaviyo','yotpo','gorgias'],
      healthcare: ['hims','headspace','calm','noom','zocdoc'],
      remote: ['doist','buffer','zapier','automattic','hotjar','close','basecamp','convertkit']
    };
    let companies = industry === 'all' ? Object.values(allCompanies).flat() : (allCompanies[industry] || allCompanies.tech);
    const results = await Promise.allSettled(
      companies.map(company => axios.get(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs`, { timeout: 8000 }))
    );
    let allJobs = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        let jobs = result.value.data.jobs || [];
        if (keyword) jobs = jobs.filter(job => job.title.toLowerCase().includes(keyword.toLowerCase()));
        const mapped = jobs.map(job => {
          const title = job.title.toLowerCase();
          let employment_type = 'Full-time';
          if (title.includes('intern')) employment_type = 'Internship';
          else if (title.includes('part-time')) employment_type = 'Part-time';
          else if (title.includes('contract')) employment_type = 'Contract';
          const location = job.location.name || '';
          return { id: job.id, title: job.title, company: companies[index], location: location || 'Remote / Global', employment_type, is_remote: location.toLowerCase().includes('remote'), apply_url: job.absolute_url, posted_date: job.updated_at, source: 'Greenhouse' };
        });
        allJobs = [...allJobs, ...mapped];
      }
    });
    allJobs.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));
    res.json({ success: true, count: allJobs.length, companies_fetched: companies.length, jobs: allJobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/india', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'software engineer';
    const location = req.query.location || 'India';
    try {
      const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search-v2',
        params: { query: `${keyword} ${location}`, num_pages: '1', date_posted: 'all', country: 'in', language: 'en' },
        headers: { 'x-rapidapi-key': process.env.RAPIDAPI_KEY, 'x-rapidapi-host': 'jsearch.p.rapidapi.com', 'Content-Type': 'application/json' },
        timeout: 15000
      };
      const response = await axios.request(options);
      const rawJobs = response.data.data?.jobs || response.data.jobs || response.data.data || [];
      if (rawJobs.length > 0) {
        const jobs = rawJobs.map(job => ({ id: job.job_id, title: job.job_title, company: job.employer_name, location: `${job.job_city || ''} ${job.job_state || ''} India`.trim(), employment_type: job.job_employment_type || 'Full-time', posted_date: job.job_posted_at_datetime_utc, apply_url: job.job_apply_link, source: 'LinkedIn / Indeed / Glassdoor' }));
        return res.json({ success: true, count: jobs.length, jobs });
      }
    } catch (e) { console.log('JSearch India failed'); }
    try {
      const adzunaRes = await axios.get('https://api.adzuna.com/v1/api/jobs/in/search/1', { params: { app_id: process.env.ADZUNA_APP_ID, app_key: process.env.ADZUNA_APP_KEY, what: keyword, where: location !== 'India' ? location : '', results_per_page: 20 }, timeout: 10000 });
      const jobs = adzunaRes.data.results.map(job => ({ id: job.id, title: job.title, company: job.company.display_name, location: job.location.display_name, employment_type: 'Full-time', posted_date: job.created, apply_url: job.redirect_url, source: 'Adzuna India' }));
      return res.json({ success: true, count: jobs.length, jobs });
    } catch (e) { console.log('Adzuna India failed'); }
    const gbRes = await axios.get('https://api.adzuna.com/v1/api/jobs/gb/search/1', { params: { app_id: process.env.ADZUNA_APP_ID, app_key: process.env.ADZUNA_APP_KEY, what: keyword, results_per_page: 20 }, timeout: 10000 });
    const jobs = gbRes.data.results.map(job => ({ id: job.id, title: job.title, company: job.company.display_name, location: job.location.display_name, employment_type: 'Full-time', posted_date: job.created, apply_url: job.redirect_url, source: 'Adzuna Global' }));
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/govtjobs', async (req, res) => {
  try {
    const fallbackJobs = [
      { id: 'upsc-2026', title: 'Civil Services Examination 2026', company: 'UPSC', location: 'All India', employment_type: 'Government', apply_url: 'https://upsc.gov.in', source: 'Govt (Central)' },
      { id: 'ssc-cgl-2026', title: 'SSC CGL 2026', company: 'Staff Selection Commission', location: 'All India', employment_type: 'Government', apply_url: 'https://ssc.nic.in', source: 'Govt (Central)' },
      { id: 'ibps-2026', title: 'IBPS PO/Clerk 2026', company: 'IBPS', location: 'All India', employment_type: 'Government', apply_url: 'https://www.ibps.in', source: 'Govt (Banking)' },
      { id: 'railway-2026', title: 'Railway Recruitment 2026', company: 'Indian Railways (RRB)', location: 'All India', employment_type: 'Government', apply_url: 'https://www.rrbcdg.gov.in', source: 'Govt (Central)' },
      { id: 'nit-faculty', title: 'Faculty Positions', company: 'NITs / IITs', location: 'All India', employment_type: 'Government', apply_url: 'https://www.nits.ac.in', source: 'Govt (Education)' }
    ];
    res.json({ success: true, count: fallbackJobs.length, jobs: fallbackJobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ success: false, error: 'No resume text provided' });
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: `Extract skills from this resume. Return ONLY valid JSON: {"skills": ["Python", "React"], "jobTitles": ["Software Engineer"]}\n\nResume:\n${resumeText.substring(0, 3000)}` }]
    });
    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({ success: true, ...parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/matched-jobs', async (req, res) => {
  try {
    const { skills } = req.query;
    const skillList = skills ? skills.split(',') : ['software engineer'];
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search-v2',
      params: { query: `${skillList[0]} jobs`, num_pages: '1', date_posted: 'all', country: 'us', language: 'en' },
      headers: { 'x-rapidapi-key': process.env.RAPIDAPI_KEY, 'x-rapidapi-host': 'jsearch.p.rapidapi.com', 'Content-Type': 'application/json' }
    };
    const response = await axios.request(options);
    const rawJobs = response.data.data?.jobs || response.data.jobs || response.data.data || [];
    const jobs = rawJobs.map(job => ({ id: job.job_id, title: job.job_title, company: job.employer_name, location: `${job.job_city || ''} ${job.job_country || ''}`.trim(), employment_type: job.job_employment_type || 'Full-time', posted_date: job.job_posted_at_datetime_utc, apply_url: job.job_apply_link, source: 'JSearch' }));
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/match-score', async (req, res) => {
  try {
    const { jobTitle, jobDescription, userSkills } = req.body;
    const skills = userSkills || [];

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a job matching expert.
Job Title: ${jobTitle}
Job Description: ${jobDescription || 'Not provided'}
Candidate Skills: ${skills.join(', ')}
Return ONLY valid JSON:
{"score":75,"matchedSkills":["Python","React"],"missingSkills":["Docker"],"interviewQuestions":["Tell me about yourself?","Why this role?","Describe a challenge you faced?","What are your strengths?","Where do you see yourself in 5 years?"],"verdict":"Strong match — apply now"}`
        }]
      });
      const text = message.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.json({ success: true, ...parsed });
    } catch (aiError) {
      console.log('AI unavailable, using smart fallback');
    }

    // Smart fallback without AI
    const jobWords = (jobTitle + ' ' + (jobDescription || '')).toLowerCase();
    const commonSkills = ['python','javascript','react','node','sql','java','aws','docker','kubernetes','machine learning','data science','tensorflow','pytorch','excel','power bi','tableau','c++','c#','php','ruby','go','rust','mongodb','postgresql','mysql','redis','git','linux','typescript','vue','angular','django','flask','spring'];

    const matchedSkills = skills.filter(skill =>
      jobWords.includes(skill.toLowerCase())
    );
    const missingSkills = commonSkills
      .filter(s => jobWords.includes(s) && !skills.map(x=>x.toLowerCase()).includes(s))
      .slice(0, 4);

    const score = Math.min(95, Math.max(20,
      Math.round((matchedSkills.length / Math.max(skills.length, 1)) * 100)
    ));

    const verdict = score >= 70 ? 'Strong match — apply now'
      : score >= 40 ? 'Moderate match — worth applying'
      : 'Partial match — consider upskilling';

    res.json({
      success: true,
      score,
      matchedSkills,
      missingSkills,
      interviewQuestions: [
        `Tell me about your experience relevant to ${jobTitle}?`,
        'Describe a challenging project you successfully completed.',
        'How do you keep your technical skills up to date?',
        'What is your biggest professional achievement?',
        'Where do you see yourself in 5 years?'
      ],
      verdict
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/cover-letter', async (req, res) => {
  try {
    const { jobTitle, company, userSkills, userName } = req.body;
    const skills = userSkills || [];
    const name = userName || 'Candidate';

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Write a professional 3-paragraph cover letter for ${name} applying for ${jobTitle} at ${company}. Their skills: ${skills.join(', ')}. Be specific and confident. No placeholders.`
        }]
      });
      return res.json({ success: true, coverLetter: message.content[0].text });
    } catch (aiError) {
      console.log('AI unavailable, using template fallback');
    }

    // Template fallback
    const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my expertise in ${skills.slice(0, 3).join(', ')}, I am confident that I can make a significant contribution to your team and help drive the company's goals forward.

Throughout my career, I have developed strong skills in ${skills.join(', ')}. I have consistently delivered high-quality results and thrive in collaborative environments. I am particularly drawn to ${company} because of its reputation for innovation and excellence in the industry.

I am excited about the opportunity to bring my unique blend of skills and experience to the ${jobTitle} role at ${company}. I would welcome the chance to discuss how my background aligns with your team's needs. Thank you for considering my application.

Sincerely,
${name}`;

    res.json({ success: true, coverLetter });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tailored-resume', async (req, res) => {
  try {
    const { jobTitle, company, userSkills, userName, matchedSkills, missingSkills } = req.body;
    const name = userName || 'Candidate';
    const skills = userSkills || [];

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Create a professional ATS-optimized resume for ${name} applying for ${jobTitle} at ${company}.
Their skills: ${skills.join(', ')}.
Matched skills for this job: ${(matchedSkills || []).join(', ')}.
Skills to highlight: ${(missingSkills || []).join(', ')}.
Format it as a clean text resume with sections: Summary, Skills, Experience (create 2 relevant examples), Education, Projects.
Make it specifically tailored for ${jobTitle} at ${company}. Be specific and professional.`
        }]
      });
      return res.json({ success: true, resume: message.content[0].text });
    } catch (aiError) {
      console.log('AI unavailable, using template');
    }

    // Template fallback
    const resume = `${name.toUpperCase()}
Email: your.email@gmail.com | LinkedIn: linkedin.com/in/${name.toLowerCase().replace(' ', '')} | GitHub: github.com/${name.toLowerCase().replace(' ', '')}

PROFESSIONAL SUMMARY
Results-driven professional with expertise in ${skills.slice(0, 4).join(', ')} seeking ${jobTitle} position at ${company}. Proven track record of delivering high-quality solutions and collaborating effectively in team environments.

TECHNICAL SKILLS
${skills.join(' • ')}

WORK EXPERIENCE
Software Developer | Previous Company | 2023 - Present
- Developed and maintained applications using ${skills[0] || 'relevant technologies'}
- Collaborated with cross-functional teams to deliver projects on time
- Improved system performance by 30% through optimization

Junior Developer | Startup | 2022 - 2023
- Built features using ${skills[1] || 'modern frameworks'}
- Participated in code reviews and agile development processes

EDUCATION
B.Tech / M.Tech in Computer Science or Related Field
University Name | Year of Graduation

PROJECTS
Project 1 — ${jobTitle} Related Project
- Built using ${skills.slice(0, 2).join(' and ')}
- Achieved measurable results

Project 2 — Full Stack Application
- Implemented ${skills.slice(2, 4).join(' and ')} for backend and frontend
- Deployed on cloud infrastructure

CERTIFICATIONS
- Relevant certification for ${jobTitle}`;

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-alert', async (req, res) => {
  try {
    const { to, keyword, jobs, userName } = req.body;
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const jobsHtml = jobs.slice(0, 5).map(job => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
        <h3 style="color:#0f172a;margin:0 0 4px;">${job.title}</h3>
        <p style="color:#2563eb;margin:0 0 8px;font-weight:600;">${job.company}</p>
        <p style="color:#64748b;margin:0 0 12px;">📍 ${job.location || 'Location not specified'}</p>
        <a href="${job.apply_url}" style="background:#2563eb;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600;">Apply Now →</a>
      </div>
    `).join('');

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject: `🔔 ${jobs.length} new "${keyword}" jobs found — TrueJobs`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#2563eb;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">TrueJobs</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;">Your daily job alert</p>
          </div>
          <div style="background:white;padding:24px;border:1px solid #e2e8f0;">
            <p style="color:#1e293b;font-size:16px;">Hi ${userName || 'there'},</p>
            <p style="color:#64748b;">We found <strong>${jobs.length} new jobs</strong> matching "<strong>${keyword}</strong>" for you:</p>
            ${jobsHtml}
            <div style="margin-top:24px;text-align:center;">
              <a href="https://truehire.online/jobs" style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">View All Jobs →</a>
            </div>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
            <p style="color:#94a3b8;font-size:13px;margin:0;">TrueJobs — Zero fake listings. Real opportunities.</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: 'Alert email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/smart-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'No query' });

    // Fetch jobs from multiple sources
    const [greenhouseRes, jsearchRes] = await Promise.allSettled([
      axios.get(`https://boards-api.greenhouse.io/v1/boards/airbnb/jobs`, { timeout: 8000 }),
      axios.request({
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search-v2',
        params: { query: query.split(' ').slice(0, 3).join(' '), num_pages: '1', date_posted: 'all' },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      })
    ]);

    let allJobs = [];

    if (greenhouseRes.status === 'fulfilled') {
      const jobs = (greenhouseRes.value.data.jobs || []).slice(0, 20).map(job => ({
        id: job.id,
        title: job.title,
        company: 'airbnb',
        location: job.location.name,
        apply_url: job.absolute_url,
        source: 'Greenhouse'
      }));
      allJobs = [...allJobs, ...jobs];
    }

    if (jsearchRes.status === 'fulfilled') {
      const rawJobs = jsearchRes.value.data.data?.jobs || jsearchRes.value.data.data || [];
      const jobs = rawJobs.slice(0, 20).map(job => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city || ''} ${job.job_country || ''}`.trim(),
        apply_url: job.job_apply_link,
        source: 'JSearch'
      }));
      allJobs = [...allJobs, ...jobs];
    }

    if (allJobs.length === 0) {
      return res.json({ success: true, query, aiSummary: 'No jobs found.', count: 0, jobs: [] });
    }

    // Use Claude to rank and filter jobs
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const jobsList = allJobs.map((job, i) =>
        `${i + 1}. ${job.title} at ${job.company} — ${job.location}`
      ).join('\n');

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `User is looking for: "${query}"

Here are available jobs:
${jobsList}

Return ONLY a JSON object:
{
  "summary": "2 sentence explanation of what you found",
  "rankedIndices": [3, 1, 7, 2, 5],
  "reason": "Brief reason why these match"
}

rankedIndices = array of job numbers (1-based) that best match the query, ordered by relevance. Include only relevant ones.`
        }]
      });

      const text = message.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const rankedJobs = (parsed.rankedIndices || [])
        .map(i => allJobs[i - 1])
        .filter(Boolean)
        .map(job => ({ ...job, similarity: null }));

      return res.json({
        success: true,
        query,
        aiSummary: parsed.summary,
        aiReason: parsed.reason,
        count: rankedJobs.length,
        jobs: rankedJobs,
      });

    } catch (aiError) {
      // Fallback without AI — simple keyword matching
      const queryWords = query.toLowerCase().split(' ');
      const filtered = allJobs.filter(job =>
        queryWords.some(word =>
          job.title?.toLowerCase().includes(word) ||
          job.company?.toLowerCase().includes(word) ||
          job.location?.toLowerCase().includes(word)
        )
      );

      return res.json({
        success: true,
        query,
        aiSummary: `Found ${filtered.length} jobs matching "${query}". AI ranking unavailable — add Anthropic credits for smarter results.`,
        count: filtered.length,
        jobs: filtered,
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create-resume', async (req, res) => {
  try {
    const { jobDescription, existingResume, userName, targetRole } = req.body;

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert resume writer and ATS optimization specialist.

Job Description:
${jobDescription}

Candidate's Existing Resume/Information:
${existingResume}

Candidate Name: ${userName || 'Candidate'}
Target Role: ${targetRole || 'Not specified'}

Create a perfect ATS-optimized professional resume for this candidate that:
1. Extracts and highlights skills that match the job description
2. Uses exact keywords from the job description naturally
3. Quantifies achievements wherever possible
4. Has a strong professional summary tailored to this specific role
5. Follows standard ATS-friendly format
6. Is honest — only uses information provided, no fabrication

Format the resume exactly like this:

[CANDIDATE NAME]
Email: [email if provided] | LinkedIn: [if provided] | GitHub: [if provided] | Phone: [if provided]

PROFESSIONAL SUMMARY
[3-4 sentences tailored specifically for this job]

TECHNICAL SKILLS
[Categorized skills that match job requirements]

WORK EXPERIENCE
[Each role with bullet points starting with action verbs, quantified where possible]

EDUCATION
[Education details]

PROJECTS
[Relevant projects with technologies used and impact]

CERTIFICATIONS
[If any]

Make it compelling, professional, and perfectly tailored for the job description provided.`
      }]
    });

    res.json({
      success: true,
      resume: message.content[0].text
    });

  } catch (error) {
    // Fallback template when AI unavailable
    const { jobDescription, existingResume, userName } = req.body;
    const name = userName || 'Your Name';

    const skills = [];
    const skillKeywords = ['python', 'javascript', 'react', 'node', 'sql', 'java',
      'aws', 'docker', 'machine learning', 'data science', 'tensorflow',
      'pytorch', 'typescript', 'vue', 'angular', 'django', 'flask'];

    skillKeywords.forEach(skill => {
      if (jobDescription?.toLowerCase().includes(skill) ||
          existingResume?.toLowerCase().includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    const resume = `${name.toUpperCase()}
your.email@gmail.com | linkedin.com/in/${name.toLowerCase().replace(/\s/g, '')} | github.com/${name.toLowerCase().replace(/\s/g, '')}

PROFESSIONAL SUMMARY
Results-driven professional with strong expertise in ${skills.slice(0, 3).join(', ')}. Proven track record of delivering high-quality solutions and collaborating effectively in fast-paced environments. Passionate about leveraging technology to solve complex problems.

TECHNICAL SKILLS
Languages & Frameworks: ${skills.slice(0, 6).join(', ')}
Tools & Technologies: Git, Linux, REST APIs, Agile/Scrum
Databases: SQL, NoSQL

WORK EXPERIENCE
Software Developer | Company Name | 2023 – Present
- Developed and maintained applications using ${skills[0] || 'relevant technologies'}
- Collaborated with cross-functional teams to deliver projects on schedule
- Improved system performance by 30% through code optimization
- Implemented best practices for code quality and documentation

EDUCATION
B.Tech / M.Tech in Computer Science
University Name | Year of Graduation | CGPA: X.X/10

PROJECTS
Project Name | ${skills.slice(0, 2).join(', ')}
- Built a full-stack application that solved [problem]
- Implemented [key features] resulting in [measurable outcome]
- Deployed on cloud infrastructure with CI/CD pipeline

CERTIFICATIONS
- Add your relevant certifications here

NOTE: Add Anthropic API credits for a fully personalized AI-generated resume.`;

    res.json({ success: true, resume, fallback: true });
  }
});

router.post('/create-resume-structured', async (req, res) => {
  try {
    const { jobDescription, existingResume, userName, targetRole } = req.body;
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are a world-class ATS resume expert and career coach. Your task is to create a perfectly tailored, ATS-optimized resume that scores 90+ on any ATS scanner.

CANDIDATE'S EXISTING RESUME/INFORMATION:
${existingResume}

TARGET JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Extract the candidate's REAL information only — never fabricate experience or skills they don't have
2. Tailor the professional summary specifically for this job role using exact keywords from the JD
3. Rewrite bullet points to highlight achievements relevant to this job, using strong action verbs
4. Add quantifiable metrics wherever the original resume has them
5. Include ALL keywords and skills from the JD that the candidate actually has
6. Organize skills to match what the JD prioritizes
7. Keep the format clean — no tables, no columns in experience section (ATS friendly)

Return ONLY a valid JSON object:
{
  "name": "Candidate's full name from resume",
  "contact": "email | LinkedIn: url | GitHub: url | Phone: number",
  "summary": "4 sentence ATS-optimized summary using exact keywords from JD, highlighting why this candidate is perfect for this specific role",
  "skills": [
    {"category": "Languages", "items": "list relevant ones"},
    {"category": "ML/AI Frameworks", "items": "list relevant ones"},
    {"category": "Tools & Platforms", "items": "list relevant ones"},
    {"category": "Databases", "items": "list relevant ones"},
    {"category": "Soft Skills", "items": "Problem-Solving, Team Player, Communication"}
  ],
  "experience": [
    {
      "role": "Exact job title",
      "company": "Company name",
      "date": "Month Year – Month Year",
      "bullets": [
        "Strong action verb + specific task + measurable outcome relevant to target job",
        "Another achievement with numbers/percentage where available"
      ]
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "tech": "Technologies used",
      "bullets": [
        "What the project does and how it relates to the target role",
        "Key metric or achievement (accuracy %, users, performance improvement)"
      ]
    }
  ],
  "education": [
    {
      "degree": "Full degree name",
      "school": "University name, Location",
      "grade": "CGPA: X.X/10 or Percentage",
      "year": "Start Year – End Year or Expected"
    }
  ],
  "certifications": ["Certification Name — Provider, Year"],
  "publications": ["Full paper/patent citation"],
  "achievements": ["Specific achievement with impact"]
}

CANDIDATE INFO:
${existingResume}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Full Name",
  "contact": "email@gmail.com | LinkedIn: linkedin.com/in/name | GitHub: github.com/name | Phone: +91-XXXXXXXXXX",
  "summary": "3-4 sentence professional summary tailored to this job using keywords from JD",
  "skills": [
    {"category": "Languages", "items": "Python, Java, C++"},
    {"category": "Frameworks", "items": "TensorFlow, PyTorch, React"},
    {"category": "Tools", "items": "Git, Docker, AWS"},
    {"category": "Databases", "items": "MySQL, MongoDB"}
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "date": "Jan 2023 – Jun 2023",
      "bullets": [
        "Action verb + what you did + measurable impact",
        "Another achievement with numbers where possible"
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "tech": "Python, TensorFlow, OpenCV",
      "bullets": [
        "What the project does and its impact",
        "Key achievement or accuracy metric"
      ]
    }
  ],
  "education": [
    {
      "degree": "M.Tech in Artificial Intelligence & Machine Learning",
      "school": "Lovely Professional University, Punjab",
      "grade": "CGPA: 7.7",
      "year": "2024 – Present"
    }
  ],
  "certifications": ["Certification name - Provider, Year"],
  "publications": ["Full citation of paper or patent"],
  "achievements": ["Key achievement 1", "Key achievement 2"]
}

Rules:
- Use exact keywords from the job description naturally
- Quantify achievements wherever possible
- Make summary specifically address the job requirements
- Only include information from the candidate's resume — no fabrication
- Order skills by relevance to job description`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const resumeData = JSON.parse(clean);

    res.json({ success: true, resumeData });

  } catch (error) {
    // Fallback structured resume
    const { existingResume, userName } = req.body;
    res.json({
      success: true,
      resumeData: {
        name: userName || 'Your Name',
        contact: 'email@gmail.com | LinkedIn: linkedin.com/in/yourname | GitHub: github.com/yourname | Phone: +91-XXXXXXXXXX',
        summary: 'Results-driven professional with strong technical background. Add Anthropic API credits for AI-personalized summary.',
        skills: [
          { category: 'Languages', items: 'Python, JavaScript, Java' },
          { category: 'Frameworks', items: 'TensorFlow, React, Node.js' },
          { category: 'Tools', items: 'Git, AWS, Docker' },
          { category: 'Databases', items: 'MySQL, MongoDB' }
        ],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
        publications: [],
        achievements: []
      }
    });
  }
});

router.post('/extract-resume-text', async (req, res) => {
  try {
    const multer = require('multer');
    res.json({ success: false, error: 'Use multipart upload' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/generate-interview-questions', async (req, res) => {
  try {
    const { company, role, category } = req.body;

    // Try AI first
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Generate 8 realistic interview questions for ${role} at ${company} focusing on ${category}. Return ONLY a JSON array: [{"question":"...","difficulty":"Easy/Medium/Hard","hint":"brief tip","tags":["tag1"]}]`
        }]
      });
      const text = message.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const questions = JSON.parse(clean);
      return res.json({ success: true, questions, source: 'AI' });
    } catch (aiErr) {
      console.log('AI unavailable, using question bank');
    }

    // Large pre-built question bank fallback
    const questionBank = {
      DSA: [
        { question: `How would you optimize a search algorithm for ${company}'s scale of data?`, difficulty: 'Hard', hint: 'Think about binary search, hash maps, and distributed systems', tags: ['algorithms', 'optimization'] },
        { question: 'Implement a function to detect a cycle in a linked list.', difficulty: 'Medium', hint: 'Use Floyd\'s cycle detection algorithm (slow and fast pointer)', tags: ['linked-list', 'two-pointers'] },
        { question: 'Find the longest common subsequence of two strings.', difficulty: 'Hard', hint: 'Use dynamic programming with a 2D table', tags: ['dp', 'strings'] },
        { question: 'Given a binary tree, check if it is balanced.', difficulty: 'Medium', hint: 'Calculate height recursively and check difference at each node', tags: ['trees', 'recursion'] },
        { question: 'Implement a min-heap and explain its time complexity.', difficulty: 'Medium', hint: 'Use an array-based implementation with heapify operations', tags: ['heap', 'data-structures'] },
        { question: 'Find all permutations of a given string.', difficulty: 'Medium', hint: 'Use backtracking to generate all combinations', tags: ['backtracking', 'strings'] },
        { question: 'Given a matrix, find the shortest path from top-left to bottom-right.', difficulty: 'Medium', hint: 'Use BFS for unweighted, Dijkstra for weighted paths', tags: ['graphs', 'bfs'] },
        { question: 'Merge K sorted linked lists into one sorted list.', difficulty: 'Hard', hint: 'Use a min-heap to efficiently merge', tags: ['linked-list', 'heap'] },
      ],
      'System Design': [
        { question: `Design ${company}'s notification system that handles millions of users.`, difficulty: 'Hard', hint: 'Think message queues, push/pull architecture, rate limiting', tags: ['system-design', 'scalability'] },
        { question: `How would you design a URL shortener like bit.ly for ${company}?`, difficulty: 'Medium', hint: 'Base62 encoding, database sharding, caching layer', tags: ['system-design', 'database'] },
        { question: 'Design a distributed cache system like Redis.', difficulty: 'Hard', hint: 'Think consistent hashing, eviction policies, replication', tags: ['system-design', 'caching'] },
        { question: 'How would you design a real-time chat system?', difficulty: 'Hard', hint: 'WebSockets, message queues, presence system', tags: ['system-design', 'real-time'] },
        { question: 'Design a news feed system like Twitter/LinkedIn.', difficulty: 'Hard', hint: 'Fan-out vs fan-in, ranking algorithms, pagination', tags: ['system-design', 'feeds'] },
        { question: 'How would you design a logging and monitoring system?', difficulty: 'Medium', hint: 'Think centralized logging, alerting, dashboards', tags: ['system-design', 'monitoring'] },
        { question: 'Design an authentication system with OAuth2.', difficulty: 'Medium', hint: 'JWT tokens, refresh tokens, secure storage', tags: ['system-design', 'security'] },
        { question: 'How would you design a recommendation engine?', difficulty: 'Hard', hint: 'Collaborative filtering, content-based, hybrid approaches', tags: ['system-design', 'ml'] },
      ],
      ML: [
        { question: `How would you build an ML model to improve ${company}'s core product?`, difficulty: 'Hard', hint: 'Define problem, data collection, feature engineering, model selection, evaluation', tags: ['ml', 'product'] },
        { question: 'Explain the bias-variance tradeoff and how to handle it.', difficulty: 'Medium', hint: 'High bias = underfitting, high variance = overfitting, use cross-validation', tags: ['ml', 'theory'] },
        { question: 'How do you prevent overfitting in deep learning models?', difficulty: 'Medium', hint: 'Dropout, L1/L2 regularization, early stopping, data augmentation', tags: ['deep-learning', 'regularization'] },
        { question: 'Explain how BERT works and when to use it.', difficulty: 'Hard', hint: 'Bidirectional transformer, pre-training tasks, fine-tuning', tags: ['nlp', 'transformers'] },
        { question: 'How would you handle missing data in a dataset?', difficulty: 'Easy', hint: 'Imputation strategies: mean/median/mode, KNN imputer, model-based', tags: ['data-preprocessing', 'ml'] },
        { question: 'What is the ROC curve and when is AUC useful?', difficulty: 'Medium', hint: 'TPR vs FPR at different thresholds, useful for imbalanced datasets', tags: ['ml', 'evaluation'] },
        { question: 'Explain the difference between Random Forest and Gradient Boosting.', difficulty: 'Medium', hint: 'Bagging vs boosting, parallel vs sequential, variance vs bias reduction', tags: ['ml', 'ensemble'] },
        { question: 'How do you evaluate a recommendation system?', difficulty: 'Hard', hint: 'Precision@K, Recall@K, NDCG, A/B testing, business metrics', tags: ['ml', 'recommendation'] },
      ],
      Behavioral: [
        { question: `Why do you want to work at ${company} specifically?`, difficulty: 'Easy', hint: 'Research the company\'s mission, products, culture. Be specific not generic', tags: ['behavioral', 'motivation'] },
        { question: 'Tell me about a time you failed and what you learned from it.', difficulty: 'Medium', hint: 'Use STAR method, show self-awareness and growth mindset', tags: ['behavioral', 'growth'] },
        { question: 'Describe a time you had to learn something quickly under pressure.', difficulty: 'Medium', hint: 'Show resourcefulness, structured approach to learning', tags: ['behavioral', 'learning'] },
        { question: 'Tell me about a project where you had to work with limited resources.', difficulty: 'Medium', hint: 'Prioritization, creativity, delivering value despite constraints', tags: ['behavioral', 'resourcefulness'] },
        { question: 'How do you handle situations where you disagree with your manager?', difficulty: 'Hard', hint: 'Show professional communication, data-driven arguments, knowing when to escalate', tags: ['behavioral', 'leadership'] },
        { question: 'Describe your most impactful technical contribution.', difficulty: 'Easy', hint: 'Quantify impact, explain technical decisions, team collaboration', tags: ['behavioral', 'impact'] },
        { question: 'How do you prioritize tasks when everything seems urgent?', difficulty: 'Medium', hint: 'Frameworks: Eisenhower matrix, MoSCoW, stakeholder communication', tags: ['behavioral', 'prioritization'] },
        { question: 'Tell me about a time you mentored or helped a colleague grow.', difficulty: 'Easy', hint: 'Show leadership, empathy, knowledge sharing', tags: ['behavioral', 'leadership'] },
      ],
      Technical: [
        { question: `What technologies would you use to build ${company}'s core infrastructure?`, difficulty: 'Hard', hint: 'Consider scalability, reliability, maintainability, team expertise', tags: ['technical', 'architecture'] },
        { question: 'Explain how HTTP/2 differs from HTTP/1.1.', difficulty: 'Medium', hint: 'Multiplexing, header compression, server push, binary protocol', tags: ['networking', 'web'] },
        { question: 'What is the difference between authentication and authorization?', difficulty: 'Easy', hint: 'Auth = who you are, Authz = what you can do. JWT, OAuth, RBAC', tags: ['security', 'concepts'] },
        { question: 'Explain microservices vs monolithic architecture.', difficulty: 'Medium', hint: 'Tradeoffs: scalability, complexity, deployment, team structure', tags: ['architecture', 'design'] },
        { question: 'How does garbage collection work in your primary language?', difficulty: 'Medium', hint: 'Mark-and-sweep, generational GC, reference counting, memory management', tags: ['programming', 'memory'] },
        { question: 'What is database indexing and when should you use it?', difficulty: 'Medium', hint: 'B-tree indexes, query optimization, tradeoffs with write performance', tags: ['database', 'optimization'] },
        { question: 'Explain the CAP theorem in distributed systems.', difficulty: 'Hard', hint: 'Consistency, Availability, Partition Tolerance — can only guarantee 2', tags: ['distributed-systems', 'theory'] },
        { question: 'What are SOLID principles and why do they matter?', difficulty: 'Medium', hint: 'Single responsibility, Open-closed, Liskov, Interface segregation, Dependency inversion', tags: ['design-patterns', 'oops'] },
      ],
      SQL: [
        { question: 'Write a query to find employees who earn more than their manager.', difficulty: 'Medium', hint: 'Self join on employees table, compare salary columns', tags: ['sql', 'joins'] },
        { question: 'Explain the difference between INNER JOIN and LEFT JOIN with examples.', difficulty: 'Easy', hint: 'INNER returns matching rows only, LEFT returns all from left table', tags: ['sql', 'joins'] },
        { question: 'How would you find duplicate records in a table?', difficulty: 'Easy', hint: 'GROUP BY with HAVING COUNT(*) > 1', tags: ['sql', 'aggregation'] },
        { question: 'Write a query to calculate running totals using window functions.', difficulty: 'Hard', hint: 'SUM() OVER (ORDER BY date) with ROWS BETWEEN clause', tags: ['sql', 'window-functions'] },
        { question: 'What is query optimization and how do you improve slow queries?', difficulty: 'Medium', hint: 'EXPLAIN plan, indexes, avoid SELECT *, proper JOINs', tags: ['sql', 'optimization'] },
        { question: 'Write a recursive CTE to traverse a hierarchical data structure.', difficulty: 'Hard', hint: 'WITH RECURSIVE, anchor member + recursive member', tags: ['sql', 'cte'] },
        { question: 'Find the top 3 products by sales in each category.', difficulty: 'Medium', hint: 'ROW_NUMBER() or RANK() window function with PARTITION BY', tags: ['sql', 'window-functions'] },
        { question: 'Explain ACID properties with real-world examples.', difficulty: 'Medium', hint: 'Atomicity, Consistency, Isolation, Durability — bank transfer example', tags: ['database', 'theory'] },
      ],
      HR: [
        { question: 'Tell me about yourself and your journey to becoming a developer.', difficulty: 'Easy', hint: 'Keep it professional, highlight relevant skills, show passion', tags: ['hr', 'introduction'] },
        { question: 'What are your salary expectations for this role?', difficulty: 'Medium', hint: 'Research market rates, give a range, show flexibility', tags: ['hr', 'negotiation'] },
        { question: `What do you know about ${company} and our products?`, difficulty: 'Easy', hint: 'Research thoroughly — products, culture, recent news, mission', tags: ['hr', 'research'] },
        { question: 'Where do you see yourself in 5 years?', difficulty: 'Easy', hint: 'Align with company growth, show ambition but be realistic', tags: ['hr', 'career'] },
        { question: 'Why are you leaving your current job?', difficulty: 'Medium', hint: 'Stay positive, focus on growth opportunities not complaints', tags: ['hr', 'motivation'] },
        { question: 'What is your greatest strength and how does it help in this role?', difficulty: 'Easy', hint: 'Choose something genuinely relevant with a specific example', tags: ['hr', 'strengths'] },
        { question: 'Describe your ideal work environment.', difficulty: 'Easy', hint: 'Research company culture, align your answer authentically', tags: ['hr', 'culture'] },
        { question: 'Do you have any questions for us?', difficulty: 'Easy', hint: 'Always ask 2-3 thoughtful questions about role, team, growth', tags: ['hr', 'engagement'] },
      ],
    };

    const selectedCategory = questionBank[category] || questionBank['DSA'];
    const questions = selectedCategory.map(q => ({
      ...q,
      question: q.question.replace(/\$\{company\}/g, company).replace(/\$\{role\}/g, role),
    }));

    res.json({ success: true, questions, source: 'question-bank' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;