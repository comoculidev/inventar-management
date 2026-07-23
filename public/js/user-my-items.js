// User My Items JavaScript
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    status: ''
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadItems();
    
    // Add event listeners
    document.getElementById('search-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
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

// Load items assigned to current user
async function loadItems() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 50);
        
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.status) {
            params.append('status', currentFilters.status);
        }
        
        const response = await fetch(`/api/user/my-items?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            renderItems(data.data);
            
            // Update pagination
            if (data.pagination) {
                totalPages = data.pagination.totalPages;
                updatePagination();
            }
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showError('Elementləri yüklərkən xəta baş verdi');
    }
}

// Render items in table
function renderItems(items) {
    const tbody = document.getElementById('items-table-body');
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Sizə təsadüf edən heç bir inventar elementi yoxdur</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.inventory_number || '-')}</td>
            <td>${escapeHtml(item.location || '-')}</td>
            <td><span class="badge badge-${getStatusClass(item.status)}">${escapeHtml(getStatusText(item.status))}</span></td>
            <td>${escapeHtml(item.category || '-')}</td>
            <td>${escapeHtml(item.room_name || '-')}</td>
            <td>${escapeHtml(item.building_name || '-')}</td>
            <td>${escapeHtml(item.organization_name || '-')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Get status text in Azerbaijani
function getStatusText(status) {
    switch (status) {
        case 'active': return 'Aktiv';
        case 'inactive': return 'Qeyri-aktiv';
        case 'maintenance': return 'Təmirdə';
        case 'lost': return 'İtkin';
        default: return status || '-';
    }
}

// Get status class for badge
function getStatusClass(status) {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'secondary';
        case 'maintenance': return 'warning';
        case 'lost': return 'danger';
        default: return 'info';
    }
}

// Apply filters
function applyFilters() {
    currentFilters.search = document.getElementById('search-input').value;
    currentFilters.status = document.getElementById('status-filter').value;
    currentPage = 1;
    loadItems();
}

// Reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    currentFilters = {
        search: '',
        status: ''
    };
    currentPage = 1;
    loadItems();
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadItems();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadItems();
    }
}

function updatePagination() {
    document.getElementById('page-info').textContent = `Səhifə ${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
