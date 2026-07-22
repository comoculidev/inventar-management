// Main JavaScript file for Inventory Management System
// Azerbaijani language support

console.log('İnventar İdarəetmə Sistemi yükləndi');

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Səhifə yükləndi');
    
    // Initialize any common functionality here
    initCommonHandlers();
});

// Initialize common event handlers
function initCommonHandlers() {
    // Add any common event listeners here
    
    // Example: Close alert messages
    const closeButtons = document.querySelectorAll('.alert .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
}

// Utility functions
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.padding = '15px';
    alert.style.borderRadius = '4px';
    alert.style.zIndex = '1000';
    
    if (type === 'success') {
        alert.style.backgroundColor = '#d5f5e3';
        alert.style.color = '#27ae60';
    } else if (type === 'error') {
        alert.style.backgroundColor = '#fdecea';
        alert.style.color = '#e74c3c';
    } else if (type === 'warning') {
        alert.style.backgroundColor = '#fef5e7';
        alert.style.color = '#f39c12';
    } else {
        alert.style.backgroundColor = '#e3f2fd';
        alert.style.color = '#3498db';
    }
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// AJAX helper function
async function makeRequest(url, method = 'GET', data = null, headers = {}) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        showAlert('Xəta baş verdi: ' + error.message, 'error');
        throw error;
    }
}

// Format date for display (Azerbaijani format)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format numbers with Azerbaijani locale
function formatNumber(number) {
    return number.toLocaleString('az-AZ');
}
