/* global db, auth, firebase, storage */
// Settings Page JavaScript
class SettingsPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.currentTab = 'profile';
        
        this.init();
    }

    async init() {
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                this.loadSettings();
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

    checkAuthentication() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Settings navigation
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Profile form
        const profileForm = document.getElementById('profileSettingsForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfileSettings();
            });
        }

        // Bio character count
        const profileBio = document.getElementById('profileBio');
        if (profileBio) {
            profileBio.addEventListener('input', (e) => {
                this.updateBioCharCount(e.target.value.length);
            });
        }

        // Privacy settings
        const savePrivacyBtn = document.getElementById('savePrivacyBtn');
        if (savePrivacyBtn) {
            savePrivacyBtn.addEventListener('click', () => {
                this.savePrivacySettings();
            });
        }

        // Notification settings
        const saveNotificationBtn = document.getElementById('saveNotificationBtn');
        if (saveNotificationBtn) {
            saveNotificationBtn.addEventListener('click', () => {
                this.saveNotificationSettings();
            });
        }

        // Security settings
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.changePassword();
            });
        }

        const setup2FABtn = document.getElementById('setup2FABtn');
        if (setup2FABtn) {
            setup2FABtn.addEventListener('click', () => {
                this.setupTwoFactorAuth();
            });
        }

        // Monetization settings
        const saveMonetizationBtn = document.getElementById('saveMonetizationBtn');
        if (saveMonetizationBtn) {
            saveMonetizationBtn.addEventListener('click', () => {
                this.saveMonetizationSettings();
            });
        }

        // Account actions
        const deactivateAccountBtn = document.getElementById('deactivateAccountBtn');
        if (deactivateAccountBtn) {
            deactivateAccountBtn.addEventListener('click', () => {
                this.deactivateAccount();
            });
        }

        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.deleteAccount();
            });
        }

        // File uploads
        const profilePic = document.getElementById('profilePic');
        if (profilePic) {
            profilePic.addEventListener('change', (e) => {
                this.handleProfilePicUpload(e.target.files[0]);
            });
        }

        const profileBanner = document.getElementById('profileBanner');
        if (profileBanner) {
            profileBanner.addEventListener('change', (e) => {
                this.handleBannerUpload(e.target.files[0]);
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.settings-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}Tab`);
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        this.currentTab = tabName;
    }

    loadSettings() {
        this.loadProfileSettings();
        this.loadPrivacySettings();
        this.loadNotificationSettings();
        this.loadSecuritySettings();
        this.loadMonetizationSettings();
        this.loadAccountInfo();
    }

    loadProfileSettings() {
        if (!this.userProfile) return;

        const displayName = document.getElementById('profileDisplayName');
        const username = document.getElementById('profileUsername');
        const bio = document.getElementById('profileBio');
        const location = document.getElementById('profileLocation');
        const website = document.getElementById('profileWebsite');

        if (displayName) displayName.value = this.userProfile.displayName || '';
        if (username) username.value = this.userProfile.username || '';
        if (bio) {
            bio.value = this.userProfile.bio || '';
            this.updateBioCharCount(bio.value.length);
        }
        if (location) location.value = this.userProfile.location || '';
        if (website) website.value = this.userProfile.website || '';
    }

    loadPrivacySettings() {
        if (!this.userProfile) return;

        const privateProfile = document.getElementById('privateProfile');
        const allowComments = document.getElementById('allowComments');
        const allowMessages = document.getElementById('allowMessages');
        const showOnlineStatus = document.getElementById('showOnlineStatus');

        if (privateProfile) privateProfile.checked = this.userProfile.privateProfile || false;
        if (allowComments) allowComments.checked = this.userProfile.allowComments !== false;
        if (allowMessages) allowMessages.checked = this.userProfile.allowMessages !== false;
        if (showOnlineStatus) showOnlineStatus.checked = this.userProfile.showOnlineStatus !== false;
    }

    loadNotificationSettings() {
        if (!this.userProfile) return;

        const notifyComments = document.getElementById('notifyComments');
        const notifyLikes = document.getElementById('notifyLikes');
        const notifyMessages = document.getElementById('notifyMessages');
        const notifyTips = document.getElementById('notifyTips');
        const notifyFollowers = document.getElementById('notifyFollowers');
        const notifyLive = document.getElementById('notifyLive');

        const notifications = this.userProfile.notifications || {};

        if (notifyComments) notifyComments.checked = notifications.comments !== false;
        if (notifyLikes) notifyLikes.checked = notifications.likes !== false;
        if (notifyMessages) notifyMessages.checked = notifications.messages !== false;
        if (notifyTips) notifyTips.checked = notifications.tips !== false;
        if (notifyFollowers) notifyFollowers.checked = notifications.followers !== false;
        if (notifyLive) notifyLive.checked = notifications.live !== false;
    }

    loadSecuritySettings() {
        const accountEmail = document.getElementById('accountEmail');
        const accountCreated = document.getElementById('accountCreated');
        const lastLogin = document.getElementById('lastLogin');

        if (accountEmail) accountEmail.value = this.currentUser.email || '';
        if (accountCreated) {
            // Handle both Firestore timestamps and regular Date objects
            const createdAt = this.userProfile?.createdAt;
            const createdDate = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
            accountCreated.value = createdDate ? createdDate.toLocaleDateString() : 'Unknown';
        }
        if (lastLogin) lastLogin.value = this.currentUser.metadata?.lastSignInTime ? new Date(this.currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown';
    }

    loadMonetizationSettings() {
        if (!this.userProfile) return;

        const enableTips = document.getElementById('enableTips');
        const enableAds = document.getElementById('enableAds');
        const payoutEmail = document.getElementById('payoutEmail');
        const payoutThreshold = document.getElementById('payoutThreshold');

        const monetization = this.userProfile.monetization || {};

        if (enableTips) enableTips.checked = monetization.enableTips !== false;
        if (enableAds) enableAds.checked = monetization.enableAds !== false;
        if (payoutEmail) payoutEmail.value = monetization.payoutEmail || '';
        if (payoutThreshold) payoutThreshold.value = monetization.payoutThreshold || '50';
    }

    loadAccountInfo() {
        // Account info is loaded in loadSecuritySettings
    }

    updateBioCharCount(count) {
        const charCount = document.getElementById('bioCharCount');
        if (charCount) {
            charCount.textContent = count;
            if (count > 450) {
                charCount.style.color = '#ef4444';
            } else if (count > 400) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = '#6b7280';
            }
        }
    }

    async saveProfileSettings() {
        try {
            const displayName = document.getElementById('profileDisplayName').value.trim();
            const username = document.getElementById('profileUsername').value.trim();
            const bio = document.getElementById('profileBio').value.trim();
            const location = document.getElementById('profileLocation').value.trim();
            const website = document.getElementById('profileWebsite').value.trim();

            if (!displayName) {
                alert('Display name is required');
                return;
            }

            if (!username) {
                alert('Username is required');
                return;
            }

            // Check if username is available (if changed)
            if (username !== this.userProfile.username) {
                const usernameCheck = await db.collection('users').where('username', '==', username).get();
                if (!usernameCheck.empty) {
                    alert('Username already taken. Please choose another.');
                    return;
                }
            }

            const updateData = {
                displayName: displayName,
                username: username,
                bio: bio,
                location: location,
                website: website,
                updatedAt: new Date()
            };

            await db.collection('users').doc(this.currentUser.uid).update(updateData);
            
            // Update local profile
            this.userProfile = { ...this.userProfile, ...updateData };

            alert('Profile settings saved successfully!');
        } catch (error) {
            console.error('Error saving profile settings:', error);
            alert('Failed to save profile settings. Please try again.');
        }
    }

    async savePrivacySettings() {
        try {
            const privateProfile = document.getElementById('privateProfile').checked;
            const allowComments = document.getElementById('allowComments').checked;
            const allowMessages = document.getElementById('allowMessages').checked;
            const showOnlineStatus = document.getElementById('showOnlineStatus').checked;

            const updateData = {
                privateProfile: privateProfile,
                allowComments: allowComments,
                allowMessages: allowMessages,
                showOnlineStatus: showOnlineStatus,
                updatedAt: new Date()
            };

            await db.collection('users').doc(this.currentUser.uid).update(updateData);
            
            // Update local profile
            this.userProfile = { ...this.userProfile, ...updateData };

            alert('Privacy settings saved successfully!');
        } catch (error) {
            console.error('Error saving privacy settings:', error);
            alert('Failed to save privacy settings. Please try again.');
        }
    }

    async saveNotificationSettings() {
        try {
            const notifications = {
                comments: document.getElementById('notifyComments').checked,
                likes: document.getElementById('notifyLikes').checked,
                messages: document.getElementById('notifyMessages').checked,
                tips: document.getElementById('notifyTips').checked,
                followers: document.getElementById('notifyFollowers').checked,
                live: document.getElementById('notifyLive').checked
            };

            const updateData = {
                notifications: notifications,
                updatedAt: new Date()
            };

            await db.collection('users').doc(this.currentUser.uid).update(updateData);
            
            // Update local profile
            this.userProfile = { ...this.userProfile, ...updateData };

            alert('Notification settings saved successfully!');
        } catch (error) {
            console.error('Error saving notification settings:', error);
            alert('Failed to save notification settings. Please try again.');
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        try {
            // Re-authenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.currentUser.email,
                currentPassword
            );
            await this.currentUser.reauthenticateWithCredential(credential);

            // Change password
            await this.currentUser.updatePassword(newPassword);

            // Clear form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            alert('Password changed successfully!');
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                alert('Current password is incorrect');
            } else {
                alert('Failed to change password. Please try again.');
            }
        }
    }

    setupTwoFactorAuth() {
        alert('Two-factor authentication setup will be implemented in a future update.');
    }

    async saveMonetizationSettings() {
        try {
            const monetization = {
                enableTips: document.getElementById('enableTips').checked,
                enableAds: document.getElementById('enableAds').checked,
                payoutEmail: document.getElementById('payoutEmail').value.trim(),
                payoutThreshold: document.getElementById('payoutThreshold').value
            };

            const updateData = {
                monetization: monetization,
                updatedAt: new Date()
            };

            await db.collection('users').doc(this.currentUser.uid).update(updateData);
            
            // Update local profile
            this.userProfile = { ...this.userProfile, ...updateData };

            alert('Monetization settings saved successfully!');
        } catch (error) {
            console.error('Error saving monetization settings:', error);
            alert('Failed to save monetization settings. Please try again.');
        }
    }

    async handleProfilePicUpload(file) {
        if (!file) return;

        try {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(`profile-pics/${this.currentUser.uid}/${Date.now()}_${file.name}`);
            
            const uploadTask = fileRef.put(file);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Upload progress
                },
                (error) => {
                    console.error('Error uploading profile picture:', error);
                    alert('Failed to upload profile picture');
                },
                async () => {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    
                    // Update user profile
                    await db.collection('users').doc(this.currentUser.uid).update({
                        profilePic: downloadURL,
                        updatedAt: new Date()
                    });

                    // Update local profile
                    this.userProfile.profilePic = downloadURL;

                    // Update avatar in header
                    const userAvatar = document.getElementById('userAvatar');
                    if (userAvatar) {
                        userAvatar.src = downloadURL;
                    }

                    alert('Profile picture updated successfully!');
                }
            );
        } catch (error) {
            console.error('Error handling profile picture upload:', error);
            alert('Failed to upload profile picture');
        }
    }

    async handleBannerUpload(file) {
        if (!file) return;

        try {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(`banners/${this.currentUser.uid}/${Date.now()}_${file.name}`);
            
            const uploadTask = fileRef.put(file);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Upload progress
                },
                (error) => {
                    console.error('Error uploading banner:', error);
                    alert('Failed to upload banner');
                },
                async () => {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    
                    // Update user profile
                    await db.collection('users').doc(this.currentUser.uid).update({
                        banner: downloadURL,
                        updatedAt: new Date()
                    });

                    // Update local profile
                    this.userProfile.banner = downloadURL;

                    alert('Banner updated successfully!');
                }
            );
        } catch (error) {
            console.error('Error handling banner upload:', error);
            alert('Failed to upload banner');
        }
    }

    async deactivateAccount() {
        if (confirm('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')) {
            try {
                await db.collection('users').doc(this.currentUser.uid).update({
                    deactivated: true,
                    deactivatedAt: new Date()
                });

                alert('Account deactivated successfully');
                await this.handleLogout();
            } catch (error) {
                console.error('Error deactivating account:', error);
                alert('Failed to deactivate account');
            }
        }
    }

    async deleteAccount() {
        if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
            const password = prompt('Please enter your password to confirm:');
            if (!password) return;

            try {
                // Re-authenticate user
                const credential = firebase.auth.EmailAuthProvider.credential(
                    this.currentUser.email,
                    password
                );
                await this.currentUser.reauthenticateWithCredential(credential);

                // Delete user data
                await db.collection('users').doc(this.currentUser.uid).delete();

                // Delete user account
                await this.currentUser.delete();

                alert('Account deleted successfully');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error deleting account:', error);
                if (error.code === 'auth/wrong-password') {
                    alert('Password is incorrect');
                } else {
                    alert('Failed to delete account. Please try again.');
                }
            }
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Initialize the settings page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsPage = new SettingsPage();
}); 