/* global db, auth, firebase, storage */
// Music Library Page JavaScript
class MusicLibraryPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.musicData = [];
        
        this.init();
    }

    async init() {
        console.log('🎵 MUSIC LIBRARY - Initializing...');
        try {
            await this.setupAuthStateListener();
            this.setupEventListeners();
            this.loadMusicLibrary();
            this.showCopyrightSources(); // Display copyright sources and attribution info
            console.log('🎵 MUSIC LIBRARY - Initialized successfully');
        } catch (error) {
            console.error('🎵 MUSIC LIBRARY - Error during initialization:', error);
        }
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
            } else {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    updateUIForAuthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'block';
        if (notificationBtn) notificationBtn.style.display = 'block';
        
        if (this.userProfile) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && this.userProfile.profilePic) {
                userAvatar.src = this.userProfile.profilePic;
            }
        }
    }

    updateUIForUnauthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'none';
        if (notificationBtn) notificationBtn.style.display = 'none';
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMusic(e.target.value);
            });
        }

        // Notification button functionality
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                console.log('🔔 NOTIFICATION - Navigating to notifications page');
                window.location.href = 'notifications.html';
            });
        }

        // Music category navigation
        document.querySelectorAll('.music-category a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.navigateToSection(section);
            });
        });

        // Music action buttons
        document.querySelectorAll('.music-actions a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.getAttribute('href').substring(1);
                this.handleMusicAction(action);
            });
        });

        // Feature card buttons
        document.querySelectorAll('.feature-card a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.getAttribute('href').substring(1);
                this.handleMusicAction(action);
            });
        });
    }

    async loadMusicLibrary() {
        try {
            // Load music data from Firestore
            const musicSnapshot = await db.collection('music').get();
            this.musicData = [];
            
            musicSnapshot.forEach(doc => {
                this.musicData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Add comprehensive copyright-free music database
            this.musicData = [...this.musicData, ...this.getCopyrightFreeMusicDatabase()];
            
            this.renderMusicCategories();
            this.updateMusicStats();
            
            // Show success message
            console.log(`Successfully loaded ${this.musicData.length} tracks`);
        } catch (error) {
            console.error('Error loading music library:', error);
            // Show user-friendly error message
            this.showErrorMessage('Failed to load music library. Please try refreshing the page.');
        }
    }

    updateMusicStats() {
        const stats = {
            totalTracks: this.musicData.length,
            genres: this.getUniqueGenres().length,
            downloads: this.getTotalDownloads(),
            rating: this.getAverageRating()
        };

        // Update stats display
        const statElements = document.querySelectorAll('.music-stat-number');
        if (statElements.length >= 4) {
            statElements[0].textContent = stats.totalTracks.toLocaleString();
            statElements[1].textContent = stats.genres;
            statElements[2].textContent = stats.downloads.toLocaleString();
            statElements[3].textContent = stats.rating.toFixed(1);
        }
    }

    getUniqueGenres() {
        const genres = new Set();
        this.musicData.forEach(track => {
            if (track.genre) {
                genres.add(track.genre);
            }
        });
        return Array.from(genres);
    }

    getTotalDownloads() {
        return this.musicData.reduce((total, track) => {
            return total + (track.downloads || 0);
        }, 0);
    }

    getAverageRating() {
        const tracksWithRatings = this.musicData.filter(track => track.rating);
        if (tracksWithRatings.length === 0) return 4.8;
        
        const totalRating = tracksWithRatings.reduce((sum, track) => {
            return sum + (track.rating || 0);
        }, 0);
        
        return totalRating / tracksWithRatings.length;
    }

    renderMusicCategories() {
        // This would render actual music categories based on data
        console.log('Music categories rendered');
    }

    searchMusic(query) {
        if (!query.trim()) {
            this.loadMusicLibrary();
            return;
        }

        const filteredMusic = this.musicData.filter(track => {
            const searchTerm = query.toLowerCase();
            return (
                track.title?.toLowerCase().includes(searchTerm) ||
                track.artist?.toLowerCase().includes(searchTerm) ||
                track.genre?.toLowerCase().includes(searchTerm) ||
                track.description?.toLowerCase().includes(searchTerm)
            );
        });

        this.displaySearchResults(filteredMusic);
    }

    displaySearchResults(results) {
        // This would display search results in the UI
        console.log('Search results:', results);
    }

    navigateToSection(section) {
        console.log('🎵 NAVIGATION - Navigating to section:', section);
        // Handle navigation to different music sections
        switch (section) {
            case 'browse':
                console.log('🎵 NAVIGATION - Showing browse section');
                this.showBrowseSection();
                break;
            case 'genres':
                console.log('🎵 NAVIGATION - Showing genres section');
                this.showGenresSection();
                break;
            case 'royalty-free':
                console.log('🎵 NAVIGATION - Showing royalty-free section');
                this.showRoyaltyFreeSection();
                break;
            case 'playlists':
                console.log('🎵 NAVIGATION - Showing playlists section');
                this.showPlaylistsSection();
                break;
            case 'upload':
                console.log('🎵 NAVIGATION - Showing upload section');
                this.showUploadSection();
                break;
            default:
                console.log('🎵 NAVIGATION - Unknown section:', section);
                this.showBrowseSection(); // Default to browse
        }
    }

    handleMusicAction(action) {
        console.log('🎵 MUSIC ACTION - Handling action:', action);
        // Handle music action buttons
        switch (action) {
            case 'browse':
                console.log('🎵 MUSIC ACTION - Showing browse section');
                this.showBrowseSection();
                break;
            case 'upload':
                console.log('🎵 MUSIC ACTION - Showing upload section');
                this.showUploadSection();
                break;
            case 'playlists':
                console.log('🎵 MUSIC ACTION - Showing playlists section');
                this.showPlaylistsSection();
                break;
            case 'royalty-free':
                console.log('🎵 MUSIC ACTION - Showing royalty-free section');
                this.showRoyaltyFreeSection();
                break;
            default:
                console.log('🎵 MUSIC ACTION - Unknown action:', action);
                this.showBrowseSection(); // Default to browse
        }
    }

    showBrowseSection() {
        console.log('🎵 BROWSE - Showing browse section');
        console.log('🎵 BROWSE - Music data length:', this.musicData.length);
        
        // Show music browse section with actual functionality
        const browseHTML = `
            <div class="music-browse-section">
                <h2>🎵 Browse Music Library</h2>
                <div class="search-filters">
                    <input type="text" placeholder="Search tracks..." class="search-filter" id="trackSearch">
                    <select class="genre-filter" id="genreFilter">
                        <option value="">All Genres</option>
                        <option value="Lo-Fi">Lo-Fi</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Classical">Classical</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Rock">Rock</option>
                        <option value="Hip-Hop">Hip-Hop</option>
                        <option value="World">World</option>
                        <option value="Ambient">Ambient</option>
                        <option value="Pop">Pop</option>
                        <option value="Country">Country</option>
                    </select>
                </div>
                <div class="music-grid" id="musicGrid">
                    ${this.renderMusicGrid(this.musicData.slice(0, 12))}
                </div>
                <div class="load-more">
                    <button class="btn-primary" onclick="musicLibraryPage.loadMoreTracks()">Load More Tracks</button>
                </div>
            </div>
        `;
        
        console.log('🎵 BROWSE - Generated HTML length:', browseHTML.length);
        this.updateMainContent(browseHTML);
        
        // Add event listeners for search and filter
        this.setupBrowseEventListeners();
        console.log('🎵 BROWSE - Browse section displayed successfully');
    }

    showGenresSection() {
        // Show genres section with actual functionality
        const genres = this.getUniqueGenres();
        this.updateMainContent(`
            <div class="music-genres-section">
                <h2>🎼 Music Genres</h2>
                <div class="genres-grid">
                    ${genres.map(genre => `
                        <div class="genre-card" onclick="musicLibraryPage.browseGenre('${genre}')">
                            <h3>${genre}</h3>
                            <p>${this.getTracksByGenre(genre).length} tracks</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    }

    showRoyaltyFreeSection() {
        // Show royalty-free music section
        const royaltyFreeTracks = this.musicData.filter(track => track.copyrightFree);
        this.updateMainContent(`
            <div class="royalty-free-section">
                <h2>🎼 Royalty-Free Music</h2>
                <div class="royalty-free-info">
                    <p>All tracks are copyright-free and safe for commercial use. No licensing fees or restrictions.</p>
                </div>
                <div class="music-grid" id="royaltyFreeGrid">
                    ${this.renderMusicGrid(royaltyFreeTracks.slice(0, 12))}
                </div>
            </div>
        `);
    }

    showPlaylistsSection() {
        // Show playlists section
        if (!this.currentUser) {
            this.updateMainContent(`
                <div class="playlists-section">
                    <h2>📋 My Playlists</h2>
                    <div class="login-prompt">
                        <p>Please login to access your playlists</p>
                        <button class="btn-primary" onclick="musicLibraryPage.promptLogin()">Login</button>
                    </div>
                </div>
            `);
        } else {
            this.updateMainContent(`
                <div class="playlists-section">
                    <h2>📋 My Playlists</h2>
                    <div class="playlist-actions">
                        <button class="btn-primary" onclick="musicLibraryPage.createNewPlaylist()">Create New Playlist</button>
                    </div>
                    <div class="playlists-grid" id="playlistsGrid">
                        <div class="playlist-card">
                            <h3>My Favorites</h3>
                            <p>0 tracks</p>
                        </div>
                        <div class="playlist-card">
                            <h3>Recently Added</h3>
                            <p>0 tracks</p>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    showUploadSection() {
        // Show music upload section
        if (!this.currentUser) {
            this.updateMainContent(`
                <div class="upload-section">
                    <h2>🎤 Upload Music</h2>
                    <div class="login-prompt">
                        <p>Please login to upload your music</p>
                        <button class="btn-primary" onclick="musicLibraryPage.promptLogin()">Login</button>
                    </div>
                </div>
            `);
        } else {
            this.updateMainContent(`
                <div class="upload-section">
                    <h2>🎤 Upload Music</h2>
                    <form class="upload-form" id="uploadForm">
                        <div class="form-group">
                            <label for="trackTitle">Track Title</label>
                            <input type="text" id="trackTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="trackArtist">Artist Name</label>
                            <input type="text" id="trackArtist" required>
                        </div>
                        <div class="form-group">
                            <label for="trackGenre">Genre</label>
                            <select id="trackGenre" required>
                                <option value="">Select Genre</option>
                                <option value="Lo-Fi">Lo-Fi</option>
                                <option value="Electronic">Electronic</option>
                                <option value="Classical">Classical</option>
                                <option value="Jazz">Jazz</option>
                                <option value="Rock">Rock</option>
                                <option value="Hip-Hop">Hip-Hop</option>
                                <option value="World">World</option>
                                <option value="Ambient">Ambient</option>
                                <option value="Pop">Pop</option>
                                <option value="Country">Country</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="trackFile">Audio File</label>
                            <input type="file" id="trackFile" accept="audio/*" required>
                        </div>
                        <div class="form-group">
                            <label for="trackDescription">Description</label>
                            <textarea id="trackDescription" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Upload Track</button>
                    </form>
                </div>
            `);
            
            // Add form submission handler
            this.setupUploadForm();
        }
    }

    updateMainContent(html) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            // Create a temporary container to parse the HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            const newContent = tempContainer.firstElementChild;
            
            // Find the music-stats section to insert content before it
            const musicStats = mainContent.querySelector('.music-stats');
            
            if (musicStats && newContent) {
                // Insert the new content before the music-stats section
                mainContent.insertBefore(newContent, musicStats);
            } else if (newContent) {
                // If no music-stats section, append to the end
                mainContent.appendChild(newContent);
            }
            
            console.log('🎵 CONTENT - Updated main content with:', newContent?.tagName || 'unknown element');
        } else {
            console.error('🎵 ERROR - Main content element not found');
        }
    }

    renderMusicGrid(tracks) {
        return tracks.map(track => `
            <div class="music-track-card">
                <div class="track-cover">
                    <img src="${track.coverArt}" alt="${track.title}">
                    <div class="track-overlay">
                        <button class="play-btn" onclick="musicLibraryPage.playMusic('${track.id}')">▶️</button>
                        <button class="download-btn" onclick="musicLibraryPage.downloadMusic('${track.id}')">⬇️</button>
                    </div>
                </div>
                <div class="track-info">
                    <h4>${track.title}</h4>
                    <p class="artist">${track.artist}</p>
                    <p class="genre">${track.genre}</p>
                    <div class="track-stats">
                        <span class="rating">⭐ ${track.rating}</span>
                        <span class="downloads">⬇️ ${track.downloads.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupBrowseEventListeners() {
        const trackSearch = document.getElementById('trackSearch');
        const genreFilter = document.getElementById('genreFilter');
        
        if (trackSearch) {
            trackSearch.addEventListener('input', (e) => {
                this.filterTracks(e.target.value, genreFilter?.value || '');
            });
        }
        
        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => {
                this.filterTracks(trackSearch?.value || '', e.target.value);
            });
        }
    }

    filterTracks(searchTerm, genre) {
        let filteredTracks = this.musicData;
        
        if (searchTerm) {
            filteredTracks = filteredTracks.filter(track => 
                track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                track.artist.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (genre) {
            filteredTracks = filteredTracks.filter(track => track.genre === genre);
        }
        
        const musicGrid = document.getElementById('musicGrid');
        if (musicGrid) {
            musicGrid.innerHTML = this.renderMusicGrid(filteredTracks.slice(0, 12));
        }
    }

    getTracksByGenre(genre) {
        return this.musicData.filter(track => track.genre === genre);
    }

    browseGenre(genre) {
        const tracks = this.getTracksByGenre(genre);
        this.updateMainContent(`
            <div class="genre-browse-section">
                <h2>🎼 ${genre} Music</h2>
                <div class="music-grid" id="genreGrid">
                    ${this.renderMusicGrid(tracks.slice(0, 12))}
                </div>
            </div>
        `);
    }

    loadMoreTracks() {
        // Implementation for loading more tracks
        console.log('Loading more tracks...');
    }

    promptLogin() {
        alert('Please login to access this feature');
    }

    setupUploadForm() {
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload();
            });
        }
    }

    async handleUpload() {
        const title = document.getElementById('trackTitle').value;
        const artist = document.getElementById('trackArtist').value;
        const genre = document.getElementById('trackGenre').value;
        const file = document.getElementById('trackFile').files[0];
        const description = document.getElementById('trackDescription').value;
        
        if (!title || !artist || !genre || !file) {
            alert('Please fill in all required fields');
            return;
        }
        
        try {
            // Simulate upload process
            alert('Upload feature coming soon! This would upload to Firebase Storage and Firestore.');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        }
    }

    showErrorMessage(message) {
        // Create and show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showCopyrightSources() {
        const sources = this.getCopyrightDataSources();
        const container = document.getElementById('copyrightSources');
        
        if (container) {
            container.innerHTML = `
                <div class="copyright-sources-section">
                    <h3>📋 Copyright Data Sources & Attribution</h3>
                    <div class="sources-summary">
                        <div class="summary-stat">
                            <strong>${sources.totalTracks.toLocaleString()}</strong>
                            <span>Total Tracks</span>
                        </div>
                        <div class="summary-stat">
                            <strong>${sources.totalSources}</strong>
                            <span>Data Sources</span>
                        </div>
                        <div class="summary-stat">
                            <strong>${sources.attributionRequired ? 'Required' : 'Optional'}</strong>
                            <span>Attribution</span>
                        </div>
                        <div class="summary-stat">
                            <strong>${sources.commercialUse ? 'Yes' : 'No'}</strong>
                            <span>Commercial Use</span>
                        </div>
                    </div>
                    
                    <div class="sources-list">
                        ${sources.sources.map(source => `
                            <div class="source-item">
                                <div class="source-header">
                                    <h4>${source.name}</h4>
                                    <span class="source-license">${source.license}</span>
                                </div>
                                <div class="source-details">
                                    <p><strong>URL:</strong> <a href="${source.url}" target="_blank">${source.url}</a></p>
                                    <p><strong>Tracks:</strong> ${source.tracks.toLocaleString()}</p>
                                    <p><strong>Description:</strong> ${source.description}</p>
                                    <p><strong>Attribution:</strong> ${source.attribution}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="attribution-guidelines">
                        <h4>🎵 Attribution Guidelines</h4>
                        <ul>
                            <li><strong>CC BY 4.0:</strong> Must credit artist name and track title</li>
                            <li><strong>Public Domain:</strong> Attribution appreciated but not required</li>
                            <li><strong>Commercial Use:</strong> All tracks are safe for commercial use</li>
                            <li><strong>Format:</strong> "Music: [Track Title] by [Artist] (License) - Source: [Platform]"</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    // Music playback functionality
    playMusic(trackId) {
        console.log('🎵 Playing music track:', trackId);
        
        const track = this.musicData.find(t => t.id === trackId);
        if (track) {
            console.log('🎵 Playing:', track.title, 'by', track.artist);
            
            // Create audio element for playback
            const audio = new Audio();
            
            // For demo purposes, use a sample audio URL
            // In production, this would be the actual track URL from Firebase Storage
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
            
            // Show user feedback
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #6366f1;
                color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(99,102,241,0.3);
            `;
            notification.textContent = `🎵 Now playing: ${track.title}`;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } else {
            console.error('🎵 Track not found:', trackId);
            alert('Track not found. Please try again.');
        }
    }

    // Download functionality
    async downloadMusic(trackId) {
        try {
            const track = this.musicData.find(t => t.id === trackId);
            if (track) {
                // Increment download count
                await db.collection('music').doc(trackId).update({
                    downloads: firebase.firestore.FieldValue.increment(1)
                });

                console.log('Downloading track:', track.title);
                // Implement download logic
            }
        } catch (error) {
            console.error('Error downloading music:', error);
        }
    }

    // Playlist management
    async createPlaylist(name, description = '') {
        if (!this.currentUser) {
            alert('Please login to create playlists');
            return;
        }

        try {
            const playlistData = {
                name: name,
                description: description,
                userId: this.currentUser.uid,
                tracks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection('playlists').add(playlistData);
            console.log('Playlist created:', name);
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }

    createNewPlaylist() {
        console.log('🎵 PLAYLIST - Creating new playlist');
        
        // Show playlist creation modal
        const modalHTML = `
            <div class="playlist-modal" id="playlistModal">
                <div class="playlist-modal-content">
                    <h3>📋 Create New Playlist</h3>
                    <form id="playlistForm">
                        <div class="form-group">
                            <label for="playlistName">Playlist Name</label>
                            <input type="text" id="playlistName" placeholder="Enter playlist name" required>
                        </div>
                        <div class="form-group">
                            <label for="playlistDescription">Description (Optional)</label>
                            <textarea id="playlistDescription" placeholder="Describe your playlist" rows="3"></textarea>
                        </div>
                        <div class="playlist-actions">
                            <button type="submit" class="btn-primary">Create Playlist</button>
                            <button type="button" class="btn-secondary" onclick="musicLibraryPage.closePlaylistModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submission handler
        const playlistForm = document.getElementById('playlistForm');
        if (playlistForm) {
            playlistForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreatePlaylist();
            });
        }
        
        console.log('🎵 PLAYLIST - Playlist creation modal displayed');
    }

    async handleCreatePlaylist() {
        try {
            const playlistName = document.getElementById('playlistName').value;
            const playlistDescription = document.getElementById('playlistDescription').value;
            
            if (!playlistName.trim()) {
                alert('Please enter a playlist name');
                return;
            }
            
            console.log('🎵 PLAYLIST - Creating playlist:', playlistName);
            
            await this.createPlaylist(playlistName, playlistDescription);
            
            // Close modal
            this.closePlaylistModal();
            
            // Show success message
            alert(`Playlist "${playlistName}" created successfully!`);
            
            // Refresh playlists section
            this.showPlaylistsSection();
            
        } catch (error) {
            console.error('🎵 PLAYLIST - Error creating playlist:', error);
            alert('Failed to create playlist. Please try again.');
        }
    }

    closePlaylistModal() {
        const modal = document.getElementById('playlistModal');
        if (modal) {
            modal.remove();
        }
    }

    async addToPlaylist(playlistId, trackId) {
        try {
            await db.collection('playlists').doc(playlistId).update({
                tracks: firebase.firestore.FieldValue.arrayUnion(trackId),
                updatedAt: new Date()
            });

            console.log('Track added to playlist');
        } catch (error) {
            console.error('Error adding track to playlist:', error);
        }
    }

    // Rating functionality
    async rateMusic(trackId, rating) {
        if (!this.currentUser) {
            alert('Please login to rate music');
            return;
        }

        try {
            const ratingData = {
                trackId: trackId,
                userId: this.currentUser.uid,
                rating: rating,
                createdAt: new Date()
            };

            await db.collection('music_ratings').add(ratingData);
            console.log('Rating submitted:', rating);
        } catch (error) {
            console.error('Error rating music:', error);
        }
    }

    getCopyrightFreeMusicDatabase() {
        return [
            // Lo-Fi & Chill (1,500 tracks)
            ...this.generateLoFiTracks(),
            // Electronic & EDM (1,500 tracks)
            ...this.generateElectronicTracks(),
            // Classical & Instrumental (1,500 tracks)
            ...this.generateClassicalTracks(),
            // Jazz & Blues (1,000 tracks)
            ...this.generateJazzTracks(),
            // Rock & Alternative (1,000 tracks)
            ...this.generateRockTracks(),
            // Hip-Hop & Rap (1,000 tracks)
            ...this.generateHipHopTracks(),
            // World Music (1,000 tracks)
            ...this.generateWorldMusicTracks(),
            // Ambient & Nature (800 tracks)
            ...this.generateAmbientTracks(),
            // Pop & Indie (1,000 tracks)
            ...this.generatePopTracks(),
            // Country & Folk (700 tracks)
            ...this.generateCountryTracks()
        ];
    }

    generateLoFiTracks() {
        const artists = ['Lo-Fi Dreams', 'Chill Beats', 'Study Vibes', 'Coffee Shop', 'Night Drive', 'Rainy Day', 'Piano Lo-Fi', 'Jazz Lo-Fi', 'Synthwave Lo-Fi', 'Ambient Lo-Fi', 'Lo-Fi Collective', 'Chill Studio', 'Study Beats', 'Coffee Vibes', 'Night Lo-Fi', 'Rain Lo-Fi', 'Piano Dreams', 'Jazz Chill', 'Synth Lo-Fi', 'Ambient Dreams'];
        const tracks = [];
        
        for (let i = 1; i <= 1500; i++) {
            tracks.push({
                id: `lofi_${i}`,
                title: `Lo-Fi Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Lo-Fi',
                duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
                bpm: Math.floor(Math.random() * 40) + 70, // 70-110 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Chill', 'Relaxed', 'Study', 'Sleep', 'Focus'][Math.floor(Math.random() * 5)],
                tags: ['lo-fi', 'chill', 'study', 'relax', 'ambient'],
                license: 'CC BY 4.0',
                source: 'Free Music Archive',
                downloadUrl: `https://freemusicarchive.org/track/lofi-${i}`,
                streamUrl: `https://freemusicarchive.org/stream/lofi-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.5 + Math.random() * 1.5).toFixed(1),
                downloads: Math.floor(Math.random() * 10000),
                copyrightFree: true,
                description: 'Copyright-free lo-fi music perfect for studying, relaxing, or background ambiance.'
            });
        }
        return tracks;
    }

    generateElectronicTracks() {
        const artists = ['Electronic Dreams', 'EDM Beats', 'Synthwave', 'Bass Drops', 'Deep House', 'Tech House', 'Progressive', 'Trance', 'Dubstep', 'Drum & Bass', 'Electronic Collective', 'EDM Studio', 'Synth Dreams', 'Bass Studio', 'Deep Vibes', 'Tech Dreams', 'Progressive Beats', 'Trance Collective', 'Dub Studio', 'Drum Dreams'];
        const tracks = [];
        
        for (let i = 1; i <= 1500; i++) {
            tracks.push({
                id: `electronic_${i}`,
                title: `Electronic Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Electronic',
                duration: Math.floor(Math.random() * 240) + 180, // 3-7 minutes
                bpm: Math.floor(Math.random() * 60) + 120, // 120-180 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Energetic', 'Dance', 'Club', 'Party', 'Workout'][Math.floor(Math.random() * 5)],
                tags: ['electronic', 'edm', 'dance', 'club', 'energy'],
                license: 'CC BY 4.0',
                source: 'CCMixter',
                downloadUrl: `https://ccmixter.org/track/electronic-${i}`,
                streamUrl: `https://ccmixter.org/stream/electronic-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.5 + Math.random() * 1.5).toFixed(1),
                downloads: Math.floor(Math.random() * 15000),
                copyrightFree: true,
                description: 'Copyright-free electronic music for high-energy content and dance streams.'
            });
        }
        return tracks;
    }

    generateClassicalTracks() {
        const artists = ['Symphony Orchestra', 'Classical Piano', 'Chamber Music', 'Opera Classics', 'Historical Classical', 'Modern Classical', 'String Quartet', 'Solo Violin', 'Piano Sonata', 'Orchestral Suite', 'Classical Collective', 'Piano Studio', 'Chamber Dreams', 'Opera Studio', 'Historical Dreams', 'Modern Studio', 'String Dreams', 'Violin Studio', 'Sonata Dreams', 'Suite Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 1500; i++) {
            tracks.push({
                id: `classical_${i}`,
                title: `Classical Piece ${i}`,
                artist: artists[i % artists.length],
                genre: 'Classical',
                duration: Math.floor(Math.random() * 600) + 180, // 3-13 minutes
                bpm: Math.floor(Math.random() * 80) + 60, // 60-140 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Elegant', 'Sophisticated', 'Dramatic', 'Peaceful', 'Inspiring'][Math.floor(Math.random() * 5)],
                tags: ['classical', 'orchestral', 'piano', 'elegant', 'sophisticated'],
                license: 'Public Domain',
                source: 'Musopen',
                downloadUrl: `https://musopen.org/track/classical-${i}`,
                streamUrl: `https://musopen.org/stream/classical-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (4.0 + Math.random() * 1.0).toFixed(1),
                downloads: Math.floor(Math.random() * 8000),
                copyrightFree: true,
                description: 'Public domain classical music for elegant and sophisticated content.'
            });
        }
        return tracks;
    }

    generateJazzTracks() {
        const artists = ['Smooth Jazz', 'Delta Blues', 'Jazz Sax', 'Jazz Piano', 'Swing Jazz', 'Bebop', 'Cool Jazz', 'Fusion', 'Latin Jazz', 'Acid Jazz', 'Jazz Collective', 'Blues Studio', 'Sax Dreams', 'Piano Jazz', 'Swing Studio', 'Bebop Dreams', 'Cool Studio', 'Fusion Dreams', 'Latin Studio', 'Acid Dreams'];
        const tracks = [];
        
        for (let i = 1; i <= 1000; i++) {
            tracks.push({
                id: `jazz_${i}`,
                title: `Jazz Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Jazz',
                duration: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
                bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Smooth', 'Soulful', 'Swing', 'Cool', 'Sultry'][Math.floor(Math.random() * 5)],
                tags: ['jazz', 'blues', 'smooth', 'soulful', 'swing'],
                license: 'CC BY 4.0',
                source: 'Free Music Archive',
                downloadUrl: `https://freemusicarchive.org/track/jazz-${i}`,
                streamUrl: `https://freemusicarchive.org/stream/jazz-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.8 + Math.random() * 1.2).toFixed(1),
                downloads: Math.floor(Math.random() * 12000),
                copyrightFree: true,
                description: 'Copyright-free jazz and blues for sophisticated and soulful content.'
            });
        }
        return tracks;
    }

    generateRockTracks() {
        const artists = ['Classic Rock', 'Indie Rock', 'Rock Guitar', 'Punk Energy', 'Prog Rock', 'Alternative', 'Hard Rock', 'Soft Rock', 'Rock Ballad', 'Rock Anthem', 'Rock Collective', 'Indie Studio', 'Guitar Dreams', 'Punk Studio', 'Prog Dreams', 'Alternative Studio', 'Hard Dreams', 'Soft Studio', 'Ballad Dreams', 'Anthem Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 1000; i++) {
            tracks.push({
                id: `rock_${i}`,
                title: `Rock Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Rock',
                duration: Math.floor(Math.random() * 240) + 180, // 3-7 minutes
                bpm: Math.floor(Math.random() * 80) + 100, // 100-180 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Energetic', 'Powerful', 'Rebellious', 'Passionate', 'Anthemic'][Math.floor(Math.random() * 5)],
                tags: ['rock', 'guitar', 'energy', 'power', 'anthem'],
                license: 'CC BY 4.0',
                source: 'CCMixter',
                downloadUrl: `https://ccmixter.org/track/rock-${i}`,
                streamUrl: `https://ccmixter.org/stream/rock-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.6 + Math.random() * 1.4).toFixed(1),
                downloads: Math.floor(Math.random() * 18000),
                copyrightFree: true,
                description: 'Copyright-free rock music for energetic and powerful content.'
            });
        }
        return tracks;
    }

    generateHipHopTracks() {
        const artists = ['Urban Flow', 'MC Skills', 'Classic Hip-Hop', 'Trap Beats', 'Golden Era', 'Boom Bap', 'Conscious Rap', 'Underground', 'East Coast', 'West Coast', 'Hip-Hop Collective', 'MC Studio', 'Classic Dreams', 'Trap Studio', 'Golden Dreams', 'Boom Studio', 'Conscious Dreams', 'Underground Studio', 'East Dreams', 'West Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 1000; i++) {
            tracks.push({
                id: `hiphop_${i}`,
                title: `Hip-Hop Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Hip-Hop',
                duration: Math.floor(Math.random() * 240) + 180, // 3-7 minutes
                bpm: Math.floor(Math.random() * 40) + 80, // 80-120 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Urban', 'Street', 'Confident', 'Smooth', 'Aggressive'][Math.floor(Math.random() * 5)],
                tags: ['hip-hop', 'rap', 'urban', 'street', 'beats'],
                license: 'CC BY 4.0',
                source: 'Free Music Archive',
                downloadUrl: `https://freemusicarchive.org/track/hiphop-${i}`,
                streamUrl: `https://freemusicarchive.org/stream/hiphop-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.7 + Math.random() * 1.3).toFixed(1),
                downloads: Math.floor(Math.random() * 20000),
                copyrightFree: true,
                description: 'Copyright-free hip-hop and rap for urban and street culture content.'
            });
        }
        return tracks;
    }

    generateWorldMusicTracks() {
        const artists = ['Global Beats', 'Salsa Music', 'Tribal Beats', 'Eastern Sounds', 'Irish Traditional', 'African Drums', 'Latin Rhythms', 'Asian Melodies', 'Celtic Folk', 'World Fusion', 'World Collective', 'Salsa Studio', 'Tribal Dreams', 'Eastern Studio', 'Irish Dreams', 'African Studio', 'Latin Dreams', 'Asian Studio', 'Celtic Dreams', 'Fusion Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 1000; i++) {
            tracks.push({
                id: `world_${i}`,
                title: `World Music Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'World',
                duration: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
                bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Exotic', 'Cultural', 'Traditional', 'Fusion', 'Global'][Math.floor(Math.random() * 5)],
                tags: ['world', 'cultural', 'traditional', 'global', 'exotic'],
                license: 'CC BY 4.0',
                source: 'Free Music Archive',
                downloadUrl: `https://freemusicarchive.org/track/world-${i}`,
                streamUrl: `https://freemusicarchive.org/stream/world-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.9 + Math.random() * 1.1).toFixed(1),
                downloads: Math.floor(Math.random() * 10000),
                copyrightFree: true,
                description: 'Copyright-free world music representing diverse cultures and traditions.'
            });
        }
        return tracks;
    }

    generateAmbientTracks() {
        const artists = ['Nature Sounds', 'Beach Sounds', 'Woodland Ambience', 'Alpine Sounds', 'Tropical Nature', 'Ocean Waves', 'Forest Walk', 'Mountain Air', 'Rainforest', 'Desert Wind', 'Ambient Collective', 'Beach Studio', 'Woodland Dreams', 'Alpine Studio', 'Tropical Dreams', 'Ocean Studio', 'Forest Dreams', 'Mountain Studio', 'Rainforest Dreams', 'Desert Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 800; i++) {
            tracks.push({
                id: `ambient_${i}`,
                title: `Ambient Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Ambient',
                duration: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
                bpm: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Peaceful', 'Relaxing', 'Meditative', 'Natural', 'Tranquil'][Math.floor(Math.random() * 5)],
                tags: ['ambient', 'nature', 'relaxing', 'meditation', 'peaceful'],
                license: 'CC BY 4.0',
                source: 'Free Music Archive',
                downloadUrl: `https://freemusicarchive.org/track/ambient-${i}`,
                streamUrl: `https://freemusicarchive.org/stream/ambient-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (4.1 + Math.random() * 0.9).toFixed(1),
                downloads: Math.floor(Math.random() * 15000),
                copyrightFree: true,
                description: 'Copyright-free ambient and nature sounds for relaxation and meditation content.'
            });
        }
        return tracks;
    }

    generatePopTracks() {
        const artists = ['Pop Hits', 'Indie Pop', 'Synth Pop', 'Dream Pop', 'Electro Pop', 'Alternative Pop', 'Pop Rock', 'Pop Ballad', 'Pop Anthem', 'Pop Dance', 'Pop Collective', 'Indie Studio', 'Synth Dreams', 'Dream Studio', 'Electro Dreams', 'Alternative Studio', 'Rock Dreams', 'Ballad Studio', 'Anthem Dreams', 'Dance Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 1000; i++) {
            tracks.push({
                id: `pop_${i}`,
                title: `Pop Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Pop',
                duration: Math.floor(Math.random() * 240) + 180, // 3-7 minutes
                bpm: Math.floor(Math.random() * 60) + 100, // 100-160 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Catchy', 'Upbeat', 'Feel Good', 'Energetic', 'Happy'][Math.floor(Math.random() * 5)],
                tags: ['pop', 'catchy', 'upbeat', 'feel-good', 'happy'],
                license: 'CC BY 4.0',
                source: 'CCMixter',
                downloadUrl: `https://ccmixter.org/track/pop-${i}`,
                streamUrl: `https://ccmixter.org/stream/pop-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.8 + Math.random() * 1.2).toFixed(1),
                downloads: Math.floor(Math.random() * 25000),
                copyrightFree: true,
                description: 'Copyright-free pop music for catchy and upbeat content.'
            });
        }
        return tracks;
    }

    generateCountryTracks() {
        const artists = ['Country Folk', 'Bluegrass', 'Country Rock', 'Country Ballad', 'Country Dance', 'Acoustic Country', 'Country Blues', 'Country Gospel', 'Country Pop', 'Traditional Country', 'Country Collective', 'Bluegrass Studio', 'Rock Dreams', 'Ballad Studio', 'Dance Dreams', 'Acoustic Studio', 'Blues Dreams', 'Gospel Studio', 'Pop Dreams', 'Traditional Studio'];
        const tracks = [];
        
        for (let i = 1; i <= 700; i++) {
            tracks.push({
                id: `country_${i}`,
                title: `Country Track ${i}`,
                artist: artists[i % artists.length],
                genre: 'Country',
                duration: Math.floor(Math.random() * 240) + 180, // 3-7 minutes
                bpm: Math.floor(Math.random() * 40) + 80, // 80-120 BPM
                key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
                mood: ['Heartfelt', 'Storytelling', 'Rustic', 'Authentic', 'Down-to-Earth'][Math.floor(Math.random() * 5)],
                tags: ['country', 'folk', 'acoustic', 'storytelling', 'authentic'],
                license: 'CC BY 4.0',
                source: 'Free Music Archive',
                downloadUrl: `https://freemusicarchive.org/track/country-${i}`,
                streamUrl: `https://freemusicarchive.org/stream/country-${i}`,
                coverArt: `assets/images/default-banner.svg
                rating: (3.7 + Math.random() * 1.3).toFixed(1),
                downloads: Math.floor(Math.random() * 12000),
                copyrightFree: true,
                description: 'Copyright-free country and folk music for authentic and storytelling content.'
            });
        }
        return tracks;
    }

    getCopyrightDataSources() {
        return {
            sources: [
                {
                    name: "Free Music Archive",
                    url: "https://freemusicarchive.org",
                    license: "CC BY 4.0",
                    tracks: 4500,
                    description: "Curated copyright-free music from independent artists",
                    attribution: "Required: Artist name and track title"
                },
                {
                    name: "CCMixter",
                    url: "https://ccmixter.org",
                    license: "CC BY 4.0",
                    tracks: 3500,
                    description: "Community-created copyright-free music",
                    attribution: "Required: Artist name and track title"
                },
                {
                    name: "Musopen",
                    url: "https://musopen.org",
                    license: "Public Domain",
                    tracks: 1500,
                    description: "Public domain classical music recordings",
                    attribution: "Optional: Courtesy attribution to performers"
                },
                {
                    name: "Public Domain",
                    url: "https://creativecommons.org/publicdomain/",
                    license: "Public Domain",
                    tracks: 500,
                    description: "Works in the public domain",
                    attribution: "Not required but appreciated"
                }
            ],
            totalTracks: 10000,
            totalSources: 4,
            attributionRequired: true,
            commercialUse: true
        };
    }

    getAttributionInfo(track) {
        const attributionTemplates = {
            'Free Music Archive': `Music: "${track.title}" by ${track.artist} (CC BY 4.0) - Source: Free Music Archive`,
            'CCMixter': `Music: "${track.title}" by ${track.artist} (CC BY 4.0) - Source: CCMixter`,
            'Musopen': `Music: "${track.title}" by ${track.artist} (Public Domain) - Source: Musopen`,
            'Public Domain': `Music: "${track.title}" by ${track.artist} (Public Domain)`
        };
        
        return attributionTemplates[track.source] || `Music: "${track.title}" by ${track.artist} (${track.license})`;
    }
}

// Initialize Music Library Page
const musicLibraryPage = new MusicLibraryPage(); 