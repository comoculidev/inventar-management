// Rooms Management JavaScript
// Azerbaijani language support

let currentPage = 1;
const itemsPerPage = 10;
let allRooms = [];
let allOrganizations = [];
let allBuildings = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadOrganizations();
    loadRooms();
    
    // Add event listeners
    document.getElementById('search-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Organization filter change - reload buildings
    document.getElementById('organization-filter').addEventListener('change', function() {
        const organizationId = this.value;
        loadBuildings(organizationId);
    });
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

// Load organizations for filter
function loadOrganizations() {
    fetch('/api/organizations', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allOrganizations = data.data;
            const select = document.getElementById('organization-filter');
            select.innerHTML = '<option value="">Bütün təşkilatlar</option>';
            data.data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.name;
                select.appendChild(option);
            });
            
            // Load buildings after organizations
            loadBuildings();
        }
    })
    .catch(error => {
        console.error('Error loading organizations:', error);
    });
}

// Load buildings for filter
function loadBuildings(organizationId = null) {
    let url = '/api/buildings';
    if (organizationId) {
        url += `?organizationId=${organizationId}`;
    }
    
    fetch(url, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allBuildings = data.data;
            const select = document.getElementById('building-filter');
            select.innerHTML = '<option value="">Bütün binalar</option>';
            data.data.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                select.appendChild(option);
            });
            
            // Also update building select in modal
            updateBuildingSelectInModal();
        }
    })
    .catch(error => {
        console.error('Error loading buildings:', error);
    });
}

// Update building select in modal based on organization
function updateBuildingSelectInModal() {
    const buildingSelect = document.getElementById('building-id');
    buildingSelect.innerHTML = '<option value="">Seçin</option>';
    allBuildings.forEach(building => {
        const option = document.createElement('option');
        option.value = building.id;
        option.textContent = building.name;
        buildingSelect.appendChild(option);
    });
}

// Load rooms
function loadRooms(page = 1, search = '', organizationId = '', buildingId = '') {
    currentPage = page;
    
    let url = `/api/rooms?page=${page}&limit=${itemsPerPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    if (buildingId) url += `&buildingId=${buildingId}`;
    
    fetch(url, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allRooms = data.data || [];
            renderRoomsTable(data.data || []);
            updatePagination(data.total || 0, page);
        }
    })
    .catch(error => {
        console.error('Error loading rooms:', error);
    });
}

// Render rooms table
function renderRoomsTable(rooms) {
    const tbody = document.getElementById('rooms-table-body');
    
    if (!rooms || rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Heç bir otaq tapılmadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = rooms.map(room => {
        const buildingName = room.building_name || (allBuildings.find(b => b.id === room.building_id)?.name || 'N/A');
        const organizationName = room.organization_name || (allOrganizations.find(o => o.id === (allBuildings.find(b => b.id === room.building_id)?.organization_id))?.name || 'N/A');
        const itemCount = room.item_count || 0;
        
        return `
            <tr>
                <td>${escapeHtml(room.name)}</td>
                <td>${escapeHtml(buildingName)}</td>
                <td>${escapeHtml(organizationName)}</td>
                <td>${escapeHtml(room.description || '-')}</td>
                <td>${room.capacity || '-'}</td>
                <td>${itemCount}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewRoomItems('${room.id}')" title="İnventarları görün">
                        👁️
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="openEditRoomModal('${room.id}')" title="Redaktə et">
                        ✏️
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${room.id}')" title="Sil">
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
function updatePagination(totalItems, page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('page-info').textContent = `Səhifə ${page} / ${totalPages > 0 ? totalPages : 1}`;
    document.getElementById('prev-page').disabled = page <= 1;
    document.getElementById('next-page').disabled = page >= totalPages || totalPages === 0;
}

// Apply filters
function applyFilters() {
    const search = document.getElementById('search-input').value;
    const organizationId = document.getElementById('organization-filter').value;
    const buildingId = document.getElementById('building-filter').value;
    loadRooms(1, search, organizationId, buildingId);
}

// Reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('organization-filter').value = '';
    document.getElementById('building-filter').value = '';
    loadRooms(1, '', '', '');
}

