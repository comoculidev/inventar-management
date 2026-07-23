// Admin Organizations JavaScript

// Helper function to make authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadOrganizations();
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

// Load all organizations
async function loadOrganizations() {
    try {
        const search = document.getElementById('search-organizations')?.value || '';
        const response = await authenticatedFetch(`/api/organizations?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        if (data.success) {
            renderOrganizationsTable(data.data);
        } else {
            showAlert(data.error || 'T\u0259\u015fkilatlar\u0131 y\u00fckl\u0259m\u0259k al\u0131nmad\u0131', 'error');
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
        showAlert('Server x\u0259ta: ' + error.message, 'error');
    }
}

// Render organizations table
function renderOrganizationsTable(organizations) {
    const tableBody = document.getElementById('organizations-table-body');
    
    if (!organizations || organizations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">He\u0017 bir t\u0259\u015fkilat tap\u0131lmad\u0131</td></tr>';
        return;
    }
    
    tableBody.innerHTML = organizations.map(org => `
        <tr>
            <td>${org.name || '-'}</td>
            <td>${org.description || '-'}</td>
            <td>${new Date(org.created_at).toLocaleDateString('az-AZ')}</td>
            <td>
                <button class="btn btn-primary btn-icon" onclick="openEditOrganizationModal('${org.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="deleteOrganization('${org.id}', '${org.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open add organization modal
function openAddOrganizationModal() {
    const modal = document.getElementById('add-organization-modal');
    if (!modal) return;
    
    document.getElementById('organization-id').value = '';
    document.getElementById('organization-name').value = '';
    document.getElementById('organization-description').value = '';
    
    modal.classList.add('active');
}

// Open edit organization modal
async function openEditOrganizationModal(orgId) {
    try {
        const response = await authenticatedFetch(`/api/organizations/${orgId}`);
        const data = await response.json();
        
        if (data.success) {
            const org = data.data;
            const modal = document.getElementById('add-organization-modal');
            
            if (!modal) return;
            
            document.getElementById('organization-id').value = org.id;
            document.getElementById('organization-name').value = org.name || '';
            document.getElementById('organization-description').value = org.description || '';
            
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading organization:', error);
    }
}

// Close organization modal
function closeOrganizationModal() {
    const modal = document.getElementById('add-organization-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save organization
async function saveOrganization() {
    const id = document.getElementById('organization-id').value;
    const name = document.getElementById('organization-name').value.trim();
    const description = document.getElementById('organization-description').value.trim();
    
    if (!name) {
        showAlert('T\u0259\u015fkilat ad\u0131 m\u00fctl\u0259q doldurulmal\u0131d\u0131r', 'error');
        return;
    }
    
    try {
        const orgData = { name, description };
        
        let url = '/api/organizations';
        let method = 'POST';
        
        if (id) {
            url = `/api/organizations/${id}`;
            method = 'PUT';
        }
        
        const response = await authenticatedFetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orgData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeOrganizationModal();
            loadOrganizations();
            showAlert(id ? 'T\u0259\u015fkilat u\u011furla yenil\u0259ndi' : 'T\u0259\u015fkilat u\u011furla \u0259lav\u0259 edildi', 'success');
        } else {
            showAlert(data.error || 'X\u0259ta ba\u015f verdi', 'error');
        }
    } catch (error) {
        console.error('Error saving organization:', error);
        showAlert('T\u0259\u015fkilat saxlanark\u0259n x\u0259ta ba\u015f verdi', 'error');
    }
}

// Delete organization
async function deleteOrganization(orgId, orgName) {
    if (confirm(`"${orgName}" t\u0259\u015fkilat\u0131n\u0131 silm\u0259k ist\u0259diyiniz\u0259 \u0259minsiniz?`)) {
        try {
            const response = await authenticatedFetch(`/api/organizations/${orgId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                loadOrganizations();
                showAlert('T\u0259\u015fkilat u\u011furla silindi', 'success');
            } else {
                showAlert(data.error || 'X\u0259ta ba\u015f verdi', 'error');
            }
        } catch (error) {
            console.error('Error deleting organization:', error);
            showAlert('T\u0259\u015fkilat silin\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
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
