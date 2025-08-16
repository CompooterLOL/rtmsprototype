// API Integration for RTMS Database
class APIService {
    constructor() {
        this.baseURL = '/api'; // Configure this to match your backend
        this.token = null;
        this.init();
    }

    init() {
        // Set up request interceptors
        this.setupRequestInterceptors();
    }

    setupRequestInterceptors() {
        // Add auth token to requests
        this.token = localStorage.getItem('rtms_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Return JSON if response has content
            if (response.status !== 204) {
                return await response.json();
            }
            
            return { success: true };
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Handle network errors gracefully
            if (!navigator.onLine) {
                throw new Error('Network connection failed. Please check your internet connection.');
            }
            
            // Handle auth errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                window.auth?.logout();
                throw new Error('Session expired. Please log in again.');
            }
            
            throw error;
        }
    }

    // Authentication endpoints
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.token = response.token;
        }
        
        return response;
    }

    async socialLogin(provider, userType) {
        // For OAuth, this would typically redirect to the provider
        // For demo purposes, we'll simulate the flow
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate successful OAuth
                resolve({
                    success: true,
                    user: {
                        id: Math.random().toString(36),
                        firstName: 'Social',
                        lastName: 'User',
                        email: `user@${provider}.com`,
                        role: userType,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
                    },
                    token: 'demo_social_token_' + Date.now()
                });
            }, 1500);
        });
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.token = null;
    }

    async verifyToken(token) {
        return await this.request('/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    // User management
    async getCurrentUser() {
        return await this.request('/users/me');
    }

    async updateProfile(userData) {
        return await this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);
        
        return await this.request('/users/me/avatar', {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set it for FormData
        });
    }

    // Student-specific endpoints
    async getStudentDashboard() {
        return await this.request('/students/dashboard');
    }

    async getStudentSubmissions() {
        return await this.request('/students/submissions');
    }

    async submitChallenge(challengeId, submissionData) {
        return await this.request(`/challenges/${challengeId}/submit`, {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
    }

    async getStudentProgress() {
        return await this.request('/students/progress');
    }

    // Staff-specific endpoints
    async getAdminDashboard() {
        return await this.request('/admin/dashboard');
    }

    async getAllStudents(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.request(`/admin/students?${queryParams}`);
    }

    async getStudentDetails(studentId) {
        return await this.request(`/admin/students/${studentId}`);
    }

    async updateStudentStatus(studentId, status) {
        return await this.request(`/admin/students/${studentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getAllChallenges() {
        return await this.request('/admin/challenges');
    }

    async createChallenge(challengeData) {
        return await this.request('/admin/challenges', {
            method: 'POST',
            body: JSON.stringify(challengeData)
        });
    }

    async updateChallenge(challengeId, challengeData) {
        return await this.request(`/admin/challenges/${challengeId}`, {
            method: 'PUT',
            body: JSON.stringify(challengeData)
        });
    }

    async deleteChallenge(challengeId) {
        return await this.request(`/admin/challenges/${challengeId}`, {
            method: 'DELETE'
        });
    }

    // Public endpoints
    async getChallenges() {
        return await this.request('/challenges');
    }

    async getChallengeDetails(challengeId) {
        return await this.request(`/challenges/${challengeId}`);
    }

    async getShowcaseProjects() {
        return await this.request('/showcase');
    }

    async getChapters() {
        return await this.request('/chapters');
    }

    async getEvents() {
        return await this.request('/events');
    }

    async getSponsors() {
        return await this.request('/sponsors');
    }

    // Notifications
    async getNotifications() {
        return await this.request('/notifications');
    }

    async markNotificationAsRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    // Analytics (Staff only)
    async getAnalytics(timeframe = '30d') {
        return await this.request(`/admin/analytics?timeframe=${timeframe}`);
    }

    async getEngagementMetrics() {
        return await this.request('/admin/analytics/engagement');
    }

    // Application endpoints
    async submitApplication(applicationData) {
        return await this.request('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async getApplicationStatus(applicationId) {
        return await this.request(`/applications/${applicationId}`);
    }

    // Chapters management
    async createChapter(chapterData) {
        return await this.request('/admin/chapters', {
            method: 'POST',
            body: JSON.stringify(chapterData)
        });
    }

    async updateChapter(chapterId, chapterData) {
        return await this.request(`/admin/chapters/${chapterId}`, {
            method: 'PUT',
            body: JSON.stringify(chapterData)
        });
    }

    // Real-time setup (WebSocket/Server-Sent Events)
    setupRealtime(token) {
        if (typeof EventSource !== 'undefined') {
            this.eventSource = new EventSource(`/api/stream?token=${token}`);
            
            this.eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeEvent(data);
            };
            
            this.eventSource.onerror = (error) => {
                console.warn('Real-time connection error:', error);
            };
        }
    }

    handleRealtimeEvent(data) {
        switch (data.type) {
            case 'notification':
                window.auth?.updateNotifications();
                break;
            case 'challenge_update':
                // Refresh challenges if on challenges page
                if (window.app?.currentPage === 'challenges') {
                    window.app?.loadPageContent('challenges');
                }
                break;
            case 'submission_status':
                // Show toast notification
                window.auth?.showToast(data.message, data.status === 'approved' ? 'success' : 'info');
                break;
            default:
                console.log('Unknown real-time event:', data);
        }
    }

    // Utility methods
    async uploadFile(file, endpoint) {
        const formData = new FormData();
        formData.append('file', file);
        
        return await this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    // Mock data for development (remove in production)
    getMockData(type) {
        const mockData = {
            studentDashboard: {
                nextMeeting: {
                    title: 'Weekly Standup',
                    time: '2h 15m',
                    chapter: 'Stanford University'
                },
                currentChallenge: {
                    title: 'Build a Portfolio Site',
                    progress: 65
                },
                submissions: [
                    { name: 'Weather App', status: 'approved' },
                    { name: 'Todo List', status: 'featured' }
                ]
            },
            adminDashboard: {
                totalStudents: 2547,
                activeChapters: 52,
                pendingApplications: 128,
                completedChallenges: 1834
            },
            challenges: [
                {
                    id: 1,
                    title: 'Build a Portfolio Website',
                    difficulty: 1,
                    category: 'Web Dev',
                    submissions: 45
                },
                {
                    id: 2,
                    title: 'API Integration Project',
                    difficulty: 2,
                    category: 'Full Stack',
                    submissions: 23
                },
                {
                    id: 3,
                    title: 'Machine Learning Model',
                    difficulty: 3,
                    category: 'AI/ML',
                    submissions: 8
                }
            ]
        };

        return Promise.resolve(mockData[type] || {});
    }
}

// Initialize API service
document.addEventListener('DOMContentLoaded', () => {
    window.api = new APIService();
});