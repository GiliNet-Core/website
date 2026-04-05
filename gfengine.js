class GFEngine {
    constructor(config) {
        this.containerId = config.container || 'news-scroll-container';
        this.feedUrls = config.feeds || [];
        this.corsProxy = config.corsProxy || '';
        this.ipfsGateway = config.ipfsGateway || 'https://ipfs.io/ipfs/';
        this.maxItems = config.maxItems || 5;
        this.items = [];
    }

    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `<div class="news-item">Aggregating feeds...</div>`;
        await this.fetchFeeds();
        this.render(container);
    }

    async fetchFeeds() {
        const fetchPromises = this.feedUrls.map(async (url) => {
            let targetUrl = url.startsWith('ipfs://') ? url.replace('ipfs://', this.ipfsGateway) : url;
            let fetchUrl = (this.corsProxy && targetUrl.startsWith('http')) ? this.corsProxy + encodeURIComponent(targetUrl) : targetUrl;

            try {
                const res = await fetch(fetchUrl);
                const data = await res.json();
                const feedTitle = data.feed_title || url.split('/').pop() || 'Unknown Source';
                return (data.items || []).map((item) => ({
                    ...item,
                    sourceName: feedTitle,
                    _unixTime: item.date ? new Date(item.date).getTime() : 0,
                    _id: `news-gen-${Math.random().toString(36).substring(2, 11)}` // Unique ID for tab routing
                }));
            } catch (e) { 
                console.error("Feed fetch error:", e);
                return []; 
            }
        });

        const results = await Promise.all(fetchPromises);
        this.items = results.flat().sort((a, b) => b._unixTime - a._unixTime).slice(0, this.maxItems);
    }

    render(container) {
        container.innerHTML = ''; 
        if (this.items.length === 0) {
            container.innerHTML = `<div class="news-item">No active feed data.</div>`;
            return;
        }

        this.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'news-item';
            el.style.cursor = 'pointer'; // Applied via JS to respect CSP

            const dateStr = item._unixTime > 0 ? new Date(item._unixTime).toISOString().split('T')[0] : 'Unknown Date';
            
            // Strip HTML elements for a clean, text-only sidebar preview (approx 90 chars)
            const cleanPreview = (item.content || '').replace(/<[^>]*>?/gm, '').substring(0, 90).trim() + '...';
            
            el.innerHTML = `
                <div class="news-date">${dateStr}</div>
                <strong>${item.title || "Untitled"}</strong><br>
                <span>${cleanPreview}</span><br>
                <a class="read-more nav-link">[Read Report]</a>
            `;

            // INLINE REDIRECT LOGIC
            el.addEventListener('click', () => this.openInlineArticle(item));

            container.appendChild(el);
        });
    }

    openInlineArticle(item) {
        const mainContent = document.getElementById('main');
        
        // 1. Remove any existing dynamic news tabs to keep DOM clean
        const oldTab = document.getElementById(item._id);
        if (oldTab) oldTab.remove();

        const articleTab = document.createElement('div');
        articleTab.id = item._id;
        articleTab.className = 'tab-content'; 
        
        const dateStr = item._unixTime > 0 ? new Date(item._unixTime).toISOString().split('T')[0] : 'Unknown Date';
        const safeContent = window.DOMPurify ? DOMPurify.sanitize(item.content) : item.content;

        articleTab.innerHTML = `
            <a class="back-link nav-link" id="back-btn-${item._id}">&lt;&lt; Return to Index</a>
            <h2>${item.title || "Untitled"}</h2>
            <div class="news-date">Timestamp: ${dateStr} | by ${item.author}</div>
            <div class="article-body">
                ${safeContent}
            </div>
            ${item.url ? `<p><br><a href="${item.url}" target="_blank" rel="noopener noreferrer">View Original Source →</a></p>` : ''}
        `;

        mainContent.appendChild(articleTab);

        // 3. Attach a CSP-safe event listener for the "Return to Index" button
        const backBtn = document.getElementById(`back-btn-${item._id}`);
        backBtn.style.cursor = 'pointer';
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Simulate a click on the home tab so it hooks into your existing script.js logic
            const homeLink = document.querySelector('[data-tab="home"]');
            if (homeLink) {
                homeLink.click();
            } else {
                this.switchToTab('home');
            }
        });

        // 4. Trigger the tab switch
        this.switchToTab(item._id);
    }

    switchToTab(tabId) {
        // Deactivate all current tabs
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Activate the new dynamic tab
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

window.GFEngine = GFEngine;
customElements.define('gf-engine', GFEngineWidget);