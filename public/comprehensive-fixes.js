// Comprehensive Fixes for All Issues
console.log('🔧 APPLYING COMPREHENSIVE FIXES');

// 1. Fix Desktop Navigation - Ensure icons and text are side by side
function fixDesktopNavigation() {
    console.log('🔧 Fixing desktop navigation...');
    
    // Add standardized navigation styles to all pages
    const style = document.createElement('style');
    style.textContent = `
        /* Standardized Desktop Navigation */
        .page-nav {
            display: flex !important;
            justify-content: center !important;
            gap: 0.8rem !important;
            background: #fff !important;
            box-shadow: 0 4px 20px rgba(99,102,241,0.08) !important;
            border-radius: 0 0 1.5rem 1.5rem !important;
            margin-bottom: 2rem !important;
            padding: 0.8rem 1.5rem !important;
            position: sticky !important;
            top: 80px !important;
            z-index: 99 !important;
            border-top: 1px solid rgba(99,102,241,0.1) !important;
            backdrop-filter: blur(10px) !important;
            max-width: 1400px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            overflow-x: auto !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            /* Override messages page specific styles */
            left: auto !important;
            right: auto !important;
            height: auto !important;
            border-bottom: none !important;
            /* Ensure consistent sizing */
            width: auto !important;
            min-width: auto !important;
        }
        
        .page-nav::-webkit-scrollbar {
            display: none !important;
        }
        
        .nav-link {
            color: #6b7280 !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            padding: 0.6rem 1rem !important;
            border-radius: 1rem !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            text-decoration: none !important;
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.4rem !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            /* Override messages page specific styles */
            border-bottom: none !important;
            /* Ensure consistent sizing */
            min-width: auto !important;
            width: auto !important;
        }
        
        .nav-link.active, .nav-link[aria-current="page"] {
            background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%) !important;
            color: #fff !important;
            box-shadow: 0 4px 12px rgba(99,102,241,0.25) !important;
            transform: translateY(-1px) !important;
            border-bottom-color: transparent !important;
        }
        
        .nav-link:hover {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
            color: #4f46e5 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(99,102,241,0.1) !important;
            border-bottom-color: transparent !important;
        }
        
        /* Messages page specific overrides for consistent sizing */
        body:has(.messages-main) .page-nav {
            margin-left: auto !important;
            margin-right: auto !important;
            max-width: 1400px !important;
            width: calc(100% - 2rem) !important;
        }
        
        /* Ensure messages page main content doesn't interfere with navigation */
        .messages-main {
            margin-top: 120px !important;
        }
        
        /* Additional messages page specific fixes */
        body:has(.messages-main) {
            /* Ensure consistent page layout */
            padding: 0 !important;
            margin: 0 !important;
        }
        
        /* Override any container styles that might affect navigation */
        body:has(.messages-main) .page-nav {
            /* Force consistent sizing */
            box-sizing: border-box !important;
            /* Ensure proper spacing */
            margin-left: auto !important;
            margin-right: auto !important;
            /* Prevent any width constraints from parent elements */
            max-width: 1400px !important;
            width: calc(100% - 2rem) !important;
            /* Ensure proper positioning */
            position: sticky !important;
            top: 80px !important;
            left: auto !important;
            right: auto !important;
        }
        
        /* Override any parent container styles */
        body:has(.messages-main) > * {
            max-width: none !important;
        }
        
        /* Ensure navigation links have consistent sizing */
        body:has(.messages-main) .nav-link {
            /* Force consistent sizing */
            box-sizing: border-box !important;
            /* Ensure proper text sizing */
            font-size: 0.95rem !important;
            /* Ensure proper padding */
            padding: 0.6rem 1rem !important;
            /* Prevent any width constraints */
            min-width: auto !important;
            width: auto !important;
            /* Ensure proper flex behavior */
            flex-shrink: 0 !important;
        }
        
        /* Enhanced Mobile Header Styles */
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
            border-bottom: none !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            box-shadow: 0 4px 20px rgba(99,102,241,0.15) !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 60px !important;
        }
        
        .header-content {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 0.8rem 1rem !important;
            height: auto !important;
            min-height: 60px !important;
            max-width: 1400px !important;
            margin: 0 auto !important;
            gap: 0.8rem !important;
        }
        
        .header-left {
            flex: 0 0 auto !important;
            display: flex !important;
            align-items: center !important;
        }
        
        .header-left .logo {
            font-size: 1.4rem !important;
            font-weight: 800 !important;
            color: white !important;
            margin: 0 !important;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
            letter-spacing: -0.5px !important;
            white-space: nowrap !important;
        }
        
        .header-center {
            flex: 1 1 auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.5rem !important;
            min-width: 0 !important;
        }
        
        .header-center .search-input {
            width: 100% !important;
            max-width: 300px !important;
            min-width: 150px !important;
            background: rgba(255, 255, 255, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 1.5rem !important;
            padding: 0.6rem 1rem !important;
            color: white !important;
            font-size: 0.9rem !important;
            backdrop-filter: blur(10px) !important;
            transition: all 0.3s !important;
            box-sizing: border-box !important;
        }
        
        .header-center .search-input::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .header-center .search-input:focus {
            outline: none !important;
            border-color: rgba(255, 255, 255, 0.6) !important;
            background: rgba(255, 255, 255, 0.25) !important;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1) !important;
        }
        
        .header-center .search-btn {
            background: rgba(255, 255, 255, 0.2) !important;
            border: none !important;
            border-radius: 50% !important;
            width: 32px !important;
            height: 32px !important;
            cursor: pointer !important;
            transition: all 0.3s !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: white !important;
            font-size: 1rem !important;
        }
        
        .header-center .search-btn:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: scale(1.05) !important;
        }
        
        .header-actions {
            flex: 0 0 auto !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.8rem !important;
        }
        
        .notification-btn {
            background: rgba(255, 255, 255, 0.2) !important;
            border: none !important;
            color: white !important;
            font-size: 1.2rem !important;
            cursor: pointer !important;
            padding: 0.5rem !important;
            border-radius: 50% !important;
            transition: all 0.3s !important;
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 40px !important;
            height: 40px !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .notification-btn:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: scale(1.05) !important;
        }
        
        .notification-badge {
            position: absolute !important;
            top: -2px !important;
            right: -2px !important;
            background: #ef4444 !important;
            color: white !important;
            border-radius: 50% !important;
            width: 18px !important;
            height: 18px !important;
            font-size: 0.7rem !important;
            font-weight: 600 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid white !important;
        }
        
        .user-avatar {
            width: 36px !important;
            height: 36px !important;
            border-radius: 50% !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            object-fit: cover !important;
            transition: all 0.3s !important;
            cursor: pointer !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        
        #userAvatarLink:hover .user-avatar {
            border-color: rgba(255, 255, 255, 0.6) !important;
            transform: scale(1.05) !important;
        }
        
        /* Mobile Responsive Header */
        @media (max-width: 768px) {
            .header-content {
                padding: 0.6rem 0.8rem !important;
                gap: 0.6rem !important;
                min-height: 56px !important;
            }
            
            .header-left .logo {
                font-size: 1.2rem !important;
            }
            
            .header-center .search-input {
                max-width: 200px !important;
                min-width: 120px !important;
                padding: 0.5rem 0.8rem !important;
                font-size: 0.85rem !important;
            }
            
            .header-center .search-btn {
                width: 28px !important;
                height: 28px !important;
                font-size: 0.9rem !important;
            }
            
            .notification-btn {
                width: 36px !important;
                height: 36px !important;
                font-size: 1.1rem !important;
                padding: 0.4rem !important;
            }
            
            .user-avatar {
                width: 32px !important;
                height: 32px !important;
            }
        }
        
        @media (max-width: 480px) {
            .header-content {
                padding: 0.5rem 0.6rem !important;
                gap: 0.5rem !important;
                min-height: 52px !important;
            }
            
            .header-left .logo {
                font-size: 1.1rem !important;
            }
            
            .header-center .search-input {
                max-width: 150px !important;
                min-width: 100px !important;
                padding: 0.4rem 0.7rem !important;
                font-size: 0.8rem !important;
            }
            
            .header-center .search-btn {
                width: 26px !important;
                height: 26px !important;
                font-size: 0.8rem !important;
            }
            
            .notification-btn {
                width: 32px !important;
                height: 32px !important;
                font-size: 1rem !important;
                padding: 0.3rem !important;
            }
            
            .user-avatar {
                width: 28px !important;
                height: 28px !important;
            }
        }
        
        /* Mobile Navigation - Standardized */
        .mobile-tab-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            background: #fff;
            box-shadow: 0 -4px 20px rgba(99,102,241,0.15);
            z-index: 200;
            padding: 0.4rem 0 0.2rem 0;
            border-radius: 1.5rem 1.5rem 0 0;
            border-top: 1px solid rgba(99,102,241,0.1);
            padding-bottom: max(0.2rem, env(safe-area-inset-bottom));
        }
        
        .tab-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            color: #1f2937;
            font-size: 0.9rem;
            font-weight: 600;
            padding: 0.3rem 0 0.1rem 0;
            border-radius: 0.7rem;
            transition: background 0.18s, color 0.18s;
            text-decoration: none;
            min-width: 0;
        }
        
        .tab-item.active, .tab-item[aria-current="page"] {
            background: linear-gradient(90deg, #6366f1 60%, #818cf8 100%);
            color: #fff;
        }
        
        .tab-item:hover {
            background: #f3f4f6;
            color: #4f46e5;
        }
        
        .tab-icon {
            font-size: 1.3rem;
            margin-bottom: 0.1rem;
        }
        
        .tab-label {
            font-size: 0.8rem;
            line-height: 1;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .page-nav {
                display: none !important;
            }
            .mobile-tab-nav {
                display: flex;
            }
        }
        
        @media (min-width: 769px) {
            .mobile-tab-nav {
                display: none;
            }
        }
        
        /* iOS Device Specific Fixes */
        @supports (padding: max(0px)) {
            .mobile-tab-nav {
                padding-bottom: max(0.2rem, env(safe-area-inset-bottom));
            }
        }
        
        /* Prevent zoom on input focus for iOS */
        @media screen and (max-width: 768px) {
            input, select, textarea {
                font-size: 16px !important;
            }
        }
        
        /* Music Play Button Styles */
        .play-btn {
            background: #6366f1;
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        
        .play-btn:hover {
            background: #4f46e5;
        }
        
        .play-btn:active {
            transform: scale(0.95);
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Desktop navigation styles applied with messages page overrides');
}

// 2. Fix Mobile Navigation - Standardize across all pages
function fixMobileNavigation() {
    console.log('🔧 Fixing mobile navigation...');
    
    // Find existing mobile navigation
    const existingMobileNav = document.querySelector('.mobile-tab-nav');
    
    if (existingMobileNav) {
        // Replace with standardized navigation
        const standardizedNav = `
            <nav class="mobile-tab-nav" role="navigation" aria-label="Mobile navigation">
                <a href="feed.html" class="tab-item" aria-label="Home">
                    <div class="tab-icon" aria-hidden="true">🏠</div>
                    <span class="tab-label">Home</span>
                </a>
                <a href="search.html" class="tab-item" aria-label="Search">
                    <div class="tab-icon" aria-hidden="true">🔍</div>
                    <span class="tab-label">Search</span>
                </a>
                <a href="upload.html" class="tab-item" aria-label="Create">
                    <div class="tab-icon" aria-hidden="true">➕</div>
                    <span class="tab-label">Create</span>
                </a>
                <a href="messages.html" class="tab-item" aria-label="Messages">
                    <div class="tab-icon" aria-hidden="true">💬</div>
                    <span class="tab-label">Messages</span>
                </a>
                <a href="live.html" class="tab-item" aria-label="Live">
                    <div class="tab-icon" aria-hidden="true">📺</div>
                    <span class="tab-label">Live</span>
                </a>
                <a href="music-library.html" class="tab-item" aria-label="Music">
                    <div class="tab-icon" aria-hidden="true">🎵</div>
                    <span class="tab-label">Music</span>
                </a>
                <a href="profile.html" class="tab-item" aria-label="Profile">
                    <div class="tab-icon" aria-hidden="true">👤</div>
                    <span class="tab-label">Profile</span>
                </a>
            </nav>
        `;
        
        existingMobileNav.outerHTML = standardizedNav;
        console.log('✅ Mobile navigation standardized');
    }
}

// 3. Fix Notification Bells - Ensure all work
function fixNotificationBells() {
    console.log('🔧 Fixing notification bells...');
    
    const notificationBtns = document.querySelectorAll('.notification-btn, #notificationBtn');
    
    notificationBtns.forEach(btn => {
        // Remove any existing onclick handlers
        btn.removeAttribute('onclick');
        
        // Add standardized onclick handler
        btn.onclick = function() {
            console.log('🔔 Notification bell clicked - navigating to notifications.html');
            window.location.href = 'notifications.html';
        };
        
        // Also add event listener for robustness
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔔 Notification bell clicked via event listener');
            window.location.href = 'notifications.html';
        });
    });
    
    console.log(`✅ Fixed ${notificationBtns.length} notification buttons`);
}

// 4. Fix Music Playback - Implement actual playback
function fixMusicPlayback() {
    console.log('🔧 Fixing music playback...');
    
    // Check if we're on the music library page
    if (window.location.pathname.includes('music-library.html')) {
        // Override the playMusic function if it exists
        if (window.musicLibraryPage && window.musicLibraryPage.playMusic) {
            const originalPlayMusic = window.musicLibraryPage.playMusic;
            
            window.musicLibraryPage.playMusic = function(trackId) {
                console.log('🎵 Playing music track:', trackId);
                
                // Find the track
                const track = this.musicData.find(t => t.id === trackId);
                if (track) {
                    console.log('🎵 Playing:', track.title, 'by', track.artist);
                    
                    // Create audio element for playback
                    const audio = new Audio();
                    
                    // For demo purposes, use a sample audio URL
                    // In production, this would be the actual track URL
                    audio.src = track.audioUrl || 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
                    
                    // Set up audio event listeners
                    audio.addEventListener('loadstart', () => {
                        console.log('🎵 Loading audio...');
                    });
                    
                    audio.addEventListener('canplay', () => {
                        console.log('🎵 Audio ready to play');
                        audio.play().catch(e => {
                            console.error('🎵 Error playing audio:', e);
                            alert('Unable to play audio. Please try again.');
                        });
                    });
                    
                    audio.addEventListener('error', (e) => {
                        console.error('🎵 Audio error:', e);
                        alert('Unable to load audio file. Please try again later.');
                    });
                    
                    // Update UI to show playing state
                    const playBtn = document.querySelector(`[onclick*="playMusic('${trackId}')"]`);
                    if (playBtn) {
                        playBtn.textContent = '⏸️';
                        playBtn.style.background = '#ef4444';
                        
                        // Reset button after audio ends
                        audio.addEventListener('ended', () => {
                            playBtn.textContent = '▶️';
                            playBtn.style.background = '#6366f1';
                        });
                    }
                    
                    // Show notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('🎵 Now Playing', {
                            body: `${track.title} by ${track.artist}`,
                            icon: '/icons/icon-192x192.png'
                        });
                    }
                } else {
                    console.error('🎵 Track not found:', trackId);
                    alert('Track not found. Please try again.');
                }
            };
            
            console.log('✅ Music playback function enhanced');
        }
    }
}

// 5. Enhanced Mobile Header Improvements
function enhanceMobileHeaders() {
    console.log('🔧 Enhancing mobile headers...');
    
    // Add enhanced mobile header styles
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced Mobile Header Improvements - Less Compact Design */
        
        /* Ensure proper spacing and sizing on all mobile devices */
        @media (max-width: 768px) {
            body {
                padding-top: 0 !important;
                margin-top: 0 !important;
            }
            
            .main-content {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }
            
            /* Improve header visibility and accessibility */
            .header {
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                min-height: 60px !important;
                width: 100% !important;
                position: relative !important;
                z-index: 1000 !important;
            }
            
            /* Better header content spacing - Override feed.css */
            .header .header-content {
                padding: 0.8rem 1rem !important;
                gap: 0.8rem !important;
                min-height: 60px !important;
                align-items: center !important;
                max-width: 100vw !important;
                margin: 0 auto !important;
                display: flex !important;
                justify-content: space-between !important;
                flex-wrap: nowrap !important;
                overflow: hidden !important;
            }
            
            /* Larger logo for better visibility */
            .header .header-left .logo {
                font-size: 1.3rem !important;
                font-weight: 800 !important;
                margin-right: 0 !important;
                flex-shrink: 0 !important;
            }
            
            /* Better touch targets for mobile */
            .header .notification-btn, 
            .header .user-avatar, 
            .header .search-btn {
                min-width: 48px !important;
                min-height: 48px !important;
                flex-shrink: 0 !important;
            }
            
            /* Improve search input on mobile - Less Compact */
            .header .header-center {
                flex: 1 !important;
                display: flex !important;
                align-items: center !important;
                gap: 0.6rem !important;
                justify-content: center !important;
                min-width: 0 !important;
                max-width: none !important;
                margin: 0 0.5rem !important;
            }
            
            .header .header-center .search-input {
                -webkit-appearance: none !important;
                appearance: none !important;
                border-radius: 24px !important;
                padding: 0.6rem 1rem !important;
                font-size: 0.95rem !important;
                min-width: 180px !important;
                max-width: 260px !important;
                width: 100% !important;
                height: 40px !important;
                border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
                background: rgba(255, 255, 255, 0.15) !important;
                color: white !important;
                backdrop-filter: blur(10px) !important;
                transition: all 0.3s ease !important;
                flex-shrink: 1 !important;
                box-sizing: border-box !important;
            }
            
            .header .header-center .search-input::placeholder {
                color: rgba(255, 255, 255, 0.7) !important;
                font-size: 0.9rem !important;
            }
            
            .header .header-center .search-input:focus {
                outline: none !important;
                border-color: rgba(255, 255, 255, 0.6) !important;
                background: rgba(255, 255, 255, 0.25) !important;
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1) !important;
            }
            
            .header .header-center .search-btn {
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                background: rgba(255, 255, 255, 0.2) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                color: white !important;
                font-size: 1rem !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                backdrop-filter: blur(10px) !important;
                flex-shrink: 0 !important;
            }
            
            .header .header-center .search-btn:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                transform: scale(1.05) !important;
            }
            
            /* Better notification button */
            .header .header-actions .notification-btn {
                width: 44px !important;
                height: 44px !important;
                background: rgba(255, 255, 255, 0.15) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                border-radius: 50% !important;
                color: white !important;
                font-size: 1.1rem !important;
                backdrop-filter: blur(10px) !important;
                transition: all 0.3s ease !important;
                flex-shrink: 0 !important;
            }
            
            .header .header-actions .notification-btn:hover {
                background: rgba(255, 255, 255, 0.25) !important;
                transform: scale(1.05) !important;
            }
            
            /* Better user avatar */
            .header .header-actions .user-avatar {
                width: 40px !important;
                height: 40px !important;
                border: 2px solid rgba(255, 255, 255, 0.4) !important;
                border-radius: 50% !important;
                transition: all 0.3s ease !important;
                flex-shrink: 0 !important;
            }
            
            .header .header-actions .user-avatar:hover {
                border-color: rgba(255, 255, 255, 0.7) !important;
                transform: scale(1.05) !important;
            }
            
            /* Better focus states for accessibility */
            .header .header-center .search-input:focus,
            .header .header-actions .notification-btn:focus,
            .header .header-actions .user-avatar:focus {
                outline: 2px solid rgba(255, 255, 255, 0.8) !important;
                outline-offset: 2px !important;
            }
            
            /* Ensure header actions don't overlap */
            .header .header-actions {
                display: flex !important;
                align-items: center !important;
                gap: 0.8rem !important;
                flex-shrink: 0 !important;
                min-width: auto !important;
            }
        }
        
        /* Small mobile devices - Better spacing */
        @media (max-width: 480px) {
            .header .header-content {
                padding: 0.7rem 0.8rem !important;
                gap: 0.6rem !important;
                min-height: 56px !important;
            }
            
            .header .header-left .logo {
                font-size: 1.2rem !important;
            }
            
            .header .header-center .search-input {
                min-width: 140px !important;
                max-width: 200px !important;
                padding: 0.5rem 0.8rem !important;
                font-size: 0.9rem !important;
                height: 36px !important;
            }
            
            .header .header-center .search-btn {
                width: 36px !important;
                height: 36px !important;
                font-size: 0.9rem !important;
            }
            
            .header .header-actions .notification-btn {
                width: 40px !important;
                height: 40px !important;
                font-size: 1rem !important;
            }
            
            .header .header-actions .user-avatar {
                width: 36px !important;
                height: 36px !important;
            }
        }
        
        /* Extra small mobile devices - Still spacious */
        @media (max-width: 360px) {
            .header .header-content {
                padding: 0.6rem 0.6rem !important;
                gap: 0.5rem !important;
                min-height: 52px !important;
            }
            
            .header .header-left .logo {
                font-size: 1.1rem !important;
            }
            
            .header .header-center .search-input {
                min-width: 120px !important;
                max-width: 160px !important;
                padding: 0.4rem 0.7rem !important;
                font-size: 0.85rem !important;
                height: 32px !important;
            }
            
            .header .header-center .search-btn {
                width: 32px !important;
                height: 32px !important;
                font-size: 0.85rem !important;
            }
            
            .header .header-actions .notification-btn {
                width: 36px !important;
                height: 36px !important;
                font-size: 0.95rem !important;
            }
            
            .header .header-actions .user-avatar {
                width: 32px !important;
                height: 32px !important;
            }
        }
        
        /* Landscape orientation fixes */
        @media (max-width: 768px) and (orientation: landscape) {
            .header .header-content {
                min-height: 52px !important;
                padding: 0.6rem 1rem !important;
            }
            
            .header .header-left .logo {
                font-size: 1.2rem !important;
            }
            
            .header .header-center .search-input {
                max-width: 220px !important;
                min-width: 160px !important;
            }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .header {
                border-bottom: 0.5px solid rgba(255, 255, 255, 0.2) !important;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
            }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .header .header-content *,
            .header .header-actions .notification-btn,
            .header .header-actions .user-avatar,
            .header .header-center .search-btn {
                transition: none !important;
                animation: none !important;
            }
        }
        
        /* Print styles */
        @media print {
            .header {
                display: none !important;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Enhance search functionality
    const searchInput = document.querySelector('.header-center .search-input');
    const searchBtn = document.querySelector('.header-center .search-btn');
    
    if (searchInput && searchBtn) {
        // Add search functionality
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                console.log('🔍 Searching for:', query);
                // Navigate to search page with query
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
        
        // Add enter key support
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    console.log('🔍 Searching for:', query);
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
        
        // Add search suggestions (basic)
        searchInput.addEventListener('input', function() {
            const query = searchInput.value.trim();
            if (query.length > 2) {
                console.log('🔍 Search suggestion for:', query);
                // In a real app, this would show search suggestions
            }
        });
    }
    
    console.log('✅ Mobile headers enhanced');
}

// 6. Add iOS Compatibility
function addIOSCompatibility() {
    console.log('🔧 Adding iOS compatibility...');
    
    const style = document.createElement('style');
    style.textContent = `
        /* iOS Specific Fixes */
        
        /* Prevent zoom on input focus */
        @media screen and (max-width: 768px) {
            input, select, textarea {
                font-size: 16px !important;
            }
        }
        
        /* Safe area support for notched devices */
        @supports (padding: max(0px)) {
            .mobile-tab-nav {
                padding-bottom: max(0.2rem, env(safe-area-inset-bottom));
            }
            
            .header {
                padding-top: max(0px, env(safe-area-inset-top));
            }
        }
        
        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
            .header {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
            
            .header-content {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        }
        
        /* Prevent rubber band scrolling on iOS */
        body {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
        }
        
        /* Fix for iOS Safari viewport issues */
        @media screen and (max-width: 768px) {
            .header {
                position: -webkit-sticky;
                position: sticky;
            }
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ iOS compatibility added');
}

// 7. Apply All Fixes
function applyAllFixes() {
    console.log('🚀 Applying all comprehensive fixes...');
    
    try {
        fixDesktopNavigation();
        fixMobileNavigation();
        fixNotificationBells();
        fixMusicPlayback();
        enhanceMobileHeaders();
        addIOSCompatibility();
        
        console.log('✅ All fixes applied successfully!');
        
        // Add success indicator
        const successIndicator = document.createElement('div');
        successIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.8rem;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        successIndicator.textContent = '✅ Fixes Applied';
        document.body.appendChild(successIndicator);
        
        // Show and hide success indicator
        setTimeout(() => {
            successIndicator.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            successIndicator.style.opacity = '0';
            setTimeout(() => {
                successIndicator.remove();
            }, 300);
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error applying fixes:', error);
    }
}

// Apply fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFixes);
} else {
    applyAllFixes();
} 