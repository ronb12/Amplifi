// Cache Clearing Utility for Amplifi
console.log("🧹 Cache Clearing Utility Loaded");

// Clear all browser caches
window.clearAllCaches = async function() {
    try {
        console.log("🧹 Starting cache clearing process...");
        
        // Clear all caches
        if ("caches" in window) {
            const cacheNames = await caches.keys();
            console.log("📦 Found caches:", cacheNames);
            
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            console.log("✅ All caches cleared");
        }
        
        // Unregister all service workers
        if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log("🔧 Found service workers:", registrations.length);
            
            await Promise.all(registrations.map(registration => registration.unregister()));
            console.log("✅ All service workers unregistered");
        }
        
        // Clear localStorage (optional - uncomment if needed)
        // localStorage.clear();
        // console.log("✅ localStorage cleared");
        
        // Clear sessionStorage
        sessionStorage.clear();
        console.log("✅ sessionStorage cleared");
        
        // Force reload the page
        console.log("🔄 Reloading page to apply cache clearing...");
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
        
    } catch (error) {
        console.error("❌ Error clearing caches:", error);
        alert("Error clearing caches: " + error.message);
    }
};

// Clear specific Amplifi caches
window.clearAmplifiCaches = async function() {
    try {
        console.log("🧹 Clearing Amplifi-specific caches...");
        
        // Clear Amplifi-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes("amplifi") || key.includes("stripe") || key.includes("firebase"))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log("🗑️ Removed:", key);
        });
        
        console.log("✅ Amplifi caches cleared");
        
    } catch (error) {
        console.error("❌ Error clearing Amplifi caches:", error);
    }
};

// Add cache clearing buttons to the page
window.addCacheClearingButtons = function() {
    const container = document.createElement("div");
    container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 10000; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #ddd;";
    container.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #333;">🧹 Cache Management</h4>
        <button onclick="clearAllCaches()" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 12px;">Clear All Caches</button>
        <button onclick="clearAmplifiCaches()" style="background: #ffc107; color: #333; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 12px;">Clear Amplifi Caches</button>
        <button onclick="this.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 12px;">Close</button>
    `;
    
    document.body.appendChild(container);
    console.log("✅ Cache clearing buttons added");
};

// Auto-add buttons after page loads
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCacheClearingButtons);
} else {
    addCacheClearingButtons();
}

console.log("🧹 Cache clearing utility ready. Use clearAllCaches() or clearAmplifiCaches()");
