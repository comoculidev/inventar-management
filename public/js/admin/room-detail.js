// Room Detail Page JavaScript
let currentRoomId = null;
let currentRoomInfo = null;
let currentFilters = {
    search: '',
    status: '',
    category: ''
};

let organizations = [];
let buildings = [];
let rooms = [];

// Get room ID from URL path: /organization/building/room/:id
document.addEventListener('DOMContentLoaded', function() {
    const pathParts = window.location.pathname.split('/');
    const roomIndex = pathParts.indexOf('room');
    
    if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
        currentRoomId = pathParts[roomIndex + 1];
        loadRoomDetails(currentRoomId);
        loadItems(currentRoomId);
        loadUserInfo();
        loadOrganizationsForModal();
    } else {
        showError('Otaq ID tapilmadi');
    }
    
    // Add event listeners - only if elements exist
    const searchInput = document.getElementById('room-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyItemFilters();
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
            const userSpan = document.getElementById('current-user');
            const roleSpan = document.getElementById('user-role');
            
            if (userSpan) {
                userSpan.textContent = userData.username || '\u001dstifad\u0019\u0007i';
            }
            if (roleSpan) {
                roleSpan.textContent = userData.role === 'admin' ? 'Admin' : '\u001dstifad\u0019\u0007i';
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Load organizations for modal dropdown
async function loadOrganizationsForModal() {
    try {
        const response = await fetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            organizations = data.data;
            const select = document.getElementById('room-item-organization');
            if (select) {
                select.innerHTML = '<option value="">T\u0019\u00015fkilat se\u0007in</option>';
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    select.appendChild(option);
                });
                
                // Load buildings when organization is selected
                select.addEventListener('change', function() {
                    loadBuildingsForModal(this.value);
                });
            }
        }
    } catch (error) {
        console.error('Error loading organizations for modal:', error);
    }
}

// Load buildings for modal dropdown based on organization
async function loadBuildingsForModal(organizationId) {
    try {
        const url = organizationId 
            ? `/api/buildings/organization/${organizationId}`
            : '/api/buildings';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            buildings = data.data;
            const select = document.getElementById('room-item-building');
            if (select) {
                select.innerHTML = '<option value="">Bina se\u0007in</option>';
                data.data.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = building.name;
                    select.appendChild(option);
                });
                
                // Reset room dropdown
                const roomSelect = document.getElementById('room-item-room');
                if (roomSelect) {
                    roomSelect.innerHTML = '<option value="">Otaq se\u0007in</option>';
                }
                
                // Load rooms when building is selected
                select.addEventListener('change', function() {
                    loadRoomsForModal(this.value);
                });
            }
        }
    } catch (error) {
        console.error('Error loading buildings for modal:', error);
    }
}

// Load rooms for modal dropdown based on building
async function loadRoomsForModal(buildingId) {
    try {
        const url = buildingId 
            ? `/api/rooms/building/${buildingId}`
            : '/api/rooms';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            rooms = data.data;
            const select = document.getElementById('room-item-room');
            if (select) {
                select.innerHTML = '<option value="">Otaq se\u0007in</option>';
                data.data.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = room.name;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading rooms for modal:', error);
    }
}

// Load room details
async function loadRoomDetails(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            currentRoomInfo = data.data;
            const room = data.data;
            
            // Update room info - only if elements exist
            const roomName = document.getElementById('room-name');
            const roomLocation = document.getElementById('room-location');
            const roomCapacity = document.getElementById('room-capacity');
            
            if (roomName) roomName.textContent = room.name || '-';
            if (roomLocation) roomLocation.textContent = room.description || '-';
            if (roomCapacity) roomCapacity.textContent = room.capacity || '-';
            
            // Load item count and stats
            loadItemCount(roomId);
            loadItemStats(roomId);
        } else {
            showError('Otaq melumatlari yuklenmedi');
        }
    } catch (error) {
        console.error('Error loading room details:', error);
        showError('Otaq melumatlarini yuklenmek alinmadi');
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
            const totalItems = document.getElementById('room-total-items');
            if (totalItems) {
                totalItems.textContent = count;
            }
        }
    } catch (error) {
        console.error('Error loading item count:', error);
    }
}

