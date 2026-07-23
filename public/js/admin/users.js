// Admin Users JavaScript

// Helper function to make authenticated fetch calls
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadUsers();
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
        
        const response = await authenticatedFetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderUsersTable(data.data);
        } else {
            showAlert(data.error || '\u0130stifad\u0259\u0017il\u0259ri y\u00fckl\u0259m\u0259k al\u0131nmad\u0131', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Server x\u0259ta: ' + error.message, 'error');
    }
}

// Render users table
function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">He\u0017 bir istifad\u0259\u0017i tap\u0131lmad\u0131</td></tr>';
        return;
    }
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username || '-'}</td>
            <td><span class="badge badge-${user.role === 'admin' ? 'info' : 'success'}">${user.role || '-'}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString('az-AZ')}</td>
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
    const modal = document.getElementById('add-user-modal');
    if (!modal) return;
    
    document.getElementById('user-id').value = '';
    document.getElementById('user-username').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = 'user';
    
    modal.classList.add('active');
}

// Open edit user modal
async function openEditUserModal(userId) {
    try {
        const response = await authenticatedFetch(`/api/users/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const user = data.data;
            const modal = document.getElementById('add-user-modal');
            
            if (!modal) return;
            
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-username').value = user.username || '';
            document.getElementById('user-password').value = '';
            document.getElementById('user-role').value = user.role || 'user';
            
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// Close user modal
function closeUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save user
async function saveUser() {
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    if (!username) {
        showAlert('\u0130stifad\u0259\u0017i ad\u0131 m\u00fctl\u0259q doldurulmal\u0131d\u0131r', 'error');
        return;
    }
    
    if (!id && !password) {
        showAlert('Yeni istifad\u0259\u0017i \u00fc\u0017\u00fcn \u015eifr\u0259 t\u0259l\u0259b olunur', 'error');
        return;
    }
    
    try {
        const userData = { username, role };
        
        if (password) {
            userData.password = password;
        }
        
        let url = '/api/users';
        let method = 'POST';
        
        if (id) {
            url = `/api/users/${id}`;
            method = 'PUT';
        }
        
        const response = await authenticatedFetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeUserModal();
            loadUsers();
            showAlert(id ? '\u0130stifad\u0259\u0017i u\u011furla yenil\u0259ndi' : '\u0130stifad\u0259\u0017i u\u011furla \u0259lav\u0259 edildi', 'success');
        } else {
            showAlert(data.error || 'X\u0259ta ba\u015f verdi', 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showAlert('\u0130stifad\u0259\u0017ini saxlayarken x\u0259ta ba\u015f verdi', 'error');
    }
}

// Delete user
async function deleteUser(userId, username) {
    if (confirm(`"${username}" istifad\u0259\u0017ini silm\u0259k ist\u0259diyiniz\u0259 \u0259minsiniz?`)) {
        try {
            const response = await authenticatedFetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                loadUsers();
                showAlert('\u0130stifad\u0259\u0017i u\u011furla silindi', 'success');
            } else {
                showAlert(data.error || 'X\u0259ta ba\u015f verdi', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert('\u0130stifad\u0259\u0017ini sil\u0259rk\u0259n x\u0259ta ba\u015f verdi', 'error');
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
