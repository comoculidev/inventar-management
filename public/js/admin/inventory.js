// Admin Inventory Management JavaScript

let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    organizationId: '',
    buildingId: '',
    category: ''
};

let organizations = [];
let buildings = [];
let rooms = [];

// Helper function to make authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrganizations();
    loadInventoryItems();
    fetchCurrentUser();
    
    // Add event listeners
    const searchInput = document.getElementById('search-inventory');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    const orgFilter = document.getElementById('organization-filter');
    if (orgFilter) {
        orgFilter.addEventListener('change', function() {
            loadBuildings(this.value);
        });
    }
    
    const buildingFilter = document.getElementById('building-filter');
    if (buildingFilter) {
        buildingFilter.addEventListener('change', function() {
            loadRoomsByBuilding(this.value);
        });
    }
    
    // Preview Excel file
    const excelFile = document.getElementById('excel-file');
    if (excelFile) {
        excelFile.addEventListener('change', function(e) {
            previewExcel(e.target.files[0]);
        });
    }
});

// Load organizations for filter
async function loadOrganizations() {
    try {
        const response = await authenticatedFetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            organizations = data.data;
            
            // Populate filter dropdown
            const filterSelect = document.getElementById('organization-filter');
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">Btn tkilatlar</option>';
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    filterSelect.appendChild(option);
                });
            }
            
            // Populate item organization dropdown
            const itemOrgSelect = document.getElementById('item-organization');
            if (itemOrgSelect) {
                itemOrgSelect.innerHTML = '<option value="">Sein</option>';
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    itemOrgSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Load buildings for filter
async function loadBuildings(organizationId) {
    try {
        const url = organizationId 
            ? `/api/buildings/organization/${organizationId}`
            : '/api/buildings';
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            buildings = data.data;
            const select = document.getElementById('building-filter');
            if (select) {
                select.innerHTML = '<option value="">Btn binalar</option>';
                data.data.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = building.name;
                    select.appendChild(option);
                });
            }
            
            // Reset building and room filters
            const buildingFilter = document.getElementById('building-filter');
            const roomFilter = document.getElementById('room-id');
            if (buildingFilter) buildingFilter.value = '';
            if (roomFilter) roomFilter.value = '';
            
            loadRoomsByBuilding('');
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

// Load buildings for item modal (cascading from organization)
async function loadBuildingsForItem(organizationId) {
    try {
        const url = organizationId 
            ? `/api/buildings/organization/${organizationId}`
            : '/api/buildings';
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('item-building');
            if (select) {
                select.innerHTML = '<option value="">Sein</option>';
                data.data.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = building.name;
                    select.appendChild(option);
                });
            }
            
            // Reset room dropdown
            const roomSelect = document.getElementById('item-room');
            if (roomSelect) {
                roomSelect.innerHTML = '<option value="">Sein</option>';
            }
        }
    } catch (error) {
        console.error('Error loading buildings for item:', error);
    }
}

