// Rooms Management JavaScript
let currentFilters = {
    search: '',
    organizationId: '',
    buildingId: ''
};
let editingRoomId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    loadOrganizations();
    loadRooms();
    
    // Add event listeners for filter changes
    const orgFilter = document.getElementById('organization-room-filter');
    const buildingFilter = document.getElementById('building-room-filter');
    const searchInput = document.getElementById('search-rooms');
    
    if (orgFilter) {
        orgFilter.addEventListener('change', function() {
            loadBuildingsForRooms(this.value);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
});

// Load organizations for filter dropdown
async function loadOrganizations() {
    try {
        const response = await fetch('/api/organizations', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            const orgSelect = document.getElementById('organization-room-filter');
            const orgModalSelect = document.getElementById('room-organization');
            
            if (orgSelect) {
                orgSelect.innerHTML = '<option value="">Bütün təşkilatlar</option>';
                
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    orgSelect.appendChild(option);
                });
            }
            
            if (orgModalSelect) {
                orgModalSelect.innerHTML = '<option value="">Seçin</option>';
                
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    orgModalSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Load buildings for filter dropdown (cascading from organization)
async function loadBuildingsForRooms(organizationId) {
    const buildingSelect = document.getElementById('building-room-filter');
    
    if (!buildingSelect) return;
    
    try {
        let url = '/api/buildings';
        if (organizationId) {
            url = `/api/buildings/organization/${organizationId}`;
        }
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            buildingSelect.innerHTML = '<option value="">Bütün binalar</option>';
            
            data.data.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                buildingSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading buildings for filter:', error);
    }
}

// Load buildings for room modal (cascading from organization)
async function loadBuildingsForRoomModal(organizationId) {
    try {
        let url = '/api/buildings';
        if (organizationId) {
            url = `/api/buildings/organization/${organizationId}`;
        }
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            const buildingSelect = document.getElementById('room-building');
            if (buildingSelect) {
                buildingSelect.innerHTML = '<option value="">Seçin</option>';
                
                data.data.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = building.name;
                    buildingSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading buildings for modal:', error);
    }
}

// Load rooms with current filters
async function loadRooms() {
    try {
        const params = new URLSearchParams();
        
        const searchInput = document.getElementById('search-rooms');
        const orgFilter = document.getElementById('organization-room-filter');
        const buildingFilter = document.getElementById('building-room-filter');
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        if (orgFilter && orgFilter.value) {
            params.append('organizationId', orgFilter.value);
        }
        if (buildingFilter && buildingFilter.value) {
            params.append('buildingId', buildingFilter.value);
        }
        
        const response = await fetch(`/api/rooms?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            renderRooms(data.data);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showError('Otaqlar yüklənərkən xəta baş verdi');
    }
}

// Render rooms in table
function renderRooms(rooms) {
    const tbody = document.getElementById('rooms-table-body');
    
    if (!tbody) {
        console.error('Error: rooms-table-body element not found');
        return;
    }
    
    if (!rooms || rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Heç bir otaq tapılmadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    rooms.forEach(room => {
        const row = document.createElement('tr');
        const itemCount = room.item_count || 0;
        
        row.innerHTML = `
            <td>${escapeHtml(room.name || '')}</td>
            <td>${escapeHtml(room.building_name || room.building_id || '-')}</td>
            <td>${escapeHtml(room.organization_name || '-')}</td>
            <td>
                <a href="/organization/building/room/${room.id}" class="btn btn-info btn-sm" title="Elementləri göstər">
                    ${itemCount} element
                </a>
            </td>
            <td>${room.capacity || '-'}</td>
            <td>${escapeHtml(room.description || '-')}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditRoomModal('${room.id}')" title="Redaktə et">
                    \u270f\ufe0f
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteRoom('${room.id}', '${escapeHtml(room.name || '')}')" title="Sil">
                    \ud83d\uddd1\ufe0f
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Apply filters
function applyFilters() {
    const searchInput = document.getElementById('search-rooms');
    const orgFilter = document.getElementById('organization-room-filter');
    const buildingFilter = document.getElementById('building-room-filter');
    
    if (searchInput) currentFilters.search = searchInput.value;
    if (orgFilter) currentFilters.organizationId = orgFilter.value;
    if (buildingFilter) currentFilters.buildingId = buildingFilter.value;
    
    loadRooms();
}

// Reset filters
function resetFilters() {
    const searchInput = document.getElementById('search-rooms');
    const orgFilter = document.getElementById('organization-room-filter');
    const buildingFilter = document.getElementById('building-room-filter');
    
    if (searchInput) searchInput.value = '';
    if (orgFilter) orgFilter.value = '';
    if (buildingFilter) buildingFilter.value = '';
    
    currentFilters = {
        search: '',
        organizationId: '',
        buildingId: ''
    };
    loadRooms();
}

// Open add room modal
function openAddRoomModal() {
    const modal = document.getElementById('add-room-modal');
    if (!modal) {
        console.error('Error: add-room-modal element not found');
        return;
    }
    
    // Clear form
    const idInput = document.getElementById('room-id');
    const nameInput = document.getElementById('room-name');
    const descInput = document.getElementById('room-description');
    const capacityInput = document.getElementById('room-capacity');
    const buildingSelect = document.getElementById('room-building');
    const orgSelect = document.getElementById('room-organization');
    const modalTitle = modal.querySelector('.modal-header h3');
    
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (capacityInput) capacityInput.value = '';
    if (buildingSelect) buildingSelect.value = '';
    if (orgSelect) orgSelect.value = '';
    if (modalTitle) modalTitle.textContent = 'Yeni Otaq';
    
    // Reset editing state
    editingRoomId = null;
    
    // Load organizations for modal
    const orgModalSelect = document.getElementById('room-organization');
    if (orgModalSelect && orgModalSelect.options.length <= 1) {
        loadOrganizations();
    }
    
    // Show modal
    modal.classList.add('active');
}

// Open edit room modal
async function openEditRoomModal(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const room = data.data;
            const modal = document.getElementById('add-room-modal');
            
            if (!modal) {
                console.error('Error: add-room-modal element not found');
                return;
            }
            
            // Set form values
            const idInput = document.getElementById('room-id');
            const nameInput = document.getElementById('room-name');
            const descInput = document.getElementById('room-description');
            const capacityInput = document.getElementById('room-capacity');
            const buildingSelect = document.getElementById('room-building');
            const orgSelect = document.getElementById('room-organization');
            const modalTitle = modal.querySelector('.modal-header h3');
            
            if (idInput) idInput.value = room.id || '';
            if (nameInput) nameInput.value = room.name || '';
            if (descInput) descInput.value = room.description || '';
            if (capacityInput) capacityInput.value = room.capacity || '';
            if (buildingSelect) buildingSelect.value = room.building_id || '';
            if (orgSelect) orgSelect.value = room.organization_id || '';
            if (modalTitle) modalTitle.textContent = 'Otağı Redaktə Et';
            
            // Set editing state
            editingRoomId = roomId;
            
            // Load organizations and buildings
            if (orgSelect && orgSelect.options.length <= 1) {
                await loadOrganizations();
            }
            
            // Load buildings for selected organization
            if (room.organization_id) {
                await loadBuildingsForRoomModal(room.organization_id);
            }
            
            // Show modal
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading room for edit:', error);
        showError('Otaq yüklənərkən xəta baş verdi');
    }
}

// Close room modal
function closeAddRoomModal() {
    const modal = document.getElementById('add-room-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingRoomId = null;
}

// Close delete room modal
function closeDeleteRoomModal() {
    const modal = document.getElementById('delete-room-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save room (create or update)
async function saveRoom() {
    const idInput = document.getElementById('room-id');
    const nameInput = document.getElementById('room-name');
    const descInput = document.getElementById('room-description');
    const capacityInput = document.getElementById('room-capacity');
    const buildingSelect = document.getElementById('room-building');
    
    const id = idInput?.value || '';
    const name = nameInput?.value?.trim() || '';
    const description = descInput?.value?.trim() || '';
    const capacity = capacityInput?.value;
    const buildingId = buildingSelect?.value;
    
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
        
        if (id) {
            url = `/api/rooms/${id}`;
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
            closeAddRoomModal();
            loadRooms();
            showSuccess(id ? 'Otaq uğurla yeniləndi' : 'Otaq uğurla əlavə edildi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error saving room:', error);
        showError('Otaq yadda saxlanarkən xəta baş verdi');
    }
}

// Confirm delete room
function confirmDeleteRoom(roomId, roomName) {
    const modal = document.getElementById('delete-room-modal');
    if (!modal) {
        if (confirm(`"${roomName}" otağını silmək istədiyinizə əminsiniz?`)) {
            deleteRoom(roomId);
        }
        return;
    }
    
    document.getElementById('delete-room-info').textContent = `"${roomName}" otağını silmək istədiyinizə əminsiniz?`;
    modal.dataset.roomId = roomId;
    modal.classList.add('active');
}

// Confirm delete from modal
async function confirmDelete() {
    const modal = document.getElementById('delete-room-modal');
    if (!modal) return;
    
    const roomId = modal.dataset.roomId;
    const roomName = modal.dataset.roomName;
    
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeDeleteRoomModal();
            loadRooms();
            showSuccess('Otaq uğurla silindi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        showError('Otaq silinərkən xəta baş verdi');
    }
}

// Delete room (called from confirmDeleteRoom if no modal)
async function deleteRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadRooms();
            showSuccess('Otaq uğurla silindi');
        } else {
            showError(data.error || 'Xəta baş verdi');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        showError('Otaq silinərkən xəta baş verdi');
    }
}

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
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

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
