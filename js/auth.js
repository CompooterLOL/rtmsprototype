// Authentication System for RTMS
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.loginType = 'student';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkStoredAuth();
        this.setupPasswordToggle();
        this.setupSocialLogin();
    }

    setupEventListeners() {
        // Login modal triggers
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('closeLoginModal').addEventListener('click', () => {
            this.hideLoginModal();
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Login tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLoginTab(e.target.dataset.tab);
            });
        });

        // User menu
        document.getElementById('userAvatar').addEventListener('click', () => {
            this.toggleUserMenu();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Close modal on overlay click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                this.hideLoginModal();
            }
        });

        // Join button
        document.getElementById('joinBtn').addEventListener('click', () => {
            this.hideLoginModal();
            window.app.navigateToPage('join');
        });

        // Notifications
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.showNotifications();
        });
    }

    setupPasswordToggle() {
        document.getElementById('togglePassword').addEventListener('click', () => {
            const passwordInput = document.getElementById('loginPassword');
            const toggle = document.getElementById('togglePassword');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggle.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggle.textContent = '👁️';
            }
        });
    }

    setupSocialLogin() {
        document.getElementById('googleLogin').addEventListener('click', () => {
            this.handleSocialLogin('google');
        });

        document.getElementById('githubLogin').addEventListener('click', () => {
            this.handleSocialLogin('github');
        });
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus on email input
        setTimeout(() => {
            document.getElementById('loginEmail').focus();
        }, 100);
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Reset form
        document.getElementById('loginForm').reset();
        this.setLoginLoading(false);
    }

    switchLoginTab(type) {
        this.loginType = type;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${type}"]`).classList.add('active');
        
        // Update form placeholder text
        const emailInput = document.getElementById('loginEmail');
        if (type === 'staff') {
            emailInput.placeholder = 'Enter your staff email';
        } else {
            emailInput.placeholder = 'Enter your student email';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        this.setLoginLoading(true);

        try {
            const loginData = {
                email,
                password,
                userType: this.loginType,
                rememberMe
            };

            const response = await window.api.login(loginData);
            
            if (response.success) {
                await this.setAuthenticatedUser(response.user, response.token);
                this.hideLoginModal();
                this.showToast('Welcome back!', 'success');
                
                // Redirect based on role
                if (response.user.role === 'staff') {
                    window.app.navigateToPage('admin-dashboard');
                } else {
                    window.app.navigateToPage('dashboard');
                }
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            this.showToast(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            this.setLoginLoading(false);
        }
    }

    async handleSocialLogin(provider) {
        try {
            this.showToast(`Redirecting to ${provider}...`, 'info');
            
            // Implement OAuth flow
            const response = await window.api.socialLogin(provider, this.loginType);
            
            if (response.success) {
                await this.setAuthenticatedUser(response.user, response.token);
                this.hideLoginModal();
                this.showToast(`Welcome via ${provider}!`, 'success');
            }
        } catch (error) {
            this.showToast(`${provider} login failed. Please try again.`, 'error');
        }
    }

    async setAuthenticatedUser(user, token) {
        this.currentUser = user;
        this.userRole = user.role;

        // Store auth data
        localStorage.setItem('rtms_token', token);
        localStorage.setItem('rtms_user', JSON.stringify(user));

        // Update UI
        this.updateAuthUI();
        this.updateNavigation();
        
        // Set up real-time connections
        if (window.api.setupRealtime) {
            window.api.setupRealtime(token);
        }
    }

    updateAuthUI() {
        // Show authenticated actions, hide public actions
        document.getElementById('publicActions').classList.add('hidden');
        document.getElementById('authenticatedActions').classList.remove('hidden');

        // Update user info
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const avatarInitials = document.getElementById('avatarInitials');
        const avatarImage = document.getElementById('avatarImage');

        userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        userRole.textContent = this.currentUser.role === 'staff' ? 'Staff' : 'Student';
        
        // Set avatar
        if (this.currentUser.avatar) {
            avatarImage.src = this.currentUser.avatar;
            avatarImage.classList.remove('hidden');
            avatarInitials.style.display = 'none';
        } else {
            const initials = `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`;
            avatarInitials.textContent = initials.toUpperCase();
        }

        // Update notifications
        this.updateNotifications();
    }

    updateNavigation() {
        // Hide all nav menus
        document.getElementById('publicNavMenu').classList.add('hidden');
        document.getElementById('studentNavMenu').classList.add('hidden');
        document.getElementById('staffNavMenu').classList.add('hidden');

        // Show appropriate nav menu
        if (this.userRole === 'staff') {
            document.getElementById('staffNavMenu').classList.remove('hidden');
        } else {
            document.getElementById('studentNavMenu').classList.remove('hidden');
        }
    }

    async updateNotifications() {
        try {
            const notifications = await window.api.getNotifications();
            const badge = document.getElementById('notificationBadge');
            
            if (notifications && notifications.length > 0) {
                badge.textContent = notifications.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (error) {
            console.warn('Failed to load notifications:', error);
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userMenuDropdown');
        dropdown.classList.toggle('show');
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                dropdown.classList.remove('show');
            }
        }, { once: true });
    }

    async logout() {
        try {
            await window.api.logout();
        } catch (error) {
            console.warn('Logout API call failed:', error);
        }

        // Clear local auth data
        localStorage.removeItem('rtms_token');
        localStorage.removeItem('rtms_user');
        
        this.currentUser = null;
        this.userRole = null;

        // Reset UI
        document.getElementById('publicActions').classList.remove('hidden');
        document.getElementById('authenticatedActions').classList.add('hidden');
        
        // Show public navigation
        document.getElementById('publicNavMenu').classList.remove('hidden');
        document.getElementById('studentNavMenu').classList.add('hidden');
        document.getElementById('staffNavMenu').classList.add('hidden');

        // Redirect to home
        window.app.navigateToPage('home');
        this.showToast('Logged out successfully', 'success');
    }

    checkStoredAuth() {
        const token = localStorage.getItem('rtms_token');
        const userData = localStorage.getItem('rtms_user');

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                this.setAuthenticatedUser(user, token);
                
                // Verify token is still valid
                window.api.verifyToken(token).catch(() => {
                    this.logout();
                });
            } catch (error) {
                console.warn('Invalid stored user data:', error);
                this.logout();
            }
        }
    }

    setLoginLoading(loading) {
        const btn = document.querySelector('#loginForm button[type="submit"]');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        if (loading) {
            btn.disabled = true;
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    showNotifications() {
        // Implement notifications panel
        this.showToast('Notifications feature coming soon!', 'info');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type] || 'ℹ️';

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
    }

    // Public methods for checking auth state
    isAuthenticated() {
        return !!this.currentUser;
    }

    isStudent() {
        return this.userRole === 'student';
    }

    isStaff() {
        return this.userRole === 'staff';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return localStorage.getItem('rtms_token');
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthSystem();
});