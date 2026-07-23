// Rooms Management JavaScript
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    organizationId: '',
    buildingId: ''
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrganizations();
    loadRooms();
    loadUserInfo();
    
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

// Load organizations for filter dropdown
async function loadOrganizations() {
    try {
        const response = await fetch('/api/organizations', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const orgSelect = document.getElementById('organization-filter');
            orgSelect.innerHTML = '<option value="">Bütün təşkilatlar</option>';
            
            data.data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.name;
                orgSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Load buildings based on selected organization
async function loadBuildings() {
    const orgId = document.getElementById('organization-filter').value;
    const buildingSelect = document.getElementById('building-filter');
    
    try {
        let url = '/api/buildings';
        if (orgId) {
            url = `/api/buildings?organizationId=${orgId}`;
        }
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            buildingSelect.innerHTML = '<option value="">Bütün binalar</option>';
            
            data.data.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                buildingSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

// Load buildings for room modal
async function loadBuildingsForModal() {
    try {
        const response = await fetch('/api/buildings', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const buildingSelect = document.getElementById('room-building');
            buildingSelect.innerHTML = '<option value="">Seçin</option>';
            
            data.data.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                buildingSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading buildings for modal:', error);
    }
}

// Load rooms with current filters
async function loadRooms() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.organizationId) {
            params.append('organizationId', currentFilters.organizationId);
        }
        if (currentFilters.buildingId) {
            params.append('buildingId', currentFilters.buildingId);
        }
        
        const response = await fetch(`/api/rooms?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            renderRooms(data.data);
            // Update pagination if available
            if (data.pagination) {
                totalPages = data.pagination.totalPages;
                updatePagination();
            }
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showError('Otaqları yüklərkən xəta baş verdi');
    }
}

// Render rooms in table
function renderRooms(rooms) {
    const tbody = document.getElementById('rooms-table-body');
    
    if (!rooms || rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Heç bir otaq tapılmadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(room.name || '')}</td>
            <td>${escapeHtml(room.description || '-')}</td>
            <td>${room.capacity || '-'}</td>
            <td>${escapeHtml(room.building_name || room.building_id || '-')}</td>
            <td>${escapeHtml(room.organization_name || '-')}</td>
            <td>${room.item_count || 0}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewRoomItems('${room.id}')" title="İnventarı göstər">
                    👁️
                </button>
                <button class="btn btn-warning btn-sm" onclick="editRoom('${room.id}')" title="Redaktə et">
                    ✏️
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteRoom('${room.id}')" title="Sil">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Apply filters
function applyFilters() {
    currentFilters.search = document.getElementById('search-input').value;
    currentFilters.organizationId = document.getElementById('organization-filter').value;
    currentFilters.buildingId = document.getElementById('building-filter').value;
    currentPage = 1;
    loadRooms();
}

// Reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('organization-filter').value = '';
    document.getElementById('building-filter').value = '';
    currentFilters = {
        search: '',
        organizationId: '',
        buildingId: ''
    };
    currentPage = 1;
    loadRooms();
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadRooms();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadRooms();
    }
}

function updatePagination() {
    document.getElementById('page-info').textContent = `Səhifə ${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Open add room modal
function openAddRoomModal() {
    document.getElementById('modal-title').textContent = 'Yeni Otaq Əlavə Et';
    document.getElementById('room-id').value = '';
    document.getElementById('room-name').value = '';
    document.getElementById('room-description').value = '';
    document.getElementById('room-capacity').value = '';
    document.getElementById('room-building').value = '';
    
    loadBuildingsForModal();
    document.getElementById('room-modal').style.display = 'block';
}

// Close room modal
function closeRoomModal() {
    document.getElementById('room-modal').style.display = 'none';
}

// Edit room
async function editRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const room = data.data;
            document.getElementById('modal-title').textContent = 'Otağı Redaktə Et';
            document.getElementById('room-id').value = room.id;
            document.getElementById('room-name').value = room.name || '';
            document.getElementById('room-description').value = room.description || '';
            document.getElementById('room-capacity').value = room.capacity || '';
            document.getElementById('room-building').value = room.building_id || '';
            
            loadBuildingsForModal();
            document.getElementById('room-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading room for edit:', error);
        showError('Otağı yüklərkən xəta baş verdi');
    }
}

// Save room (create or update)
async function saveRoom() {
    const roomId = document.getElementById('room-id').value;
    const name = document.getElementById('room-name').value.trim();
    const description = document.getElementById('room-description').value.trim();
    const capacity = document.getElementById('room-capacity').value;
    const buildingId = document.getElementById('room-building').value;
    
    if (!name || !buildingId) {
        showError('Otaq adı və bina mütləq doldurulmalıdır');
        return;
    }
    
    try {
        const roomData = {
            name,
            description,
            capacity: capacity ? parseInt(capacity) : null,
            building_id: buildingId
        };
        
        let url = '/api/rooms';
        let method = 'POST';
        
        if (roomId) {
            url = `/api/rooms/${roomId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomData),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeRoomModal();
            loadRooms();
            showSuccess(roomId ? 'Otaq uğurla yeniləndi' : 'Otaq uğurla əlavə edildi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error saving room:', error);
        showError('Otağı saxlayarkən xəta baş verdi');
    }
}

// Delete room
function deleteRoom(roomId) {
    document.getElementById('room-id').value = roomId;
    document.getElementById('delete-modal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

// Confirm delete
async function confirmDelete() {
    const roomId = document.getElementById('room-id').value;
    
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeDeleteModal();
            loadRooms();
            showSuccess('Otaq uğurla silindi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        showError('Otağı silərkən xəta baş verdi');
    }
}

// View room items - Redirect to room detail page
function viewRoomItems(roomId) {
    // Redirect to the room detail page
    window.location.href = `/organization/building/room/${roomId}`;
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
