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

module.exports = router;