/**
 * Proper Dropdown Menu Implementation
 * Following WCAG 2.1 AA standards and web best practices
 */
class ProperDropdown {
    constructor(element) {
        this.dropdown = element;
        this.trigger = element.querySelector('.dropdown-trigger');
        this.menu = element.querySelector('.dropdown-menu');
        this.items = element.querySelectorAll('.dropdown-item');
        
        if (!this.trigger || !this.menu) {
            console.error('❌ Proper dropdown missing required elements:', { trigger: !!this.trigger, menu: !!this.menu });
            return;
        }
        
        this.init();
    }
    
    init() {
        // Set initial ARIA attributes
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.setAttribute('aria-haspopup', 'true');
        this.trigger.setAttribute('aria-controls', this.menu.id);
        this.menu.setAttribute('aria-hidden', 'true');
        this.menu.setAttribute('hidden', 'hidden');
        
        // Toggle dropdown
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        // Keyboard navigation for trigger
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Keyboard navigation within menu
        this.menu.addEventListener('keydown', (e) => {
            this.handleMenuKeydown(e);
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.close();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Handle menu item clicks
        this.items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        });
        
        console.log('✅ Proper dropdown initialized:', this.trigger.textContent.trim());
    }
    
    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        // Close other dropdowns first
        ProperDropdown.closeAllDropdowns();
        
        this.trigger.setAttribute('aria-expanded', 'true');
        this.menu.removeAttribute('hidden');
        this.menu.setAttribute('aria-hidden', 'false');
        
        // Position the menu
        this.positionMenu();
        
        // Focus first item
        const firstItem = this.menu.querySelector('.dropdown-item');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 0);
        }
        
        console.log('🎯 Opened dropdown:', this.trigger.textContent.trim());
    }
    
    close() {
        this.trigger.setAttribute('aria-expanded', 'false');
        this.menu.setAttribute('hidden', 'hidden');
        this.menu.setAttribute('aria-hidden', 'true');
        
        // Return focus to trigger
        this.trigger.focus();
        
        console.log('🎯 Closed dropdown:', this.trigger.textContent.trim());
    }
    
    isOpen() {
        return this.trigger.getAttribute('aria-expanded') === 'true';
    }
    
    positionMenu() {
        const triggerRect = this.trigger.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get menu dimensions (force a reflow to get accurate measurements)
        this.menu.style.visibility = 'hidden';
        this.menu.style.display = 'block';
        const menuWidth = this.menu.offsetWidth;
        const menuHeight = this.menu.offsetHeight;
        this.menu.style.visibility = 'visible';
        
        console.log('🎯 Positioning menu:', {
            triggerLeft: triggerRect.left,
            triggerWidth: triggerRect.width,
            menuWidth: menuWidth,
            viewportWidth: viewportWidth,
            triggerBottom: triggerRect.bottom,
            viewportHeight: viewportHeight
        });
        
        // Calculate initial position (align with trigger)
        let left = triggerRect.left;
        let top = triggerRect.bottom + 8; // 8px gap - prefer dropping down
        
        // Ensure menu doesn't go off the right edge
        if (left + menuWidth > viewportWidth - 8) {
            left = viewportWidth - menuWidth - 8;
        }
        
        // Ensure menu doesn't go off the left edge
        if (left < 8) {
            left = 8;
        }
        
        // Check if there's enough space below, if not, drop up
        const spaceBelow = viewportHeight - triggerRect.bottom - 8;
        const spaceAbove = triggerRect.top - 8;
        
        if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
            // Drop up if there's not enough space below but enough space above
            top = triggerRect.top - menuHeight - 8;
            console.log('🎯 Dropping up due to insufficient space below');
        } else if (spaceBelow < menuHeight && spaceAbove < menuHeight) {
            // If neither space is sufficient, choose the one with more space
            if (spaceAbove > spaceBelow) {
                top = triggerRect.top - menuHeight - 8;
                console.log('🎯 Dropping up due to more space above');
            } else {
                top = triggerRect.bottom + 8;
                console.log('🎯 Dropping down despite limited space');
            }
        } else {
            // Default: drop down
            console.log('🎯 Dropping down (default)');
        }
        
        // Final safety check to ensure menu doesn't go off the top edge
        if (top < 8) {
            top = 8;
        }
        
        console.log('🎯 Final position:', { left, top, spaceBelow, spaceAbove });
        
        // Apply position
        this.menu.style.left = left + 'px';
        this.menu.style.top = top + 'px';
    }
    
    handleMenuKeydown(e) {
        const items = Array.from(this.items);
        const currentIndex = items.indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                items[prevIndex].focus();
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                document.activeElement.click();
                break;
                
            case 'Home':
                e.preventDefault();
                items[0].focus();
                break;
                
            case 'End':
                e.preventDefault();
                items[items.length - 1].focus();
                break;
        }
    }
    
    static closeAllDropdowns() {
        document.querySelectorAll('.proper-dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger && trigger.getAttribute('aria-expanded') === 'true') {
                const instance = dropdown.properDropdownInstance;
                if (instance) {
                    instance.close();
                }
            }
        });
    }
}

// Improved initialization with better timing
function initializeProperDropdowns() {
    console.log('🎯 Initializing proper dropdowns...');
    
    const dropdowns = document.querySelectorAll('.proper-dropdown');
    console.log('🔍 Found dropdowns:', dropdowns.length);
    
    dropdowns.forEach((dropdown, index) => {
        console.log(`🎯 Initializing dropdown ${index + 1}:`, dropdown);
        const instance = new ProperDropdown(dropdown);
        dropdown.properDropdownInstance = instance;
    });
    
    console.log('✅ All proper dropdowns initialized');
}

// Wait for DOM to be ready
function waitForElements() {
    return new Promise((resolve) => {
        const checkElements = () => {
            const dropdowns = document.querySelectorAll('.proper-dropdown');
            if (dropdowns.length > 0) {
                console.log('🎯 Proper dropdown elements found, initializing...');
                resolve();
            } else {
                console.log('⏳ Waiting for proper dropdown elements...');
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOMContentLoaded fired, checking for dropdowns...');
    
    // Try immediate initialization
    const immediateDropdowns = document.querySelectorAll('.proper-dropdown');
    if (immediateDropdowns.length > 0) {
        console.log('✅ Dropdowns found immediately, initializing...');
        initializeProperDropdowns();
    } else {
        console.log('⏳ No dropdowns found immediately, waiting...');
        // Wait for elements to be created
        waitForElements().then(() => {
            initializeProperDropdowns();
        });
    }
});

// Also initialize on window load to catch late-loading elements
window.addEventListener('load', () => {
    console.log('🎯 Window load fired, checking for late-loading dropdowns...');
    
    const dropdowns = document.querySelectorAll('.proper-dropdown');
    dropdowns.forEach((dropdown, index) => {
        if (!dropdown.properDropdownInstance) {
            console.log(`🎯 Late initializing dropdown ${index + 1}:`, dropdown);
            const instance = new ProperDropdown(dropdown);
            dropdown.properDropdownInstance = instance;
        }
    });
});

// Fallback initialization for dynamic content
setTimeout(() => {
    console.log('🎯 Fallback initialization check...');
    const dropdowns = document.querySelectorAll('.proper-dropdown');
    dropdowns.forEach((dropdown, index) => {
        if (!dropdown.properDropdownInstance) {
            console.log(`🎯 Fallback initializing dropdown ${index + 1}:`, dropdown);
            const instance = new ProperDropdown(dropdown);
            dropdown.properDropdownInstance = instance;
        }
    });
}, 2000); 