// Previous page
function previousPage() {
    if (currentPage > 1) {
        const search = document.getElementById('search-input').value;
        const organizationId = document.getElementById('organization-filter').value;
        const buildingId = document.getElementById('building-filter').value;
        loadRooms(currentPage - 1, search, organizationId, buildingId);
    }
}

// Next page
function nextPage() {
    const search = document.getElementById('search-input').value;
    const organizationId = document.getElementById('organization-filter').value;
    const buildingId = document.getElementById('building-filter').value;
    loadRooms(currentPage + 1, search, organizationId, buildingId);
}

// Open add room modal
function openAddRoomModal() {
    document.getElementById('modal-title').textContent = 'Yeni Otaq Əlavə Et';
    document.getElementById('room-id').value = '';
    document.getElementById('room-name').value = '';
    document.getElementById('room-description').value = '';
    document.getElementById('room-capacity').value = '';
    document.getElementById('building-id').value = '';
    document.getElementById('room-modal').style.display = 'block';
}

// Open edit room modal
function openEditRoomModal(roomId) {
    const room = allRooms.find(r => r.id === roomId);
    if (!room) return;
    
    document.getElementById('modal-title').textContent = 'Otağı Redaktə Et';
    document.getElementById('room-id').value = room.id;
    document.getElementById('room-name').value = room.name;
    document.getElementById('room-description').value = room.description || '';
    document.getElementById('room-capacity').value = room.capacity || '';
    document.getElementById('building-id').value = room.building_id;
    document.getElementById('room-modal').style.display = 'block';
}

// Close room modal
function closeRoomModal() {
    document.getElementById('room-modal').style.display = 'none';
}

// Save room
function saveRoom() {
    const roomId = document.getElementById('room-id').value;
    const name = document.getElementById('room-name').value.trim();
    const description = document.getElementById('room-description').value.trim();
    const capacity = document.getElementById('room-capacity').value;
    const buildingId = document.getElementById('building-id').value;
    
    if (!name || !buildingId) {
        showNotification('Otaq adı və bina seçimi mütləqdir!', 'error');
        return;
    }
    
    const roomData = {
        name,
        description,
        capacity: capacity ? parseInt(capacity) : null,
        building_id: buildingId
    };
    
    let url, method;
    if (roomId) {
        url = `/api/rooms/${roomId}`;
        method = 'PUT';
    } else {
        url = '/api/rooms';
        method = 'POST';
    }
    
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeRoomModal();
            const search = document.getElementById('search-input').value;
            const organizationId = document.getElementById('organization-filter').value;
            const buildingId = document.getElementById('building-filter').value;
            loadRooms(currentPage, search, organizationId, buildingId);
            showNotification('Otaq uğurla yadda saxlanıldı!', 'success');
        } else {
            showNotification(data.error || 'Xəta baş verdi!', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving room:', error);
        showNotification('Xəta baş verdi!', 'error');
    });
}

// Open delete modal
function openDeleteModal(roomId) {
    const room = allRooms.find(r => r.id === roomId);
    if (!room) return;
    
    document.getElementById('delete-room-info').textContent = `Otaq: ${room.name}`;
    document.getElementById('delete-modal').dataset.roomId = roomId;
    document.getElementById('delete-modal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

// Confirm delete
function confirmDelete() {
    const roomId = document.getElementById('delete-modal').dataset.roomId;
    if (!roomId) return;
    
    fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeDeleteModal();
            const search = document.getElementById('search-input').value;
            const organizationId = document.getElementById('organization-filter').value;
            const buildingId = document.getElementById('building-filter').value;
            loadRooms(currentPage, search, organizationId, buildingId);
            showNotification('Otaq uğurla silindi!', 'success');
        } else {
            showNotification(data.error || 'Xəta baş verdi!', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting room:', error);
        showNotification('Xəta baş verdi!', 'error');
    });
}

// View room items
function viewRoomItems(roomId) {
    window.location.href = `/admin/rooms/${roomId}/items`;
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification - can be enhanced with a proper notification system
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
