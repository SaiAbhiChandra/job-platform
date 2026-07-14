const express = require('express');
const cors = require('cors');
require('dotenv').config();

const jobRoutes = require('./routes/jobs');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Job Platform API is running!' });
});

// Job routes
app.use('/api/jobs', jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});