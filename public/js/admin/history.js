// History Page JavaScript
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    startDate: '',
    endDate: '',
    search: '',
    actionType: ''
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    document.getElementById('start-date').value = formatDateForInput(startDate);
    document.getElementById('end-date').value = formatDateForInput(endDate);
    
    loadHistory();
    
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

// Load history logs
async function loadHistory() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 50);
        
        if (currentFilters.startDate) {
            params.append('startDate', currentFilters.startDate);
        }
        if (currentFilters.endDate) {
            params.append('endDate', currentFilters.endDate);
        }
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.actionType) {
            params.append('actionType', currentFilters.actionType);
        }
        
        const response = await fetch(`/api/history/date-range?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            renderHistory(data.data);
            if (data.pagination) {
                totalPages = data.pagination.totalPages;
                updatePagination();
            }
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showError('Tarixçəni yüklərkən xəta baş verdi');
    }
}

// Render history logs in table
function renderHistory(logs) {
    const tbody = document.getElementById('history-table-body');
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Heç bir qeyd tapılmadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        // Parse old and new values for display
        let oldValues = '-';
        let newValues = '-';
        
        try {
            if (log.old_values) {
                const oldObj = JSON.parse(log.old_values);
                oldValues = formatValuesForDisplay(oldObj);
            }
            if (log.new_values) {
                const newObj = JSON.parse(log.new_values);
                newValues = formatValuesForDisplay(newObj);
            }
        } catch (e) {
            console.error('Error parsing values:', e);
        }
        
        row.innerHTML = `
            <td>${formatDateTime(log.timestamp || log.created_at)}</td>
            <td>${escapeHtml(log.organization_name || '-')}</td>
            <td>${escapeHtml(log.building_name || '-')}</td>
            <td>${escapeHtml(log.room_name || '-')}</td>
            <td>${escapeHtml(log.responsible_person || log.user_name || '-')}</td>
            <td><span class="badge badge-${getActionClass(log.action_type)}">${escapeHtml(getActionText(log.action_type))}</span></td>
            <td>${escapeHtml(oldValues)}</td>
            <td>${escapeHtml(newValues)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Format values for display
function formatValuesForDisplay(obj) {
    if (!obj) return '-';
    
    const parts = [];
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) {
            parts.push(`${key}: ${obj[key]}`);
        }
    }
    return parts.join(', ');
}

// Format date for input field (YYYY-MM-DD)
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Get action text in Azerbaijani
function getActionText(action) {
    switch (action) {
        case 'create': return 'Yaradılma';
        case 'update': return 'Yenilənmə';
        case 'delete': return 'Silinmə';
        default: return action || 'Əməliyyat';
    }
}

// Get action class for badge
function getActionClass(action) {
    switch (action) {
        case 'create': return 'success';
        case 'update': return 'info';
        case 'delete': return 'danger';
        default: return 'secondary';
    }
}

// Apply filters
function applyFilters() {
    currentFilters.startDate = document.getElementById('start-date').value;
    currentFilters.endDate = document.getElementById('end-date').value;
    currentFilters.search = document.getElementById('search-input').value;
    currentFilters.actionType = document.getElementById('action-type-filter').value;
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
    document.getElementById('search-input').value = '';
    document.getElementById('action-type-filter').value = '';
    
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
    document.getElementById('page-info').textContent = `Səhifə ${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Export to Excel
async function exportToExcel() {
    try {
        // Show progress modal
        document.getElementById('export-modal').style.display = 'block';
        document.getElementById('export-progress').style.width = '0%';
        
        // Prepare export data
        const params = new URLSearchParams();
        if (currentFilters.startDate) {
            params.append('startDate', currentFilters.startDate);
        }
        if (currentFilters.endDate) {
            params.append('endDate', currentFilters.endDate);
        }
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.actionType) {
            params.append('actionType', currentFilters.actionType);
        }
        
        // Update progress
        document.getElementById('export-progress').style.width = '50%';
        
        const response = await fetch(`/api/history/date-range?${params.toString()}&limit=10000`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update progress
            document.getElementById('export-progress').style.width = '75%';
            
            // Prepare data for Excel
            const headers = ['Tarix', 'Təşkilat', 'Bina', 'Otaq', 'Məsul Şəxs', 'Əməliyyat', 'Köhnə Dəyərlər', 'Yeni Dəyərlər'];
            const rows = data.data.map(log => {
                let oldValues = '-';
                let newValues = '-';
                
                try {
                    if (log.old_values) {
                        const oldObj = JSON.parse(log.old_values);
                        oldValues = formatValuesForDisplay(oldObj);
                    }
                    if (log.new_values) {
                        const newObj = JSON.parse(log.new_values);
                        newValues = formatValuesForDisplay(newObj);
                    }
                } catch (e) {
                    console.error('Error parsing values for export:', e);
                }
                
                return [
                    formatDateTime(log.timestamp || log.created_at),
                    log.organization_name || '-',
                    log.building_name || '-',
                    log.room_name || '-',
                    log.responsible_person || log.user_name || '-',
                    getActionText(log.action_type),
                    oldValues,
                    newValues
                ];
            });
            
            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
            ].join('\n');
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tarixce_${formatDateForInput(new Date())}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Update progress
            document.getElementById('export-progress').style.width = '100%';
            
            // Hide modal after short delay
            setTimeout(() => {
                document.getElementById('export-modal').style.display = 'none';
            }, 1000);
            
            showSuccess('Tarixçə uğurla Excel faylına ixrac edildi');
        } else {
            closeExportModal();
            showError(data.error || 'İxrac zamanı xəta baş verdi');
        }
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        closeExportModal();
        showError('Excelə ixrac edərkən xəta baş verdi');
    }
}

// Close export modal
function closeExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    alert(message);
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
