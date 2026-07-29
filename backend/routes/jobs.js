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

module.exports = router;