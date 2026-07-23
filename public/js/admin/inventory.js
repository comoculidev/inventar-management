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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrganizations();
    loadInventoryItems();
    fetchCurrentUser();
    
    // Add event listeners
    document.getElementById('search-inventory').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    document.getElementById('organization-filter').addEventListener('change', function() {
        loadBuildings(this.value);
    });
    
    document.getElementById('building-filter').addEventListener('change', function() {
        loadRoomsByBuilding(this.value);
    });
    
    // Preview Excel file
    document.getElementById('excel-file').addEventListener('change', function(e) {
        previewExcel(e.target.files[0]);
    });
    
    // Load organizations for modal dropdown
    loadOrganizationsForModal();
});

// Load organizations for filter
async function loadOrganizations() {
    try {
        const response = await fetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            organizations = data.data;
            const select = document.getElementById('organization-filter');
            select.innerHTML = '<option value="">Btn tkilatlar</option>';
            data.data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Load organizations for modal dropdown
async function loadOrganizationsForModal() {
    try {
        const response = await fetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('item-organization');
            if (select) {
                select.innerHTML = '<option value="">Tkilat sein</option>';
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
            const select = document.getElementById('item-building');
            if (select) {
                select.innerHTML = '<option value="">Bina sein</option>';
                data.data.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = building.name;
                    select.appendChild(option);
                });
                
                // Reset room dropdown
                document.getElementById('item-room').innerHTML = '<option value="">Otaq sein</option>';
                
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
            const select = document.getElementById('item-room');
            if (select) {
                select.innerHTML = '<option value="">Otaq sein</option>';
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

// Load buildings for filter
async function loadBuildings(organizationId) {
    try {
        const url = organizationId 
            ? `/api/buildings/organization/${organizationId}`
            : '/api/buildings';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            buildings = data.data;
            const select = document.getElementById('building-filter');
            select.innerHTML = '<option value="">Btn binalar</option>';
            data.data.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                select.appendChild(option);
            });
            
            // Reset building and room filters
            document.getElementById('building-filter').value = '';
            loadRoomsByBuilding('');
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

// Load rooms for filter
async function loadRooms() {
    try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        
        if (data.success) {
            rooms = data.data;
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// Load rooms by building
async function loadRoomsByBuilding(buildingId) {
    try {
        const url = buildingId 
            ? `/api/rooms/building/${buildingId}`
            : '/api/rooms';
        const response = await fetch(url);
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

// Load inventory items
async function loadInventoryItems() {
    try {
        const params = new URLSearchParams(currentFilters);
        
        const response = await fetch(`/api/inventory-items/filter?${params}`);
        const data = await response.json();
        
        if (data.success) {
            renderInventoryTable(data.data);
        }
    } catch (error) {
        console.error('Error loading inventory items:', error);
        showAlert('nventar yalar yklnrkn xta ba verdi', 'error');
    }
}

// Render inventory table
function renderInventoryTable(items) {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    
    if (items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">He bir ya taplmad</td>';
        tbody.appendChild(row);
        return;
    }
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.inventory_number || '-'}</td>
            <td>${item.location || '-'}</td>
            <td><span class="badge badge-${getStatusBadgeClass(item.status)}">${item.status || '-'}</span></td>
            <td>${item.category || '-'}</td>
            <td>${item.responsible_person || '-'}</td>
            <td>${item.room_name || '-'}</td>
            <td class="actions">
                <button class="btn btn-info btn-icon" onclick="openEditItemModal('${item.id}')"></button>
                <button class="btn btn-danger btn-icon" onclick="confirmDeleteItem('${item.id}', '${item.inventory_number}')"></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update pagination
    updatePagination();
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

// Update pagination
function updatePagination() {
    document.getElementById('page-info').textContent = `Shif ${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Apply filters
function applyFilters() {
    currentFilters = {
        search: document.getElementById('search-inventory').value,
        organizationId: document.getElementById('organization-filter').value,
        buildingId: document.getElementById('building-filter').value,
        category: document.getElementById('category-filter').value
    };
    loadInventoryItems();
}

// Reset filters
function resetFilters() {
    document.getElementById('search-inventory').value = '';
    document.getElementById('organization-filter').value = '';
    document.getElementById('building-filter').value = '';
    document.getElementById('category-filter').value = '';
    currentFilters = {
        search: '',
        organizationId: '',
        buildingId: '',
        category: ''
    };
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
    // Reset form
    document.getElementById('item-id').value = '';
    document.getElementById('item-number').value = '';
    document.getElementById('item-location').value = '';
    document.getElementById('item-status').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('item-responsible').value = '';
    
    // Reset dropdowns
    document.getElementById('item-organization').value = '';
    document.getElementById('item-building').innerHTML = '<option value="">Bina sein</option>';
    document.getElementById('item-room').innerHTML = '<option value="">Otaq sein</option>';
    
    document.getElementById('add-item-modal').classList.add('active');
}

// Open edit item modal
async function openEditItemModal(id) {
    try {
        const response = await fetch(`/api/inventory-items/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const item = data.data;
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-number').value = item.inventory_number || '';
            document.getElementById('item-location').value = item.location || '';
            document.getElementById('item-status').value = item.status || '';
            document.getElementById('item-category').value = item.category || '';
            document.getElementById('item-responsible').value = item.responsible_person || '';
            
            // Load organization, building, room for the item
            if (item.room_id) {
                // Get room details to find building and organization
                const roomResponse = await fetch(`/api/rooms/${item.room_id}`);
                const roomData = await roomResponse.json();
                
                if (roomData.success && roomData.data) {
                    const room = roomData.data;
                    document.getElementById('item-room').value = room.id;
                    
                    // Get building details
                    const buildingResponse = await fetch(`/api/buildings/${room.building_id}`);
                    const buildingData = await buildingResponse.json();
                    
                    if (buildingData.success && buildingData.data) {
                        const building = buildingData.data;
                        document.getElementById('item-building').value = building.id;
                        
                        // Load buildings for this organization
                        await loadBuildingsForModal(building.organization_id);
                        document.getElementById('item-organization').value = building.organization_id;
                    }
                }
            }
            
            document.getElementById('add-item-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showAlert('ya yklnrkn xta ba verdi', 'error');
    }
}

// Close item modal
function closeAddItemModal() {
    document.getElementById('add-item-modal').classList.remove('active');
}

// Save item
async function saveItem() {
    const id = document.getElementById('item-id').value;
    const inventoryNumber = document.getElementById('item-number').value;
    const location = document.getElementById('item-location').value;
    const status = document.getElementById('item-status').value;
    const roomId = document.getElementById('item-room').value;
    const responsiblePerson = document.getElementById('item-responsible').value;
    const category = document.getElementById('item-category').value;
    
    if (!inventoryNumber || !status || !roomId) {
        showAlert('nventar nmrsi, status v otaq mtlq doldurulmaldr', 'error');
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
            response = await fetch(`/api/inventory-items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/inventory-items', {
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
            showAlert(id ? 'ya uurla redakt edildi' : 'ya uurla lav edildi', 'success');
        } else {
            showAlert(result.error || 'Xta ba verdi', 'error');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showAlert('ya yadda saxlanarkn xta ba verdi', 'error');
    }
}

// Confirm delete item
function confirmDeleteItem(id, inventoryNumber) {
    if (confirm(`"${inventoryNumber}" elementini silmek istediyinize eminsiniz?`)) {
        deleteItem(id);
    }
}

// Delete item
async function deleteItem(id) {
    try {
        const response = await fetch(`/api/inventory-items/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadInventoryItems();
            showAlert('ya uurla silindi', 'success');
        } else {
            showAlert(result.error || 'Xta ba verdi', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('ya silinrkn xta ba verdi', 'error');
    }
}

// Open import modal
function openImportModal() {
    document.getElementById('excel-file').value = '';
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-modal').classList.add('active');
}

// Close import modal
function closeImportModal() {
    document.getElementById('import-modal').classList.remove('active');
}

// Preview Excel file
async function previewExcel(file) {
    if (!file) return;
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Note: Preview would require server-side parsing
        // For now, just show file name
        document.getElementById('import-preview').style.display = 'block';
        document.getElementById('preview-table').innerHTML = `<p>Fayl: ${file.name}</p>`;
    } catch (error) {
        console.error('Error previewing Excel:', error);
    }
}

// Import Excel
async function importExcelFile() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Zhmt olmasa, fayl sein', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/inventory-items/import', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeImportModal();
            loadInventoryItems();
            showAlert(`${result.message || 'Fayl uurla idxal edildi'}`, 'success');
            
            // Show invalid items if any
            if (result.invalidItems && result.invalidItems.length > 0) {
                showAlert(`${result.invalidItems.length} dd stir xtaldr v idxal edilmmidir`, 'warning');
            }
        } else {
            showAlert(result.error || 'Xta ba verdi', 'error');
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        showAlert('Fayl idxal olunarkn xta ba verdi', 'error');
    }
}

// Fetch current user
async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.data) {
            document.getElementById('current-user').textContent = data.data.username;
            const roleBadge = document.getElementById('user-role');
            roleBadge.textContent = data.data.role;
            roleBadge.className = `badge badge-${data.data.role === 'admin' ? 'info' : 'success'}`;
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
}

// Show alert
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Logout function
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              window.location.href = '/';
          }
      })
      .catch(error => {
          console.error('Error logging out:', error);
          window.location.href = '/';
      });
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
