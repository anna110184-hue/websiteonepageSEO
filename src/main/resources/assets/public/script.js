// SEO Analyzer Frontend JavaScript
class SEOAnalyzer {
    constructor() {
        this.form = document.getElementById('seo-form');
        this.urlInput = document.getElementById('url-input');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadingSection = document.getElementById('loading-section');
        this.resultsSection = document.getElementById('results-section');
        this.errorSection = document.getElementById('error-section');
        
        this.currentStep = 1;
        this.totalSteps = 4;
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeWebsite();
        });

        // Auto-resize URL input on mobile
        this.urlInput.addEventListener('input', this.validateUrl.bind(this));
    }

    validateUrl() {
        const url = this.urlInput.value.trim();
        const isValid = this.isValidUrl(url);
        
        if (url && !isValid) {
            this.urlInput.style.borderColor = '#ef4444';
        } else {
            this.urlInput.style.borderColor = '';
        }
        
        return isValid;
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    async analyzeWebsite() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a website URL');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid HTTP or HTTPS URL');
            return;
        }

        try {
            this.showLoading();
            
            const response = await fetch('/api/seo/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.displayResults(data);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Failed to analyze website. Please try again.');
        }
    }

    showLoading() {
        // Hide other sections
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        
        // Show loading section
        this.loadingSection.style.display = 'block';
        
        // Update button state
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.querySelector('.btn-text').style.display = 'none';
        this.analyzeBtn.querySelector('.btn-loading').style.display = 'flex';
        
        // Start loading animation
        this.animateLoadingSteps();
    }

    animateLoadingSteps() {
        this.currentStep = 1;
        
        const interval = setInterval(() => {
            // Mark current step as completed
            const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
            if (currentStepEl) {
                currentStepEl.classList.remove('active');
                currentStepEl.classList.add('completed');
            }
            
            this.currentStep++;
            
            // Mark next step as active
            const nextStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
            if (nextStepEl) {
                nextStepEl.classList.add('active');
            }
            
            // Stop when all steps are done
            if (this.currentStep > this.totalSteps) {
                clearInterval(interval);
            }
        }, 800);
    }

    hideLoading() {
        this.loadingSection.style.display = 'none';
        
        // Reset button state
        this.analyzeBtn.disabled = false;
        this.analyzeBtn.querySelector('.btn-text').style.display = 'inline';
        this.analyzeBtn.querySelector('.btn-loading').style.display = 'none';
        
        // Reset loading steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        document.querySelector('[data-step="1"]').classList.add('active');
    }

    displayResults(data) {
        this.hideLoading();
        
        // Hide error section
        this.errorSection.style.display = 'none';
        
        // Populate results
        this.populateScoreCard(data.aiPoweredSuggestions);
        this.populateAnalytics(data.structuredAnalytics);
        this.populateSuggestions(data.aiPoweredSuggestions.prioritizedSuggestions);
        this.populateBlogIdeas(data.aiPoweredSuggestions.blogPostIdeas);
        
        // Show results section
        this.resultsSection.style.display = 'block';
        
        // Smooth scroll to results
        this.resultsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    populateScoreCard(aiSuggestions) {
        const scoreElement = document.getElementById('seo-score');
        const explanationElement = document.getElementById('score-explanation');
        
        const score = aiSuggestions.seoScore || 0;
        scoreElement.textContent = score;
        explanationElement.textContent = aiSuggestions.scoreExplanation || 'Analysis completed';
        
        // Animate score
        this.animateScore(scoreElement, score);
        
        // Update score color based on value
        if (score >= 80) {
            scoreElement.style.color = '#10b981';
        } else if (score >= 60) {
            scoreElement.style.color = '#f59e0b';
        } else {
            scoreElement.style.color = '#ef4444';
        }
    }

    animateScore(element, targetScore) {
        let currentScore = 0;
        const increment = targetScore / 50; // Animate over ~1 second
        
        const animation = setInterval(() => {
            currentScore += increment;
            element.textContent = Math.round(currentScore);
            
            if (currentScore >= targetScore) {
                element.textContent = targetScore;
                clearInterval(animation);
            }
        }, 20);
    }

    populateAnalytics(analytics) {
        // Title analysis
        document.getElementById('title-content').textContent = analytics.title.content || 'No title found';
        document.getElementById('title-length').textContent = `${analytics.title.length} characters`;
        this.setStatus('title-status', this.getTitleStatus(analytics.title));
        
        // Meta description
        document.getElementById('meta-content').textContent = analytics.metaDescription.content || 'No meta description found';
        document.getElementById('meta-length').textContent = `${analytics.metaDescription.length} characters`;
        this.setStatus('meta-status', this.getMetaStatus(analytics.metaDescription));
        
        // Content analysis
        document.getElementById('word-count').textContent = `${analytics.wordCount.total} words`;
        document.getElementById('h1-count').textContent = analytics.headingStructure.counts.h1;
        this.setStatus('content-status', this.getContentStatus(analytics.wordCount, analytics.headingStructure));
        
        // Image analysis
        document.getElementById('total-images').textContent = analytics.imageAnalysis.totalImages;
        document.getElementById('missing-alt').textContent = analytics.imageAnalysis.imagesWithoutAlt;
        this.setStatus('images-status', this.getImageStatus(analytics.imageAnalysis));
    }

    getTitleStatus(title) {
        if (title.isEmpty) return { type: 'error', text: 'Missing title tag' };
        if (title.isTooLong) return { type: 'warning', text: 'Title too long (>60 chars)' };
        if (title.isTooShort) return { type: 'warning', text: 'Title too short (<30 chars)' };
        return { type: 'good', text: 'Title length is optimal' };
    }

    getMetaStatus(meta) {
        if (meta.isEmpty) return { type: 'error', text: 'Missing meta description' };
        if (meta.isTooLong) return { type: 'warning', text: 'Meta description too long' };
        if (meta.isTooShort) return { type: 'warning', text: 'Meta description too short' };
        return { type: 'good', text: 'Meta description is optimal' };
    }

    getContentStatus(wordCount, headings) {
        if (headings.hasNoH1) return { type: 'error', text: 'Missing H1 heading' };
        if (headings.hasMultipleH1) return { type: 'warning', text: 'Multiple H1 headings found' };
        if (wordCount.isLowContent) return { type: 'warning', text: 'Low content word count' };
        return { type: 'good', text: 'Good content structure' };
    }

    getImageStatus(images) {
        if (images.totalImages === 0) return { type: 'good', text: 'No images to optimize' };
        if (images.altTextCompliance < 50) return { type: 'error', text: 'Poor alt text compliance' };
        if (images.altTextCompliance < 80) return { type: 'warning', text: 'Some images missing alt text' };
        return { type: 'good', text: 'Good image optimization' };
    }

    setStatus(elementId, status) {
        const element = document.getElementById(elementId);
        element.textContent = status.text;
        element.className = `status-indicator status-${status.type}`;
    }

    populateSuggestions(suggestions) {
        const container = document.getElementById('suggestions-list');
        container.innerHTML = '';
        
        if (!suggestions || suggestions.length === 0) {
            container.innerHTML = '<p style="color: #cccccc; text-align: center;">No specific suggestions available.</p>';
            return;
        }
        
        suggestions.forEach(suggestion => {
            const suggestionEl = document.createElement('div');
            suggestionEl.className = 'suggestion-item';
            
            suggestionEl.innerHTML = `
                <div class="suggestion-header">
                    <div class="suggestion-issue">${this.escapeHtml(suggestion.issue)}</div>
                    <div class="priority-badge priority-${suggestion.priority.toLowerCase()}">
                        ${suggestion.priority}
                    </div>
                </div>
                <div class="suggestion-text">${this.escapeHtml(suggestion.suggestion)}</div>
                <div class="suggestion-impact">💡 Impact: ${this.escapeHtml(suggestion.impact)}</div>
            `;
            
            container.appendChild(suggestionEl);
        });
    }

    populateBlogIdeas(blogIdeas) {
        const container = document.getElementById('blog-ideas-grid');
        container.innerHTML = '';
        
        if (!blogIdeas || blogIdeas.length === 0) {
            container.innerHTML = '<p style="color: #cccccc; text-align: center; grid-column: 1 / -1;">No blog post ideas available.</p>';
            return;
        }
        
        blogIdeas.forEach(idea => {
            const ideaEl = document.createElement('div');
            ideaEl.className = 'blog-idea-card';
            
            const keywordTags = idea.keywords ? 
                idea.keywords.map(keyword => 
                    `<span class="keyword-tag">${this.escapeHtml(keyword)}</span>`
                ).join('') : '';
            
            ideaEl.innerHTML = `
                <h3 class="blog-idea-title">${this.escapeHtml(idea.title)}</h3>
                <p class="blog-idea-description">${this.escapeHtml(idea.description)}</p>
                <div class="blog-keywords">${keywordTags}</div>
            `;
            
            container.appendChild(ideaEl);
        });
    }

    showError(message) {
        this.hideLoading();
        
        // Hide results section
        this.resultsSection.style.display = 'none';
        
        // Show error
        document.getElementById('error-message').textContent = message;
        this.errorSection.style.display = 'block';
        
        // Smooth scroll to error
        this.errorSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Clear results function (global for retry button)
function clearResults() {
    document.getElementById('error-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('url-input').focus();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SEOAnalyzer();
    console.log('🚀 SEO Analyzer frontend initialized');
});