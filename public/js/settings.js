/* global db, auth, firebase, storage */
// Settings Page JavaScript
console.log('🔧 SETTINGS.JS LOADED - Starting settings page initialization');

class SettingsPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.currentTab = 'profile';
        
        this.init();
    }

    async init() {
        console.log('Initializing settings page...');
        this.setupEventListeners();
        
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await this.setupAuthStateListener();
    }

    async setupAuthStateListener() {
        console.log('Setting up auth state listener...');
        auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                this.loadSettings();
                
                // Check account status for recovery options
                await this.checkAccountStatus();
            } else {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
                // Only show login prompt if user is not authenticated
                this.showLoginPrompt();
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
            // Show login prompt instead of redirecting
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        // Check if modal already exists to prevent duplicates
        if (document.querySelector('.login-prompt-modal')) {
            return;
        }
        
        console.log('Showing login prompt modal');
        
        // Create a login prompt modal
        const modal = document.createElement('div');
        modal.className = 'login-prompt-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px;">
                <h3>Login Required</h3>
                <p>Please log in to access settings.</p>
                <button id="goToLoginBtn" style="background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Go to Login</button>
                <button id="cancelLoginBtn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('goToLoginBtn').addEventListener('click', () => {
            console.log('User clicked Go to Login');
            window.location.href = 'index.html';
        });
        
        document.getElementById('cancelLoginBtn').addEventListener('click', () => {
            console.log('User clicked Cancel');
            document.body.removeChild(modal);
        });
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

        // User avatar click - prevent navigation and show profile options
        const userAvatarContainer = document.getElementById('userAvatarContainer');
        if (userAvatarContainer) {
            userAvatarContainer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showProfileOptions();
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
                // Store account data for potential recovery
                const accountData = {
                    ...this.userProfile,
                    deactivated: true,
                    deactivatedAt: new Date(),
                    recoveryToken: this.generateRecoveryToken(),
                    canRecover: true
                };

                await db.collection('users').doc(this.currentUser.uid).update(accountData);

                // Store recovery info in separate collection
                await db.collection('accountRecovery').doc(this.currentUser.uid).set({
                    email: this.currentUser.email,
                    recoveryToken: accountData.recoveryToken,
                    deactivatedAt: accountData.deactivatedAt,
                    canRecover: true,
                    accountType: 'deactivated'
                });

                alert('Account deactivated successfully. You can reactivate it by logging in with your email and password.');
                await this.handleLogout();
            } catch (error) {
                console.error('Error deactivating account:', error);
                alert('Failed to deactivate account');
            }
        }
    }

    async deleteAccount() {
        if (confirm('Are you sure you want to delete your account? You can restore it within 30 days by contacting support.')) {
            const password = prompt('Please enter your password to confirm:');
            if (!password) return;

            try {
                // Re-authenticate user
                const credential = firebase.auth.EmailAuthProvider.credential(
                    this.currentUser.email,
                    password
                );
                await this.currentUser.reauthenticateWithCredential(credential);

                // Store account data for potential recovery (30-day grace period)
                const accountData = {
                    ...this.userProfile,
                    deleted: true,
                    deletedAt: new Date(),
                    recoveryToken: this.generateRecoveryToken(),
                    canRecover: true,
                    recoveryDeadline: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days
                };

                // Move to deleted accounts collection instead of deleting
                await db.collection('deletedAccounts').doc(this.currentUser.uid).set(accountData);

                // Store recovery info
                await db.collection('accountRecovery').doc(this.currentUser.uid).set({
                    email: this.currentUser.email,
                    recoveryToken: accountData.recoveryToken,
                    deletedAt: accountData.deletedAt,
                    canRecover: true,
                    accountType: 'deleted',
                    recoveryDeadline: accountData.recoveryDeadline
                });

                // Mark as deleted in users collection (soft delete)
                await db.collection('users').doc(this.currentUser.uid).update({
                    deleted: true,
                    deletedAt: new Date(),
                    canRecover: true
                });

                alert('Account deleted successfully. You can restore it within 30 days by logging in or contacting support.');
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

    showProfileOptions() {
        // Create a simple dropdown menu for profile options
        const options = [
            { text: 'View Profile', action: () => window.location.href = 'profile.html' },
            { text: 'Settings', action: () => this.switchTab('profile') },
            { text: 'Logout', action: () => this.handleLogout() }
        ];

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 150px;
            margin-top: 0.5rem;
        `;

        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = option.text;
            item.style.cssText = `
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid #f3f4f6;
            `;
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f3f4f6';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'white';
            });
            item.addEventListener('click', () => {
                option.action();
                document.body.removeChild(dropdown);
            });
            dropdown.appendChild(item);
        });

        // Remove any existing dropdown
        const existingDropdown = document.querySelector('.profile-dropdown');
        if (existingDropdown) {
            document.body.removeChild(existingDropdown);
        }

        // Add dropdown to body
        document.body.appendChild(dropdown);

        // Close dropdown when clicking outside
        const userAvatarContainer = document.getElementById('userAvatarContainer');
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && !userAvatarContainer.contains(e.target)) {
                document.body.removeChild(dropdown);
                document.removeEventListener('click', closeDropdown);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 100);
    }

    async handleLogout() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Generate recovery token
    generateRecoveryToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Reactivate account
    async reactivateAccount() {
        try {
            await db.collection('users').doc(this.currentUser.uid).update({
                deactivated: false,
                reactivatedAt: new Date(),
                canRecover: false
            });

            // Remove from recovery collection
            await db.collection('accountRecovery').doc(this.currentUser.uid).delete();

            alert('Account reactivated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error reactivating account:', error);
            alert('Failed to reactivate account');
        }
    }

    // Restore deleted account
    async restoreDeletedAccount() {
        try {
            // Check if account can still be recovered
            const recoveryDoc = await db.collection('accountRecovery').doc(this.currentUser.uid).get();
            if (!recoveryDoc.exists) {
                alert('Account recovery information not found');
                return;
            }

            const recoveryData = recoveryDoc.data();
            if (recoveryData.accountType !== 'deleted') {
                alert('This account is not deleted');
                return;
            }

            // Check if recovery deadline has passed
            if (recoveryData.recoveryDeadline && new Date() > recoveryData.recoveryDeadline.toDate()) {
                alert('Account recovery period has expired (30 days). Please contact support.');
                return;
            }

            // Restore account data
            const deletedAccountDoc = await db.collection('deletedAccounts').doc(this.currentUser.uid).get();
            if (deletedAccountDoc.exists) {
                const accountData = deletedAccountDoc.data();
                delete accountData.deleted;
                delete accountData.deletedAt;
                delete accountData.canRecover;
                delete accountData.recoveryDeadline;

                // Restore to users collection
                await db.collection('users').doc(this.currentUser.uid).set(accountData);

                // Remove from deleted accounts
                await db.collection('deletedAccounts').doc(this.currentUser.uid).delete();
            }

            // Update users collection
            await db.collection('users').doc(this.currentUser.uid).update({
                deleted: false,
                restoredAt: new Date(),
                canRecover: false
            });

            // Remove from recovery collection
            await db.collection('accountRecovery').doc(this.currentUser.uid).delete();

            alert('Account restored successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error restoring account:', error);
            alert('Failed to restore account');
        }
    }

    // Check account status and show recovery options
    async checkAccountStatus() {
        if (!this.currentUser) return;

        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (!userDoc.exists) return;

            const userData = userDoc.data();
            
            if (userData.deactivated) {
                this.showReactivatePrompt();
            } else if (userData.deleted) {
                this.showRestorePrompt();
            }
        } catch (error) {
            console.error('Error checking account status:', error);
        }
    }

    // Show reactivation prompt
    showReactivatePrompt() {
        const modal = document.createElement('div');
        modal.className = 'account-recovery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px;">
                <h3>Account Deactivated</h3>
                <p>Your account has been deactivated. Would you like to reactivate it?</p>
                <button id="reactivateBtn" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Reactivate Account</button>
                <button id="cancelReactivateBtn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('reactivateBtn').addEventListener('click', () => {
            this.reactivateAccount();
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelReactivateBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Show restore prompt
    showRestorePrompt() {
        const modal = document.createElement('div');
        modal.className = 'account-recovery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px;">
                <h3>Account Deleted</h3>
                <p>Your account has been deleted. You can restore it within 30 days.</p>
                <button id="restoreBtn" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Restore Account</button>
                <button id="cancelRestoreBtn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('restoreBtn').addEventListener('click', () => {
            this.restoreDeletedAccount();
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelRestoreBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
}

// Initialize the settings page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM CONTENT LOADED - Creating SettingsPage instance');
    window.settingsPage = new SettingsPage();
    console.log('🔧 SETTINGS PAGE INSTANCE CREATED');
}); 