const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.initialize();
    }

    initialize() {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
                return;
            }

            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            console.log('✅ Gemini AI service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI:', error.message);
        }
    }

    async generateSuggestions(analytics, url) {
        try {
            if (!this.model) {
                throw new Error('Gemini API not properly initialized. Check your API key.');
            }

            console.log('🤖 Generating AI-powered SEO suggestions...');

            const prompt = this.buildPrompt(analytics, url);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse the structured response
            const suggestions = this.parseGeminiResponse(text);
            
            console.log('✅ AI suggestions generated successfully');
            return suggestions;

        } catch (error) {
            console.error('❌ Gemini API Error:', error.message);
            
            // Return fallback suggestions if AI fails
            return this.getFallbackSuggestions(analytics);
        }
    }

    buildPrompt(analytics, url) {
        return `You are an expert SEO consultant analyzing a webpage. Based on the following analytics data, provide specific, actionable SEO recommendations.

WEBPAGE URL: ${url}

ANALYTICS DATA:
- Title: "${analytics.title.content}" (${analytics.title.length} characters)
- Meta Description: "${analytics.metaDescription.content}" (${analytics.metaDescription.length} characters)
- Word Count: ${analytics.wordCount.total} words
- H1 Count: ${analytics.headingStructure.counts.h1}
- H1 Text: "${analytics.headingStructure.h1Text}"
- Images Total: ${analytics.imageAnalysis.totalImages}
- Images Missing Alt Text: ${analytics.imageAnalysis.imagesWithoutAlt}
- Alt Text Compliance: ${analytics.imageAnalysis.altTextCompliance.toFixed(1)}%
- Has Viewport Meta: ${analytics.technicalSEO.hasViewportMeta}
- Has Canonical Link: ${analytics.technicalSEO.hasCanonicalLink}
- Has Open Graph: ${analytics.technicalSEO.hasOpenGraph}
- Total Links: ${analytics.linkAnalysis.totalLinks}
- Internal Links: ${analytics.linkAnalysis.internalLinks}
- External Links: ${analytics.linkAnalysis.externalLinks}

RESPONSE FORMAT (JSON):
{
  "seoScore": [number between 0-100],
  "scoreExplanation": "[brief explanation of the score]",
  "prioritizedSuggestions": [
    {
      "priority": "High|Medium|Low",
      "issue": "[specific issue found]",
      "suggestion": "[actionable recommendation]",
      "impact": "[expected SEO impact]"
    }
  ],
  "blogPostIdeas": [
    {
      "title": "[creative blog post title]",
      "description": "[brief description of the post content]",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    },
    {
      "title": "[second creative blog post title]",
      "description": "[brief description of the post content]",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Provide 3-5 prioritized suggestions focusing on the most impactful improvements. Blog post ideas should be based on the page's apparent topic and target audience. Ensure all suggestions are specific and actionable.`;
    }

    parseGeminiResponse(text) {
        try {
            // Extract JSON from the response (remove any markdown formatting)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // If JSON parsing fails, create a structured response from the text
            return this.createStructuredResponse(text);
            
        } catch (error) {
            console.error('❌ Failed to parse Gemini response:', error.message);
            console.log('Raw response:', text);
            
            // Return a basic structured response
            return {
                seoScore: 70,
                scoreExplanation: "Analysis completed with AI assistance",
                prioritizedSuggestions: [
                    {
                        priority: "Medium",
                        issue: "SEO analysis completed",
                        suggestion: "Review the detailed analytics above for specific improvements",
                        impact: "Varies based on implementation"
                    }
                ],
                blogPostIdeas: [
                    {
                        title: "SEO Best Practices Guide",
                        description: "Comprehensive guide to improving your website's search engine optimization",
                        keywords: ["SEO", "optimization", "search engine"]
                    },
                    {
                        title: "Technical SEO Checklist",
                        description: "Essential technical elements every website should implement",
                        keywords: ["technical SEO", "website optimization", "meta tags"]
                    }
                ]
            };
        }
    }

    createStructuredResponse(text) {
        // Basic parsing for non-JSON responses
        const lines = text.split('\n');
        const suggestions = [];
        
        // Extract suggestions from text
        lines.forEach(line => {
            if (line.includes('suggestion') || line.includes('improve') || line.includes('optimize')) {
                suggestions.push({
                    priority: "Medium",
                    issue: "General SEO improvement",
                    suggestion: line.trim(),
                    impact: "Moderate improvement in search rankings"
                });
            }
        });

        return {
            seoScore: 75,
            scoreExplanation: "Based on technical analysis and AI recommendations",
            prioritizedSuggestions: suggestions.slice(0, 5),
            blogPostIdeas: [
                {
                    title: "Improving Your Website's SEO Performance",
                    description: "Learn how to optimize your website for better search engine visibility",
                    keywords: ["SEO", "website optimization", "search rankings"]
                },
                {
                    title: "Content Marketing Strategies That Work",
                    description: "Effective approaches to create content that ranks well in search engines",
                    keywords: ["content marketing", "SEO content", "organic traffic"]
                }
            ]
        };
    }

    getFallbackSuggestions(analytics) {
        const suggestions = [];
        let score = 85; // Start with a good base score

        // Title analysis
        if (analytics.title.isEmpty) {
            suggestions.push({
                priority: "High",
                issue: "Missing page title",
                suggestion: "Add a descriptive title tag (30-60 characters) that includes your target keywords",
                impact: "Significant improvement in search rankings and click-through rates"
            });
            score -= 15;
        } else if (analytics.title.isTooLong) {
            suggestions.push({
                priority: "Medium",
                issue: "Title tag too long",
                suggestion: "Shorten your title tag to under 60 characters to prevent truncation in search results",
                impact: "Better visibility and click-through rates in search results"
            });
            score -= 5;
        } else if (analytics.title.isTooShort) {
            suggestions.push({
                priority: "Medium",
                issue: "Title tag too short",
                suggestion: "Expand your title tag to 30-60 characters to include more relevant keywords",
                impact: "Better keyword targeting and search visibility"
            });
            score -= 3;
        }

        // Meta description analysis
        if (analytics.metaDescription.isEmpty) {
            suggestions.push({
                priority: "High",
                issue: "Missing meta description",
                suggestion: "Add a compelling meta description (120-160 characters) that summarizes your page content",
                impact: "Improved click-through rates from search results"
            });
            score -= 10;
        } else if (analytics.metaDescription.isTooLong) {
            suggestions.push({
                priority: "Medium",
                issue: "Meta description too long",
                suggestion: "Shorten your meta description to under 160 characters to prevent truncation",
                impact: "Better presentation in search results"
            });
            score -= 3;
        }

        // Heading structure
        if (analytics.headingStructure.hasNoH1) {
            suggestions.push({
                priority: "High",
                issue: "Missing H1 heading",
                suggestion: "Add a single H1 heading that clearly describes the page topic and includes target keywords",
                impact: "Better content structure and keyword signal to search engines"
            });
            score -= 12;
        } else if (analytics.headingStructure.hasMultipleH1) {
            suggestions.push({
                priority: "Medium",
                issue: "Multiple H1 headings found",
                suggestion: "Use only one H1 heading per page and use H2-H6 for subheadings",
                impact: "Clearer content hierarchy for search engines"
            });
            score -= 5;
        }

        // Image optimization
        if (analytics.imageAnalysis.altTextCompliance < 80) {
            suggestions.push({
                priority: "Medium",
                issue: `${analytics.imageAnalysis.imagesWithoutAlt} images missing alt text`,
                suggestion: "Add descriptive alt text to all images for better accessibility and SEO",
                impact: "Improved accessibility and image search rankings"
            });
            score -= 8;
        }

        // Content length
        if (analytics.wordCount.isLowContent) {
            suggestions.push({
                priority: "High",
                issue: "Low content word count",
                suggestion: "Expand your content to at least 300 words with valuable, relevant information",
                impact: "Better content depth signals and user engagement"
            });
            score -= 15;
        }

        // Technical SEO
        if (!analytics.technicalSEO.hasViewportMeta) {
            suggestions.push({
                priority: "High",
                issue: "Missing viewport meta tag",
                suggestion: "Add viewport meta tag for mobile responsiveness: <meta name='viewport' content='width=device-width, initial-scale=1'>",
                impact: "Better mobile user experience and search rankings"
            });
            score -= 10;
        }

        // Ensure score doesn't go below 0
        score = Math.max(0, score);

        return {
            seoScore: score,
            scoreExplanation: `Score based on ${suggestions.length} issues found. Address high-priority items first for maximum impact.`,
            prioritizedSuggestions: suggestions.slice(0, 5),
            blogPostIdeas: [
                {
                    title: "Complete SEO Optimization Guide for Better Rankings",
                    description: "Step-by-step guide to optimize your website for search engines and improve organic traffic",
                    keywords: ["SEO optimization", "search rankings", "organic traffic", "website optimization"]
                },
                {
                    title: "Technical SEO Checklist: Essential Elements for Success",
                    description: "Master the technical aspects of SEO with this comprehensive checklist",
                    keywords: ["technical SEO", "SEO checklist", "website performance", "search optimization"]
                }
            ]
        };
    }
}

module.exports = new GeminiService();