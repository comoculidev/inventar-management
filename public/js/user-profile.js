// User Profile JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadProfile();
});

// Load user info in header
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

// Load profile information
async function loadProfile() {
    try {
        const user = getCookie('user');
        if (!user) {
            showError('İstifadəçi məlumatları tapılmadı');
            return;
        }
        
        const userData = JSON.parse(user);
        
        // Update profile fields
        document.getElementById('profile-username').textContent = userData.username || '-';
        document.getElementById('profile-role').textContent = getRoleText(userData.role);
        document.getElementById('profile-created').textContent = userData.created_at ? formatDate(userData.created_at) : '-';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Get role text in Azerbaijani
function getRoleText(role) {
    switch (role) {
        case 'admin': return 'Admin';
        case 'user': return 'İstifadəçi';
        default: return role || '-';
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Helper functions
function showError(message) {
    alert(`Xəta: ${message}`);
}

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
