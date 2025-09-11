const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const seoAnalysisRoutes = require('./routes/seoAnalysis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../resources/assets/public')));

// API Routes
app.use('/api/seo', seoAnalysisRoutes);

// Serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../resources/assets/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 SEO Analyzer server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});