// Load item stats for room
async function loadItemStats(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/items`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const items = data.data || [];
            const activeCount = items.filter(i => i.status === 'active').length;
            const inactiveCount = items.filter(i => i.status === 'inactive').length;
            
            const activeEl = document.getElementById('room-active-items');
            const inactiveEl = document.getElementById('room-inactive-items');
            
            if (activeEl) activeEl.textContent = activeCount;
            if (inactiveEl) inactiveEl.textContent = inactiveCount;
        }
    } catch (error) {
        console.error('Error loading item stats:', error);
    }
}

// Load all items for the room
async function loadItems(roomId) {
    try {
        const params = new URLSearchParams();
        
        const searchInput = document.getElementById('room-search');
        const statusFilter = document.getElementById('room-status-filter');
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        if (statusFilter && statusFilter.value) {
            params.append('status', statusFilter.value);
        }
        
        const response = await fetch(`/api/rooms/${roomId}/items?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            renderItems(data.data);
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showError('Elementler yuklenmek alinmadi');
    }
}

// Render items in table
function renderItems(items) {
    const tbody = document.getElementById('room-items-table-body');
    
    if (!tbody) {
        console.error('Error: room-items-table-body element not found');
        return;
    }
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Hech bir element tapilmadi</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.inventory_number || '')}</td>
            <td>${escapeHtml(item.location || '')}</td>
            <td><span class="badge badge-${getStatusClass(item.status)}">${escapeHtml(item.status || '')}</span></td>
            <td>${escapeHtml(item.category || '')}</td>
            <td>${escapeHtml(item.responsible_person || '')}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editItem('${item.id}')" title="Redakte et">
                    \u270f\ufe0f
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteItem('${item.id}', '${escapeHtml(item.inventory_number || '')}')" title="Sil">
                    \ud83d\uddd1\ufe0f
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Apply filters
function applyItemFilters() {
    const searchInput = document.getElementById('room-search');
    const statusFilter = document.getElementById('room-status-filter');
    
    if (searchInput) currentFilters.search = searchInput.value;
    if (statusFilter) currentFilters.status = statusFilter.value;
    
    if (currentRoomId) {
        loadItems(currentRoomId);
    }
}

// Reset filters
function resetFilters() {
    const searchInput = document.getElementById('room-search');
    const statusFilter = document.getElementById('room-status-filter');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    
    currentFilters = {
        search: '',
        status: '',
        category: ''
    };
    
    if (currentRoomId) {
        loadItems(currentRoomId);
    }
}

// Open add item modal
function openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (!modal) {
        console.error('Error: add-item-modal element not found');
        return;
    }
    
    // Clear form
    const numberInput = document.getElementById('room-item-number');
    const locationInput = document.getElementById('room-item-location');
    const statusSelect = document.getElementById('room-item-status');
    const categorySelect = document.getElementById('room-item-category');
    const responsibleInput = document.getElementById('room-item-responsible');
    const orgSelect = document.getElementById('room-item-organization');
    const buildingSelect = document.getElementById('room-item-building');
    const roomSelect = document.getElementById('room-item-room');
    
    if (numberInput) numberInput.value = '';
    if (locationInput) locationInput.value = '';
    if (statusSelect) statusSelect.value = '';
    if (categorySelect) categorySelect.value = '';
    if (responsibleInput) responsibleInput.value = '';
    if (orgSelect) orgSelect.value = '';
    if (buildingSelect) buildingSelect.innerHTML = '<option value="">Bina se\u0007in</option>';
    if (roomSelect) roomSelect.innerHTML = '<option value="">Otaq se\u0007in</option>';
    
    // Pre-select current room if we have room info
    if (currentRoomInfo && roomSelect) {
        // We need to load the building and organization for this room
        loadRoomHierarchyForModal();
    }
    
    // Show modal
    modal.classList.add('active');
}

// Load room hierarchy for modal
async function loadRoomHierarchyForModal() {
    if (!currentRoomInfo) return;
    
    try {
        // Get building for this room
        const buildingResponse = await fetch(`/api/buildings/${currentRoomInfo.building_id}`);
        const buildingData = await buildingResponse.json();
        
        if (buildingData.success && buildingData.data) {
            const building = buildingData.data;
            
            // Set organization
            const orgSelect = document.getElementById('room-item-organization');
            if (orgSelect) {
                orgSelect.value = building.organization_id;
                await loadBuildingsForModal(building.organization_id);
            }
            
            // Set building
            const buildingSelect = document.getElementById('room-item-building');
            if (buildingSelect) {
                buildingSelect.value = building.id;
                await loadRoomsForModal(building.id);
            }
            
            // Set room
            const roomSelect = document.getElementById('room-item-room');
            if (roomSelect) {
                roomSelect.value = currentRoomInfo.id;
            }
        }
    } catch (error) {
        console.error('Error loading room hierarchy:', error);
    }
}

