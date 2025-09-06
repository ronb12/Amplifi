// Global Theme Manager for Amplifi
// This script ensures theme settings are applied across all pages

class GlobalThemeManager {
    constructor() {
        this.settings = {};
        this.init();
    }

    init() {
        console.log('🎨 Global Theme Manager initializing...');
        this.loadSettings();
        this.applyTheme();
        this.setupThemeWatcher();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('amplifiSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            console.log('🎨 Loaded theme settings:', this.settings);
        } else {
            // Default settings
            this.settings = {
                darkMode: false,
                themeColor: '#667eea',
                fontSize: 16
            };
            console.log('🎨 Using default theme settings');
        }
    }

    applyTheme() {
        console.log('🎨 Applying global theme...');
        
        // Apply dark mode
        if (this.settings.darkMode) {
            this.applyDarkMode();
        } else {
            this.applyLightMode();
        }
        
        // Apply theme color
        if (this.settings.themeColor) {
            this.applyThemeColor(this.settings.themeColor);
        }
        
        // Apply font size
        if (this.settings.fontSize) {
            this.applyFontSize(this.settings.fontSize);
        }
    }

    applyDarkMode() {
        document.body.classList.add('dark-theme');
        document.documentElement.setAttribute('data-theme', 'dark');
        
        // Apply dark mode CSS variables
        document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-secondary', '#2d2d2d');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--border-light', '#404040');
        
        console.log('🌙 Dark mode applied');
    }

    applyLightMode() {
        document.body.classList.remove('dark-theme');
        document.documentElement.setAttribute('data-theme', 'light');
        
        // Apply light mode CSS variables
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f8f9fa');
        document.documentElement.style.setProperty('--text-primary', '#333333');
        document.documentElement.style.setProperty('--text-secondary', '#6c757d');
        document.documentElement.style.setProperty('--border-light', '#dee2e6');
        
        console.log('☀️ Light mode applied');
    }

    applyThemeColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        
        // Update theme elements
        this.updateThemeElements(color);
        
        console.log('🎨 Theme color applied:', color);
    }

    applyFontSize(size) {
        const baseSize = size + 'px';
        document.documentElement.style.setProperty('--base-font-size', baseSize);
        document.documentElement.style.setProperty('--font-size-base', baseSize);
        document.body.style.fontSize = baseSize;
        
        console.log('📏 Font size applied:', baseSize);
    }

    updateThemeElements(color) {
        // Update all primary buttons
        const primaryButtons = document.querySelectorAll('.btn-primary');
        primaryButtons.forEach(btn => {
            btn.style.background = color;
        });
        
        // Update active toggle switches
        const activeToggles = document.querySelectorAll('.toggle-switch.active');
        activeToggles.forEach(toggle => {
            toggle.style.background = color;
        });
        
        // Update theme previews
        const themePreviews = document.querySelectorAll('.theme-preview.active');
        themePreviews.forEach(preview => {
            preview.style.borderColor = color;
        });
    }

    updateSetting(settingName, value) {
        console.log(`🎨 Updating global theme: ${settingName} = ${value}`);
        
        this.settings[settingName] = value;
        
        switch(settingName) {
            case 'darkMode':
                if (value) {
                    this.applyDarkMode();
                } else {
                    this.applyLightMode();
                }
                break;
                
            case 'themeColor':
                this.applyThemeColor(value);
                break;
                
            case 'fontSize':
                this.applyFontSize(value);
                break;
        }
        
        // Save updated settings
        localStorage.setItem('amplifiSettings', JSON.stringify(this.settings));
        
        // Notify other components
        this.notifyThemeChange(settingName, value);
    }

    notifyThemeChange(settingName, value) {
        // Dispatch custom event for other components to listen to
        const event = new CustomEvent('themeChanged', {
            detail: { settingName, value, settings: this.settings }
        });
        document.dispatchEvent(event);
    }

    setupThemeWatcher() {
        // Watch for changes in localStorage from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'amplifiSettings') {
                console.log('🎨 Theme settings changed in another tab, updating...');
                this.loadSettings();
                this.applyTheme();
            }
        });
    }
}

// Initialize global theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global theme manager instance
    window.globalThemeManager = new GlobalThemeManager();
    
    // Also integrate with existing app if available
    if (window.app && window.app.themeManager) {
        console.log('🎨 Integrating with existing app theme manager');
        // Sync settings between global manager and app manager
        window.app.themeManager.settings = window.globalThemeManager.settings;
    }
});

// Make theme manager available globally
window.GlobalThemeManager = GlobalThemeManager;
