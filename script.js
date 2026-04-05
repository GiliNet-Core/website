document.addEventListener('DOMContentLoaded', () => {
        // Simple tab switching logic handled securely
        function switchTab(tabId) {
            // Hide all tabs
            const tabs = document.getElementsByClassName('tab-content');
            for(let i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove('active');
            }
            
            // Remove active class from nav
            const navs = document.getElementById('navlist').getElementsByTagName('a');
            for(let i = 0; i < navs.length; i++) {
                navs[i].classList.remove('active');
            }
            
            // Show selected tab
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }

            // Highlight nav ONLY if it exists (prevents JS crashing on News items)
            const activeNav = document.getElementById('nav-' + tabId);
            if (activeNav) {
                activeNav.classList.add('active');
            }

            // Handle Sidebar visibility
            const sidebar = document.getElementById('sidebar');
            if (tabId === 'active-index' || tabId === 'uncopyright') {
                sidebar.classList.add('hidden');
            } else {
                sidebar.classList.remove('hidden');
            }
        }

        // Programmatically attach event listeners to all links meant for navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTab = this.getAttribute('data-tab');
                if (targetTab) {
                    switchTab(targetTab);
                }
            });
        });
        // Wing Registry Form Logic
const registryForm = document.getElementById('wing-registry-form');
if (registryForm) {
    registryForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent page reload

        // Grab values and sanitize utilizing DOMPurify
        const name = DOMPurify.sanitize(document.getElementById('w-name').value);
        const focus = DOMPurify.sanitize(document.getElementById('w-focus').value);
        const link = DOMPurify.sanitize(document.getElementById('w-link').value);
        const alias = DOMPurify.sanitize(document.getElementById('w-alias').value) || 'Anonymous';
        const pgp = DOMPurify.sanitize(document.getElementById('w-pgp').value);

        // Construct the payload
        const payload = `WING NAME: ${name}\nFOCUS: ${focus}\nOPS LINK: ${link}\nHOST ALIAS: ${alias}\nPGP SIGNATURE:\n${pgp}`;

        // Output to the terminal block
        document.getElementById('output-block').textContent = payload;
        document.getElementById('form-output').classList.remove('hidden');
    });
    
}

        
        // Set 64-bit Y2K38-resistant UNIX timestamp
const nowMs = BigInt(Date.now()); 
const unix64 = nowMs / 1000n; // The 'n' suffix denotes a BigInt literal for integer division
document.getElementById('timestamp').innerText = unix64.toString() + " (64-bit UNIX Time)";
        // Active Index Search Logic
        const searchInput = document.getElementById('wing-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                // Sanitize the input string utilizing DOMPurify to maintain strict PRISEC standards
                const query = DOMPurify.sanitize(e.target.value).toLowerCase();
                
                // Target the rows inside the Active Index table body
                const tableRows = document.querySelectorAll('#active-index .index-table tbody tr');

                tableRows.forEach(row => {
                    // .textContent is inherently safe from HTML injection
                    const rowText = row.textContent.toLowerCase();
                    
                    if (rowText.includes(query)) {
                        row.style.display = ''; // Show row
                    } else {
                        row.style.display = 'none'; // Hide row
                    }
                });
            });
        }
        // Mirror Feature Copy Logic
        const copyCidBtn = document.getElementById('copy-cid-btn');
        if (copyCidBtn) {
            copyCidBtn.addEventListener('click', () => {
                const cidText = document.getElementById('wing-cid').innerText;
                
                // Uses the secure Clipboard API - inherently protected by your CSP
                navigator.clipboard.writeText(cidText).then(() => {
                    const status = document.getElementById('copy-status');
                    status.style.display = 'block';
                    
                    // Hide the success message after 2.5 seconds
                    setTimeout(() => {
                        status.style.display = 'none';
                    }, 2500);
                }).catch(err => {
                    console.error('Clipboard access denied by strictly defined permissions.', err);
                });
            });
        }
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
    const staticPolicy = window.trustedTypes.createPolicy('dompurify', {
        createHTML: (input) => DOMPurify.sanitize(input)
    });
}
 // Convert static news dates to 64-bit Y2K38-resistant UNIX timestamps
        const newsDates = document.querySelectorAll('.news-date');
        const dateRegex = /(\d{4}-\d{2}-\d{2})/; // Matches YYYY-MM-DD

        newsDates.forEach(element => {
            const originalText = element.innerText;
            const match = originalText.match(dateRegex);
            
            if (match) {
                const dateString = match[0];
                // Parse the date and get milliseconds
                const dateMs = new Date(dateString).getTime();
                
                // Convert to 64-bit BigInt Unix time
                const unix64 = BigInt(dateMs) / 1000n;
                
                // Replace the human-readable date with the Unix timestamp
                element.innerText = originalText.replace(dateString, unix64.toString());
            }
        });
    });
    document.addEventListener('DOMContentLoaded', () => {
        const engine = new GFEngine({
            container: 'news-scroll-container',
            feeds: [
                'https://gili-net.github.io/feedlib/feed.json'
            ],
            maxItems: 3
        });
        engine.init();
    });
    