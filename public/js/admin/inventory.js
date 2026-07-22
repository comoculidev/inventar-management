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
    loadRooms();
    loadInventoryItems();
    fetchCurrentUser();
    
    // Add event listeners
    document.getElementById('search-input').addEventListener('keyup', function(e) {
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
});

// Load organizations for filter
async function loadOrganizations() {
    try {
        const response = await fetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            organizations = data.data;
            const select = document.getElementById('organization-filter');
            select.innerHTML = '<option value="">Bütün təşkilatlar</option>';
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
            select.innerHTML = '<option value="">Bütün binalar</option>';
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
            const select = document.getElementById('room-id');
            select.innerHTML = '<option value="">Seçin</option>';
            data.data.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.name;
                select.appendChild(option);
            });
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
            select.innerHTML = '<option value="">Seçin</option>';
            data.data.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading rooms by building:', error);
    }
}

// Load inventory items
async function loadInventoryItems() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20,
            ...currentFilters
        });
        
        const response = await fetch(`/api/inventory-items/filter?${params}`);
        const data = await response.json();
        
        if (data.success) {
            renderInventoryTable(data.data);
            if (data.pagination) {
                currentPage = data.pagination.page;
                totalPages = data.pagination.totalPages;
            }
        }
    } catch (error) {
        console.error('Error loading inventory items:', error);
        showAlert('İnventar əşyaları yüklənərkən xəta baş verdi', 'error');
    }
}

// Render inventory table
function renderInventoryTable(items) {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    
    if (items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">Heç bir əşya tapılmadı</td>';
        tbody.appendChild(row);
        return;
    }
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.location || '-'}</td>
            <td><span class="badge badge-${getStatusBadgeClass(item.status)}">${item.status || '-'}</span></td>
            <td>${item.inventory_number || '-'}</td>
            <td>${item.responsible_person || '-'}</td>
            <td>${item.category || '-'}</td>
            <td>${item.room_name || '-'}</td>
            <td class="actions">
                <button class="btn btn-info btn-icon" onclick="openEditItemModal('${item.id}')">✏️</button>
                <button class="btn btn-danger btn-icon" onclick="confirmDeleteItem('${item.id}', '${item.inventory_number}')">🗑️</button>
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
    document.getElementById('page-info').textContent = `Səhifə ${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Apply filters
function applyFilters() {
    currentFilters = {
        search: document.getElementById('search-input').value,
        organizationId: document.getElementById('organization-filter').value,
        buildingId: document.getElementById('building-filter').value,
        category: document.getElementById('category-filter').value
    };
    currentPage = 1;
    loadInventoryItems();
}

// Reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('organization-filter').value = '';
    document.getElementById('building-filter').value = '';
    document.getElementById('category-filter').value = '';
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
    document.getElementById('modal-title').textContent = 'Yeni Əşya Əlavə Et';
    document.getElementById('item-id').value = '';
    document.getElementById('inventory-number').value = '';
    document.getElementById('location').value = '';
    document.getElementById('status').value = '';
    document.getElementById('room-id').value = '';
    document.getElementById('responsible-person').value = '';
    document.getElementById('category').value = '';
    document.getElementById('item-modal').classList.add('active');
}

// Open edit item modal
async function openEditItemModal(id) {
    try {
        const response = await fetch(`/api/inventory-items/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const item = data.data;
            document.getElementById('modal-title').textContent = 'Əşya Redaktə Et';
            document.getElementById('item-id').value = item.id;
            document.getElementById('inventory-number').value = item.inventory_number || '';
            document.getElementById('location').value = item.location || '';
            document.getElementById('status').value = item.status || '';
            document.getElementById('room-id').value = item.room_id || '';
            document.getElementById('responsible-person').value = item.responsible_person || '';
            document.getElementById('category').value = item.category || '';
            document.getElementById('item-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showAlert('Əşya yüklənərkən xəta baş verdi', 'error');
    }
}

// Close item modal
function closeItemModal() {
    document.getElementById('item-modal').classList.remove('active');
}

// Save item
async function saveItem() {
    const id = document.getElementById('item-id').value;
    const inventoryNumber = document.getElementById('inventory-number').value;
    const location = document.getElementById('location').value;
    const status = document.getElementById('status').value;
    const roomId = document.getElementById('room-id').value;
    const responsiblePerson = document.getElementById('responsible-person').value;
    const category = document.getElementById('category').value;
    
    if (!inventoryNumber || !status || !roomId) {
        showAlert('İnventar nömrəsi, status və otaq mütləq doldurulmalıdır', 'error');
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
            closeItemModal();
            loadInventoryItems();
            showAlert(id ? 'Əşya uğurla redaktə edildi' : 'Əşya uğurla əlavə edildi', 'success');
        } else {
            showAlert(result.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showAlert('Əşya yadda saxlanarkən xəta baş verdi', 'error');
    }
}

// Confirm delete item
function confirmDeleteItem(id, inventoryNumber) {
    document.getElementById('delete-item-info').textContent = `İnventar nömrəsi: ${inventoryNumber}`;
    document.getElementById('delete-modal').dataset.itemId = id;
    document.getElementById('delete-modal').classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
}

// Confirm delete
async function confirmDelete() {
    const id = document.getElementById('delete-modal').dataset.itemId;
    
    try {
        const response = await fetch(`/api/inventory-items/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeDeleteModal();
            loadInventoryItems();
            showAlert('Əşya uğurla silindi', 'success');
        } else {
            showAlert(result.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('Əşya silinərkən xəta baş verdi', 'error');
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
async function importExcel() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Zəhmət olmasa, fayl seçin', 'error');
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
            showAlert(`${result.message || 'Fayl uğurla idxal edildi'}`, 'success');
            
            // Show invalid items if any
            if (result.invalidItems && result.invalidItems.length > 0) {
                showAlert(`${result.invalidItems.length} ədəd sətir xətalıdır və idxal edilməmişdir`, 'warning');
            }
        } else {
            showAlert(result.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        showAlert('Fayl idxal olunarkən xəta baş verdi', 'error');
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
