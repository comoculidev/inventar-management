// Room Detail Page JavaScript
let currentPage = 1;
let totalPages = 1;
let currentRoomId = null;
let currentFilters = {
    search: '',
    status: '',
    category: ''
};

// Get room ID from URL path: /organization/building/room/:id
document.addEventListener('DOMContentLoaded', function() {
    const pathParts = window.location.pathname.split('/');
    const roomIndex = pathParts.indexOf('room');
    
    if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
        currentRoomId = pathParts[roomIndex + 1];
        loadRoomDetails(currentRoomId);
        loadItems(currentRoomId);
        loadUserInfo();
        loadCategories();
    } else {
        showError('Otaq ID tapılmadı');
    }
    
    // Add event listeners
    document.getElementById('item-search-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyItemFilters();
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

// Load room details
async function loadRoomDetails(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const room = data.data;
            
            // Update breadcrumb
            document.getElementById('breadcrumb-room').textContent = room.name || 'Otaq';
            
            // Update room info
            document.getElementById('room-name').textContent = room.name || '-';
            document.getElementById('room-organization').textContent = room.organization_name || room.organization_id || '-';
            document.getElementById('room-building').textContent = room.building_name || room.building_id || '-';
            document.getElementById('room-description').textContent = room.description || '-';
            document.getElementById('room-capacity').textContent = room.capacity || '-';
            
            // Load item count
            loadItemCount(roomId);
        } else {
            showError('Otaq məlumatları yüklənə bilmədi');
        }
    } catch (error) {
        console.error('Error loading room details:', error);
        showError('Otaq məlumatlarını yüklərkən xəta baş verdi');
    }
}

// Load item count for room
async function loadItemCount(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/items`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const count = data.data ? data.data.length : 0;
            document.getElementById('room-item-count').textContent = count;
        }
    } catch (error) {
        console.error('Error loading item count:', error);
    }
}

// Load categories for filter
async function loadCategories() {
    try {
        const response = await fetch('/api/inventory-items', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const categories = new Set();
            data.data.forEach(item => {
                if (item.category) {
                    categories.add(item.category);
                }
            });
            
            const categorySelect = document.getElementById('item-category-filter');
            categorySelect.innerHTML = '<option value="">Bütün kateqoriyalar</option>';
            
            Array.from(categories).sort().forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load items for room
async function loadItems(roomId) {
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.status) {
            params.append('status', currentFilters.status);
        }
        if (currentFilters.category) {
            params.append('category', currentFilters.category);
        }
        
        // Use the new endpoint: GET /api/rooms/:id/items
        const response = await fetch(`/api/rooms/${roomId}/items?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            renderItems(data.data);
            // For now, simple pagination
            totalPages = 1;
            updatePagination();
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
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Bu otaqda heç bir inventar elementi yoxdur</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.inventory_number || '-')}</td>
            <td>${escapeHtml(item.location || '-')}</td>
            <td><span class="badge badge-${getStatusClass(item.status)}">${escapeHtml(item.status || '-')}</span></td>
            <td>${escapeHtml(item.responsible_person || '-')}</td>
            <td>${escapeHtml(item.category || '-')}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editItem('${item.id}')" title="Redaktə et">
                    ✏️
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')" title="Sil">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Apply item filters
function applyItemFilters() {
    currentFilters.search = document.getElementById('item-search-input').value;
    currentFilters.status = document.getElementById('item-status-filter').value;
    currentFilters.category = document.getElementById('item-category-filter').value;
    currentPage = 1;
    loadItems(currentRoomId);
}

// Reset item filters
function resetItemFilters() {
    document.getElementById('item-search-input').value = '';
    document.getElementById('item-status-filter').value = '';
    document.getElementById('item-category-filter').value = '';
    currentFilters = {
        search: '',
        status: '',
        category: ''
    };
    currentPage = 1;
    loadItems(currentRoomId);
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadItems(currentRoomId);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadItems(currentRoomId);
    }
}