// Close item modal
function closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (modal) {
        modal.classList.remove('active');
    }
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
            const modal = document.getElementById('add-item-modal');
            
            if (!modal) {
                console.error('Error: add-item-modal element not found');
                return;
            }
            
            // Set form values
            const numberInput = document.getElementById('room-item-number');
            const locationInput = document.getElementById('room-item-location');
            const statusSelect = document.getElementById('room-item-status');
            const categorySelect = document.getElementById('room-item-category');
            const responsibleInput = document.getElementById('room-item-responsible');
            
            if (numberInput) numberInput.value = item.inventory_number || '';
            if (locationInput) locationInput.value = item.location || '';
            if (statusSelect) statusSelect.value = item.status || '';
            if (categorySelect) categorySelect.value = item.category || '';
            if (responsibleInput) responsibleInput.value = item.responsible_person || '';
            
            // Load organization, building, room for the item
            if (item.room_id) {
                const roomResponse = await fetch(`/api/rooms/${item.room_id}`);
                const roomData = await roomResponse.json();
                
                if (roomData.success && roomData.data) {
                    const room = roomData.data;
                    
                    // Get building details
                    const buildingResponse = await fetch(`/api/buildings/${room.building_id}`);
                    const buildingData = await buildingResponse.json();
                    
                    if (buildingData.success && buildingData.data) {
                        const building = buildingData.data;
                        
                        // Set organization
                        const orgSelect = document.getElementById('room-item-organization');
                        if (orgSelect) {
                            orgSelect.value = building.organization_id;
                            await loadBuildingsForModal(building.organization_id);
                        }
                        
                        // Set building
                        const buildingSelect = document.getElementById('room-item-building');
                        if (buildingSelect) {
                            buildingSelect.value = building.id;
                            await loadRoomsForModal(building.id);
                        }
                        
                        // Set room
                        const roomSelect = document.getElementById('room-item-room');
                        if (roomSelect) {
                            roomSelect.value = room.id;
                        }
                    }
                }
            }
            
            // Store item ID for update
            const form = document.getElementById('add-room-item-form');
            if (form) {
                form.dataset.editingId = itemId;
            }
            
            // Show modal
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showError('Element yuklenmek alinmadi');
    }
}

// Save item (create or update)
async function saveItem() {
    const numberInput = document.getElementById('room-item-number');
    const locationInput = document.getElementById('room-item-location');
    const statusSelect = document.getElementById('room-item-status');
    const categorySelect = document.getElementById('room-item-category');
    const responsibleInput = document.getElementById('room-item-responsible');
    const roomSelect = document.getElementById('room-item-room');
    
    const inventory_number = numberInput?.value?.trim() || '';
    const location = locationInput?.value?.trim() || '';
    const status = statusSelect?.value || '';
    const category = categorySelect?.value || '';
    const responsible_person = responsibleInput?.value?.trim() || '';
    const room_id = roomSelect?.value || '';
    
    if (!inventory_number) {
        showError('Inventar nomresi mutleq doldurulmalidir');
        return;
    }
    
    if (!room_id) {
        showError('Otaq mutleq secilmelidir');
        return;
    }
    
    try {
        const itemData = {
            inventory_number,
            location,
            status,
            category,
            responsible_person,
            room_id
        };
        
        const form = document.getElementById('add-room-item-form');
        const editingId = form?.dataset?.editingId;
        
        let url = '/api/inventory-items';
        let method = 'POST';
        
        if (editingId) {
            url = `/api/inventory-items/${editingId}`;
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
            closeAddItemModal();
            if (currentRoomId) {
                loadItems(currentRoomId);
                loadItemCount(currentRoomId);
                loadItemStats(currentRoomId);
            }
            showSuccess(editingId ? 'Element ugurla yenilendi' : 'Element ugurla elave edildi');
        } else {
            showError(data.error || 'Xeta bas verdi');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showError('Elementi saxlayarken xeta bas verdi');
    }
}

// Confirm delete item
function confirmDeleteItem(itemId, itemNumber) {
    if (confirm(`"${itemNumber}" elementini silmek istediyinize eminsiniz?`)) {
        deleteItem(itemId);
    }
}

// Delete item
async function deleteItem(itemId) {
    try {
        const response = await fetch(`/api/inventory-items/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (currentRoomId) {
                loadItems(currentRoomId);
                loadItemCount(currentRoomId);
                loadItemStats(currentRoomId);
            }
            showSuccess('Element ugurla silindi');
        } else {
            showError(data.error || 'Xeta bas verdi');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showError('Elementi silmek alinmadi');
    }
}

// Filter room items
function filterRoomItems() {
    if (currentRoomId) {
        loadItems(currentRoomId);
    }
}

// Go back to rooms page
function goBack() {
    window.location.href = '/admin/rooms';
}

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
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
    alert(`Xeta: ${message}`);
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
