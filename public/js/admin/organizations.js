// Admin Organizations JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadOrganizations();
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

// Load all organizations
async function loadOrganizations() {
    try {
        const search = document.getElementById('search-organizations')?.value || '';
        const response = await fetch(`/api/organizations?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        if (data.success) {
            renderOrganizationsTable(data.data);
        } else {
            showAlert(data.error || 'Təşkilatları yükləmək alınmadı', 'error');
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Render organizations table
function renderOrganizationsTable(organizations) {
    const tableBody = document.getElementById('organizations-table-body');
    
    if (!organizations || organizations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Heç bir təşkilat tapılmadı</td></tr>';
        return;
    }
    
    tableBody.innerHTML = organizations.map(org => `
        <tr>
            <td>${org.name || '-'}</td>
            <td>${org.description || '-'}</td>
            <td>
                <span class="badge badge-info">
                    Binalar
                </span>
            </td>
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
    document.getElementById('add-organization-modal').classList.add('active');
}

// Close add organization modal
function closeAddOrganizationModal() {
    document.getElementById('add-organization-modal').classList.remove('active');
    document.getElementById('organization-name').value = '';
    document.getElementById('organization-description').value = '';
}

// Add new organization
async function addOrganization() {
    const name = document.getElementById('organization-name').value.trim();
    const description = document.getElementById('organization-description').value.trim();
    
    if (!name) {
        showAlert('Təşkilat adı tələb olunur', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/organizations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Təşkilat uğurla yaradıldı!', 'success');
            closeAddOrganizationModal();
            loadOrganizations();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Open edit organization modal
async function openEditOrganizationModal(id) {
    try {
        const response = await fetch(`/api/organizations/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const org = data.data;
            document.getElementById('edit-organization-id').value = org.id;
            document.getElementById('edit-organization-name').value = org.name || '';
            document.getElementById('edit-organization-description').value = org.description || '';
            document.getElementById('edit-organization-modal').classList.add('active');
        } else {
            showAlert(data.error || 'Təşkilat tapılmadı', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Close edit organization modal
function closeEditOrganizationModal() {
    document.getElementById('edit-organization-modal').classList.remove('active');
}

// Update organization
async function updateOrganization() {
    const id = document.getElementById('edit-organization-id').value;
    const name = document.getElementById('edit-organization-name').value.trim();
    const description = document.getElementById('edit-organization-description').value.trim();
    
    if (!name) {
        showAlert('Təşkilat adı tələb olunur', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/organizations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Təşkilat uğurla yeniləndi!', 'success');
            closeEditOrganizationModal();
            loadOrganizations();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Delete organization
async function deleteOrganization(id, name) {
    if (!confirm(`"${name}" təşkilatını silmək istədiyinizə əminsiniz?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/organizations/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Təşkilat uğurla silindi!', 'success');
            loadOrganizations();
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
