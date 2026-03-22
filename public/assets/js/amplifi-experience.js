(function () {
    const pageConfig = {
        'index.html': {
            tag: 'Amplifi Identity',
            eyebrow: 'Built for social connection',
            title: 'Share what matters. Discover people. Build real communities.',
            description: 'Amplifi should feel like a social media platform first: stronger discovery, cleaner community interactions, and creator tools that support sharing instead of overshadowing it.',
            stats: [
                ['Community first', 'Keep feeds, profiles, and live moments centered on people and conversations.'],
                ['Better discovery', 'Make it easier to find creators, topics, and content worth following.'],
                ['Sharing momentum', 'Support posting, going live, and reacting without losing the social feel.']
            ],
            actions: [
                { href: 'login.html', label: 'Join the community', primary: true, icon: 'fa-rocket' },
                { href: 'feed.html', label: 'Explore the feed', icon: 'fa-chart-line' },
                { href: 'profile.html', label: 'Open your profile', icon: 'fa-user' }
            ]
        },
        'feed.html': {
            tag: 'Feed Experience',
            eyebrow: 'Designed for momentum',
            title: 'Your feed should feel alive, relevant, and social.',
            description: 'This pass gives the feed a cleaner identity and a clearer sense of what users can do next: discover people, react to posts, and move naturally through the social experience.',
            filterTypes: ['videos', 'moments', 'videos', 'videos'],
            links: [
                ['Go live', 'Jump from browsing into a live social moment with your audience.', 'live.html'],
                ['Share next', 'Turn what you are seeing into your next post, video, or moment.', 'upload.html'],
                ['View library', 'Keep saved content, playlists, and social activity close by.', 'library.html']
            ]
        },
        'profile.html': {
            tag: 'Social Presence',
            eyebrow: 'Show people who you are',
            title: 'A social profile should feel like a living identity, not just an account page.',
            description: 'Highlight personality, make activity easier to scan, and frame profile management as part of community building instead of just creator admin.',
            actions: [
                { href: 'creator-dashboard.html', label: 'Open social hub', primary: true, icon: 'fa-chart-pie' },
                { href: 'subscriptions.html', label: 'Review supporter community', icon: 'fa-star' }
            ]
        },
        'creator-dashboard.html': {
            tag: 'Social Hub',
            eyebrow: 'Operate with clarity',
            title: 'Your social hub should help you connect, share, and keep momentum.',
            description: 'Tie posting, live moments, community planning, and profile growth into one clear hub so social activity feels coordinated instead of scattered.',
            actions: [
                { href: 'upload.html', label: 'Share something new', primary: true, icon: 'fa-upload' },
                { href: 'schedule.html', label: 'Open posting plan', icon: 'fa-calendar' }
            ]
        },
        'creator-setup.html': {
            tag: 'Profile Setup',
            eyebrow: 'Start with identity',
            title: 'New users need a clearer first-run path into the social experience.',
            description: 'Use onboarding to define your profile identity, content focus, posting rhythm, and community direction before jumping into the app.',
            actions: [
                { href: 'creator-dashboard.html', label: 'Back to social hub', primary: true, icon: 'fa-gauge' },
                { href: 'profile.html?tab=about', label: 'Review social profile', icon: 'fa-user' }
            ]
        },
        'upload.html': {
            tag: 'Content Studio',
            eyebrow: 'Share faster',
            title: 'Posting should feel like a social action, not a dead-end form.',
            description: 'The experience should make it easy to post, schedule, go live, and create moments that keep your social presence active.',
            actions: [
                { href: 'video-editor.html', label: 'Jump into editor', primary: true, icon: 'fa-scissors' },
                { href: 'schedule.html', label: 'Plan post time', icon: 'fa-calendar' }
            ]
        },
        'live.html': {
            tag: 'Live Experience',
            eyebrow: 'Real-time social energy',
            title: 'Live should communicate momentum, community, and connection instantly.',
            description: 'This UX pass reframes live as a core social touchpoint with clearer actions for streaming, scheduling, and audience participation.',
            actions: [
                { href: 'creator-dashboard.html', label: 'Manage social hub', primary: true, icon: 'fa-bolt' },
                { href: 'subscriptions.html', label: 'View supporter tiers', icon: 'fa-heart' }
            ]
        },
        'library.html': {
            tag: 'Content Library',
            eyebrow: 'Organize with intent',
            title: 'A social library should help you return to what matters, not just store files.',
            description: 'Keep watch history, saved items, playlists, and social activity feeling like part of one connected experience.',
            actions: [
                { href: 'music-library.html', label: 'Browse music library', primary: true, icon: 'fa-music' },
                { href: 'creator-dashboard.html', label: 'Go to social hub', icon: 'fa-chart-line' }
            ]
        },
        'search.html': {
            tag: 'Discovery',
            eyebrow: 'Find the next idea faster',
            title: 'Search should feel like social discovery, not just filtering.',
            description: 'This layer gives search more direction by emphasizing people, content types, and the next social actions users usually take once they find something useful.'
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
            title: 'Trending should spotlight cultural energy and social momentum.',
            description: 'This pass helps users understand why they are here: discover what people are reacting to and find what is worth joining next.'
        },
        'schedule.html': {
            tag: 'Publishing cadence',
            eyebrow: 'Plan with confidence',
            title: 'Scheduling should feel like planning your social presence, not just date picking.',
            description: 'Make the calendar and posting plan feel tied to community momentum, not just creator admin.'
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
            title: 'Social posting flow',
            description: 'Move from an idea to a post, moment, or live share without bouncing between disconnected tools.',
            items: [
                ['1. Start a share', 'Bring in videos, clips, or assets for your next post or moment.'],
                ['2. Refine quickly', 'Open the editor, create moments, and prep titles before posting.'],
                ['3. Schedule with intent', 'Choose the best time to post and keep your social momentum moving.']
            ]
        },
        'live.html': {
            title: 'Live social checklist',
            description: 'Treat live streaming like a community moment, with prep, conversation hooks, and follow-up built in.',
            items: [
                ['Prep the room', 'Check title, thumbnail, stream key, and what people should expect.'],
                ['Prime engagement', 'Point viewers toward live chat, supporter tiers, and what to do next.'],
                ['Repurpose after stream', 'Turn the replay into clips, highlights, and scheduled follow-ups.']
            ]
        },
        'profile.html': {
            title: 'Social credibility',
            description: 'Your profile should signal who you are, what you share, and why people should follow or come back.',
            items: [
                ['Clarify identity', 'Make your interests, tone, and social promise obvious at a glance.'],
                ['Show momentum', 'Surface activity, playlists, and recent posts to reinforce trust.'],
                ['Guide the community', 'Link people toward memberships, uploads, and the next social touchpoint.']
            ]
        },
        'library.html': {
            title: 'Reuse momentum',
            description: 'A strong library helps you find your best content quickly and turn saved media into new social momentum.',
            items: [
                ['Watch patterns', 'Use history and saved items to spot what deserves a follow-up.'],
                ['Organize by intent', 'Separate inspiration, post-ready items, and evergreen assets.'],
                ['Create from the archive', 'Jump from stored content into new uploads, playlists, or edits.']
            ]
        },
        'creator-dashboard.html': {
            title: 'Social operating hub',
            description: 'Use the hub as your decision layer: what to share, when to post, and how to turn activity into stronger community momentum.',
            items: [
                ['Prioritize the next share', 'Pick the one post, moment, or live event that should move today.'],
                ['Connect the flow', 'Move between upload, editor, schedule, and live without losing social momentum.'],
                ['Support community value', 'Point people toward memberships, live moments, and deeper interaction.']
            ]
        },
        'creator-setup.html': {
            title: 'Profile setup with intent',
            description: 'Use onboarding to turn Amplifi into a social platform personalized to your identity and interests instead of a generic shell.',
            items: [
                ['Define your positioning', 'Clarify your niche, community promise, and content style from the start.'],
                ['Pick a repeatable cadence', 'Make your schedule realistic enough to stay active consistently.'],
                ['Align support early', 'Tie subscriptions, support, or growth goals to what you actually share.']
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

    function getCreatorPlanData() {
        if (!window.amplifiAuth || typeof window.amplifiAuth.getCreatorPlan !== 'function') {
            return null;
        }
        return window.amplifiAuth.getCreatorPlan() || null;
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
                return user.name || user.email || 'User';
            }
        }

        return 'User';
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

    function getStoredList(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    }

    function setStoredList(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function toggleStoredValue(key, value) {
        const current = getStoredList(key);
        const next = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        setStoredList(key, next);
        return next.includes(value);
    }

    function updateSearchPlaceholders() {
        document.querySelectorAll('#searchInput, .yt-search-input').forEach((input) => {
            input.setAttribute('placeholder', 'Search posts, people, topics...');
        });
    }

    function readStoredJson(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || 'null');
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function writeStoredJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function emitSocialStateUpdate() {
        window.dispatchEvent(new CustomEvent('amplifi-social-state-updated'));
    }

    function readSocialEvents() {
        const events = readStoredJson('amplifi_social_events', []);
        return Array.isArray(events) ? events : [];
    }

    function writeSocialEvents(events) {
        writeStoredJson('amplifi_social_events', events.slice(-250));
        emitSocialStateUpdate();
    }

    function recordSocialEvent(type, payload) {
        const events = readSocialEvents();
        const entry = {
            id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            timestamp: Date.now(),
            page: currentPage(),
            ...(payload || {})
        };
        events.push(entry);
        writeSocialEvents(events);
        return entry;
    }

    function readSocialComments() {
        const comments = readStoredJson('amplifi_social_comments', []);
        return Array.isArray(comments) ? comments : [];
    }

    function writeSocialComments(comments) {
        writeStoredJson('amplifi_social_comments', comments.slice(-250));
        emitSocialStateUpdate();
    }

    function addSocialComment(comment) {
        const comments = readSocialComments();
        comments.push({
            id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            page: currentPage(),
            ...(comment || {})
        });
        writeSocialComments(comments);
    }

    function getCommentsForKey(contentKey) {
        return readSocialComments()
            .filter((comment) => comment.contentKey === contentKey)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    function formatCompactNumber(value) {
        const number = Number(value || 0);
        if (number >= 1000000) {
            return `${(number / 1000000).toFixed(1)}M`;
        }
        if (number >= 1000) {
            return `${(number / 1000).toFixed(1)}K`;
        }
        return String(number);
    }

    function getCommunityMetrics() {
        const uploads = readStoredJson('uploadHistory', []);
        const following = Array.from(new Set(getStoredList('amplifi_following')));
        const saved = Array.from(new Set(getStoredList('amplifi_saved_posts')));
        const plan = getCreatorPlanData() || {};
        const goals = Array.isArray(plan.goals) ? plan.goals.length : 0;
        const comments = readSocialComments();
        const commentCount = Array.isArray(comments) ? comments.length : 0;
        const events = readSocialEvents();
        const shareCount = events.filter((event) => event.type === 'share').length;
        const likeCount = events.filter((event) => event.type === 'like' && event.active !== false).length;
        const saveCount = saved.length;
        const support = commentCount + shareCount + saveCount;
        const followingCount = following.length;

        return {
            uploads: uploads.length || 12,
            following: followingCount || 18,
            saved: saveCount || 7,
            goals: goals || 3,
            commentCount: commentCount || 24,
            shareCount: shareCount || 12,
            likeCount: likeCount || 120,
            support: support || 36,
            reach: Math.max(45600, (uploads.length * 2400) + (followingCount * 320) + (saveCount * 180) + (commentCount * 24) + (shareCount * 36) + 10000)
        };
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
            <h2>Build a social presence that actually compounds.</h2>
            <p>Amplifi should make it easier to stay active, connect formats together, and guide people into deeper community relationships.</p>
        `;

        const grid = document.createElement('div');
        grid.className = 'amplifi-home-grid';
        [
            ['Social-first experience', 'Feed, profiles, live, and posting should feel centered on people and interaction.'],
            ['Multi-format momentum', 'Turn posts, moments, and live streams into a tighter social rhythm.'],
            ['Community pathways', 'Move people from discovery into follows, memberships, library, and deeper participation.']
        ].forEach(([title, description]) => {
            const card = document.createElement('article');
            card.className = 'amplifi-home-card';
            card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        anchor.insertAdjacentElement('beforebegin', section);
    }

    function injectSocialProofStrip() {
        if (currentPage() !== 'index.html' || document.querySelector('.amplifi-proof-strip')) {
            return;
        }

        const anchor = document.querySelector('.hero-section');
        if (!anchor || !anchor.parentElement) {
            return;
        }

        const strip = document.createElement('section');
        strip.className = 'amplifi-proof-strip';
        [
            ['Faster social loop', 'Post, react, and move without product clutter.'],
            ['People-first discovery', 'Profiles, moments, and trending feel connected.'],
            ['Community depth', 'Feed actions push real return visits, not passive browsing.'],
            ['Cleaner creator tools', 'Support creators without making the app feel like a dashboard.']
        ].forEach(([title, description]) => {
            const item = document.createElement('article');
            item.className = 'amplifi-proof-chip';
            item.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            strip.appendChild(item);
        });

        anchor.insertAdjacentElement('afterend', strip);
    }

    function injectHomeCommunitySnapshot() {
        if (currentPage() !== 'index.html' || document.querySelector('.amplifi-discovery-rail')) {
            return;
        }

        const anchor = document.querySelector('.trending-section');
        if (!anchor) {
            return;
        }

        const metrics = getCommunityMetrics();
        const profile = getCreatorProfileData() || {};
        const section = document.createElement('section');
        section.className = 'amplifi-discovery-rail';
        [
            ['Community snapshot', `${formatCompactNumber(metrics.following)} people/creators followed · ${formatCompactNumber(metrics.saved)} saves ready to revisit.`],
            ['Why this can beat YouTube', 'Faster interaction loops, cleaner discovery, and more visible identity across the whole product.'],
            ['Best next move', `Use ${profile.contentCategory || 'your niche'} to turn feed traffic into profile visits, saves, and repeat follows.`]
        ].forEach(([title, description]) => {
            const card = document.createElement('article');
            card.className = 'amplifi-discovery-card';
            card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
            section.appendChild(card);
        });

        anchor.insertAdjacentElement('beforebegin', section);
    }

    function injectFeedComposer() {
        if (currentPage() !== 'feed.html' || document.querySelector('.amplifi-social-composer')) {
            return;
        }

        const anchor = document.querySelector('.feed-header');
        if (!anchor) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const panel = document.createElement('section');
        panel.className = 'amplifi-social-composer';
        panel.innerHTML = `
            <div>
                <div class="amplifi-page-tag">Social momentum</div>
                <h3>Stay active without leaving the conversation.</h3>
                <p>Amplifi should feel more social than a video catalog. Move from discovery into posting, moments, live, and community actions in one flow.</p>
                <div class="amplifi-composer-actions">
                    <a class="amplifi-composer-btn primary" href="upload.html"><i class="fas fa-pen"></i><span>Post an update</span></a>
                    <a class="amplifi-composer-btn" href="moments.html"><i class="fas fa-bolt"></i><span>Create a moment</span></a>
                    <a class="amplifi-composer-btn" href="live.html"><i class="fas fa-broadcast-tower"></i><span>Go live now</span></a>
                </div>
            </div>
            <aside class="amplifi-social-panel">
                <h3>${creatorDisplayName()}'s feed pulse</h3>
                <div class="amplifi-pulse-list">
                    <div class="amplifi-pulse-item">
                        <div class="amplifi-pulse-icon"><i class="fas fa-users"></i></div>
                        <div><strong>People want a reason to return</strong><span>${profile.contentCategory || 'Your community'} grows faster when feed, profile, and moments all reinforce the same identity.</span></div>
                    </div>
                    <div class="amplifi-pulse-item">
                        <div class="amplifi-pulse-icon"><i class="fas fa-fire"></i></div>
                        <div><strong>Short actions compound</strong><span>Likes, follows, comments, and saves should be visible everywhere, not buried behind a player page.</span></div>
                    </div>
                </div>
            </aside>
        `;

        anchor.insertAdjacentElement('afterend', panel);
    }

    function enhanceDiscoveryCards() {
        if (!['index.html', 'trending.html', 'moments.html'].includes(currentPage())) {
            return;
        }

        document.querySelectorAll('.yt-video-card').forEach((card, index) => {
            if (card.dataset.amplifiDiscoveryEnhanced === 'true') {
                return;
            }

            card.dataset.amplifiDiscoveryEnhanced = 'true';
            const info = card.querySelector('.yt-video-info');
            const title = card.querySelector('.yt-video-title');
            const author = card.querySelector('.yt-video-author, .yt-video-creator');
            if (!info || !title) {
                return;
            }

            const creator = author ? author.textContent.trim() : 'Amplifi';
            const creatorId = slugify(creator) || `amplifi${index + 1}`;
            const contentKey = `${currentPage()}::${creatorId}::${slugify(title.textContent.trim()) || index}`;
            const localCommentCount = getCommentsForKey(contentKey).length;
            const localShareCount = readSocialEvents().filter((event) => event.type === 'share' && event.contentKey === contentKey).length;
            const handle = `@${slugify(creator) || `amplifi${index + 1}`}`;
            const badges = document.createElement('div');
            badges.className = 'amplifi-feed-meta';
            badges.innerHTML = currentPage() === 'moments.html'
                ? '<span class="amplifi-feed-badge"><i class="fas fa-bolt"></i>Replay-worthy</span><span class="amplifi-feed-badge"><i class="fas fa-comment-dots"></i>Conversation starter</span>'
                : '<span class="amplifi-feed-badge"><i class="fas fa-chart-line"></i>Rising now</span><span class="amplifi-feed-badge"><i class="fas fa-users"></i>Community pick</span>';

            const topline = document.createElement('div');
            topline.className = 'amplifi-card-topline';
            topline.innerHTML = `
                <span class="amplifi-card-handle">${handle}</span>
                <button class="amplifi-card-follow" type="button" data-follow-value="${creatorId}">
                    <span>Follow</span>
                </button>
            `;

            const bottomline = document.createElement('div');
            bottomline.className = 'amplifi-social-actions';
            bottomline.innerHTML = `
                <button class="amplifi-static-action" type="button" data-save-value="${contentKey}"><i class="fas fa-bookmark"></i><span>Save</span></button>
                <button class="amplifi-static-action" type="button" data-comment-key="${contentKey}" data-comment-title="${title.textContent.trim()}" data-comment-creator="${creator}"><i class="fas fa-comments"></i><span>Comment${localCommentCount ? ` · ${localCommentCount}` : ''}</span></button>
                <button class="amplifi-static-action" type="button" data-share-key="${contentKey}" data-share-title="${title.textContent.trim()}"><i class="fas fa-share-nodes"></i><span>Share${localShareCount ? ` · ${localShareCount}` : ''}</span></button>
                <a class="amplifi-static-action" href="profile.html"><i class="fas fa-user-plus"></i><span>View profile</span></a>
            `;

            info.insertBefore(badges, info.firstChild);
            info.insertBefore(topline, title);
            info.appendChild(bottomline);
        });

        document.querySelectorAll('.amplifi-card-follow').forEach((button) => {
            const value = button.dataset.followValue;
            const active = getStoredList('amplifi_following').includes(value);
            button.classList.toggle('active', active);
            button.querySelector('span').textContent = active ? 'Following' : 'Follow';
            button.onclick = () => {
                const isFollowing = toggleStoredValue('amplifi_following', value);
                recordSocialEvent('follow', { creatorId: value, active: isFollowing });
                button.classList.toggle('active', isFollowing);
                button.querySelector('span').textContent = isFollowing ? 'Following' : 'Follow';
            };
        });

        document.querySelectorAll('.amplifi-static-action[data-save-value]').forEach((button) => {
            const value = button.dataset.saveValue;
            button.classList.toggle('active', getStoredList('amplifi_saved_posts').includes(value));
            button.onclick = () => {
                const isSaved = toggleStoredValue('amplifi_saved_posts', value);
                recordSocialEvent('save', { contentKey: value, active: isSaved });
                button.classList.toggle('active', isSaved);
            };
        });

        document.querySelectorAll('.amplifi-static-action[data-comment-key]').forEach((button) => {
            button.onclick = () => {
                openSharedCommentsSheet({
                    contentKey: button.dataset.commentKey,
                    title: button.dataset.commentTitle,
                    creator: button.dataset.commentCreator
                });
            };
        });

        document.querySelectorAll('.amplifi-static-action[data-share-key]').forEach((button) => {
            button.onclick = async () => {
                const contentKey = button.dataset.shareKey;
                recordSocialEvent('share', {
                    contentKey,
                    title: button.dataset.shareTitle
                });
                const shareCount = readSocialEvents().filter((event) => event.type === 'share' && event.contentKey === contentKey).length;
                button.querySelector('span').textContent = `Share${shareCount ? ` · ${shareCount}` : ''}`;
                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${contentKey}`);
                    } catch (error) {
                        // Ignore clipboard failures on unsupported browsers.
                    }
                }
            };
        });
    }

    function injectDiscoverySnapshot() {
        if (!['trending.html', 'moments.html'].includes(currentPage()) || document.querySelector('.amplifi-social-panel[data-snapshot]')) {
            return;
        }

        const anchor = document.querySelector('.trending-header, .moments-header');
        if (!anchor) {
            return;
        }

        const metrics = getCommunityMetrics();
        const panel = document.createElement('section');
        panel.className = 'amplifi-social-panel';
        panel.dataset.snapshot = 'true';
        panel.innerHTML = `
            <div class="amplifi-page-tag">${currentPage() === 'trending.html' ? 'Cultural momentum' : 'Short-form loop'}</div>
            <h3>${currentPage() === 'trending.html' ? 'See what communities are rallying around.' : 'Keep short-form tied to identity, not random clips.'}</h3>
            <p>${currentPage() === 'trending.html'
                ? `Trending should point people toward creators and conversations worth following. Right now you have ${formatCompactNumber(metrics.following)} followed identities, ${formatCompactNumber(metrics.shareCount)} shares, and ${formatCompactNumber(metrics.saved)} saved posts shaping repeat visits.`
                : `Moments work best when they feed profile growth and return visits. Right now you have ${formatCompactNumber(metrics.saved)} saved posts, ${formatCompactNumber(metrics.commentCount)} comments, and ${formatCompactNumber(metrics.likeCount)} lightweight reactions worth building on.`}</p>
            <div class="amplifi-inline-actions">
                <a class="amplifi-pill-btn primary" href="feed.html"><i class="fas fa-rss"></i><span>Open social feed</span></a>
                <a class="amplifi-pill-btn" href="profile.html"><i class="fas fa-user"></i><span>Strengthen profile</span></a>
            </div>
        `;

        anchor.insertAdjacentElement('afterend', panel);
    }

    function upgradeProfileToSocialProfile() {
        if (currentPage() !== 'profile.html') {
            return;
        }

        const metrics = getCommunityMetrics();
        const labels = Array.from(document.querySelectorAll('.stat-label'));
        const replacements = ['Posts', 'Followers', 'Reach', 'Support'];
        labels.slice(0, replacements.length).forEach((label, index) => {
            label.textContent = replacements[index];
        });

        const numbers = Array.from(document.querySelectorAll('.profile-stats .stat-number'));
        const values = [
            formatCompactNumber(metrics.uploads),
            formatCompactNumber(metrics.following * 42),
            formatCompactNumber(metrics.reach),
            formatCompactNumber(metrics.support)
        ];
        numbers.slice(0, values.length).forEach((node, index) => {
            node.textContent = values[index];
        });

        const tabMap = {
            videos: 'Posts',
            analytics: 'Insights',
            monetization: 'Community',
            playlists: 'Collections',
            about: 'About'
        };

        document.querySelectorAll('.profile-tabs .tab-btn').forEach((button) => {
            const label = tabMap[button.dataset.tab];
            if (label) {
                button.textContent = label;
            }
        });

        document.querySelectorAll('h2, h3').forEach((heading) => {
            if (heading.textContent.trim() === 'Channel Analytics') {
                heading.textContent = 'Profile Insights';
            }
            if (heading.textContent.trim() === 'Monetization') {
                heading.textContent = 'Community Support';
            }
        });

        const actionButtons = Array.from(document.querySelectorAll('.profile-actions button'));
        if (actionButtons[0]) {
            actionButtons[0].innerHTML = '<i class="fas fa-user-pen"></i> Edit Profile';
        }
        if (actionButtons[1]) {
            actionButtons[1].innerHTML = '<i class="fas fa-sliders"></i> Profile Settings';
        }

        const profile = getCreatorProfileData() || {};
        let rail = document.querySelector('.amplifi-discovery-rail');
        if (!rail) {
            const header = document.querySelector('.profile-header');
            if (!header) {
                return;
            }
            rail = document.createElement('section');
            rail.className = 'amplifi-discovery-rail';
            header.insertAdjacentElement('afterend', rail);
        }

        const cardData = [
            ['Profile promise', profile.creatorPromise || 'Use your profile to explain what people get when they follow you.'],
            ['Primary vibe', `${profile.contentCategory || 'Community'} · ${profile.contentFormat || 'Social video'}`],
            ['Community traction', `${formatCompactNumber(metrics.following * 42)} followers, ${formatCompactNumber(metrics.saved)} saved posts, ${formatCompactNumber(metrics.commentCount)} active comments tracked locally.`],
            ['Best next move', 'Point visitors to your latest post, your strongest collection, and your next live moment.']
        ];

        if (!rail.children.length) {
            cardData.forEach(([title, description]) => {
                const card = document.createElement('article');
                card.className = 'amplifi-discovery-card';
                card.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
                rail.appendChild(card);
            });
        } else {
            Array.from(rail.querySelectorAll('.amplifi-discovery-card')).slice(0, cardData.length).forEach((card, index) => {
                const [title, description] = cardData[index];
                const strong = card.querySelector('strong');
                const span = card.querySelector('span');
                if (strong) {
                    strong.textContent = title;
                }
                if (span) {
                    span.textContent = description;
                }
            });
        }
    }

    function ensureSharedCommentsSheet() {
        if (!['index.html', 'trending.html', 'moments.html'].includes(currentPage()) || document.getElementById('amplifiSharedCommentsSheet')) {
            return;
        }

        const sheet = document.createElement('div');
        sheet.className = 'amplifi-comments-sheet';
        sheet.id = 'amplifiSharedCommentsSheet';
        sheet.setAttribute('aria-hidden', 'true');
        sheet.innerHTML = `
            <div class="amplifi-comments-header">
                <div>
                    <h3 id="amplifiSharedCommentsTitle">Comments</h3>
                    <p class="amplifi-comments-hint" id="amplifiSharedCommentsMeta">Join the conversation around this post.</p>
                </div>
                <button class="amplifi-comments-close" type="button" aria-label="Close comments">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="amplifi-comments-list" id="amplifiSharedCommentsList"></div>
            <div class="amplifi-comments-compose">
                <textarea id="amplifiSharedCommentComposer" placeholder="Add something worth replying to..."></textarea>
                <div class="amplifi-comments-actions">
                    <span class="amplifi-comments-hint">Keep discovery social by making replies easy here too.</span>
                    <button class="amplifi-pill-btn primary" type="button" id="amplifiSharedCommentSubmit">
                        <i class="fas fa-paper-plane"></i>
                        <span>Post comment</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(sheet);
        sheet.querySelector('.amplifi-comments-close').addEventListener('click', closeSharedCommentsSheet);
        sheet.querySelector('#amplifiSharedCommentSubmit').addEventListener('click', submitSharedComment);
    }

    function renderSharedComments(contentKey) {
        const list = document.getElementById('amplifiSharedCommentsList');
        if (!list) {
            return;
        }

        const comments = getCommentsForKey(contentKey);
        if (!comments.length) {
            list.innerHTML = `
                <div class="amplifi-comment-item">
                    <strong>No comments yet</strong>
                    <span>Be the first person to move this discovery into a conversation.</span>
                </div>
            `;
            return;
        }

        list.innerHTML = comments.map((comment) => `
            <div class="amplifi-comment-item">
                <strong>${comment.author || 'Amplifi user'}</strong>
                <span>${comment.text}</span>
                <div class="amplifi-comment-time">${new Date(comment.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    function openSharedCommentsSheet(options) {
        ensureSharedCommentsSheet();
        const sheet = document.getElementById('amplifiSharedCommentsSheet');
        if (!sheet) {
            return;
        }

        sheet.dataset.contentKey = options.contentKey;
        const title = document.getElementById('amplifiSharedCommentsTitle');
        const meta = document.getElementById('amplifiSharedCommentsMeta');
        if (title) {
            title.textContent = `Comments on ${options.title || 'this post'}`;
        }
        if (meta) {
            meta.textContent = `${options.creator || 'Amplifi'} · ${currentPage()}`;
        }

        renderSharedComments(options.contentKey);
        sheet.classList.add('show');
        sheet.setAttribute('aria-hidden', 'false');
    }

    function closeSharedCommentsSheet() {
        const sheet = document.getElementById('amplifiSharedCommentsSheet');
        if (!sheet) {
            return;
        }
        sheet.classList.remove('show');
        sheet.setAttribute('aria-hidden', 'true');
    }

    function submitSharedComment() {
        const sheet = document.getElementById('amplifiSharedCommentsSheet');
        const composer = document.getElementById('amplifiSharedCommentComposer');
        if (!sheet || !composer) {
            return;
        }

        const contentKey = sheet.dataset.contentKey;
        const text = composer.value.trim();
        if (!contentKey || !text) {
            return;
        }

        const user = window.amplifiAuth && typeof window.amplifiAuth.getUser === 'function'
            ? window.amplifiAuth.getUser()
            : null;
        addSocialComment({
            contentKey,
            text,
            author: user ? (user.name || user.email || 'Amplifi user') : 'Amplifi user'
        });
        recordSocialEvent('comment', { contentKey });
        composer.value = '';
        renderSharedComments(contentKey);

        document.querySelectorAll(`[data-comment-key="${contentKey}"] span`).forEach((label) => {
            const count = getCommentsForKey(contentKey).length;
            label.textContent = `Comment${count ? ` · ${count}` : ''}`;
        });
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
                <span>Try another filter or jump into the social flow to share something new.</span>
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
                <h2>${creatorName}'s social focus</h2>
                <p>Use this area to spotlight recent posts, reinforce your ${formatLabel} style, and make your ${categoryLabel} identity easier to understand.</p>
                <div class="amplifi-workflow-grid">
                    <article class="amplifi-step-card">
                        <strong>Signature series</strong>
                        <span>Build repeatable ${formatLabel} formats so viewers know what to return for each week.</span>
                    </article>
                    <article class="amplifi-step-card">
                        <strong>High-performing posts</strong>
                        <span>Promote your strongest evergreen posts, not just the newest upload.</span>
                    </article>
                    <article class="amplifi-step-card">
                        <strong>Next action</strong>
                        <span>Guide people into playlists, subscriptions, or your next live/post moment.</span>
                    </article>
                </div>
                <div class="amplifi-action-row">
                    <a class="amplifi-action-btn primary" href="upload.html"><i class="fas fa-upload"></i><span>Share something new</span></a>
                    <a class="amplifi-action-btn" href="schedule.html"><i class="fas fa-calendar"></i><span>Plan next post</span></a>
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
            subtitle.textContent = `${profile.contentFormat || 'Social'} momentum ready`;
        }
        if (description) {
            description.textContent = `Your ${profile.contentCategory || 'community'} presence is set up. Move your next post through moments, feed discovery, and live interaction with more momentum.`;
        }
        if (primary) {
            primary.textContent = 'Open Social Hub';
            primary.onclick = () => {
                window.location.href = 'creator-dashboard.html';
            };
        }
        if (secondary) {
            secondary.textContent = 'Start Next Post';
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
            pageHeaderDescription.textContent = `${creatorName}'s ${profile.contentCategory || 'community'} profile with a ${profile.contentFormat || 'social video'} rhythm built for repeat visits.`;
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

    function injectProfileAboutPreview() {
        if (currentPage() !== 'profile.html' || !isCreatorSetupReady()) {
            return;
        }

        const aboutTab = document.getElementById('about');
        const aboutContent = aboutTab ? aboutTab.querySelector('.about-content') : null;
        if (!aboutContent || aboutContent.querySelector('.amplifi-profile-preview')) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const plan = getCreatorPlanData() || {};
        const creatorName = creatorDisplayName();
        const goals = Array.isArray(plan.goals) ? plan.goals.slice(0, 3) : [];

        const panel = document.createElement('section');
        panel.className = 'amplifi-workflow-panel amplifi-inline-panel amplifi-profile-preview';
        panel.innerHTML = `
            <div class="amplifi-page-tag">Social identity</div>
            <h2>${creatorName}'s public profile story</h2>
            <p>${profile.creatorPromise || `Use this space to explain what ${creatorName} shares, who it resonates with, and why people should come back.`}</p>
            <div class="amplifi-workflow-grid">
                <article class="amplifi-step-card">
                    <strong>Primary interest</strong>
                    <span>${profile.contentCategory || 'Set a primary category in creator setup.'}</span>
                </article>
                <article class="amplifi-step-card">
                    <strong>Format and rhythm</strong>
                    <span>${profile.contentFormat || 'No format set yet'}${profile.publishCadence ? ` · ${profile.publishCadence}` : ''}</span>
                </article>
                <article class="amplifi-step-card">
                    <strong>Community direction</strong>
                    <span>${profile.audienceGoal || 'No audience goal set'}${profile.monetizationFocus ? ` · ${profile.monetizationFocus}` : ''}</span>
                </article>
            </div>
        `;

        if (goals.length) {
            const goalWrap = document.createElement('div');
            goalWrap.className = 'amplifi-link-grid';
            goals.forEach((goal) => {
                const item = document.createElement('div');
                item.className = 'amplifi-link-card';
                        item.innerHTML = `<strong>${goal.title}</strong><span>${goal.description || 'Social goal saved from the dashboard.'}</span>`;
                goalWrap.appendChild(item);
            });
            panel.appendChild(goalWrap);
        }

        aboutContent.insertAdjacentElement('afterbegin', panel);
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

    function personalizeSchedulePage() {
        if (currentPage() !== 'schedule.html' || !isCreatorSetupReady()) {
            return;
        }

        const profile = getCreatorProfileData() || {};
        const plan = getCreatorPlanData() || {};
        const creatorName = creatorDisplayName();
        const pageHeaderDescription = document.querySelector('.page-header p');
        const scheduleTitle = document.querySelector('.schedule-title');
        const scheduleHeader = document.querySelector('.schedule-header');
        const contentType = document.getElementById('contentType');
        const contentTitle = document.getElementById('contentTitle');
        const scheduleDate = document.getElementById('scheduleDate');

        if (pageHeaderDescription) {
            pageHeaderDescription.textContent = `${creatorName} is planning a ${profile.publishCadence || 'consistent'} ${profile.contentFormat || 'creator'} cadence for ${profile.contentCategory || 'their audience'}.`;
        }

        if (scheduleTitle) {
            scheduleTitle.textContent = `${creatorName}'s content calendar`;
        }

        if (contentType && !contentType.value && profile.contentFormat) {
            const typeMap = {
                'long-form': 'video',
                'shorts': 'short',
                'live': 'live',
                'hybrid': 'video'
            };
            contentType.value = typeMap[profile.contentFormat] || '';
        }

        if (contentTitle && !contentTitle.value) {
            const categoryLabel = profile.contentCategory || 'creator';
            contentTitle.placeholder = `${creatorName} ${categoryLabel} release`;
        }

        if (scheduleDate && !scheduleDate.value) {
            scheduleDate.value = new Date().toISOString().split('T')[0];
        }

        if (scheduleHeader && !document.querySelector('.amplifi-schedule-plan')) {
            const panel = document.createElement('section');
            panel.className = 'amplifi-workflow-panel amplifi-inline-panel amplifi-schedule-plan';
            const incompleteTasks = Array.isArray(plan.tasks) ? plan.tasks.filter((task) => !task.completed).slice(0, 3) : [];
            const goals = Array.isArray(plan.goals) ? plan.goals.slice(0, 2) : [];

            panel.innerHTML = `
                <div class="amplifi-page-tag">Planning layer</div>
                <h2>Schedule around your creator strategy</h2>
                <p>${profile.creatorPromise || `Plan releases that support ${creatorName}'s audience promise, not just random publish dates.`}</p>
                <div class="amplifi-workflow-grid">
                    <article class="amplifi-step-card">
                        <strong>Cadence</strong>
                        <span>${profile.publishCadence || 'No cadence selected yet'}${profile.contentFormat ? ` · ${profile.contentFormat}` : ''}</span>
                    </article>
                    <article class="amplifi-step-card">
                        <strong>Audience focus</strong>
                        <span>${profile.audienceGoal || 'No audience goal set'}${profile.monetizationFocus ? ` · ${profile.monetizationFocus}` : ''}</span>
                    </article>
                    <article class="amplifi-step-card">
                        <strong>Category</strong>
                        <span>${profile.contentCategory || 'Set a category in creator setup to sharpen scheduling decisions.'}</span>
                    </article>
                </div>
            `;

            if (incompleteTasks.length || goals.length) {
                const extra = document.createElement('div');
                extra.className = 'amplifi-link-grid';
                [...incompleteTasks.map((task) => [task.title, task.description || 'Open the dashboard to manage this task.', task.href || 'creator-dashboard.html']),
                 ...goals.map((goal) => [goal.title, goal.description || 'Saved from your creator dashboard.', 'creator-dashboard.html'])].slice(0, 4)
                    .forEach(([title, description, href]) => {
                        const item = document.createElement('a');
                        item.className = 'amplifi-link-card';
                        item.href = href;
                        item.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
                        extra.appendChild(item);
                    });
                panel.appendChild(extra);
            }

            scheduleHeader.insertAdjacentElement('afterend', panel);
        }
    }

    function wireSchedulePlanPersistence() {
        if (currentPage() !== 'schedule.html') {
            return;
        }

        const form = document.getElementById('contentForm');
        if (!form) {
            return;
        }

        form.addEventListener('submit', function () {
            if (!window.amplifiAuth || typeof window.amplifiAuth.getCreatorPlan !== 'function' || typeof window.amplifiAuth.setCreatorPlan !== 'function') {
                return;
            }

            const plan = window.amplifiAuth.getCreatorPlan() || {};
            if (!Array.isArray(plan.tasks) || !plan.tasks.length) {
                return;
            }

            const updated = {
                ...plan,
                tasks: plan.tasks.map((task) => task.id === 'schedule-next' ? { ...task, completed: true } : task)
            };
            window.amplifiAuth.setCreatorPlan(updated);
        });
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
        updateSearchPlaceholders();
        wireHeroButtons();
        injectContextPanel();
        injectWorkflowPanel();
        enhanceHomePageSections();
        injectSocialProofStrip();
        injectHomeCommunitySnapshot();
        injectFeedComposer();
        enhanceSectionHeadings();
        tuneAuthLinks();
        enhanceFeedFilters();
        ensureSharedCommentsSheet();
        enhanceDiscoveryCards();
        injectDiscoverySnapshot();
        ensureProfileVideosPanel();
        enhanceProfileTabs();
        upgradeProfileToSocialProfile();
        enhanceUploadOptions();
        enhanceLiveAndLibraryCards();
        personalizeIndexHero();
        personalizeProfileSurface();
        injectProfileAboutPreview();
        personalizeUploadPage();
        personalizeSchedulePage();
        wireSchedulePlanPersistence();
        personalizeLivePage();
    });

    document.addEventListener('amplifi:feed-updated', function () {
        enhanceFeedFilters();
    });

    window.addEventListener('amplifi-social-state-updated', function () {
        if (['index.html', 'trending.html', 'moments.html'].includes(currentPage())) {
            enhanceDiscoveryCards();
            injectDiscoverySnapshot();
        }
        if (currentPage() === 'profile.html') {
            upgradeProfileToSocialProfile();
        }
        if (currentPage() === 'index.html') {
            injectHomeCommunitySnapshot();
        }
    });

    window.addEventListener('storage', function (event) {
        if (!event.key || !event.key.startsWith('amplifi_')) {
            return;
        }
        window.dispatchEvent(new CustomEvent('amplifi-social-state-updated'));
    });
})();