// Load rooms for filter
async function loadRoomsByBuilding(buildingId) {
    try {
        const url = buildingId 
            ? `/api/rooms/building/${buildingId}`
            : '/api/rooms';
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('room-id');
            if (select) {
                select.innerHTML = '<option value="">Sein</option>';
                data.data.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = room.name;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading rooms by building:', error);
    }
}

// Load rooms for item modal (cascading from building)
async function loadRoomsForItem(buildingId) {
    try {
        const url = buildingId 
            ? `/api/rooms/building/${buildingId}`
            : '/api/rooms';
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('item-room');
            if (select) {
                select.innerHTML = '<option value="">Sein</option>';
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

// Load rooms
async function loadRooms() {
    try {
        const response = await authenticatedFetch('/api/rooms');
        const data = await response.json();
        
        if (data.success) {
            rooms = data.data;
            const select = document.getElementById('room-id');
            if (select) {
                select.innerHTML = '<option value="">Sein</option>';
                data.data.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = room.name;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// Load inventory items
async function loadInventoryItems() {
    try {
        const params = new URLSearchParams(currentFilters);
        params.append('page', currentPage);
        params.append('limit', 20);
        
        const response = await authenticatedFetch(`/api/inventory-items/filter?${params}`);
        const data = await response.json();
        
        if (data.success) {
            renderInventoryTable(data.data.data || data.data);
            if (data.data.pagination) {
                currentPage = data.data.pagination.page;
                totalPages = data.data.pagination.totalPages;
            }
        }
    } catch (error) {
        console.error('Error loading inventory items:', error);
        showAlert('\u0130nventar \u0259\u015fyalar\u0131 y\u00fckl\u0259n\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Render inventory table
function renderInventoryTable(items) {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">He\u0017 bir \u0259\u015fya tap\u0131lmad\u0131</td>';
        tbody.appendChild(row);
        return;
    }
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.inventory_number || '-')}</td>
            <td>${escapeHtml(item.location || '-')}</td>
            <td><span class="badge badge-${getStatusBadgeClass(item.status)}">${escapeHtml(item.status || '-')}</span></td>
            <td>${escapeHtml(item.category || '-')}</td>
            <td>${escapeHtml(item.responsible_person || '-')}</td>
            <td>${escapeHtml(item.room_name || item.room_id || '-')}</td>
            <td class="actions">
                <button class="btn btn-info btn-icon" onclick="openEditItemModal('${item.id}')" title="Redakt\u0259 et">
                    \u270f\ufe0f
                </button>
                <button class="btn btn-danger btn-icon" onclick="confirmDeleteItem('${item.id}', '${escapeHtml(item.inventory_number || '')}')" title="Sil">
                    \ud83d\uddd1\ufe0f
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
        case 'active': return 'success';
        case 'inactive': return 'warning';
        case 'maintenance': return 'info';
        case 'lost': return 'danger';
        default: return 'info';
    }
}

// Apply filters
function applyFilters() {
    currentFilters = {
        search: document.getElementById('search-inventory')?.value || '',
        organizationId: document.getElementById('organization-filter')?.value || '',
        buildingId: document.getElementById('building-filter')?.value || '',
        category: document.getElementById('category-filter')?.value || ''
    };
    currentPage = 1;
    loadInventoryItems();
}

// Reset filters
function resetFilters() {
    const searchInput = document.getElementById('search-inventory');
    const orgFilter = document.getElementById('organization-filter');
    const buildingFilter = document.getElementById('building-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) searchInput.value = '';
    if (orgFilter) orgFilter.value = '';
    if (buildingFilter) buildingFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
    currentFilters = {
        search: '',
        organizationId: '',
        buildingId: '',
        category: ''
    };
    currentPage = 1;
    loadInventoryItems();
}

// Previous page
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadInventoryItems();
    }
}

// Next page
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadInventoryItems();
    }
}

// Open add item modal
function openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (!modal) return;
    
    document.getElementById('modal-title').textContent = 'Yeni \u0130nventar Elementi';
    document.getElementById('item-id').value = '';
    document.getElementById('inventory-number').value = '';
    document.getElementById('item-location').value = '';
    document.getElementById('item-status').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('item-responsible').value = '';
    
    // Load organization dropdown
    const orgSelect = document.getElementById('item-organization');
    if (orgSelect && orgSelect.options.length <= 1) {
        loadOrganizations();
    }
    
    // Reset building and room dropdowns
    const buildingSelect = document.getElementById('item-building');
    const roomSelect = document.getElementById('item-room');
    if (buildingSelect) buildingSelect.innerHTML = '<option value="">Se\u0017in</option>';
    if (roomSelect) roomSelect.innerHTML = '<option value="">Se\u0017in</option>';
    
    modal.classList.add('active');
}

// Open edit item modal
async function openEditItemModal(id) {
    try {
        const response = await authenticatedFetch(`/api/inventory-items/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const item = data.data;
            const modal = document.getElementById('add-item-modal');
            if (!modal) return;
            
            document.getElementById('modal-title').textContent = '\u0130nventar Elementini Redakt\u0259 Et';
            document.getElementById('item-id').value = item.id;
            document.getElementById('inventory-number').value = item.inventory_number || '';
            document.getElementById('item-location').value = item.location || '';
            document.getElementById('item-status').value = item.status || '';
            document.getElementById('item-category').value = item.category || '';
            document.getElementById('item-responsible').value = item.responsible_person || '';
            
            // Load organization and set value
            const orgSelect = document.getElementById('item-organization');
            if (orgSelect && orgSelect.options.length <= 1) {
                await loadOrganizations();
            }
            
            // If we have room_id, we need to find the organization and building
            if (item.room_id) {
                // Load the room details to get building and organization
                const roomResponse = await authenticatedFetch(`/api/rooms/${item.room_id}`);
                const roomData = await roomResponse.json();
                
                if (roomData.success && roomData.data) {
                    const room = roomData.data;
                    
                    // Set organization
                    if (room.organization_id) {
                        const orgSelect = document.getElementById('item-organization');
                        if (orgSelect) {
                            orgSelect.value = room.organization_id;
                            await loadBuildingsForItem(room.organization_id);
                        }
                    }
                    
                    // Set building
                    if (room.building_id) {
                        const buildingSelect = document.getElementById('item-building');
                        if (buildingSelect) {
                            buildingSelect.value = room.building_id;
                            await loadRoomsForItem(room.building_id);
                        }
                    }
                    
                    // Set room
                    const roomSelect = document.getElementById('item-room');
                    if (roomSelect) {
                        roomSelect.value = item.room_id;
                    }
                }
            }
            
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showAlert('Element y\u00fckl\u0259n\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Close item modal
function closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save item
async function saveItem() {
    const id = document.getElementById('item-id')?.value || '';
    const inventoryNumber = document.getElementById('inventory-number')?.value?.trim() || '';
    const location = document.getElementById('item-location')?.value?.trim() || '';
    const status = document.getElementById('item-status')?.value || '';
    const roomId = document.getElementById('item-room')?.value || '';
    const responsiblePerson = document.getElementById('item-responsible')?.value?.trim() || '';
    const category = document.getElementById('item-category')?.value || '';
    
    if (!inventoryNumber || !roomId) {
        showAlert('\u0130nventar n\u00f6mr\u0259si v\u0259 otaq m\u00fctl\u0259q doldurulmal\u0131d\u0131r', 'error');
        return;
    }
    
    try {
        const data = {
            inventory_number: inventoryNumber,
            location,
            status,
            responsible_person: responsiblePerson,
            category,
            room_id: roomId
        };
        
        let response;
        if (id) {
            response = await authenticatedFetch(`/api/inventory-items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await authenticatedFetch('/api/inventory-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            closeAddItemModal();
            loadInventoryItems();
            showAlert(id ? '\u018f\u015fya u\u011furla redakt\u0259 edildi' : '\u018f\u015fya u\u011furla \u0259lav\u0259 edildi', 'success');
        } else {
            showAlert(result.error || 'X\u0259ta ba\u015f verdi', 'error');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showAlert('Elementi yadda saxlayark\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Confirm delete item
function confirmDeleteItem(id, inventoryNumber) {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    
    document.getElementById('delete-item-info').textContent = `\u0130nventar n\u00f6mr\u0259si: ${inventoryNumber}`;
    modal.dataset.itemId = id;
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
        
        const result = await response.json();
        
        if (result.success) {
            closeDeleteModal();
            loadInventoryItems();
            showAlert('\u018f\u015fya u\u011furla silindi', 'success');
        } else {
            showAlert(result.error || 'X\u0259ta ba\u015f verdi', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('\u018f\u015fya silin\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Open import modal
function openImportModal() {
    const modal = document.getElementById('import-modal');
    if (!modal) return;
    
    document.getElementById('excel-file').value = '';
    document.getElementById('import-preview').style.display = 'none';
    modal.classList.add('active');
}

// Close import modal
function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Preview Excel file
async function previewExcel(file) {
    if (!file) return;
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Note: Preview would require server-side parsing
        // For now, just show file name
        const preview = document.getElementById('import-preview');
        const previewTable = document.getElementById('preview-table');
        if (preview && previewTable) {
            preview.style.display = 'block';
            previewTable.innerHTML = `<p>Fayl: ${escapeHtml(file.name)}</p>`;
        }
    } catch (error) {
        console.error('Error previewing Excel:', error);
    }
}

// Import Excel
async function importExcel() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput?.files[0];
    
    if (!file) {
        showAlert('Z\u0259hm\u0259t olmasa, fayl se\u0017in', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await authenticatedFetch('/api/inventory-items/import', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeImportModal();
            loadInventoryItems();
            showAlert(`${result.message || 'Fayl u\u011furla idxal edildi'}`, 'success');
            
            // Show invalid items if any
            if (result.invalidItems && result.invalidItems.length > 0) {
                showAlert(`${result.invalidItems.length} \u0259d\u0259d s\u0259tir x\u0259tal\u0131d\u0131r v\u0259 idxal edilm\u0259mi\u015fdir`, 'warning');
            }
        } else {
            showAlert(result.error || 'X\u0259ta ba\u015f verdi', 'error');
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        showAlert('Fayl idxal olunark\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Fetch current user
async function fetchCurrentUser() {
    try {
        const response = await authenticatedFetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.data) {
            const userSpan = document.getElementById('current-user');
            const roleSpan = document.getElementById('user-role');
            
            if (userSpan) {
                userSpan.textContent = data.data.username;
            }
            if (roleSpan) {
                roleSpan.textContent = data.data.role === 'admin' ? 'Admin' : '\u0130stifad\u0259\u0017i';
                roleSpan.className = `badge badge-${data.data.role === 'admin' ? 'info' : 'success'}`;
            }
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
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
    // Simple alert for now - can be replaced with toast notifications
    alert(message);
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
