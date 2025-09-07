// Dashboard Functions for Creator Dashboard
console.log("Dashboard functions loading...");

// Global functions for dashboard functionality - Updated for new design
function uploadContent() {
    if (window.app && window.app.currentUser) {
        showNotification('📤 Opening upload form...', 'info');
        // Here you would typically open a modal or redirect to upload page
        setTimeout(() => {
        }, 1000);
    } else {
        showNotification('❌ Please sign in to upload content', 'error');
    }
}

function goLive() {
    if (window.app && window.app.currentUser) {
        showNotification('📡 Starting live stream setup...', 'info');
        setTimeout(() => {
        }, 1000);
    } else {
        showNotification('❌ Please sign in to go live', 'error');
    }
}

function viewAnalytics() {
}

function manageEarnings() {
    // Scroll to earnings section smoothly
    const earningsSection = document.querySelector('.earnings-overview');
    if (earningsSection) {
        earningsSection.scrollIntoView({ behavior: 'smooth' });
        showNotification('💰 Scrolled to earnings section', 'info');
    }
}

function requestPayout() {
    if (window.app && window.app.currentUser) {
        // Check if Stripe is connected
        if (window.createStripeConnectAccount) {
            showNotification('💳 Processing payout request...', 'info');
            
            // Get the available payout amount from the UI dynamically
            const payoutElement = document.querySelector('.earnings-amount');
            const payoutAmount = payoutElement ? parseFloat(payoutElement.textContent.replace(/[^0-9.]/g, '')) : 0;
            
            if (payoutAmount <= 0) {
                showNotification('❌ No funds available for payout', 'error');
                return;
            }
            
            // Request payout through Stripe service
            if (window.requestStripePayout) {
                window.requestStripePayout(payoutAmount, 'connected_account_id')
                    .then(result => {
                        if (result.success) {
                            showNotification(`✅ ${result.message}`, 'success');
                        } else {
                            showNotification(`❌ Payout failed: ${result.error}`, 'error');
                        }
                    })
                    .catch(error => {
                        showNotification(`❌ Payout error: ${error.message}`, 'error');
                    });
            } else {
                showNotification('❌ Stripe payout service not available', 'error');
            }
        } else {
            showNotification('❌ Please connect your Stripe account first', 'error');
        }
    } else {
        showNotification('❌ Please sign in to request payout', 'error');
    }
}

function viewAllContent() {
}

    try {
        const connectBtn = document.querySelector('.btn-stripe');
        
        if (connectBtn) {
            connectBtn.textContent = "Redirecting to Stripe...";
            connectBtn.disabled = true;
        }
        
        // Check if user is authenticated
        if (!window.app || !window.app.currentUser) {
            showNotification('❌ Please sign in first', 'error');
            if (connectBtn) {
                connectBtn.textContent = "Connect Stripe Account";
                connectBtn.disabled = false;
            }
            return;
        }
        
        // Check if Stripe service is available
        if (window.createStripeConnectAccount) {
            showNotification('🔗 Redirecting to Stripe Connect onboarding...', 'info');
            
            // Get current user info
            const userId = window.app.currentUser.uid;
            const userEmail = window.app.currentUser.email;
            
            // Call the Stripe service to create account and get onboarding URL
            window.createStripeConnectAccount({
                userId: userId,
                email: userEmail
            }).then(result => {
                if (result.success && result.accountLink) {
                    // Redirect to Stripe Connect onboarding
                    window.location.href = result.accountLink;
                } else {
                    throw new Error(result.error || 'Failed to create Stripe account link');
                }
            }).catch(error => {
                showNotification(`❌ Failed to connect to Stripe: ${error.message}`, 'error');
                if (connectBtn) {
                    connectBtn.textContent = "Connect Stripe Account";
                    connectBtn.disabled = false;
                }
            });
        } else {
            showNotification('❌ Stripe service not available', 'error');
            if (connectBtn) {
                connectBtn.textContent = "Connect Stripe Account";
                connectBtn.disabled = false;
            }
        }

    } catch (error) {
        showNotification("❌ Failed to connect Stripe account", "error");
        const connectBtn = document.querySelector('.btn-stripe');
        if (connectBtn) {
            connectBtn.textContent = "Connect Stripe Account";
            connectBtn.disabled = false;
        }
    }
}

    showNotification("📚 Stripe Connect allows you to receive payments for tips, subscriptions, and other revenue streams. It's secure, compliant, and provides instant payment processing.", "info");
}

    showNotification('🔗 Opening Stripe dashboard...', 'info');
    // Here you would typically redirect to Stripe dashboard
    setTimeout(() => {
    }, 1000);
}

    if (confirm('Are you sure you want to disconnect your Stripe account? This will stop payment processing.')) {
        showNotification('🔗 Disconnecting Stripe account...', 'info');
        setTimeout(() => {
            location.reload(); // Reload to show original connect button
        }, 1000);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

// Check if style already exists
if (!document.querySelector('style[data-dashboard-animation]')) {
    style.setAttribute('data-dashboard-animation', 'true');
    document.head.appendChild(style);
}

// Make functions globally accessible
window.uploadContent = uploadContent;
window.goLive = goLive;
window.viewAnalytics = viewAnalytics;
window.manageEarnings = manageEarnings;
window.requestPayout = requestPayout;
window.viewAllContent = viewAllContent;
window.showNotification = showNotification;

// Initialize dashboard functions
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (window.app && window.app.currentUser) {
        console.log('✅ User authenticated:', window.app.currentUser.uid);
    }
    
    // Check if Stripe service is loaded
    if (window.createStripeConnectAccount) {
        console.log('✅ Stripe service available');
    }

    // Check if dashboard functions are loaded
    if (window.uploadContent && window.goLive && window.viewAnalytics && window.manageEarnings) {
        console.log('✅ Dashboard functions loaded successfully');
    }
});

console.log("✅ Dashboard functions loaded successfully!");
