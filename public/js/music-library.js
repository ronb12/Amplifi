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
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.loadMusicLibrary();
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

            this.updateMusicStats();
            this.renderMusicCategories();
        } catch (error) {
            console.error('Error loading music library:', error);
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
        // Handle navigation to different music sections
        switch (section) {
            case 'browse':
                this.showBrowseSection();
                break;
            case 'genres':
                this.showGenresSection();
                break;
            case 'royalty-free':
                this.showRoyaltyFreeSection();
                break;
            case 'playlists':
                this.showPlaylistsSection();
                break;
            case 'upload':
                this.showUploadSection();
                break;
            default:
                console.log('Unknown section:', section);
        }
    }

    handleMusicAction(action) {
        // Handle music action buttons
        switch (action) {
            case 'browse':
                this.showBrowseSection();
                break;
            case 'upload':
                this.showUploadSection();
                break;
            case 'playlists':
                this.showPlaylistsSection();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    showBrowseSection() {
        // Show music browse section
        console.log('Showing browse section');
        // This would update the UI to show the browse section
    }

    showGenresSection() {
        // Show genres section
        console.log('Showing genres section');
        // This would update the UI to show genres
    }

    showRoyaltyFreeSection() {
        // Show royalty-free music section
        console.log('Showing royalty-free section');
        // This would update the UI to show royalty-free tracks
    }

    showPlaylistsSection() {
        // Show playlists section
        console.log('Showing playlists section');
        // This would update the UI to show user playlists
    }

    showUploadSection() {
        // Show music upload section
        console.log('Showing upload section');
        // This would update the UI to show upload form
    }

    // Music playback functionality
    playMusic(trackId) {
        const track = this.musicData.find(t => t.id === trackId);
        if (track) {
            console.log('Playing track:', track.title);
            // Implement music playback logic
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
}

// Initialize Music Library Page
const musicLibraryPage = new MusicLibraryPage(); 