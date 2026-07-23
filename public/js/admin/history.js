// History Page JavaScript
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    startDate: '',
    endDate: '',
    search: '',
    actionType: ''
};

// Helper function to make authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    document.getElementById('start-date').value = formatDateForInput(startDate);
    document.getElementById('end-date').value = formatDateForInput(endDate);
    
    // Set current filters with default dates
    currentFilters.startDate = formatDateForInput(startDate);
    currentFilters.endDate = formatDateForInput(endDate);
    
    loadHistory();
    
    // Add event listeners
    const searchInput = document.getElementById('search-history');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
        });
    }
});

// Load user info
function loadUserInfo() {
    const user = getCookie('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            document.getElementById('current-user').textContent = userData.username || '\u0130stifad\u0259\u0017i';
            document.getElementById('user-role').textContent = userData.role === 'admin' ? 'Admin' : '\u0130stifad\u0259\u0017i';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Load history logs
async function loadHistory() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 50);
        
        // Always include dates (they are required by the backend)
        if (currentFilters.startDate) {
            params.append('startDate', currentFilters.startDate);
        } else {
            // Default to 30 days ago
            const defaultStart = new Date();
            defaultStart.setDate(defaultStart.getDate() - 30);
            params.append('startDate', formatDateForInput(defaultStart));
        }
        
        if (currentFilters.endDate) {
            params.append('endDate', currentFilters.endDate);
        } else {
            // Default to today
            params.append('endDate', formatDateForInput(new Date()));
        }
        
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.actionType) {
            params.append('actionType', currentFilters.actionType);
        }
        
        const response = await authenticatedFetch(`/api/history/date-range?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            renderHistory(data.data);
            if (data.pagination) {
                totalPages = data.pagination.totalPages;
                updatePagination();
            }
        } else {
            console.error('Error loading history:', data.error);
            showAlert(data.error || 'Tarix\u0259\u0017i y\u00fckl\u0259m\u0259k al\u0131nmad\u0131', 'error');
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showAlert('Tarix\u0259\u0017i y\u00fckl\u0259n\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Render history table
function renderHistory(logs) {
    const tbody = document.getElementById('history-table-body');
    
    if (!tbody) {
        console.error('Error: history-table-body element not found');
        return;
    }
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">He\u0017 bir tarix\u0259\u0017 qeydi tap\u0131lmad\u0131</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(log.created_at)}</td>
            <td>${escapeHtml(log.organization_name || '-')}</td>
            <td>${escapeHtml(log.building_name || '-')}</td>
            <td>${escapeHtml(log.room_name || '-')}</td>
            <td>${escapeHtml(log.responsible_person || '-')}</td>
            <td><span class="badge badge-${getActionBadgeClass(log.action_type)}">${escapeHtml(log.action_type || '-')}</span></td>
            <td>${escapeHtml(log.table_name || '-')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Get action badge class
function getActionBadgeClass(actionType) {
    switch (actionType) {
        case 'create': return 'success';
        case 'update': return 'info';
        case 'delete': return 'danger';
        default: return 'secondary';
    }
}

// Format date for input (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date and time for display
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('az-AZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Apply filters
function applyFilters() {
    currentFilters.startDate = document.getElementById('start-date').value;
    currentFilters.endDate = document.getElementById('end-date').value;
    currentFilters.search = document.getElementById('search-history').value;
    currentFilters.actionType = document.getElementById('action-type').value;
    currentPage = 1;
    loadHistory();
}

// Reset filters
function resetFilters() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    document.getElementById('start-date').value = formatDateForInput(startDate);
    document.getElementById('end-date').value = formatDateForInput(endDate);
    document.getElementById('search-history').value = '';
    document.getElementById('action-type').value = '';
    
    currentFilters = {
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
        search: '',
        actionType: ''
    };
    currentPage = 1;
    loadHistory();
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadHistory();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadHistory();
    }
}

function updatePagination() {
    // Implementation if needed
}

// Export to CSV
async function exportToCSV() {
    try {
        const params = new URLSearchParams();
        
        if (currentFilters.startDate) {
            params.append('startDate', currentFilters.startDate);
        } else {
            const defaultStart = new Date();
            defaultStart.setDate(defaultStart.getDate() - 30);
            params.append('startDate', formatDateForInput(defaultStart));
        }
        
        if (currentFilters.endDate) {
            params.append('endDate', currentFilters.endDate);
        } else {
            params.append('endDate', formatDateForInput(new Date()));
        }
        
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.actionType) {
            params.append('actionType', currentFilters.actionType);
        }
        
        const response = await authenticatedFetch(`/api/history/date-range?${params.toString()}&limit=10000`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Create CSV content
            const headers = ['Tarix', 'T\u0259\u015fkilat', 'Bina', 'Otaq', 'M\u0259sul \u015e\u0259xs', '\u018fm\u0259liyyat N\u0259v\u0259', 'C\u0259dv\u0259l'];
            const rows = data.data.map(log => [
                formatDateTime(log.created_at),
                escapeHtml(log.organization_name || '-'),
                escapeHtml(log.building_name || '-'),
                escapeHtml(log.room_name || '-'),
                escapeHtml(log.responsible_person || '-'),
                escapeHtml(log.action_type || '-'),
                escapeHtml(log.table_name || '-')
            ]);
            
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });
            
            const link = document.createElement('a');
            link.href = csvContent;
            link.download = `tarixce_${formatDateForInput(new Date())}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showAlert('Tarix\u0259\u0017 CSV fayl\u0131na ixrac edildi!', 'success');
        } else {
            showAlert('Tarix\u0259\u0017 y\u00fckl\u0259m\u0259k al\u0131nmad\u0131', 'error');
        }
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showAlert('CSV fayl\u0131na ixrac olunark\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showAlert(message, type = 'info') {
    alert(message);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
