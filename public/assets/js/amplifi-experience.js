(function () {
    const pageConfig = {
        'index.html': {
            tag: 'Amplifi Identity',
            eyebrow: 'Built for serious creators',
            title: 'Create once. Publish smarter. Build a stronger fan connection.',
            description: 'Amplifi should feel less like a clone and more like a creator operating system: sharper workflows, clearer monetization touchpoints, and a cleaner path from idea to audience.',
            stats: [
                ['Creator workflow', 'Edit, schedule, go live, and publish from one product lane.'],
                ['Audience clarity', 'Surface what matters most instead of burying actions under clutter.'],
                ['Faster discovery', 'Make it obvious where new viewers should go next.']
            ],
            actions: [
                { href: 'login.html', label: 'Start your creator setup', primary: true, icon: 'fa-rocket' },
                { href: 'creator-dashboard.html', label: 'See creator workflow', icon: 'fa-chart-line' },
                { href: 'upload.html', label: 'Open content studio', icon: 'fa-upload' }
            ]
        },
        'feed.html': {
            tag: 'Feed Experience',
            eyebrow: 'Designed for momentum',
            title: 'Your feed should feel curated, not chaotic.',
            description: 'This pass gives the feed a more premium identity and a clearer sense of what users can do next: explore, publish, or jump into the creator workflow without friction.',
            filterTypes: ['videos', 'moments', 'videos', 'videos'],
            links: [
                ['Go live', 'Jump from browsing straight into your live creator flow.', 'live.html'],
                ['Upload next', 'Turn inspiration into your next publish-ready asset.', 'upload.html'],
                ['View library', 'Keep your content organized and closer to reuse.', 'library.html']
            ]
        },
        'profile.html': {
            tag: 'Creator Presence',
            eyebrow: 'Own your channel story',
            title: 'A creator profile should feel like a brand hub, not just an account page.',
            description: 'Highlight credibility, make creator stats easier to scan, and frame profile management as a growth tool instead of a settings page.',
            actions: [
                { href: 'creator-dashboard.html', label: 'Open creator dashboard', primary: true, icon: 'fa-chart-pie' },
                { href: 'subscriptions.html', label: 'Review memberships', icon: 'fa-star' }
            ]
        },
        'creator-dashboard.html': {
            tag: 'Creator Hub',
            eyebrow: 'Operate with clarity',
            title: 'Your creator dashboard should feel like a command center, not a placeholder.',
            description: 'Tie creation, publishing, scheduling, and monetization into one obvious workflow so creators know what to do next.',
            actions: [
                { href: 'upload.html', label: 'Create next release', primary: true, icon: 'fa-upload' },
                { href: 'schedule.html', label: 'Open content plan', icon: 'fa-calendar' }
            ]
        },
        'creator-setup.html': {
            tag: 'Creator Setup',
            eyebrow: 'Start with structure',
            title: 'New creators need a clearer first-run path than just landing on a dashboard.',
            description: 'Use onboarding to define identity, content focus, publishing rhythm, and monetization direction before jumping into tools.',
            actions: [
                { href: 'creator-dashboard.html', label: 'Back to creator hub', primary: true, icon: 'fa-gauge' },
                { href: 'profile.html?tab=about', label: 'Review creator profile', icon: 'fa-user' }
            ]
        },
        'upload.html': {
            tag: 'Content Studio',
            eyebrow: 'Ship faster',
            title: 'Upload should feel like the start of a creator workflow, not a dead-end form.',
            description: 'The experience is now framed around what comes next: editing, scheduling, publishing, and creating moments from the same entry point.',
            actions: [
                { href: 'video-editor.html', label: 'Jump into editor', primary: true, icon: 'fa-scissors' },
                { href: 'schedule.html', label: 'Plan publish time', icon: 'fa-calendar' }
            ]
        },
        'live.html': {
            tag: 'Live Experience',
            eyebrow: 'Real-time creator energy',
            title: 'Live should communicate momentum, monetization, and audience connection instantly.',
            description: 'This UX pass reframes live as a premium creator touchpoint with clearer actions for streaming, scheduling, and viewer support.',
            actions: [
                { href: 'creator-dashboard.html', label: 'Manage creator flow', primary: true, icon: 'fa-bolt' },
                { href: 'subscriptions.html', label: 'View supporter tiers', icon: 'fa-heart' }
            ]
        },
        'library.html': {
            tag: 'Content Library',
            eyebrow: 'Organize with intent',
            title: 'A creator library should help you reuse momentum, not just store files.',
            description: 'Keep watch history, saved items, playlists, and creator tools feeling like part of one clean publishing system.',
            actions: [
                { href: 'music-library.html', label: 'Browse music library', primary: true, icon: 'fa-music' },
                { href: 'creator-dashboard.html', label: 'Go to creator dashboard', icon: 'fa-chart-line' }
            ]
        },
        'search.html': {
            tag: 'Discovery',
            eyebrow: 'Find the next idea faster',
            title: 'Search should feel like discovery, not just filtering.',
            description: 'This layer gives search more direction by emphasizing creators, content types, and the next actions users usually take once they find something useful.'
        },
        'moments.html': {
            tag: 'Short-Form',
            eyebrow: 'Quick content, stronger recall',
            title: 'Moments should feel fast, polished, and built for replay value.',
            description: 'A sharper shell helps short-form content feel intentional and more premium without copying other platforms outright.'
        },
        'trending.html': {
            tag: 'What is rising',
            eyebrow: 'Signal over noise',
            title: 'Trending should spotlight cultural energy and creator opportunity.',
            description: 'This pass helps users understand why they are here: discover momentum, study patterns, and find what is worth reacting to next.'
        },
        'schedule.html': {
            tag: 'Publishing cadence',
            eyebrow: 'Plan with confidence',
            title: 'Scheduling should feel like strategic publishing, not just date picking.',
            description: 'Make the calendar and content planning area feel more creator-centric, premium, and outcome-driven.'
        },
        'video-editor.html': {
            tag: 'Editing suite',
            eyebrow: 'Professional without the bloat',
            title: 'The editor should feel powerful, focused, and creator-grade.',
            description: 'A cleaner visual identity gives the editing experience more trust and makes advanced tools feel more approachable.'
        }
    };

    const workflowConfig = {
        'upload.html': {
            title: 'Creator workflow',
            description: 'Move from raw footage to published content without bouncing between disconnected tools.',
            items: [
                ['1. Upload source', 'Bring in full videos, short-form clips, or assets for your next post.'],
                ['2. Refine quickly', 'Open the editor, create moments, and prep titles before publishing.'],
                ['3. Schedule with intent', 'Choose the best drop time and build momentum before launch.']
            ]
        },
        'live.html': {
            title: 'Live launch checklist',
            description: 'Treat live streaming like a show, with prep, audience hooks, and monetization cues built in.',
            items: [
                ['Prep the room', 'Check title, thumbnail, stream key, and your audience promise.'],
                ['Prime engagement', 'Point viewers toward live chat, supporter tiers, and next content.'],
                ['Repurpose after stream', 'Turn the replay into clips, highlights, and scheduled follow-ups.']
            ]
        },
        'profile.html': {
            title: 'Channel credibility',
            description: 'Your profile should signal what you make, who it is for, and what viewers should do next.',
            items: [
                ['Clarify positioning', 'Make your niche and creator promise obvious at a glance.'],
                ['Show momentum', 'Surface stats, playlists, and recent output to reinforce trust.'],
                ['Guide the audience', 'Link viewers toward memberships, uploads, and creator touchpoints.']
            ]
        },
        'library.html': {
            title: 'Reuse momentum',
            description: 'A strong library helps you find your best content quickly and turn old assets into new growth.',
            items: [
                ['Watch patterns', 'Use history and saved items to spot what deserves a follow-up.'],
                ['Organize by intent', 'Separate inspiration, publish-ready items, and evergreen assets.'],
                ['Create from the archive', 'Jump from stored content into new uploads, playlists, or edits.']
            ]
        },
        'creator-dashboard.html': {
            title: 'Creator operating system',
            description: 'Use the dashboard as your decision layer: what to publish, when to schedule, and how to turn activity into growth.',
            items: [
                ['Prioritize the next release', 'Pick the one asset that should move today and ship it.'],
                ['Connect the workflow', 'Move between upload, editor, schedule, and live without losing momentum.'],
                ['Support monetization', 'Point viewers toward memberships, live moments, and premium creator value.']
            ]
        },
        'creator-setup.html': {
            title: 'Setup with intent',
            description: 'Use onboarding to turn Amplifi into a creator system personalized to your niche instead of a generic shell.',
            items: [
                ['Define your positioning', 'Clarify your niche, audience promise, and publishing format from the start.'],
                ['Pick a repeatable cadence', 'Make your schedule realistic enough to maintain momentum consistently.'],
                ['Align monetization early', 'Tie subscriptions, support, or brand goals to the content you actually plan to publish.']
            ]
        }
    };

    function currentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    function currentQuery() {
        return new URLSearchParams(window.location.search);
    }

    function getCreatorProfileData() {
        if (!window.amplifiAuth || typeof window.amplifiAuth.getCreatorProfile !== 'function') {
            return null;
        }
        return window.amplifiAuth.getCreatorProfile() || null;
    }

    function isCreatorSetupReady() {
        return Boolean(window.amplifiAuth && typeof window.amplifiAuth.isOnboardingComplete === 'function' && window.amplifiAuth.isOnboardingComplete());
    }

    function creatorDisplayName() {
        const profile = getCreatorProfileData();
        if (profile && profile.creatorName) {
            return profile.creatorName;
        }

        if (window.amplifiAuth && typeof window.amplifiAuth.getUser === 'function') {
            const user = window.amplifiAuth.getUser();
            if (user) {
                return user.name || user.email || 'Creator';
            }
        }

        return 'Creator';
    }

    function slugify(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 18);
    }

    function setActiveNavigation() {
        const page = currentPage();

        document.querySelectorAll('.yt-desktop-nav-item, .yt-mobile-tab, .yt-mobile-menu-item').forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') {
                return;
            }

            const normalized = href.split('?')[0];
            if (normalized === page) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    function wireSearch() {
        const input = document.getElementById('searchInput');
        const button = document.getElementById('searchBtn');

        if (!input || !button) {
            return;
        }

        const runSearch = () => {
            const query = input.value.trim();
            if (!query) {
                window.location.href = 'search.html';
                return;
            }
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        };

        button.addEventListener('click', runSearch);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                runSearch();
            }
        });

        const query = currentQuery().get('q');
        if (query) {
            input.value = query;
        }

        const searchPageInput = document.querySelector('.search-input');
        const searchPageButton = document.querySelector('.search-btn');

        if (searchPageInput) {
            if (query && !searchPageInput.value) {
                searchPageInput.value = query;
            }

            const runSearchPage = () => {
                const value = searchPageInput.value.trim();
                window.location.href = value ? `search.html?q=${encodeURIComponent(value)}` : 'search.html';
            };

            if (searchPageButton) {
                searchPageButton.addEventListener('click', runSearchPage);
            }

            searchPageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    runSearchPage();
                }
            });
        }
    }

    function wireHeroButtons() {
        const primary = Array.from(document.querySelectorAll('button, a')).find((el) => el.textContent.trim() === 'Get Started');
        const secondary = Array.from(document.querySelectorAll('button, a')).find((el) => el.textContent.trim() === 'Learn More');

        if (primary) {
            primary.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }

        if (secondary) {
            secondary.addEventListener('click', () => {
                window.location.href = 'about.html';
            });
        }
    }

    function createActionRow(actions) {
        const row = document.createElement('div');
        row.className = 'amplifi-action-row';

        actions.forEach((action) => {
            const link = document.createElement('a');
            link.className = `amplifi-action-btn${action.primary ? ' primary' : ''}`;
            link.href = action.href;
            link.innerHTML = action.icon
                ? `<i class="fas ${action.icon}"></i><span>${action.label}</span>`
                : `<span>${action.label}</span>`;
            row.appendChild(link);
        });

        return row;
    }

    function createStatsGrid(stats) {
        const grid = document.createElement('div');
        grid.className = 'amplifi-stat-grid';

        stats.forEach(([title, description]) => {
            const card = document.createElement('div');
            card.className = 'amplifi-stat-card';
            card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            grid.appendChild(card);
        });

        return grid;
    }

    function createLinksGrid(links) {
        const grid = document.createElement('div');
        grid.className = 'amplifi-link-grid';

        links.forEach(([title, description, href]) => {
            const card = document.createElement('a');
            card.className = 'amplifi-link-card';
            card.href = href;
            card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            grid.appendChild(card);
        });

        return grid;
    }

    function injectContextPanel() {
        const config = pageConfig[currentPage()];
        if (!config) {
            return;
        }

        const anchor = document.querySelector('.page-header, .feed-header, .live-header, .upload-header, .library-header, .search-header, .moments-header, .trending-header, .hero-section, .creator-hero-card, .setup-panel');
        if (!anchor || document.querySelector('.amplifi-context-panel, .amplifi-spotlight')) {
            return;
        }

        const panel = document.createElement('section');
        panel.className = currentPage() === 'index.html' ? 'amplifi-spotlight' : 'amplifi-context-panel';

        const tag = document.createElement('div');
        tag.className = currentPage() === 'index.html' ? 'amplifi-eyebrow' : 'amplifi-page-tag';
        tag.innerHTML = currentPage() === 'index.html'
            ? `<i class="fas fa-bolt"></i><span>${config.eyebrow || config.tag}</span>`
            : `<span>${config.tag}</span>`;

        const title = document.createElement('h2');
        title.textContent = config.title;

        const description = document.createElement('p');
        description.textContent = config.description;

        panel.appendChild(tag);
        panel.appendChild(title);
        panel.appendChild(description);

        if (config.stats) {
            panel.appendChild(createStatsGrid(config.stats));
        }

        if (config.links) {
            panel.appendChild(createLinksGrid(config.links));
        }

        if (config.actions) {
            panel.appendChild(createActionRow(config.actions));
        }

        anchor.insertAdjacentElement('afterend', panel);
    }

    function injectWorkflowPanel() {
        const config = workflowConfig[currentPage()];
        if (!config || document.querySelector('.amplifi-workflow-panel')) {
            return;
        }

        const anchor = document.querySelector('.upload-header, .live-header, .profile-header, .library-header, .profile-content, .creator-panel, .setup-side-card');
        if (!anchor) {
            return;
        }

        const panel = document.createElement('section');
        panel.className = 'amplifi-workflow-panel';
        panel.innerHTML = `
            <div class="amplifi-page-tag">Amplifi system</div>
            <h2>${config.title}</h2>
            <p>${config.description}</p>
        `;

        const grid = document.createElement('div');
        grid.className = 'amplifi-workflow-grid';

        config.items.forEach(([title, description]) => {
            const card = document.createElement('article');
            card.className = 'amplifi-step-card';
            card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            grid.appendChild(card);
        });

        panel.appendChild(grid);
        anchor.insertAdjacentElement('afterend', panel);
    }

    function enhanceHomePageSections() {
        if (currentPage() !== 'index.html' || document.querySelector('.amplifi-home-grid')) {
            return;
        }

        const anchor = document.querySelector('.features-section');
        if (!anchor) {
            return;
        }

        const section = document.createElement('section');
        section.className = 'amplifi-home-section';
        section.innerHTML = `
            <div class="amplifi-page-tag">Why Amplifi</div>
            <h2>Build a creator workflow that actually compounds.</h2>
            <p>Amplifi should make it easier to produce consistently, connect formats together, and guide viewers into deeper creator relationships.</p>
        `;

        const grid = document.createElement('div');
        grid.className = 'amplifi-home-grid';
        [
            ['Creator operating system', 'Upload, edit, schedule, and go live from one connected workflow.'],
            ['Multi-format momentum', 'Turn long-form, moments, and live streams into a tighter content engine.'],
            ['Audience pathways', 'Move people from discovery into memberships, library, and creator touchpoints.']
        ].forEach(([title, description]) => {
            const card = document.createElement('article');
            card.className = 'amplifi-home-card';
            card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        anchor.insertAdjacentElement('beforebegin', section);
    }

    function enhanceSectionHeadings() {
        document.querySelectorAll('.features-section > h2, .trending-section > h2, .live-streams > h2, .upcoming-streams > h2, .upload-history > h2').forEach((heading) => {
            if (heading.dataset.amplifiEnhanced === 'true') {
                return;
            }
            heading.dataset.amplifiEnhanced = 'true';
            const label = document.createElement('span');
            label.className = 'amplifi-page-tag';
            label.textContent = 'Amplifi focus';
            heading.parentElement.insertBefore(label, heading);
        });
    }

    function tuneAuthLinks() {
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.onclick = () => {
                window.location.href = 'login.html?tab=signup';
            };
        }
    }

    function enhanceFeedFilters() {
        if (currentPage() !== 'feed.html') {
            return;
        }

        const buttons = Array.from(document.querySelectorAll('.feed-filters .filter-btn'));
        const cards = Array.from(document.querySelectorAll('.yt-video-grid .yt-video-card'));
        const config = pageConfig['feed.html'];

        if (!buttons.length || !cards.length || !config || !config.filterTypes) {
            return;
        }

        cards.forEach((card, index) => {
            card.dataset.filterType = config.filterTypes[index] || 'videos';
        });

        let emptyState = document.querySelector('.amplifi-empty-state');
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'amplifi-empty-state';
            emptyState.innerHTML = `
                <strong>No content in this view yet.</strong>
                <span>Try another filter or jump into the creator workflow to publish something new.</span>
            `;
            const grid = document.querySelector('.yt-video-grid');
            if (grid && grid.parentElement) {
                grid.parentElement.appendChild(emptyState);
            }
        }

        const applyFilter = (type) => {
            let visible = 0;

            cards.forEach((card) => {
                const matches = type === 'all' || card.dataset.filterType === type;
                card.classList.toggle('amplifi-hidden', !matches);
                if (matches) {
                    visible += 1;
                }
            });

            buttons.forEach((button) => {
                const buttonType = button.textContent.trim().toLowerCase();
                button.classList.toggle('active', buttonType === type || (type === 'all' && buttonType === 'all'));
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        };

        buttons.forEach((button) => {
            const type = button.textContent.trim().toLowerCase();
            button.addEventListener('click', () => applyFilter(type === 'all' ? 'all' : type));
        });

        const requested = currentQuery().get('filter');
        applyFilter(requested || 'all');
    }

    function ensureProfileVideosPanel() {
        if (currentPage() !== 'profile.html' || document.getElementById('videos')) {
            return;
        }

        const tabs = document.querySelector('.profile-tabs');
        if (!tabs || !tabs.parentElement) {
            return;
        }

        const section = document.createElement('div');
        section.className = 'tab-content active amplifi-generated-videos-tab';
        section.id = 'videos';
        const profile = getCreatorProfileData() || {};
        const creatorName = creatorDisplayName();
        const formatLabel = profile.contentFormat || 'creator';
        const categoryLabel = profile.contentCategory || 'your niche';
        section.innerHTML = `
            <div class="amplifi-workflow-panel amplifi-inline-panel">
                <div class="amplifi-page-tag">Channel output</div>
                <h2>${creatorName}'s publishing focus</h2>
                <p>Use this area to spotlight your latest uploads, reinforce your ${formatLabel} strategy, and make your ${categoryLabel} positioning easier to understand.</p>
                <div class="amplifi-workflow-grid">
                    <article class="amplifi-step-card">
                        <strong>Signature series</strong>
                        <span>Build repeatable ${formatLabel} formats so viewers know what to return for each week.</span>
                    </article>
                    <article class="amplifi-step-card">
                        <strong>High-performing backlog</strong>
                        <span>Promote your strongest evergreen uploads, not just the newest post.</span>
                    </article>
                    <article class="amplifi-step-card">
                        <strong>Next action</strong>
                        <span>Guide viewers into playlists, subscriptions, or your next launch window.</span>
                    </article>
                </div>
                <div class="amplifi-action-row">
                    <a class="amplifi-action-btn primary" href="upload.html"><i class="fas fa-upload"></i><span>Upload a new video</span></a>
                    <a class="amplifi-action-btn" href="schedule.html"><i class="fas fa-calendar"></i><span>Plan next release</span></a>
                </div>
            </div>
        `;

        tabs.insertAdjacentElement('afterend', section);
    }

    function enhanceProfileTabs() {
        if (currentPage() !== 'profile.html') {
            return;
        }

        const buttons = Array.from(document.querySelectorAll('.profile-tabs .tab-btn'));
        const sections = Array.from(document.querySelectorAll('.profile-content > .tab-content'));
        if (!buttons.length || !sections.length) {
            return;
        }

        const showTab = (tabName) => {
            buttons.forEach((button) => {
                const match = button.dataset.tab === tabName;
                button.classList.toggle('active', match);
                button.setAttribute('aria-selected', match ? 'true' : 'false');
            });

            sections.forEach((section) => {
                const id = section.id || '';
                const dataTab = section.dataset.tab || '';
                const match = id === tabName || dataTab === tabName || id === `${tabName}Tab`;
                section.classList.toggle('active', match);
                section.style.display = match ? '' : 'none';
            });

            localStorage.setItem('amplifi_profile_tab', tabName);
        };

        buttons.forEach((button) => {
            button.addEventListener('click', () => showTab(button.dataset.tab));
        });

        const requested = currentQuery().get('tab') || localStorage.getItem('amplifi_profile_tab') || buttons[0].dataset.tab;
        if (requested) {
            showTab(requested);
        }
    }

    function enhanceUploadOptions() {
        if (currentPage() !== 'upload.html') {
            return;
        }

        document.querySelectorAll('.upload-option').forEach((card, index) => {
            if (card.querySelector('.amplifi-option-tag')) {
                return;
            }

            const tag = document.createElement('div');
            tag.className = 'amplifi-option-tag';
            tag.textContent = ['Core', 'Live', 'Short-form', 'Library', 'Advanced'][index] || 'Creator';
            card.insertBefore(tag, card.firstChild);
        });
    }

    function enhanceLiveAndLibraryCards() {
        document.querySelectorAll('.live-card, .upcoming-card, .content-card').forEach((card) => {
            card.classList.add('amplifi-elevated-card');
        });
    }

    function personalizeIndexHero() {
        if (currentPage() !== 'index.html' || !isCreatorSetupReady()) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const title = document.querySelector('.hero-content h1');
        const subtitle = document.querySelector('.hero-subtitle');
        const description = document.querySelector('.hero-description');
        const primary = Array.from(document.querySelectorAll('button, a')).find((el) => el.textContent.trim() === 'Get Started');
        const secondary = Array.from(document.querySelectorAll('button, a')).find((el) => el.textContent.trim() === 'Learn More');

        if (title) {
            title.textContent = `Welcome back, ${creatorDisplayName()}`;
        }
        if (subtitle) {
            subtitle.textContent = `${profile.contentFormat || 'Creator'} workflow ready`;
        }
        if (description) {
            description.textContent = `Your ${profile.contentCategory || 'creator'} system is set up. Move your next release through upload, schedule, and audience growth with more clarity.`;
        }
        if (primary) {
            primary.textContent = 'Open Creator Hub';
            primary.onclick = () => {
                window.location.href = 'creator-dashboard.html';
            };
        }
        if (secondary) {
            secondary.textContent = 'Start Next Upload';
            secondary.onclick = () => {
                window.location.href = 'upload.html';
            };
        }
    }

    function personalizeProfileSurface() {
        if (currentPage() !== 'profile.html' || !isCreatorSetupReady()) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const creatorName = creatorDisplayName();
        const username = `@${slugify(creatorName) || 'creator'}`;
        const pageHeaderDescription = document.querySelector('.page-header p');
        const channelTitle = document.querySelector('.channel-title');
        const usernameDisplay = document.querySelector('.username-display');
        const currentName = document.getElementById('currentDisplayName');

        if (pageHeaderDescription) {
            pageHeaderDescription.textContent = `${creatorName}'s ${profile.contentCategory || 'creator'} hub with a ${profile.contentFormat || 'content'}-first workflow.`;
        }
        if (channelTitle) {
            channelTitle.textContent = creatorName;
        }
        if (usernameDisplay) {
            usernameDisplay.textContent = username;
        }
        if (currentName) {
            currentName.textContent = creatorName;
        }
    }

    function personalizeUploadPage() {
        if (currentPage() !== 'upload.html' || !isCreatorSetupReady()) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const creatorName = creatorDisplayName();
        const pageHeaderDescription = document.querySelector('.page-header p');
        const uploadHeaderTitle = document.querySelector('.upload-header h1');
        const uploadHeaderDescription = document.querySelector('.upload-header p');
        const cards = Array.from(document.querySelectorAll('.upload-option'));

        if (pageHeaderDescription) {
            pageHeaderDescription.textContent = `Build your next ${profile.contentFormat || 'creator'} release for ${profile.contentCategory || 'your audience'} with tools matched to your workflow.`;
        }
        if (uploadHeaderTitle) {
            uploadHeaderTitle.textContent = `${creatorName}'s content studio`;
        }
        if (uploadHeaderDescription) {
            uploadHeaderDescription.textContent = `Create for a ${profile.publishCadence || 'repeatable'} cadence and keep your ${profile.audienceGoal || 'growth'} goal moving.`;
        }

        if (cards[0]) {
            const heading = cards[0].querySelector('h3');
            const description = cards[0].querySelector('p');
            if (heading) {
                heading.textContent = profile.contentFormat === 'shorts' ? 'Upload short-form source' : 'Upload next release';
            }
            if (description) {
                description.textContent = `Start the next ${profile.contentFormat || 'content'} asset for your ${profile.contentCategory || 'creator'} pipeline.`;
            }
        }

        if (cards[4]) {
            const description = cards[4].querySelector('p');
            if (description) {
                description.textContent = profile.contentFormat === 'shorts'
                    ? 'Create a quick moment that reinforces your short-form strategy'
                    : 'Turn long-form or live content into a reusable short-form moment';
            }
        }
    }

    function personalizeLivePage() {
        if (currentPage() !== 'live.html' || !isCreatorSetupReady()) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const pageHeaderDescription = document.querySelector('.page-header p');
        const goLiveButton = document.querySelector('.go-live-btn');
        const scheduleButton = document.querySelector('.schedule-stream-btn');

        if (pageHeaderDescription) {
            pageHeaderDescription.textContent = `${creatorDisplayName()} can use live to support ${profile.audienceGoal || 'engagement'} and strengthen a ${profile.contentFormat || 'creator'} publishing rhythm.`;
        }
        if (goLiveButton) {
            goLiveButton.innerHTML = `<i class="fas fa-broadcast-tower"></i> Go Live as ${creatorDisplayName()}`;
        }
        if (scheduleButton) {
            scheduleButton.innerHTML = `<i class="fas fa-calendar"></i> Schedule ${profile.contentCategory || 'creator'} stream`;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.body.classList.add('amplifi-experience-ready');
        setActiveNavigation();
        wireSearch();
        wireHeroButtons();
        injectContextPanel();
        injectWorkflowPanel();
        enhanceHomePageSections();
        enhanceSectionHeadings();
        tuneAuthLinks();
        enhanceFeedFilters();
        ensureProfileVideosPanel();
        enhanceProfileTabs();
        enhanceUploadOptions();
        enhanceLiveAndLibraryCards();
        personalizeIndexHero();
        personalizeProfileSurface();
        personalizeUploadPage();
        personalizeLivePage();
    });
})();
