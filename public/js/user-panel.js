// User Panel JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadUserStats();
});

// Load user info
function loadUserInfo() {
    const user = getCookie('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            document.getElementById('current-user').textContent = userData.username || 'İstifadəçi';
            document.getElementById('user-role').textContent = userData.role === 'admin' ? 'Admin' : 'İstifadəçi';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Load user statistics
async function loadUserStats() {
    try {
        const response = await fetch('/api/user/stats', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data || {};
            document.getElementById('my-items-count').textContent = stats.totalItems || 0;
            document.getElementById('active-items-count').textContent = stats.activeItems || 0;
            document.getElementById('maintenance-items-count').textContent = stats.maintenanceItems || 0;
            document.getElementById('inactive-items-count').textContent = stats.inactiveItems || 0;
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Helper functions
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Logout function
function logout() {
    if (confirm('Çıxış etmək istəyirsiz?')) {
        window.location.href = '/logout';
    }
}
