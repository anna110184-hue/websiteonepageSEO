const axios = require('axios');
const cheerio = require('cheerio');

class SEOAnalysisService {
    constructor() {
        this.timeout = 10000; // 10 seconds timeout
        this.userAgent = 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)';
    }

    async extractAnalytics(url) {
        try {
            console.log(`🔍 Fetching webpage: ${url}`);
            
            // Fetch webpage HTML
            const response = await axios.get(url, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive'
                },
                maxRedirects: 5
            });

            const html = response.data;
            const $ = cheerio.load(html);

            console.log(`📊 Analyzing HTML content...`);

            // Extract analytics data
            const analytics = {
                // Basic page information
                url: url,
                title: this.extractTitle($),
                metaDescription: this.extractMetaDescription($),
                
                // Content analysis
                wordCount: this.calculateWordCount($),
                headingStructure: this.analyzeHeadingStructure($),
                
                // Image analysis
                imageAnalysis: this.analyzeImages($),
                
                // Technical SEO
                technicalSEO: this.analyzeTechnicalSEO($),
                
                // Page structure
                pageStructure: this.analyzePageStructure($),
                
                // Additional metrics
                linkAnalysis: this.analyzeLinks($)
            };

            console.log(`✅ Analytics extraction completed`);
            return analytics;

        } catch (error) {
            console.error('❌ Error extracting analytics:', error.message);
            throw new Error(`Failed to analyze webpage: ${error.message}`);
        }
    }

    extractTitle($) {
        const title = $('title').text().trim();
        return {
            content: title,
            length: title.length,
            isEmpty: !title,
            isTooLong: title.length > 60,
            isTooShort: title.length < 30
        };
    }

    extractMetaDescription($) {
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        return {
            content: metaDesc.trim(),
            length: metaDesc.length,
            isEmpty: !metaDesc.trim(),
            isTooLong: metaDesc.length > 160,
            isTooShort: metaDesc.length < 120
        };
    }

    calculateWordCount($) {
        // Remove script, style, and other non-content elements
        $('script, style, nav, header, footer, aside').remove();
        
        const textContent = $('body').text();
        const words = textContent
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(word => word.length > 0);
        
        return {
            total: words.length,
            isLowContent: words.length < 300,
            isGoodContent: words.length >= 300 && words.length <= 2000,
            isLongContent: words.length > 2000
        };
    }

    analyzeHeadingStructure($) {
        const headings = {
            h1: $('h1').length,
            h2: $('h2').length,
            h3: $('h3').length,
            h4: $('h4').length,
            h5: $('h5').length,
            h6: $('h6').length
        };

        const h1Text = $('h1').first().text().trim();
        
        return {
            counts: headings,
            h1Text: h1Text,
            hasMultipleH1: headings.h1 > 1,
            hasNoH1: headings.h1 === 0,
            hasGoodStructure: headings.h1 === 1 && headings.h2 > 0
        };
    }

    analyzeImages($) {
        const images = $('img');
        const totalImages = images.length;
        let imagesWithoutAlt = 0;
        let imagesWithEmptyAlt = 0;
        let imagesWithGoodAlt = 0;

        images.each((index, img) => {
            const alt = $(img).attr('alt');
            if (!alt) {
                imagesWithoutAlt++;
            } else if (alt.trim() === '') {
                imagesWithEmptyAlt++;
            } else if (alt.trim().length > 5) {
                imagesWithGoodAlt++;
            }
        });

        return {
            totalImages,
            imagesWithoutAlt,
            imagesWithEmptyAlt,
            imagesWithGoodAlt,
            altTextCompliance: totalImages > 0 ? (imagesWithGoodAlt / totalImages) * 100 : 100
        };
    }

    analyzeTechnicalSEO($) {
        return {
            hasViewportMeta: $('meta[name="viewport"]').length > 0,
            hasCharsetMeta: $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0,
            hasCanonicalLink: $('link[rel="canonical"]').length > 0,
            hasRobotsMeta: $('meta[name="robots"]').length > 0,
            hasStructuredData: $('script[type="application/ld+json"]').length > 0,
            hasOpenGraph: $('meta[property^="og:"]').length > 0,
            hasTwitterCard: $('meta[name^="twitter:"]').length > 0
        };
    }

    analyzePageStructure($) {
        return {
            hasHeader: $('header').length > 0,
            hasMain: $('main').length > 0,
            hasFooter: $('footer').length > 0,
            hasNav: $('nav').length > 0,
            usesSemanticHTML: $('article, section, aside, header, footer, nav, main').length > 0
        };
    }

    analyzeLinks($) {
        const internalLinks = $('a[href^="/"], a[href*="' + 'localhost' + '"]').length;
        const externalLinks = $('a[href^="http"]').not('[href*="localhost"]').length;
        const totalLinks = $('a[href]').length;

        return {
            totalLinks,
            internalLinks,
            externalLinks,
            noFollowLinks: $('a[rel*="nofollow"]').length,
            hasGoodLinkStructure: totalLinks > 0 && internalLinks > externalLinks * 0.8
        };
    }
}

module.exports = new SEOAnalysisService();