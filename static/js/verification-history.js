/**
 * Verification History Management
 * Handles verification history display, filtering, search, and export
 */

class VerificationHistoryManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {};
        this.currentVerificationId = null;
        this.authToken = this.getAuthToken();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadStatistics();
        this.loadVerifications();
    }
    
    getAuthToken() {
        // Get JWT token from localStorage or sessionStorage
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    
    setupEventListeners() {
        // Filter form submission
        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters();
        });
        
        // Real-time search
        document.getElementById('searchQuery').addEventListener('input', 
            this.debounce(() => this.applyFilters(), 500)
        );
        
        // Filter changes
        ['serviceFilter', 'statusFilter', 'dateFrom', 'dateTo'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.applyFilters());
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async loadStatistics(periodDays = 30) {
        try {
            const response = await fetch(`/api/verifications/stats/summary?period_days=${periodDays}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load statistics');
            }
            
            const stats = await response.json();
            this.updateStatisticsDisplay(stats);
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showError('Failed to load statistics');
        }
    }
    
    updateStatisticsDisplay(stats) {
        document.getElementById('totalVerifications').textContent = stats.total_verifications;
        document.getElementById('completedVerifications').textContent = stats.completed_verifications;
        document.getElementById('successRate').textContent = `${stats.success_rate}%`;
        
        // Calculate monthly verifications (assuming current period includes this month)
        const monthlyCount = Math.floor(stats.total_verifications * (30 / stats.period_days));
        document.getElementById('monthlyVerifications').textContent = monthlyCount;
    }
    
    async loadVerifications() {
        try {
            this.showLoading(true);
            
            const params = new URLSearchParams({
                page: this.currentPage,
                page_size: this.pageSize,
                ...this.currentFilters
            });
            
            const response = await fetch(`/api/verifications?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load verifications');
            }
            
            const data = await response.json();
            this.displayVerifications(data);
            this.updatePagination(data);
            
        } catch (error) {
            console.error('Error loading verifications:', error);
            this.showError('Failed to load verifications');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayVerifications(data) {
        const tbody = document.getElementById('verificationsTableBody');
        const resultCount = document.getElementById('resultCount');
        
        resultCount.textContent = `${data.total_count} verification${data.total_count !== 1 ? 's' : ''}`;
        
        if (data.verifications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-shield-alt"></i>
                            <h5>No verifications found</h5>
                            <p class="text-muted">Try adjusting your filters or create a new verification.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = data.verifications.map(verification => `
            <tr class="fade-in">
                <td>
                    <div class="d-flex align-items-center">
                        <span class="service-icon service-${verification.service_name.toLowerCase()}">
                            ${this.getServiceIcon(verification.service_name)}
                        </span>
                        ${this.capitalizeFirst(verification.service_name)}
                    </div>
                </td>
                <td>
                    <span class="text-monospace">${verification.phone_number || '-'}</span>
                </td>
                <td>
                    <span class="status-badge status-${verification.status}">
                        ${this.capitalizeFirst(verification.status)}
                    </span>
                </td>
                <td>
                    ${verification.verification_code ? 
                        `<span class="verification-code">${verification.verification_code}</span>` : 
                        '-'
                    }
                </td>
                <td>
                    <small>${this.formatDateTime(verification.created_at)}</small>
                </td>
                <td>
                    <small>${verification.completed_at ? 
                        this.formatDateTime(verification.completed_at) : 
                        '-'
                    }</small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary btn-action" 
                                onclick="verificationManager.viewDetails('${verification.id}')"
                                title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${verification.status === 'pending' ? `
                            <button class="btn btn-sm btn-outline-danger btn-action" 
                                    onclick="verificationManager.cancelVerification('${verification.id}')"
                                    title="Cancel">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    getServiceIcon(serviceName) {
        const icons = {
            whatsapp: 'W',
            google: 'G',
            telegram: 'T',
            discord: 'D',
            facebook: 'F',
            instagram: 'I',
            twitter: 'X',
            tiktok: 'T'
        };
        return icons[serviceName.toLowerCase()] || serviceName.charAt(0).toUpperCase();
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    updatePagination(data) {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(data.total_count / this.pageSize);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="verificationManager.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="verificationManager.goToPage(1)">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="verificationManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="verificationManager.goToPage(${totalPages})">${totalPages}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="verificationManager.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.loadVerifications();
    }
    
    applyFilters() {
        this.currentFilters = {};
        
        const searchQuery = document.getElementById('searchQuery').value.trim();
        if (searchQuery) {
            this.currentFilters.search = searchQuery;
        }
        
        const serviceFilter = document.getElementById('serviceFilter').value;
        if (serviceFilter) {
            this.currentFilters.service_name = serviceFilter;
        }
        
        const statusFilter = document.getElementById('statusFilter').value;
        if (statusFilter) {
            this.currentFilters.status = statusFilter;
        }
        
        const dateFrom = document.getElementById('dateFrom').value;
        if (dateFrom) {
            this.currentFilters.date_from = dateFrom + 'T00:00:00';
        }
        
        const dateTo = document.getElementById('dateTo').value;
        if (dateTo) {
            this.currentFilters.date_to = dateTo + 'T23:59:59';
        }
        
        this.currentPage = 1;
        this.loadVerifications();
    }
    
    async viewDetails(verificationId) {
        try {
            const response = await fetch(`/api/verifications/${verificationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load verification details');
            }
            
            const verification = await response.json();
            this.showVerificationModal(verification);
            
        } catch (error) {
            console.error('Error loading verification details:', error);
            this.showError('Failed to load verification details');
        }
    }
    
    showVerificationModal(verification) {
        this.currentVerificationId = verification.id;
        
        const modalBody = document.getElementById('verificationModalBody');
        modalBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Service</div>
                        <div class="text-gray-800 font-medium flex items-center mt-1">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 bg-blue-500">
                                ${this.getServiceIcon(verification.service_name)}
                            </span>
                            ${this.capitalizeFirst(verification.service_name)}
                        </div>
                    </div>
                </div>
                <div>
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Status</div>
                        <div class="text-gray-800 font-medium mt-1">
                            <span class="px-2 py-1 rounded-full text-xs font-bold ${this.getStatusBadgeClass(verification.status)}">
                                ${this.capitalizeFirst(verification.status)}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Phone Number</div>
                        <div class="text-gray-800 font-medium mt-1 font-mono">
                            ${verification.phone_number || '-'}
                        </div>
                    </div>
                </div>
                <div>
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Verification Code</div>
                        <div class="text-gray-800 font-medium mt-1">
                            ${verification.verification_code ? 
                                `<span class="bg-gray-200 px-2 py-1 rounded-md font-mono text-sm">${verification.verification_code}</span>` : 
                                'Not received'
                            }
                        </div>
                    </div>
                </div>
                <div>
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Created At</div>
                        <div class="text-gray-800 font-medium mt-1">
                            ${this.formatDateTime(verification.created_at)}
                        </div>
                    </div>
                </div>
                <div>
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Completed At</div>
                        <div class="text-gray-800 font-medium mt-1">
                            ${verification.completed_at ? 
                                this.formatDateTime(verification.completed_at) : 
                                'Not completed'
                            }
                        </div>
                    </div>
                </div>
                <div class="col-span-full">
                    <div class="p-3 bg-gray-100 rounded-md mb-2">
                        <div class="text-sm font-semibold text-gray-600">Verification ID</div>
                        <div class="text-gray-800 font-medium mt-1 font-mono">
                            ${verification.id}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show/hide cancel button based on status
        const cancelBtn = document.getElementById('cancelVerificationBtn');
        if (verification.status === 'pending') {
            cancelBtn.style.display = 'inline-block';
        } else {
            cancelBtn.style.display = 'none';
        }
        
        document.getElementById('verificationModal').classList.remove('hidden');
    }
    
    async cancelVerification(verificationId = null) {
        const id = verificationId || this.currentVerificationId;
        if (!id) return;
        
        if (!confirm('Are you sure you want to cancel this verification?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/verifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to cancel verification');
            }
            
            this.showSuccess('Verification cancelled successfully');
            this.loadVerifications();
            this.loadStatistics();
            
            // Close modal if open
            document.getElementById('verificationModal').classList.add('hidden');
            
        } catch (error) {
            console.error('Error cancelling verification:', error);
            this.showError('Failed to cancel verification');
        }
    }
    
    async exportData(format) {
        try {
            document.getElementById('exportModal').classList.remove('hidden');
            
            const params = new URLSearchParams({
                format_type: format,
                ...this.currentFilters
            });
            
            const response = await fetch(`/api/verifications/export/data?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to export data');
            }
            
            if (format === 'csv') {
                const blob = await response.blob();
                this.downloadFile(blob, `verifications_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
            } else {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                this.downloadFile(blob, `verifications_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
            }
            
            this.showSuccess(`Data exported successfully as ${format.toUpperCase()}`);
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export data');
        } finally {
            document.getElementById('exportModal').classList.add('hidden');
        }
    }
    
    downloadFile(blob, filename, mimeType) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    refreshData() {
        this.loadStatistics();
        this.loadVerifications();
    }
    
    showLoading(show) {
        const tbody = document.getElementById('verificationsTableBody');
        if (show) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    showSuccess(message) {
        this.showAlert(message, 'success');
    }
    
    showError(message) {
        this.showAlert(message, 'danger');
    }
    
    showAlert(message, type) {
        const alertHTML = `
            <div class="fixed top-5 right-5 z-[9999] p-4 rounded-lg shadow-lg text-white text-sm font-semibold ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}">
                ${message}
                <button type="button" class="ml-2 text-white opacity-75 hover:opacity-100" onclick="this.parentNode.remove()">&times;</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.fixed.top-5.right-5');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
}

// Global functions for onclick handlers
function exportData(format) {
    verificationManager.exportData(format);
}

function refreshData() {
    verificationManager.refreshData();
}

function cancelVerification() {
    verificationManager.cancelVerification();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.verificationManager = new VerificationHistoryManager();
});