function updatePagination() {
    document.getElementById('page-info').textContent = `Səhifə ${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Open add item modal
function openAddItemModal() {
    document.getElementById('modal-title').textContent = 'Yeni Element Əlavə Et';
    document.getElementById('item-id').value = '';
    document.getElementById('inventory-number').value = '';
    document.getElementById('location').value = '';
    document.getElementById('status').value = '';
    document.getElementById('category').value = '';
    document.getElementById('responsible-person').value = '';
    document.getElementById('add-item-modal').style.display = 'block';
}

// Close item modal
function closeItemModal() {
    document.getElementById('add-item-modal').style.display = 'none';
}

// Edit item
async function editItem(itemId) {
    try {
        const response = await fetch(`/api/inventory-items/${itemId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const item = data.data;
            document.getElementById('modal-title').textContent = 'Elementi Redaktə Et';
            document.getElementById('item-id').value = item.id;
            document.getElementById('inventory-number').value = item.inventory_number || '';
            document.getElementById('location').value = item.location || '';
            document.getElementById('status').value = item.status || '';
            document.getElementById('category').value = item.category || '';
            document.getElementById('responsible-person').value = item.responsible_person || '';
            document.getElementById('add-item-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading item for edit:', error);
        showError('Elementi yüklərkən xəta baş verdi');
    }
}

// Save item (create or update)
async function saveItem() {
    const itemId = document.getElementById('item-id').value;
    const inventoryNumber = document.getElementById('inventory-number').value.trim();
    const location = document.getElementById('location').value.trim();
    const status = document.getElementById('status').value;
    const category = document.getElementById('category').value.trim();
    const responsiblePerson = document.getElementById('responsible-person').value.trim();
    
    if (!inventoryNumber) {
        showError('İnventar nömrəsi mütləq doldurulmalıdır');
        return;
    }
    
    try {
        const itemData = {
            inventory_number: inventoryNumber,
            location,
            status,
            category,
            responsible_person: responsiblePerson,
            room_id: currentRoomId
        };
        
        let url = '/api/inventory-items';
        let method = 'POST';
        
        if (itemId) {
            url = `/api/inventory-items/${itemId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeItemModal();
            loadItems(currentRoomId);
            loadItemCount(currentRoomId);
            showSuccess(itemId ? 'Element uğurla yeniləndi' : 'Element uğurla əlavə edildi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showError('Elementi saxlayarkən xəta baş verdi');
    }
}

// Delete item
function deleteItem(itemId) {
    document.getElementById('item-id').value = itemId;
    document.getElementById('delete-modal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

// Confirm delete
async function confirmDelete() {
    const itemId = document.getElementById('item-id').value;
    
    try {
        const response = await fetch(`/api/inventory-items/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeDeleteModal();
            loadItems(currentRoomId);
            loadItemCount(currentRoomId);
            showSuccess('Element uğurla silindi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showError('Elementi silərkən xəta baş verdi');
    }
}

// Open import modal
function openImportModal() {
    document.getElementById('excel-file').value = '';
    document.getElementById('import-modal').style.display = 'block';
}

// Close import modal
function closeImportModal() {
    document.getElementById('import-modal').style.display = 'none';
}

// Import Excel
async function importExcel() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Zəhmət olmasa, bir fayl seçin');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/inventory-items/import', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeImportModal();
            loadItems(currentRoomId);
            loadItemCount(currentRoomId);
            showSuccess(`${data.count || 0} element uğurla idxal edildi`);
            
            if (data.errors && data.errors.length > 0) {
                alert(`Uğurla idxal edildi, lakin ${data.errors.length} xəta var. Konsola baxın.`);
                console.error('Import errors:', data.errors);
            }
        } else {
            showError(data.error || 'İdxal zamanı xəta baş verdi');
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        showError('Excel faylını idxal edərkən xəta baş verdi');
    }
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'secondary';
        case 'maintenance': return 'warning';
        case 'lost': return 'danger';
        default: return 'info';
    }
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
