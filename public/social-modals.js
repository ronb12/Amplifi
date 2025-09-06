// Social Features Modal System for Amplifi
// Comprehensive modal management for all social features

class SocialModalManager {
    constructor() {
        console.log('SocialModalManager constructor called');
        this.activeModals = new Set();
        this.modalStack = [];
        this.init();
        console.log('SocialModalManager initialized with:', this);
    }
    
    init() {
        console.log('SocialModalManager.init() called');
        this.setupGlobalEventListeners();
        this.createModalContainer();
        console.log('SocialModalManager.init() completed');
    }
    
    setupGlobalEventListeners() {
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                this.closeTopModal();
            }
        });
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeTopModal();
            }
        });
    }
    
    createModalContainer() {
        console.log('Creating modal container...');
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            container.className = 'modal-container';
            document.body.appendChild(container);
            console.log('✅ Modal container created and added to body');
        } else {
            console.log('Modal container already exists');
        }
    }
    
    showModal(modalContent, options = {}) {
        console.log('ModalManager.showModal called with:', { modalContent: modalContent.substring(0, 100) + '...', options }); // Debug log
        
        const modalId = this.generateId();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.dataset.modalId = modalId;
        
        modal.innerHTML = `
            <div class="modal-content ${options.size || 'medium'}">
                <div class="modal-header">
                    <h3>${options.title || 'Feature'}</h3>
                    <button class="modal-close" onclick="modalManager.closeModal('${modalId}')">×</button>
                </div>
                <div class="modal-body">
                    ${modalContent}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        const container = document.getElementById('modal-container');
        if (!container) {
            console.error('Modal container not found, creating one...');
            this.createModalContainer();
        }
        
        document.getElementById('modal-container').appendChild(modal);
        this.activeModals.add(modalId);
        this.modalStack.push(modalId);
        
        // Add animation
        setTimeout(() => modal.classList.add('show'), 10);
        
        console.log('Modal created with ID:', modalId); // Debug log
        return modalId;
    }
    
    closeModal(modalId) {
        const modal = document.querySelector(`[data-modal-id="${modalId}"]`);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                this.activeModals.delete(modalId);
                this.modalStack = this.modalStack.filter(id => id !== modalId);
            }, 300);
        }
    }
    
    closeTopModal() {
        if (this.modalStack.length > 0) {
            const topModalId = this.modalStack[this.modalStack.length - 1];
            this.closeModal(topModalId);
        }
    }
    
    generateId() {
        return 'modal_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Debug method to check status
    getStatus() {
        return {
            activeModals: this.activeModals.size,
            modalStack: this.modalStack.length,
            containerExists: !!document.getElementById('modal-container'),
            containerElement: document.getElementById('modal-container')
        };
    }
}

// Global modal manager instance
let modalManager = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SocialModalManager...');
    modalManager = new SocialModalManager();
    console.log('✅ Modal manager initialized:', modalManager);
});
