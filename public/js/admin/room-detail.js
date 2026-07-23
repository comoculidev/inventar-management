// Room Detail Page JavaScript
// Azerbaijani language support

let currentRoomId = null;
let currentPage = 1;
const itemsPerPage = 10;
let allItems = [];

// Get room ID from URL
document.addEventListener('DOMContentLoaded', function() {
    const pathParts = window.location.pathname.split('/');
    
    // Check for /admin/rooms/:id/items format
    const roomsIndex = pathParts.indexOf('rooms');
    if (roomsIndex > 0 && pathParts[roomsIndex + 1] && pathParts[roomsIndex + 2] === 'items') {
        currentRoomId = pathParts[roomsIndex + 1];
    }
    
    if (currentRoomId) {
        loadUserInfo();
        loadRoomDetails(currentRoomId);
        loadItems(currentRoomId);
        
        // Add event listeners
        document.getElementById('item-search-input').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyItemFilters();
            }
        });
    } else {
        showNotification('Otaq ID tapılmadı!', 'error');
    }
});

// Load user info
function loadUserInfo() {
    fetch('/api/auth/me', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.user) {
            document.getElementById('current-user').textContent = data.user.username;
            document.getElementById('user-role').textContent = data.user.role === 'admin' ? 'Admin' : 'İstifadəçi';
        }
    })
    .catch(error => {
        console.error('Error loading user info:', error);
    });
}

// Load room details
function loadRoomDetails(roomId) {
    fetch(`/api/rooms/${roomId}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data) {
            const room = data.data;
            
            // Set room info in header
            document.getElementById('room-info').textContent = `${room.name} otağı`;
            document.getElementById('breadcrumb-room').textContent = room.name;
            
            // Set room details
            document.getElementById('room-name').textContent = room.name;
            document.getElementById('room-description').textContent = room.description || '-';
            document.getElementById('room-capacity').textContent = room.capacity || '-';
            
            // Load building and organization info
            if (room.building_id) {
                fetch(`/api/buildings/${room.building_id}`, {
                    credentials: 'include'
                })
                .then(buildingResponse => buildingResponse.json())
                .then(buildingData => {
                    if (buildingData.success && buildingData.data) {
                        const building = buildingData.data;
                        document.getElementById('room-building').textContent = building.name;
                        
                        // Load organization info
                        if (building.organization_id) {
                            fetch(`/api/organizations/${building.organization_id}`, {
                                credentials: 'include'
                            })
                            .then(orgResponse => orgResponse.json())
                            .then(orgData => {
                                if (orgData.success && orgData.data) {
                                    document.getElementById('room-organization').textContent = orgData.data.name;
                                }
                            });
                        }
                    }
                });
            }
        }
    })
    .catch(error => {
        console.error('Error loading room details:', error);
        showNotification('Otaq məlumatları yüklənərkən xəta baş verdi!', 'error');
    });
}

// Load items for this room
function loadItems(roomId, page = 1, search = '', category = '', status = '') {
    currentPage = page;
    
    // Use the filter endpoint with roomId parameter
    let url = `/api/rooms//items${roomId}&page=${page}&limit=${itemsPerPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    
    fetch(url, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allItems = data.data || [];
            renderItemsTable(data.data || []);
            updateItemPagination(data.pagination ? data.pagination.total : data.data ? data.data.length : 0, page);
            updateItemCount(data.pagination ? data.pagination.total : data.data ? data.data.length : 0);
        }
    })
    .catch(error => {
        console.error('Error loading items:', error);
    });
}

// Update item count display
function updateItemCount(count) {
    document.getElementById('room-item-count').textContent = count;
}

