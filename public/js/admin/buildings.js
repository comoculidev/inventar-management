// Admin Buildings JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadBuildings();
    loadOrganizationsForSelect();
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success && data.data) {
            document.getElementById('current-user').textContent = data.data.username;
            const roleBadge = document.getElementById('user-role');
            roleBadge.textContent = data.data.role === 'admin' ? 'Admin' : 'İstifadəçi';
            roleBadge.className = `badge badge-${data.data.role === 'admin' ? 'info' : 'success'}`;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load all buildings
async function loadBuildings() {
    try {
        const search = document.getElementById('search-buildings')?.value || '';
        const organizationId = document.getElementById('organization-building-filter')?.value || '';
        
        let url = '/api/buildings';
        const params = [];
        
        if (organizationId) {
            params.push(`organizationId=${organizationId}`);
        }
        if (search) {
            params.push(`search=${encodeURIComponent(search)}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderBuildingsTable(data.data);
        } else {
            showAlert(data.error || 'Binaları yükləmək alınmadı', 'error');
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Render buildings table
function renderBuildingsTable(buildings) {
    const tableBody = document.getElementById('buildings-table-body');
    
    if (!buildings || buildings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Heç bir bina tapılmadı</td></tr>';
        return;
    }
    
    tableBody.innerHTML = buildings.map(building => `
        <tr>
            <td>${building.name || '-'}</td>
            <td>${building.organization_name || building.organization_id || '-'}</td>
            <td>
                <span class="badge badge-info">
                    Otaqlar
                </span>
            </td>
            <td>${building.description || '-'}</td>
            <td>${new Date(building.created_at).toLocaleDateString('az-AZ')}</td>
            <td>
                <button class="btn btn-primary btn-icon" onclick="openEditBuildingModal('${building.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="deleteBuilding('${building.id}', '${building.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load organizations for select dropdown
async function loadOrganizationsForSelect() {
    try {
        const response = await fetch('/api/organizations');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('organization-building-filter');
            const addSelect = document.getElementById('building-organization');
            const editSelect = document.getElementById('edit-building-organization');
            
            const options = '<option value="">Bütün təşkilatlar</option>' +
                data.data.map(org => `<option value="${org.id}">${org.name}</option>`).join('');
            
            if (select) select.innerHTML = options;
            if (addSelect) addSelect.innerHTML = '<option value="">Seçin</option>' + 
                data.data.map(org => `<option value="${org.id}">${org.name}</option>`).join('');
            if (editSelect) editSelect.innerHTML = '<option value="">Seçin</option>' + 
                data.data.map(org => `<option value="${org.id}">${org.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Open add building modal
function openAddBuildingModal() {
    document.getElementById('add-building-modal').classList.add('active');
}

// Close add building modal
function closeAddBuildingModal() {
    document.getElementById('add-building-modal').classList.remove('active');
    document.getElementById('building-name').value = '';
    document.getElementById('building-description').value = '';
    document.getElementById('building-organization').value = '';
}

// Add new building
async function addBuilding() {
    const name = document.getElementById('building-name').value.trim();
    const description = document.getElementById('building-description').value.trim();
    const organization_id = document.getElementById('building-organization').value;
    
    if (!name) {
        showAlert('Bina adı tələb olunur', 'error');
        return;
    }
    
    if (!organization_id) {
        showAlert('Təşkilat seçilməlidir', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/buildings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, organization_id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Bina uğurla yaradıldı!', 'success');
            closeAddBuildingModal();
            loadBuildings();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Open edit building modal
async function openEditBuildingModal(id) {
    try {
        const response = await fetch(`/api/buildings/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const building = data.data;
            document.getElementById('edit-building-id').value = building.id;
            document.getElementById('edit-building-name').value = building.name || '';
            document.getElementById('edit-building-description').value = building.description || '';
            document.getElementById('edit-building-organization').value = building.organization_id || '';
            document.getElementById('edit-building-modal').classList.add('active');
        } else {
            showAlert(data.error || 'Bina tapılmadı', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Close edit building modal
function closeEditBuildingModal() {
    document.getElementById('edit-building-modal').classList.remove('active');
}

// Update building
async function updateBuilding() {
    const id = document.getElementById('edit-building-id').value;
    const name = document.getElementById('edit-building-name').value.trim();
    const description = document.getElementById('edit-building-description').value.trim();
    const organization_id = document.getElementById('edit-building-organization').value;
    
    if (!name) {
        showAlert('Bina adı tələb olunur', 'error');
        return;
    }
    
    if (!organization_id) {
        showAlert('Təşkilat seçilməlidir', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/buildings/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, organization_id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Bina uğurla yeniləndi!', 'success');
            closeEditBuildingModal();
            loadBuildings();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Delete building
async function deleteBuilding(id, name) {
    if (!confirm(`"${name}" binasını silmək istədiyinizə əminsiniz?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/buildings/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Bina uğurla silindi!', 'success');
            loadBuildings();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login';
    }
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
