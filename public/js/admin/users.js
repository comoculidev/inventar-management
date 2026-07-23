// Admin Users JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadUsers();
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

// Load all users
async function loadUsers() {
    try {
        const search = document.getElementById('search-users')?.value || '';
        const role = document.getElementById('role-filter')?.value || '';
        
        let url = '/api/users';
        const params = [];
        
        if (search) {
            params.push(`search=${encodeURIComponent(search)}`);
        }
        if (role) {
            params.push(`role=${role}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderUsersTable(data.data);
        } else {
            showAlert(data.error || 'İstifadəçiləri yükləmək alınmadı', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Render users table
function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Heç bir istifadəçi tapılmadı</td></tr>';
        return;
    }
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username || '-'}</td>
            <td><span class="badge badge-${user.role === 'admin' ? 'info' : 'success'}">${user.role === 'admin' ? 'Admin' : 'İstifadəçi'}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString('az-AZ')}</td>
            <td>-</td>
            <td><span class="badge badge-success">Aktiv</span></td>
            <td>
                <button class="btn btn-primary btn-icon" onclick="openEditUserModal('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="deleteUser('${user.id}', '${user.username}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open add user modal
function openAddUserModal() {
    document.getElementById('add-user-modal').classList.add('active');
}

// Close add user modal
function closeAddUserModal() {
    document.getElementById('add-user-modal').classList.remove('active');
    document.getElementById('user-username').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role-select').value = '';
}

// Add new user
async function addUser() {
    const username = document.getElementById('user-username').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role-select').value;
    
    if (!username || !password || !role) {
        showAlert('Bütün sahələr tələb olunur', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Şifrə minimum 6 simvoldan ibarət olmalıdır', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('İstifadəçi uğurla yaradıldı!', 'success');
            closeAddUserModal();
            loadUsers();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Open edit user modal
async function openEditUserModal(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const user = data.data;
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-user-username').value = user.username || '';
            document.getElementById('edit-user-role').value = user.role || '';
            document.getElementById('edit-user-modal').classList.add('active');
        } else {
            showAlert(data.error || 'İstifadəçi tapılmadı', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Close edit user modal
function closeEditUserModal() {
    document.getElementById('edit-user-modal').classList.remove('active');
}

// Update user
async function updateUser() {
    const id = document.getElementById('edit-user-id').value;
    const username = document.getElementById('edit-user-username').value.trim();
    const role = document.getElementById('edit-user-role').value;
    const password = document.getElementById('edit-user-password').value;
    
    if (!username || !role) {
        showAlert('İstifadəçi adı və rol tələb olunur', 'error');
        return;
    }
    
    const updateData = { username, role };
    if (password && password.length >= 6) {
        updateData.password = password;
    }
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('İstifadəçi uğurla yeniləndi!', 'success');
            closeEditUserModal();
            loadUsers();
        } else {
            showAlert(data.error || 'Xəta baş verdi', 'error');
        }
    } catch (error) {
        showAlert('Server xəta: ' + error.message, 'error');
    }
}

// Delete user
async function deleteUser(id, username) {
    if (!confirm(`"${username}" istifadəçisini silmək istədiyinizə əminsiniz?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('İstifadəçi uğurla silindi!', 'success');
            loadUsers();
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
