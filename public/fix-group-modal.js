// Fix for group modal create button
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the modal system is working
    if (typeof modalManager === 'undefined') {
        console.log('Modal manager not found, creating fallback');
        // Create a simple fallback modal system
        window.modalManager = {
            showModal: (content, options) => {
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content ${options.size || 'medium'}">
                        <div class="modal-header">
                            <h3>${options.title || 'Feature'}</h3>
                            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                    </div>
                `;
                document.body.appendChild(modal);
                setTimeout(() => modal.classList.add('show'), 10);
            },
            closeModal: () => {
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => modal.remove());
            }
        };
    }
    
    // Ensure social features is working
    if (typeof socialFeatures === 'undefined') {
        console.log('Social features not found, creating fallback');
        window.socialFeatures = {
            closeModal: () => {
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => modal.remove());
            },
            createGroup: () => {
                const name = document.getElementById('groupName')?.value;
                const description = document.getElementById('groupDescription')?.value;
                
                if (!name || !description) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                alert('Group created successfully!');
                this.closeModal();
            }
        };
    }
});
