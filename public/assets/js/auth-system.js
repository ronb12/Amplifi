// Amplifi Authentication System - shared auth helpers for static pages
(function () {
    const STORAGE_KEY = 'amplifi_auth';
    const CREATOR_PROFILE_KEY = 'amplifi_creator_profile';
    const CREATOR_PLAN_KEY = 'amplifi_creator_plan';
    let currentUser = null;

    function safeParse(value) {
        if (!value) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch (error) {
            console.warn('Failed to parse stored auth data:', error);
            return null;
        }
    }

    function readStoredAuth() {
        const authData = safeParse(localStorage.getItem(STORAGE_KEY));
        if (!authData || !authData.isAuthenticated) {
            return null;
        }

        currentUser = authData.user || null;
        return authData;
    }

    function writeStoredAuth(user) {
        currentUser = user || null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isAuthenticated: true,
            user: currentUser,
            timestamp: Date.now()
        }));
        window.dispatchEvent(new CustomEvent('auth-success', {
            detail: { user: currentUser }
        }));
    }

    function clearStoredAuth() {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('auth-logout'));
    }

    function readCreatorProfile() {
        return safeParse(localStorage.getItem(CREATOR_PROFILE_KEY));
    }

    function writeCreatorProfile(profile) {
        const existing = readCreatorProfile() || {};
        const nextProfile = {
            ...existing,
            ...profile,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(CREATOR_PROFILE_KEY, JSON.stringify(nextProfile));
        window.dispatchEvent(new CustomEvent('creator-profile-updated', {
            detail: { profile: nextProfile }
        }));
        return nextProfile;
    }

    function isCreatorSetupComplete() {
        const profile = readCreatorProfile();
        return Boolean(profile && profile.completed);
    }

    function readCreatorPlan() {
        return safeParse(localStorage.getItem(CREATOR_PLAN_KEY));
    }

    function writeCreatorPlan(plan) {
        const nextPlan = {
            ...(readCreatorPlan() || {}),
            ...(plan || {}),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(CREATOR_PLAN_KEY, JSON.stringify(nextPlan));
        window.dispatchEvent(new CustomEvent('creator-plan-updated', {
            detail: { plan: nextPlan }
        }));
        return nextPlan;
    }

    function defaultPostAuthDestination() {
        return isCreatorSetupComplete() ? 'creator-dashboard.html' : 'creator-setup.html';
    }

    function syncFirebaseState() {
        if (typeof auth === 'undefined' || !auth || typeof auth.onAuthStateChanged !== 'function') {
            return;
        }

        auth.onAuthStateChanged((user) => {
            if (!user) {
                clearStoredAuth();
                return;
            }

            writeStoredAuth({
                email: user.email || '',
                name: user.displayName || user.email || 'User',
                photoURL: user.photoURL || '',
                uid: user.uid || ''
            });
        });
    }

    window.amplifiAuth = {
        isAuthenticated() {
            return Boolean(readStoredAuth());
        },

        getUser() {
            const authData = readStoredAuth();
            return authData ? authData.user : null;
        },

        requireAuth(callback, fallbackUrl = 'login.html') {
            if (this.isAuthenticated()) {
                callback();
                return;
            }

            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            window.location.href = `${fallbackUrl}?redirect=${encodeURIComponent(currentPage)}`;
        },

        setUser(user) {
            writeStoredAuth(user);
        },

        getPostAuthDestination(redirectUrl) {
            return redirectUrl || defaultPostAuthDestination();
        },

        getCreatorProfile() {
            return readCreatorProfile();
        },

        setCreatorProfile(profile) {
            return writeCreatorProfile(profile);
        },

        isOnboardingComplete() {
            return isCreatorSetupComplete();
        },

        getCreatorPlan() {
            return readCreatorPlan();
        },

        setCreatorPlan(plan) {
            return writeCreatorPlan(plan);
        },

        clear() {
            clearStoredAuth();
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        readStoredAuth();
        syncFirebaseState();
        console.log('Auth system loaded');
    });
})();
