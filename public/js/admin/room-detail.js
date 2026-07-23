// Room Detail Page JavaScript
let currentRoomId = null;
let currentRoomData = null;
let currentFilters = {
    search: '',
    status: '',
    category: ''
};

let organizations = [];

// Helper function to make authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
}

// Get room ID from URL path: /organization/building/room/:id
document.addEventListener('DOMContentLoaded', function() {
    const pathParts = window.location.pathname.split('/');
    const roomIndex = pathParts.indexOf('room');
    
    if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
        currentRoomId = pathParts[roomIndex + 1];
        loadRoomDetails(currentRoomId);
        loadItems(currentRoomId);
        loadUserInfo();
        loadOrganizations();
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

// Load organizations
async function loadOrganizations() {
    try {
        const response = await authenticatedFetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            organizations = data.data;
            
            // Populate organization dropdown in modal
            const orgSelect = document.getElementById('room-item-organization');
            if (orgSelect) {
                orgSelect.innerHTML = '<option value="">Se\u0017in</option>';
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    orgSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Load buildings for item modal (cascading from organization)
async function loadBuildingsForRoomItem(organizationId) {
    try {
        const url = organizationId 
            ? `/api/buildings/organization/${organizationId}`
            : '/api/buildings';
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('room-item-building');
            if (select) {
                select.innerHTML = '<option value="">Se\u0017in</option>';
                data.data.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = building.name;
                    select.appendChild(option);
                });
            }
            
            // Reset room dropdown
            const roomSelect = document.getElementById('room-item-room');
            if (roomSelect) {
                roomSelect.innerHTML = '<option value="">Se\u0017in</option>';
            }
        }
    } catch (error) {
        console.error('Error loading buildings for item:', error);
    }
}

// Load rooms for item modal (cascading from building)
async function loadRoomsForRoomItem(buildingId) {
    try {
        const url = buildingId 
            ? `/api/rooms/building/${buildingId}`
            : '/api/rooms';
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('room-item-room');
            if (select) {
                select.innerHTML = '<option value="">Se\u0017in</option>';
                data.data.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = room.name;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading rooms for item:', error);
    }
}

// Load user info
function loadUserInfo() {
    const user = getCookie('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            const userSpan = document.getElementById('current-user');
            const roleSpan = document.getElementById('user-role');
            
            if (userSpan) {
                userSpan.textContent = userData.username || '\u0130stifad\u0259\u0017i';
            }
            if (roleSpan) {
                roleSpan.textContent = userData.role === 'admin' ? 'Admin' : '\u0130stifad\u0259\u0017i';
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Load room details
async function loadRoomDetails(roomId) {
    try {
        const response = await authenticatedFetch(`/api/rooms/${roomId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            currentRoomData = data.data;
            
            // Update room info - only if elements exist
            const roomName = document.getElementById('room-name');
            const roomLocation = document.getElementById('room-location');
            const roomCapacity = document.getElementById('room-capacity');
            
            if (roomName) roomName.textContent = data.data.name || '-';
            if (roomLocation) roomLocation.textContent = data.data.description || '-';
            if (roomCapacity) roomCapacity.textContent = data.data.capacity || '-';
            
            // Load item count and stats
            loadItemCount(roomId);
            loadItemStats(roomId);
            
            // Pre-load organization and building for the modal
            if (data.data.building_id) {
                // Get building to find organization
                const buildingResponse = await authenticatedFetch(`/api/buildings/${data.data.building_id}`);
                const buildingData = await buildingResponse.json();
                
                if (buildingData.success && buildingData.data && buildingData.data.organization_id) {
                    // Pre-select organization and load buildings
                    const orgSelect = document.getElementById('room-item-organization');
                    if (orgSelect) {
                        orgSelect.value = buildingData.data.organization_id;
                        await loadBuildingsForRoomItem(buildingData.data.organization_id);
                        
                        // Pre-select building
                        const buildingSelect = document.getElementById('room-item-building');
                        if (buildingSelect) {
                            buildingSelect.value = data.data.building_id;
                            await loadRoomsForRoomItem(data.data.building_id);
                            
                            // Pre-select room
                            const roomSelect = document.getElementById('room-item-room');
                            if (roomSelect) {
                                roomSelect.value = roomId;
                            }
                        }
                    }
                }
            }
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
        const response = await authenticatedFetch(`/api/rooms/${roomId}/items`);
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
        const response = await authenticatedFetch(`/api/rooms/${roomId}/items`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const items = data.data;
            const activeCount = items.filter(item => item.status === 'active').length;
            const inactiveCount = items.filter(item => item.status === 'inactive').length;
            
            const activeItems = document.getElementById('room-active-items');
            const inactiveItems = document.getElementById('room-inactive-items');
            
            if (activeItems) activeItems.textContent = activeCount;
            if (inactiveItems) inactiveItems.textContent = inactiveCount;
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
        const categoryFilter = document.getElementById('room-category-filter');
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        if (statusFilter && statusFilter.value) {
            params.append('status', statusFilter.value);
        }
        if (categoryFilter && categoryFilter.value) {
            params.append('category', categoryFilter.value);
        }
        
        const response = await authenticatedFetch(`/api/rooms/${roomId}/items?${params.toString()}`);
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
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">He\u0017 bir element tap\u0131lmad\u0131</td></tr>';
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
    const categoryFilter = document.getElementById('room-category-filter');
    
    if (searchInput) currentFilters.search = searchInput.value;
    if (statusFilter) currentFilters.status = statusFilter.value;
    if (categoryFilter) currentFilters.category = categoryFilter.value;
    
    if (currentRoomId) {
        loadItems(currentRoomId);
    }
}

// Reset filters
function resetFilters() {
    const searchInput = document.getElementById('room-search');
    const statusFilter = document.getElementById('room-status-filter');
    const categoryFilter = document.getElementById('room-category-filter');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
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
    const idInput = document.getElementById('room-item-id');
    const numberInput = document.getElementById('room-item-number');
    const locationInput = document.getElementById('room-item-location');
    const statusSelect = document.getElementById('room-item-status');
    const categorySelect = document.getElementById('room-item-category');
    const responsibleInput = document.getElementById('room-item-responsible');
    
    if (idInput) idInput.value = '';
    if (numberInput) numberInput.value = '';
    if (locationInput) locationInput.value = '';
    if (statusSelect) statusSelect.value = '';
    if (categorySelect) categorySelect.value = '';
    if (responsibleInput) responsibleInput.value = '';
    
    // Reset organization, building, room to current room
    if (currentRoomData) {
        // The organization and building should already be pre-selected from loadRoomDetails
        // Just make sure room is selected
        const roomSelect = document.getElementById('room-item-room');
        if (roomSelect) {
            roomSelect.value = currentRoomId;
        }
    }
    
    // Show modal
    modal.classList.add('active');
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
        const response = await authenticatedFetch(`/api/inventory-items/${itemId}`);
        const data = await response.json();
        
        if (data.success) {
            const item = data.data;
            const modal = document.getElementById('add-item-modal');
            
            if (!modal) {
                console.error('Error: add-item-modal element not found');
                return;
            }
            
            // Set form values
            const idInput = document.getElementById('room-item-id');
            const numberInput = document.getElementById('room-item-number');
            const locationInput = document.getElementById('room-item-location');
            const statusSelect = document.getElementById('room-item-status');
            const categorySelect = document.getElementById('room-item-category');
            const responsibleInput = document.getElementById('room-item-responsible');
            
            if (idInput) idInput.value = item.id;
            if (numberInput) numberInput.value = item.inventory_number || '';
            if (locationInput) locationInput.value = item.location || '';
            if (statusSelect) statusSelect.value = item.status || '';
            if (categorySelect) categorySelect.value = item.category || '';
            if (responsibleInput) responsibleInput.value = item.responsible_person || '';
            
            // Load organization and set value
            if (item.room_id) {
                // Load the room details to get building and organization
                const roomResponse = await authenticatedFetch(`/api/rooms/${item.room_id}`);
                const roomData = await roomResponse.json();
                
                if (roomData.success && roomData.data) {
                    const room = roomData.data;
                    
                    // Set organization
                    if (room.organization_id) {
                        const orgSelect = document.getElementById('room-item-organization');
                        if (orgSelect) {
                            orgSelect.value = room.organization_id;
                            await loadBuildingsForRoomItem(room.organization_id);
                        }
                    }
                    
                    // Set building
                    if (room.building_id) {
                        const buildingSelect = document.getElementById('room-item-building');
                        if (buildingSelect) {
                            buildingSelect.value = room.building_id;
                            await loadRoomsForRoomItem(room.building_id);
                        }
                    }
                    
                    // Set room
                    const roomSelect = document.getElementById('room-item-room');
                    if (roomSelect) {
                        roomSelect.value = item.room_id;
                    }
                }
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
    const idInput = document.getElementById('room-item-id');
    const numberInput = document.getElementById('room-item-number');
    const locationInput = document.getElementById('room-item-location');
    const statusSelect = document.getElementById('room-item-status');
    const categorySelect = document.getElementById('room-item-category');
    const responsibleInput = document.getElementById('room-item-responsible');
    const roomSelect = document.getElementById('room-item-room');
    
    const id = idInput?.value || '';
    const inventory_number = numberInput?.value?.trim() || '';
    const location = locationInput?.value?.trim() || '';
    const status = statusSelect?.value || '';
    const category = categorySelect?.value || '';
    const responsible_person = responsibleInput?.value?.trim() || '';
    const room_id = roomSelect?.value || '';
    
    if (!inventory_number || !room_id) {
        showError('\u0130nventar n\u00f6mr\u0259si v\u0259 otaq m\u00fctl\u0259q doldurulmal\u0131d\u0131r');
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
        
        let url = '/api/inventory-items';
        let method = 'POST';
        
        if (id) {
            url = `/api/inventory-items/${id}`;
            method = 'PUT';
        }
        
        const response = await authenticatedFetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeAddItemModal();
            if (currentRoomId) {
                loadItems(currentRoomId);
                loadItemCount(currentRoomId);
                loadItemStats(currentRoomId);
            }
            showSuccess(id ? 'Element u\u011furla yenilendi' : 'Element u\u011furla \u0259lav\u0259 edildi');
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
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    
    document.getElementById('delete-item-info').textContent = `\u0130nventar n\u00f6mr\u0259si: ${itemNumber}`;
    modal.dataset.itemId = itemId;
    modal.classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Confirm delete
async function confirmDelete() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    
    const id = modal.dataset.itemId;
    
    try {
        const response = await authenticatedFetch(`/api/inventory-items/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeDeleteModal();
            if (currentRoomId) {
                loadItems(currentRoomId);
                loadItemCount(currentRoomId);
                loadItemStats(currentRoomId);
            }
            showSuccess('Element u\u011furla silindi');
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
