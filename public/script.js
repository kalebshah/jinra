class NewsFeed {
    constructor() {
        this.articles = [];
        this.currentIndex = 0;
        this.isLoading = false;
        this.apiBase = window.location.origin;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.isRailway = window.location.hostname.includes('railway.app');
        
        // Search properties
        this.isSearchMode = false;
        this.currentSearchQuery = '';
        
        this.initializeElements();
        this.bindEvents();
        this.checkServerHealth();
    }

    initializeElements() {
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
        this.newsContainerEl = document.getElementById('news-container');
        this.articleCardEl = document.getElementById('article-card');
        
        // Article content elements
        this.articleImageEl = document.getElementById('article-image');
        this.articleSourceEl = document.getElementById('article-source');
        this.articleTimeEl = document.getElementById('article-time');
        this.articleTitleEl = document.getElementById('article-title');
        this.articleSummaryEl = document.getElementById('article-summary');
        this.articleLinkEl = document.getElementById('article-link');
        
        // Counter elements
        this.currentArticleEl = document.getElementById('current-article');
        this.totalArticlesEl = document.getElementById('total-articles');
        
        // Control elements
        this.refreshBtnEl = document.getElementById('refresh-btn');
        this.retryBtnEl = document.getElementById('retry-btn');
        this.progressBarEl = document.getElementById('progress-bar');
        
        // Search elements
        this.searchInputEl = document.getElementById('search-input');
        this.searchBtnEl = document.getElementById('search-btn');
        this.clearSearchBtnEl = document.getElementById('clear-search-btn');
    }

    bindEvents() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Don't handle keyboard shortcuts if user is typing in search input
            if (document.activeElement === this.searchInputEl) {
                return;
            }
            
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextArticle();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousArticle();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.refreshArticles();
            }
        });

        // Button events
        this.refreshBtnEl.addEventListener('click', () => this.refreshArticles());
        this.retryBtnEl.addEventListener('click', () => this.loadArticles());
        
        // Search events
        this.searchBtnEl.addEventListener('click', () => this.performSearch());
        this.clearSearchBtnEl.addEventListener('click', () => this.clearSearch());
        this.searchInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        this.searchInputEl.addEventListener('input', () => {
            if (this.searchInputEl.value.trim()) {
                this.clearSearchBtnEl.style.display = 'flex';
            } else {
                this.clearSearchBtnEl.style.display = 'none';
            }
        });

        // Scroll support for mouse wheel
        this.articleCardEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                // Scroll down - next article
                this.nextArticle();
            } else if (e.deltaY < 0) {
                // Scroll up - previous article
                this.previousArticle();
            }
        });

        // Touch/swipe support for mobile
        let startY = 0;
        let startX = 0;
        
        this.articleCardEl.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });

        this.articleCardEl.addEventListener('touchend', (e) => {
            if (!startY || !startX) return;
            
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = startX - endX;
            
            // Swipe up or left for next article
            if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
                this.nextArticle();
            } else if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
                this.nextArticle();
            }
            // Swipe down or right for previous article
            else if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
                this.previousArticle();
            } else if (Math.abs(diffX) > Math.abs(diffY) && diffX < -50) {
                this.previousArticle();
            }
            
            startY = 0;
            startX = 0;
        });
    }

    async checkServerHealth() {
        try {
            console.log('Checking server health...');
            const response = await fetch(`${this.apiBase}/health`);
            if (response.ok) {
                console.log('Server is healthy, loading articles...');
                this.loadArticles();
            } else {
                throw new Error('Server health check failed');
            }
        } catch (error) {
            console.error('Server health check failed:', error);
            // Still try to load articles in case health endpoint is not available
            this.loadArticles();
        }
    }

    async loadArticles() {
        this.showLoading();
        this.isLoading = true;


        try {
            console.log('Loading articles from:', `${this.apiBase}/api/articles?limit=50`);
            const response = await fetch(`${this.apiBase}/api/articles?limit=50`);
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Articles loaded:', data.articles?.length || 0);
            
            this.articles = data.articles || [];
            
            if (this.articles.length === 0) {
                throw new Error('No articles found');
            }
            
            this.currentIndex = 0;
            this.updateCounter();
            this.displayCurrentArticle();
            this.showNews();
            
        } catch (error) {
            console.error('Error loading articles:', error);
            
            // Retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying... (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => {
                    this.loadArticles();
                }, 2000 * this.retryCount); // Exponential backoff
                return;
            }
            
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    async refreshArticles() {
        if (this.isLoading) return;
        
        this.refreshBtnEl.style.transform = 'rotate(180deg)';
        await this.loadArticles();
        
        setTimeout(() => {
            this.refreshBtnEl.style.transform = 'rotate(0deg)';
        }, 500);
    }

    nextArticle() {
        if (this.articles.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.articles.length;
        this.displayCurrentArticle();
        this.updateCounter();
        this.updateProgress();
    }

    previousArticle() {
        if (this.articles.length === 0) return;
        
        this.currentIndex = this.currentIndex === 0 
            ? this.articles.length - 1 
            : this.currentIndex - 1;
        this.displayCurrentArticle();
        this.updateCounter();
        this.updateProgress();
    }

    displayCurrentArticle() {
        if (this.articles.length === 0) return;
        
        const article = this.articles[this.currentIndex];
        
        // Update image
        if (article.image_url) {
            this.articleImageEl.src = article.image_url;
            this.articleImageEl.alt = article.title;
        } else {
            this.articleImageEl.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDYwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNzUgMTAwSDMyNVYxNTBIMjc1VjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1MCAxNzVIMzUwVjIwMEgyNTBWMTc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            this.articleImageEl.alt = 'No image available';
        }
        
        // Update content
        this.articleSourceEl.textContent = article.source || 'Unknown Source';
        this.articleTimeEl.textContent = this.formatTime(article.published_at);
        this.articleTitleEl.textContent = article.title;
        this.articleSummaryEl.textContent = article.summary || article.description || 'No summary available';
        this.articleLinkEl.href = article.url;
        
        // Add animation
        this.articleCardEl.style.animation = 'none';
        setTimeout(() => {
            this.articleCardEl.style.animation = 'slideIn 0.5s ease-out';
        }, 10);
    }

    updateCounter() {
        this.currentArticleEl.textContent = this.currentIndex + 1;
        this.totalArticlesEl.textContent = this.articles.length;
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.articles.length) * 100;
        this.progressBarEl.style.width = `${progress}%`;
    }

    async performSearch() {
        const query = this.searchInputEl.value.trim();
        
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        this.showLoading();
        this.isLoading = true;

        try {
            console.log('Searching for:', query);
            const response = await fetch(`${this.apiBase}/api/articles/search/${encodeURIComponent(query)}?limit=50`);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                this.articles = data.results;
                this.currentIndex = 0;
                this.isSearchMode = true;
                this.currentSearchQuery = query;
                
                this.showNews();
                this.displayCurrentArticle();
                this.updateCounter();
                this.updateProgress();
                
                console.log(`Found ${data.results.length} articles for "${query}"`);
            } else {
                this.showError(`No articles found for "${query}". Try different keywords.`);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError(`Search failed: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    clearSearch() {
        this.searchInputEl.value = '';
        this.clearSearchBtnEl.style.display = 'none';
        this.isSearchMode = false;
        this.currentSearchQuery = '';
        
        // Reload original articles
        this.loadArticles();
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    }

    showLoading() {
        this.loadingEl.classList.remove('hidden');
        this.errorEl.classList.add('hidden');
        this.newsContainerEl.classList.add('hidden');
    }

    showError(message) {
        this.loadingEl.classList.add('hidden');
        this.errorEl.classList.remove('hidden');
        this.newsContainerEl.classList.add('hidden');
        
        document.getElementById('error-message').textContent = message;
    }

    showNews() {
        this.loadingEl.classList.add('hidden');
        this.errorEl.classList.add('hidden');
        this.newsContainerEl.classList.remove('hidden');
    }
}

// Initialize the news feed when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsFeed();
});

// Add some helpful console messages
console.log('📚 Jinri loaded!');
console.log('🎮 Controls:');
console.log('  ↓ or → : Next article');
console.log('  ↑ or ← : Previous article');
console.log('  Scroll up/down : Navigate articles');
console.log('  R : Refresh articles');
console.log('  Swipe up/left on mobile: Next article');
console.log('  Swipe down/right on mobile: Previous article');
