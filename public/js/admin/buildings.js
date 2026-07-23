// Admin Buildings JavaScript

// Helper function to make authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadBuildings();
    loadOrganizationsForSelect();
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await authenticatedFetch('/api/auth/me', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success && data.data) {
            document.getElementById('current-user').textContent = data.data.username;
            const roleBadge = document.getElementById('user-role');
            roleBadge.textContent = data.data.role === 'admin' ? 'Admin' : '\u0130stifad\u0259\u0017i';
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
        
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderBuildingsTable(data.data);
        } else {
            showAlert(data.error || 'Binalar\u0131 y\u00fckl\u0259m\u0259k al\u0131nmad\u0131', 'error');
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
        showAlert('Server x\u0259ta: ' + error.message, 'error');
    }
}

// Render buildings table
function renderBuildingsTable(buildings) {
    const tableBody = document.getElementById('buildings-table-body');
    
    if (!buildings || buildings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">He\u0017 bir bina tap\u0131lmad\u0131</td></tr>';
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
        const response = await authenticatedFetch('/api/organizations');
        const data = await response.json();
        
        if (data.success && data.data) {
            const orgSelect = document.getElementById('building-organization');
            const filterSelect = document.getElementById('organization-building-filter');
            
            if (orgSelect) {
                orgSelect.innerHTML = '<option value="">Se\u0017in</option>';
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    orgSelect.appendChild(option);
                });
            }
            
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">B\u00fct\u00fcn t\u0259\u015fkilatlar</option>';
                data.data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    filterSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

// Open add building modal
function openAddBuildingModal() {
    const modal = document.getElementById('add-building-modal');
    if (!modal) return;
    
    document.getElementById('building-id').value = '';
    document.getElementById('building-name').value = '';
    document.getElementById('building-description').value = '';
    document.getElementById('building-organization').value = '';
    
    modal.classList.add('active');
}

// Open edit building modal
async function openEditBuildingModal(buildingId) {
    try {
        const response = await authenticatedFetch(`/api/buildings/${buildingId}`);
        const data = await response.json();
        
        if (data.success) {
            const building = data.data;
            const modal = document.getElementById('add-building-modal');
            
            if (!modal) return;
            
            document.getElementById('building-id').value = building.id;
            document.getElementById('building-name').value = building.name || '';
            document.getElementById('building-description').value = building.description || '';
            document.getElementById('building-organization').value = building.organization_id || '';
            
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading building:', error);
    }
}

// Close building modal
function closeBuildingModal() {
    const modal = document.getElementById('add-building-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save building
async function saveBuilding() {
    const id = document.getElementById('building-id').value;
    const name = document.getElementById('building-name').value.trim();
    const description = document.getElementById('building-description').value.trim();
    const organizationId = document.getElementById('building-organization').value;
    
    if (!name || !organizationId) {
        showAlert('Bina ad\u0131 v\u0259 t\u0259\u015fkilat m\u00fctl\u0259q doldurulmal\u0131d\u0131r', 'error');
        return;
    }
    
    try {
        const buildingData = { name, description, organization_id: organizationId };
        
        let url = '/api/buildings';
        let method = 'POST';
        
        if (id) {
            url = `/api/buildings/${id}`;
            method = 'PUT';
        }
        
        const response = await authenticatedFetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buildingData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeBuildingModal();
            loadBuildings();
            showAlert(id ? 'Bina u\u011furla yenil\u0259ndi' : 'Bina u\u011furla \u0259lav\u0259 edildi', 'success');
        } else {
            showAlert(data.error || 'X\u0259ta ba\u015f verdi', 'error');
        }
    } catch (error) {
        console.error('Error saving building:', error);
        showAlert('Bina saxlanark\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Delete building
async function deleteBuilding(buildingId, buildingName) {
    if (confirm(`"${buildingName}" binas\u0131n\u0131 silm\u0259k ist\u0259diyiniz\u0259 \u0259minsiniz?`)) {
        try {
            const response = await authenticatedFetch(`/api/buildings/${buildingId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                loadBuildings();
                showAlert('Bina u\u011furla silindi', 'success');
            } else {
                showAlert(data.error || 'X\u0259ta ba\u015f verdi', 'error');
            }
        } catch (error) {
            console.error('Error deleting building:', error);
            showAlert('Bina silin\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
        }
    }
}

// Helper functions
function showAlert(message, type = 'info') {
    alert(message);
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