// Render items table
function renderItemsTable(items) {
    const tbody = document.getElementById('items-table-body');
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Bu otaqda heç bir inventar əşyası yoxdur</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => {
        let statusBadge = '';
        switch(item.status) {
            case 'active':
                statusBadge = '<span class="badge badge-success">Aktiv</span>';
                break;
            case 'inactive':
                statusBadge = '<span class="badge badge-warning">Qeyri-aktiv</span>';
                break;
            case 'maintenance':
                statusBadge = '<span class="badge badge-info">Təmirdə</span>';
                break;
            case 'lost':
                statusBadge = '<span class="badge badge-danger">İtkin</span>';
                break;
            default:
                statusBadge = '<span class="badge">' + escapeHtml(item.status) + '</span>';
        }
        
        return `
            <tr>
                <td>${escapeHtml(item.inventory_number)}</td>
                <td>${escapeHtml(item.location || '-')}</td>
                <td>${statusBadge}</td>
                <td>${escapeHtml(item.responsible_person || '-')}</td>
                <td>${escapeHtml(item.category || '-')}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openEditItemModal('${item.id}')" title="Redaktə et">
                        ✏️
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${item.id}')" title="Sil">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update pagination
function updateItemPagination(totalItems, page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('page-info').textContent = `Səhifə ${page} / ${totalPages > 0 ? totalPages : 1}`;
    document.getElementById('prev-page').disabled = page <= 1;
    document.getElementById('next-page').disabled = page >= totalPages || totalPages === 0;
}

// Apply item filters
function applyItemFilters() {
    const search = document.getElementById('item-search-input').value;
    const category = document.getElementById('item-category-filter').value;
    const status = document.getElementById('item-status-filter').value;
    loadItems(currentRoomId, 1, search, category, status);
}

// Reset item filters
function resetItemFilters() {
    document.getElementById('item-search-input').value = '';
    document.getElementById('item-category-filter').value = '';
    document.getElementById('item-status-filter').value = '';
    loadItems(currentRoomId, 1, '', '', '');
}

// Previous page
function previousItemPage() {
    if (currentPage > 1) {
        const search = document.getElementById('item-search-input').value;
        const category = document.getElementById('item-category-filter').value;
        const status = document.getElementById('item-status-filter').value;
        loadItems(currentRoomId, currentPage - 1, search, category, status);
    }
}

// Next page
function nextItemPage() {
    const search = document.getElementById('item-search-input').value;
    const category = document.getElementById('item-category-filter').value;
    const status = document.getElementById('item-status-filter').value;
    loadItems(currentRoomId, currentPage + 1, search, category, status);
}

// Open add item modal
function openAddItemModal() {
    document.getElementById('modal-title').textContent = 'Yeni Əşya Əlavə Et';
    document.getElementById('item-id').value = '';
    document.getElementById('inventory-number').value = '';
    document.getElementById('location').value = '';
    document.getElementById('status').value = '';
    document.getElementById('category').value = '';
    document.getElementById('responsible-person').value = '';
    document.getElementById('item-modal').style.display = 'block';
}

// Open edit item modal
function openEditItemModal(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById('modal-title').textContent = 'Əşyanı Redaktə Et';
    document.getElementById('item-id').value = item.id;
    document.getElementById('inventory-number').value = item.inventory_number;
    document.getElementById('location').value = item.location || '';
    document.getElementById('status').value = item.status || '';
    document.getElementById('category').value = item.category || '';
    document.getElementById('responsible-person').value = item.responsible_person || '';
    document.getElementById('item-modal').style.display = 'block';
}

// Close item modal
function closeItemModal() {
    document.getElementById('item-modal').style.display = 'none';
}

// Save item
function saveItem() {
    const itemId = document.getElementById('item-id').value;
    const inventoryNumber = document.getElementById('inventory-number').value.trim();
    const location = document.getElementById('location').value.trim();
    const status = document.getElementById('status').value;
    const category = document.getElementById('category').value.trim();
    const responsiblePerson = document.getElementById('responsible-person').value.trim();
    
    if (!inventoryNumber || !status) {
        showNotification('İnventar nömrəsi və status mütləqdir!', 'error');
        return;
    }
    
    const itemData = {
        inventory_number: inventoryNumber,
        location,
        status,
        category,
        responsible_person: responsiblePerson,
        room_id: currentRoomId
    };
    
    let url, method;
    if (itemId) {
        url = `/api/inventory-items/${itemId}`;
        method = 'PUT';
    } else {
        url = '/api/inventory-items';
        method = 'POST';
    }
    
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeItemModal();
            const search = document.getElementById('item-search-input').value;
            const category = document.getElementById('item-category-filter').value;
            const status = document.getElementById('item-status-filter').value;
            loadItems(currentRoomId, currentPage, search, category, status);
            showNotification('Əşya uğurla yadda saxlanıldı!', 'success');
        } else {
            showNotification(data.error || 'Xəta baş verdi!', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving item:', error);
        showNotification('Xəta baş verdi!', 'error');
    });
}

// Open import modal
function openImportModal() {
    document.getElementById('import-modal').style.display = 'block';
}

// Close import modal
function closeImportModal() {
    document.getElementById('import-modal').style.display = 'none';
}

// Import Excel
function importExcel() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Zəhmət olmasa, fayl seçin!', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', currentRoomId);
    
    fetch('/api/inventory-items/import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeImportModal();
            fileInput.value = '';
            loadItems(currentRoomId);
            showNotification('Excel faylı uğurla idxal edildi!', 'success');
        } else {
            showNotification(data.error || 'Xəta baş verdi!', 'error');
        }
    })
    .catch(error => {
        console.error('Error importing Excel:', error);
        showNotification('Xəta baş verdi!', 'error');
    });
}

// Open delete modal
function openDeleteModal(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById('delete-item-info').textContent = `İnventar nömrəsi: ${item.inventory_number}`;
    document.getElementById('delete-modal').dataset.itemId = itemId;
    document.getElementById('delete-modal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

// Confirm delete
function confirmDelete() {
    const itemId = document.getElementById('delete-modal').dataset.itemId;
    if (!itemId) return;
    
    fetch(`/api/inventory-items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeDeleteModal();
            const search = document.getElementById('item-search-input').value;
            const category = document.getElementById('item-category-filter').value;
            const status = document.getElementById('item-status-filter').value;
            loadItems(currentRoomId, currentPage, search, category, status);
            showNotification('Əşya uğurla silindi!', 'success');
        } else {
            showNotification(data.error || 'Xəta baş verdi!', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error);
        showNotification('Xəta baş verdi!', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#2196F3';
        notification.style.color = 'white';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
