// Admin Dashboard JavaScript

// Fetch and display dashboard statistics
document.addEventListener('DOMContentLoaded', function() {
    fetchDashboardStats();
    fetchCurrentUser();
});

// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('total-organizations').textContent = data.data.totalOrganizations;
            document.getElementById('total-buildings').textContent = data.data.totalBuildings;
            document.getElementById('total-rooms').textContent = data.data.totalRooms;
            document.getElementById('total-items').textContent = data.data.totalItems;
            document.getElementById('total-users').textContent = data.data.totalUsers;
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showAlert('Statistika yüklənərkən xəta baş verdi', 'error');
    }
}

// Fetch current user information
async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.data) {
            document.getElementById('current-user').textContent = data.data.username;
            const roleBadge = document.getElementById('user-role');
            roleBadge.textContent = data.data.role;
            roleBadge.className = `badge badge-${data.data.role === 'admin' ? 'info' : 'success'}`;
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
}

// Logout function
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              window.location.href = '/';
          }
      })
      .catch(error => {
          console.error('Error logging out:', error);
          window.location.href = '/';
      });
}
