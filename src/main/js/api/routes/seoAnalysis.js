const express = require('express');
const router = express.Router();
const seoAnalysisService = require('../../services/seoAnalysisService');
const geminiService = require('../../services/geminiService');

// POST /api/seo/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                message: 'Please provide a valid URL to analyze'
            });
        }

        // Validate URL format
        if (!isValidUrl(url)) {
            return res.status(400).json({
                error: 'Invalid URL format',
                message: 'Please provide a valid HTTP/HTTPS URL'
            });
        }

        console.log(`🔍 Starting SEO analysis for: ${url}`);

        // Step 1: Extract structured analytics from the webpage
        const analytics = await seoAnalysisService.extractAnalytics(url);
        
        // Step 2: Get AI-powered suggestions from Gemini
        const aiSuggestions = await geminiService.generateSuggestions(analytics, url);

        // Step 3: Combine results
        const response = {
            url,
            timestamp: new Date().toISOString(),
            structuredAnalytics: analytics,
            aiPoweredSuggestions: aiSuggestions
        };

        console.log(`✅ SEO analysis completed for: ${url}`);
        res.json(response);

    } catch (error) {
        console.error('❌ SEO Analysis Error:', error);
        
        // Handle specific error types
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            return res.status(400).json({
                error: 'Unable to reach website',
                message: 'The website could not be accessed. Please check the URL and try again.'
            });
        }

        if (error.message.includes('timeout')) {
            return res.status(408).json({
                error: 'Request timeout',
                message: 'The website took too long to respond. Please try again.'
            });
        }

        if (error.message.includes('Gemini API')) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'AI suggestions are temporarily unavailable. Showing analytics only.'
            });
        }

        res.status(500).json({
            error: 'Analysis failed',
            message: 'An error occurred during SEO analysis. Please try again.'
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'SEO Analysis API',
        timestamp: new Date().toISOString()
    });
});

// Helper function to validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

module.exports = router;