// RTMS Application JavaScript

class RTMSApp {
    constructor() {
        this.currentPage = 'home';
        this.glowMode = 'redesign'; // redesign, accessible, high-glow
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupGlowMode();
        this.setupInteractiveElements();
        this.setupMobileMenu();
        this.setupAuthIntegration();
        this.loadPageContent();
        this.isInitialized = true;
    }

    setupAuthIntegration() {
        // Wait for auth system to initialize
        document.addEventListener('auth:ready', () => {
            this.updateNavigationForAuth();
        });

        // Listen for auth state changes
        document.addEventListener('auth:login', (e) => {
            this.handleAuthLogin(e.detail);
        });

        document.addEventListener('auth:logout', () => {
            this.handleAuthLogout();
        });
    }

    updateNavigationForAuth() {
        if (window.auth && window.auth.isAuthenticated()) {
            this.updateNavLinksForRole();
        }
    }

    updateNavLinksForRole() {
        const allNavLinks = document.querySelectorAll('.nav-link');
        allNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href').substring(1);
                if (this.requiresAuth(href) && !window.auth.isAuthenticated()) {
                    e.preventDefault();
                    window.auth.showLoginModal();
                    return;
                }
                
                if (this.requiresStaffRole(href) && !window.auth.isStaff()) {
                    e.preventDefault();
                    window.auth.showToast('Access denied. Staff privileges required.', 'error');
                    return;
                }
            });
        });
    }

    requiresAuth(page) {
        const authPages = ['dashboard', 'submissions', 'profile', 'admin-dashboard', 'manage-students', 'manage-challenges', 'manage-chapters', 'analytics', 'settings'];
        return authPages.includes(page);
    }

    requiresStaffRole(page) {
        const staffPages = ['admin-dashboard', 'manage-students', 'manage-challenges', 'manage-chapters', 'analytics', 'settings'];
        return staffPages.includes(page);
    }

    handleAuthLogin(userData) {
        this.updateNavigationForAuth();
        // Refresh current page content if it's auth-dependent
        if (this.requiresAuth(this.currentPage)) {
            this.loadPageContent(this.currentPage);
        }
    }

    handleAuthLogout() {
        // Redirect to home if user was on an auth-required page
        if (this.requiresAuth(this.currentPage)) {
            this.navigateToPage('home');
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('href').substring(1);
                this.navigateToPage(targetPage);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page);
            }
        });
    }

    navigateToPage(pageName) {
        this.showPage(pageName);
        history.pushState({ page: pageName }, '', `#${pageName}`);
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load page-specific content
        this.loadPageContent(pageName);
    }

    setupGlowMode() {
        // Check for saved preference
        const savedMode = localStorage.getItem('rtms-glow-mode');
        if (savedMode) {
            this.setGlowMode(savedMode);
        }
    }

    setGlowMode(mode) {
        document.body.className = document.body.className.replace(/theme-\w+/, '');
        document.body.classList.add(`theme-${mode}`);
        this.glowMode = mode;
        localStorage.setItem('rtms-glow-mode', mode);
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    setupInteractiveElements() {
        // Sponsor CTA pulse effect
        const sponsorCTA = document.querySelector('.sponsor-cta');
        if (sponsorCTA) {
            sponsorCTA.addEventListener('mouseenter', () => {
                sponsorCTA.style.animationDuration = '1s';
            });
            sponsorCTA.addEventListener('mouseleave', () => {
                sponsorCTA.style.animationDuration = '3s';
            });
        }

        // Card hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.card, .dashboard-card, .challenge-card, .project-card')) {
                const card = e.target.closest('.card, .dashboard-card, .challenge-card, .project-card');
                this.addCardGlow(card);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.card, .dashboard-card, .challenge-card, .project-card')) {
                const card = e.target.closest('.card, .dashboard-card, .challenge-card, .project-card');
                this.removeCardGlow(card);
            }
        });

        // Button interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn')) {
                this.handleButtonClick(e.target);
            }
        });
    }

    addCardGlow(card) {
        if (this.glowMode !== 'accessible') {
            card.style.transition = 'all 0.25s ease-out';
        }
    }

    removeCardGlow(card) {
        setTimeout(() => {
            card.style.transition = 'all 0.25s ease-out';
        }, 100);
    }

    handleButtonClick(button) {
        const buttonText = button.textContent.trim();
        
        switch (buttonText) {
            case 'Join the Club':
                this.navigateToPage('join');
                break;
            case 'Become a Sponsor':
                this.navigateToPage('sponsors');
                break;
            default:
                // Add ripple effect
                this.addRippleEffect(button);
        }
    }

    addRippleEffect(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        ripple.classList.add('ripple');
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    loadPageContent(pageName = this.currentPage) {
        switch (pageName) {
            case 'join':
                this.loadJoinPage();
                break;
            case 'dashboard':
                this.loadDashboardPage();
                break;
            case 'challenges':
                this.loadChallengesPage();
                break;
            case 'showcase':
                this.loadShowcasePage();
                break;
            case 'sponsors':
                this.loadSponsorsPage();
                break;
            case 'chapters':
                this.loadChaptersPage();
                break;
            case 'merch':
                this.loadMerchPage();
                break;
            case 'calendar':
                this.loadCalendarPage();
                break;
            case 'policies':
                this.loadPoliciesPage();
                break;
            case 'styleguide':
                this.loadStyleguidePage();
                break;
            case 'admin-dashboard':
                this.loadAdminDashboardPage();
                break;
            case 'manage-students':
                this.loadManageStudentsPage();
                break;
            case 'manage-challenges':
                this.loadManageChallengesPage();
                break;
            case 'submissions':
                this.loadSubmissionsPage();
                break;
            case 'profile':
                this.loadProfilePage();
                break;
        }
    }

    loadJoinPage() {
        if (document.getElementById('join')) return;
        
        const joinPage = this.createPage('join', `
            <div class="join-container">
                <div class="join-card">
                    <div class="join-header">
                        <h1 class="join-title">Join the Club</h1>
                        <p class="join-subtitle">Apply in 2 minutes. We'll review and set you up.</p>
                    </div>
                    <form class="join-form">
                        <div class="form-row">
                            <div class="input-group">
                                <label class="input-label" for="firstName">First Name</label>
                                <input type="text" id="firstName" class="input" placeholder="Enter your first name" required>
                            </div>
                            <div class="input-group">
                                <label class="input-label" for="lastName">Last Name</label>
                                <input type="text" id="lastName" class="input" placeholder="Enter your last name" required>
                            </div>
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="email">Email Address</label>
                            <input type="email" id="email" class="input" placeholder="Enter your email address" required>
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="school">School/University</label>
                            <input type="text" id="school" class="input" placeholder="Enter your school name" required>
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="experience">Experience Level</label>
                            <select id="experience" class="input" required>
                                <option value="">Select your experience level</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="interests">Areas of Interest</label>
                            <div class="interests-grid">
                                <label class="checkbox-label">
                                    <input type="checkbox" value="web"> Web Development
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="mobile"> Mobile Apps
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="ai"> AI/Machine Learning
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="game"> Game Development
                                </label>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">Submit Application</button>
                    </form>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(joinPage);
    }

    loadDashboardPage() {
        if (document.getElementById('dashboard')) return;
        
        const dashboardPage = this.createPage('dashboard', `
            <div class="dashboard-header">
                <div class="dashboard-welcome">
                    <div class="avatar avatar-lg">JD</div>
                    <div>
                        <div class="dashboard-title">Welcome back, John!</div>
                        <div class="dashboard-chapter">Chapter: Stanford University</div>
                    </div>
                </div>
                <div class="status-pill status-accepted">Active Member</div>
            </div>
            <div class="dashboard-grid">
                <div class="dashboard-card featured">
                    <div class="card-icon">⏰</div>
                    <h3 class="card-title">Next Meeting</h3>
                    <p class="card-subtitle">Weekly Standup</p>
                    <div class="card-content">
                        <div class="progress-circle">
                            <svg>
                                <circle class="progress-circle-bg" cx="40" cy="40" r="36"></circle>
                                <circle class="progress-circle-fill" cx="40" cy="40" r="36" 
                                        stroke-dasharray="226" stroke-dashoffset="56"></circle>
                            </svg>
                            <div class="progress-circle-text">2h 15m</div>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">🎯</div>
                    <h3 class="card-title">Current Challenge</h3>
                    <p class="card-subtitle">Build a Portfolio Site</p>
                    <div class="card-content">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 65%"></div>
                        </div>
                        <div style="margin-top: 8px; font-size: 14px; color: var(--color-text-dim);">65% Complete</div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">📢</div>
                    <h3 class="card-title">Announcements</h3>
                    <div class="card-content">
                        <div style="border-left: 3px solid var(--color-yellow-accent); padding-left: 12px; margin: 8px 0;">
                            <div style="font-weight: 600;">Hackathon Next Week!</div>
                            <div style="font-size: 14px; color: var(--color-text-dim);">Join us for our monthly hackathon</div>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">📋</div>
                    <h3 class="card-title">My Submissions</h3>
                    <div class="card-content">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0;">
                            <span>Weather App</span>
                            <span class="status-pill status-approved">Approved</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0;">
                            <span>Todo List</span>
                            <span class="status-pill status-featured">Featured</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(dashboardPage);
    }

    loadChallengesPage() {
        if (document.getElementById('challenges')) return;
        
        const challengesPage = this.createPage('challenges', `
            <div class="container">
                <div class="challenges-header">
                    <h1 class="section-title">Challenges</h1>
                    <p class="section-subtitle">Optional, but featured if you ship.</p>
                </div>
                <div class="challenges-grid">
                    <div class="challenge-card">
                        <div class="challenge-header">
                            <h3 class="card-title">Build a Portfolio Website</h3>
                            <div class="challenge-meta">
                                <div class="badge-difficulty">
                                    <span>Beginner</span>
                                    <div class="difficulty-dots">
                                        <div class="difficulty-dot active"></div>
                                        <div class="difficulty-dot"></div>
                                        <div class="difficulty-dot"></div>
                                    </div>
                                </div>
                                <div class="chip">Web Dev</div>
                            </div>
                        </div>
                        <p class="challenge-description">Create a personal portfolio website showcasing your projects and skills. Must include responsive design and proper accessibility.</p>
                        <div class="challenge-actions">
                            <button class="btn btn-primary">Submit Work</button>
                            <span style="color: var(--color-text-dim); font-size: 14px;">45 submissions</span>
                        </div>
                    </div>
                    <div class="challenge-card">
                        <div class="challenge-header">
                            <h3 class="card-title">API Integration Project</h3>
                            <div class="challenge-meta">
                                <div class="badge-difficulty">
                                    <span>Intermediate</span>
                                    <div class="difficulty-dots">
                                        <div class="difficulty-dot active"></div>
                                        <div class="difficulty-dot active"></div>
                                        <div class="difficulty-dot"></div>
                                    </div>
                                </div>
                                <div class="chip">Full Stack</div>
                            </div>
                        </div>
                        <p class="challenge-description">Build an application that consumes at least 2 different APIs and presents the data in a meaningful way.</p>
                        <div class="challenge-actions">
                            <button class="btn btn-primary">Submit Work</button>
                            <span style="color: var(--color-text-dim); font-size: 14px;">23 submissions</span>
                        </div>
                    </div>
                    <div class="challenge-card">
                        <div class="challenge-header">
                            <h3 class="card-title">Machine Learning Model</h3>
                            <div class="challenge-meta">
                                <div class="badge-difficulty">
                                    <span>Advanced</span>
                                    <div class="difficulty-dots">
                                        <div class="difficulty-dot active"></div>
                                        <div class="difficulty-dot active"></div>
                                        <div class="difficulty-dot active"></div>
                                    </div>
                                </div>
                                <div class="chip">AI/ML</div>
                            </div>
                        </div>
                        <p class="challenge-description">Train and deploy a machine learning model that solves a real-world problem. Include proper evaluation metrics.</p>
                        <div class="challenge-actions">
                            <button class="btn btn-primary">Submit Work</button>
                            <span style="color: var(--color-text-dim); font-size: 14px;">8 submissions</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(challengesPage);
    }

    loadShowcasePage() {
        if (document.getElementById('showcase')) return;
        
        const showcasePage = this.createPage('showcase', `
            <div class="container">
                <div class="section-title">Student Showcase</div>
                <div class="showcase-grid">
                    <div class="project-card featured">
                        <div class="project-image">
                            Featured Project
                            <div class="project-overlay">
                                <button class="btn btn-primary btn-small">View Live</button>
                                <button class="btn btn-ghost btn-small">Source</button>
                            </div>
                        </div>
                        <div class="project-content">
                            <h3 class="project-title">AI-Powered Study Assistant</h3>
                            <p class="project-author">by Sarah Chen • Stanford</p>
                            <div class="project-tags">
                                <div class="chip">React</div>
                                <div class="chip">Python</div>
                                <div class="chip">OpenAI</div>
                            </div>
                        </div>
                    </div>
                    <div class="project-card">
                        <div class="project-image">
                            Project Image
                            <div class="project-overlay">
                                <button class="btn btn-primary btn-small">View Live</button>
                                <button class="btn btn-ghost btn-small">Source</button>
                            </div>
                        </div>
                        <div class="project-content">
                            <h3 class="project-title">Sustainable Campus App</h3>
                            <p class="project-author">by Mike Johnson • MIT</p>
                            <div class="project-tags">
                                <div class="chip">React Native</div>
                                <div class="chip">Node.js</div>
                            </div>
                        </div>
                    </div>
                    <div class="project-card">
                        <div class="project-image">
                            Project Image
                            <div class="project-overlay">
                                <button class="btn btn-primary btn-small">View Live</button>
                                <button class="btn btn-ghost btn-small">Source</button>
                            </div>
                        </div>
                        <div class="project-content">
                            <h3 class="project-title">Local Business Directory</h3>
                            <p class="project-author">by Alex Kim • Berkeley</p>
                            <div class="project-tags">
                                <div class="chip">Vue.js</div>
                                <div class="chip">Firebase</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(showcasePage);
    }

    loadSponsorsPage() {
        if (document.getElementById('sponsors')) return;
        
        const sponsorsPage = this.createPage('sponsors', `
            <div class="container">
                <div class="section-title">Power a chapter. Boost student makers.</div>
                <div class="section-subtitle">Join industry leaders supporting the next generation of builders</div>
                
                <div class="sponsor-tiers">
                    <div class="grid grid-3" style="margin: 60px 0;">
                        <div class="tier-card bronze">
                            <div class="tier-header">
                                <h3 class="tier-name">Bronze</h3>
                                <div class="tier-price">$500/month</div>
                            </div>
                            <div class="tier-benefits">
                                <div class="benefit">✓ Logo on website</div>
                                <div class="benefit">✓ Monthly impact report</div>
                                <div class="benefit">✓ Access to talent pool</div>
                            </div>
                            <button class="btn btn-secondary">Get Started</button>
                        </div>
                        <div class="tier-card silver featured">
                            <div class="tier-header">
                                <h3 class="tier-name">Silver</h3>
                                <div class="tier-price">$1,500/month</div>
                                <div class="tier-badge">Most Popular</div>
                            </div>
                            <div class="tier-benefits">
                                <div class="benefit">✓ All Bronze benefits</div>
                                <div class="benefit">✓ Dedicated chapter support</div>
                                <div class="benefit">✓ Mentorship opportunities</div>
                                <div class="benefit">✓ Project showcase priority</div>
                            </div>
                            <button class="btn btn-primary">Get Started</button>
                        </div>
                        <div class="tier-card gold">
                            <div class="tier-header">
                                <h3 class="tier-name">Gold</h3>
                                <div class="tier-price">$3,000/month</div>
                            </div>
                            <div class="tier-benefits">
                                <div class="benefit">✓ All Silver benefits</div>
                                <div class="benefit">✓ Custom workshops</div>
                                <div class="benefit">✓ Recruitment pipeline</div>
                                <div class="benefit">✓ Strategic partnership</div>
                            </div>
                            <button class="btn btn-secondary">Get Started</button>
                        </div>
                    </div>
                </div>
                
                <div class="funding-flow">
                    <h2 class="section-title">How Your Investment Flows</h2>
                    <div class="flow-diagram">
                        <div class="flow-step">
                            <div class="flow-icon">💰</div>
                            <h4>Your Contribution</h4>
                            <p>Monthly sponsorship investment</p>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <div class="flow-icon">🏫</div>
                            <h4>Chapter Support</h4>
                            <p>Resources, events, and mentorship</p>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <div class="flow-icon">🚀</div>
                            <h4>Student Success</h4>
                            <p>Projects, skills, and career growth</p>
                        </div>
                    </div>
                </div>
                
                <div class="sponsor-cta-section">
                    <div class="cta-card">
                        <h3>Ready to make an impact?</h3>
                        <p>Connect with our partnerships team to discuss custom sponsorship opportunities.</p>
                        <button class="btn btn-primary btn-large sponsor-cta">Become a Sponsor</button>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(sponsorsPage);
    }

    loadChaptersPage() {
        if (document.getElementById('chapters')) return;
        
        const chaptersPage = this.createPage('chapters', `
            <div class="container">
                <div class="section-title">Chapters Across the Globe</div>
                <div class="section-subtitle">Find your local community or start one at your school</div>
                
                <div class="chapters-map">
                    <div class="map-placeholder">
                        <div class="map-content">
                            <h3>🌍 Interactive Chapter Map</h3>
                            <p>Visual representation of all active chapters worldwide</p>
                            <div class="map-stats">
                                <div class="map-stat">
                                    <span class="stat-number">50+</span>
                                    <span class="stat-label">Active Chapters</span>
                                </div>
                                <div class="map-stat">
                                    <span class="stat-number">25</span>
                                    <span class="stat-label">Countries</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chapters-grid">
                    <div class="chapter-card">
                        <div class="chapter-header">
                            <h3 class="chapter-name">Stanford University</h3>
                            <div class="chapter-meta">
                                <span class="chapter-location">California, USA</span>
                                <span class="chapter-members">245 members</span>
                            </div>
                        </div>
                        <div class="chapter-description">
                            Leading innovation in Silicon Valley with weekly workshops and hackathons.
                        </div>
                        <div class="chapter-tags">
                            <div class="chip">AI/ML</div>
                            <div class="chip">Web3</div>
                            <div class="chip">Startups</div>
                        </div>
                        <button class="btn btn-ghost">View Chapter</button>
                    </div>
                    
                    <div class="chapter-card">
                        <div class="chapter-header">
                            <h3 class="chapter-name">MIT</h3>
                            <div class="chapter-meta">
                                <span class="chapter-location">Massachusetts, USA</span>
                                <span class="chapter-members">180 members</span>
                            </div>
                        </div>
                        <div class="chapter-description">
                            Pushing the boundaries of technology with research-focused projects.
                        </div>
                        <div class="chapter-tags">
                            <div class="chip">Robotics</div>
                            <div class="chip">IoT</div>
                            <div class="chip">Research</div>
                        </div>
                        <button class="btn btn-ghost">View Chapter</button>
                    </div>
                    
                    <div class="chapter-card start-chapter">
                        <div class="chapter-icon">🚀</div>
                        <h3 class="chapter-name">Start a Chapter</h3>
                        <div class="chapter-description">
                            Bring RTMS to your school and build a community of makers.
                        </div>
                        <button class="btn btn-primary">Apply to Start</button>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(chaptersPage);
    }

    loadMerchPage() {
        if (document.getElementById('merch')) return;
        
        const merchPage = this.createPage('merch', `
            <div class="container">
                <div class="section-title">RTMS Merch</div>
                <div class="section-subtitle">Profits support the club and student chapters</div>
                
                <div class="merch-grid">
                    <div class="product-card">
                        <div class="product-image">RTMS Hoodie</div>
                        <div class="product-content">
                            <h3 class="product-title">RTMS Hoodie</h3>
                            <p class="product-price">$45</p>
                            <div class="product-sizes">
                                <div class="size-chip">S</div>
                                <div class="size-chip active">M</div>
                                <div class="size-chip">L</div>
                                <div class="size-chip">XL</div>
                            </div>
                            <button class="btn btn-primary">Add to Cart</button>
                        </div>
                    </div>
                    
                    <div class="product-card">
                        <div class="product-image">RTMS T-Shirt</div>
                        <div class="product-content">
                            <h3 class="product-title">RTMS T-Shirt</h3>
                            <p class="product-price">$25</p>
                            <div class="product-sizes">
                                <div class="size-chip">S</div>
                                <div class="size-chip active">M</div>
                                <div class="size-chip">L</div>
                                <div class="size-chip">XL</div>
                            </div>
                            <button class="btn btn-primary">Add to Cart</button>
                        </div>
                    </div>
                    
                    <div class="product-card">
                        <div class="product-image">Sticker Pack</div>
                        <div class="product-content">
                            <h3 class="product-title">Sticker Pack</h3>
                            <p class="product-price">$8</p>
                            <p class="product-description">Set of 6 premium vinyl stickers</p>
                            <button class="btn btn-primary">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(merchPage);
    }

    loadCalendarPage() {
        if (document.getElementById('calendar')) return;
        
        const calendarPage = this.createPage('calendar', `
            <div class="container">
                <div class="section-title">Event Calendar</div>
                <div class="calendar-view">
                    <div class="calendar-header">
                        <button class="btn btn-ghost">← Previous</button>
                        <h3 class="calendar-month">August 2025</h3>
                        <button class="btn btn-ghost">Next →</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">Sun</div>
                        <div class="calendar-day-header">Mon</div>
                        <div class="calendar-day-header">Tue</div>
                        <div class="calendar-day-header">Wed</div>
                        <div class="calendar-day-header">Thu</div>
                        <div class="calendar-day-header">Fri</div>
                        <div class="calendar-day-header">Sat</div>
                        
                        ${this.generateCalendarDays()}
                    </div>
                </div>
                
                <div class="upcoming-events">
                    <h3>Upcoming Events</h3>
                    <div class="event-list">
                        <div class="event-item">
                            <div class="event-date">Aug 18</div>
                            <div class="event-details">
                                <h4>Weekly Standup</h4>
                                <p>Stanford Chapter • 7:00 PM</p>
                            </div>
                        </div>
                        <div class="event-item">
                            <div class="event-date">Aug 22</div>
                            <div class="event-details">
                                <h4>AI Workshop</h4>
                                <p>MIT Chapter • 6:00 PM</p>
                            </div>
                        </div>
                        <div class="event-item">
                            <div class="event-date">Aug 25</div>
                            <div class="event-details">
                                <h4>Monthly Hackathon</h4>
                                <p>All Chapters • 9:00 AM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(calendarPage);
    }

    generateCalendarDays() {
        let days = '';
        for (let i = 1; i <= 31; i++) {
            const isToday = i === 16;
            const hasEvent = [18, 22, 25].includes(i);
            const dayClass = `calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`;
            days += `<div class="${dayClass}">${i}${hasEvent ? '<div class="event-pill"></div>' : ''}</div>`;
        }
        return days;
    }

    loadPoliciesPage() {
        if (document.getElementById('policies')) return;
        
        const policiesPage = this.createPage('policies', `
            <div class="container">
                <div class="policies-layout">
                    <div class="policies-toc">
                        <h3>Table of Contents</h3>
                        <div class="toc-item active">
                            <a href="#code-of-conduct">Code of Conduct</a>
                        </div>
                        <div class="toc-item">
                            <a href="#privacy-policy">Privacy Policy</a>
                        </div>
                        <div class="toc-item">
                            <a href="#terms-of-service">Terms of Service</a>
                        </div>
                        <div class="toc-item">
                            <a href="#academic-integrity">Academic Integrity</a>
                        </div>
                    </div>
                    <div class="policies-content">
                        <section id="code-of-conduct">
                            <h2>Code of Conduct</h2>
                            <p>Our community is built on respect, collaboration, and learning. We expect all members to:</p>
                            <ul>
                                <li>Treat everyone with respect and kindness</li>
                                <li>Provide constructive feedback and support</li>
                                <li>Respect different perspectives and experiences</li>
                                <li>Maintain a safe and inclusive environment</li>
                            </ul>
                        </section>
                        
                        <section id="privacy-policy">
                            <h2>Privacy Policy</h2>
                            <p>We respect your privacy and are committed to protecting your personal data.</p>
                            <h3>Data Collection</h3>
                            <p>We collect only the information necessary to provide our services...</p>
                        </section>
                        
                        <section id="terms-of-service">
                            <h2>Terms of Service</h2>
                            <p>By using RTMS, you agree to these terms and conditions...</p>
                        </section>
                        
                        <section id="academic-integrity">
                            <h2>Academic Integrity</h2>
                            <p>We maintain high standards of academic honesty and expect all submissions to be original work...</p>
                        </section>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(policiesPage);
    }

    loadStyleguidePage() {
        if (document.getElementById('styleguide')) return;
        
        const styleguidePage = this.createPage('styleguide', `
            <div class="container">
                <div class="section-title">Design System</div>
                <div class="section-subtitle">Colors, typography, components, and patterns</div>
                
                <div class="styleguide-section">
                    <h2>Colors</h2>
                    <div class="color-palette">
                        <div class="color-swatch">
                            <div class="color-sample" style="background: #0B0B0B;"></div>
                            <div class="color-info">
                                <strong>Black Canvas</strong>
                                <code>#0B0B0B</code>
                            </div>
                        </div>
                        <div class="color-swatch">
                            <div class="color-sample" style="background: #FFD400;"></div>
                            <div class="color-info">
                                <strong>Yellow Accent</strong>
                                <code>#FFD400</code>
                            </div>
                        </div>
                        <div class="color-swatch">
                            <div class="color-sample" style="background: #FFEB7A;"></div>
                            <div class="color-info">
                                <strong>Yellow Soft</strong>
                                <code>#FFEB7A</code>
                            </div>
                        </div>
                        <div class="color-swatch">
                            <div class="color-sample" style="background: #F7F7F7;"></div>
                            <div class="color-info">
                                <strong>Text Primary</strong>
                                <code>#F7F7F7</code>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="styleguide-section">
                    <h2>Buttons</h2>
                    <div class="component-showcase">
                        <button class="btn btn-primary">Primary Button</button>
                        <button class="btn btn-secondary">Secondary Button</button>
                        <button class="btn btn-ghost">Ghost Button</button>
                        <button class="btn btn-primary btn-small">Small Button</button>
                        <button class="btn btn-primary btn-large">Large Button</button>
                    </div>
                </div>
                
                <div class="styleguide-section">
                    <h2>Cards</h2>
                    <div class="component-showcase">
                        <div class="card" style="max-width: 300px;">
                            <div class="card-header">
                                <h3 class="card-title">Card Title</h3>
                                <p class="card-subtitle">Card subtitle</p>
                            </div>
                            <div class="card-content">
                                This is the card content area with some sample text.
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary btn-small">Action</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="styleguide-section">
                    <h2>Badges & Chips</h2>
                    <div class="component-showcase">
                        <div class="badge badge-primary">Primary</div>
                        <div class="badge badge-secondary">Secondary</div>
                        <div class="badge badge-success">Success</div>
                        <div class="badge badge-warning">Warning</div>
                        <div class="badge badge-error">Error</div>
                        <div class="chip">React</div>
                        <div class="chip">JavaScript</div>
                        <div class="chip">Python</div>
                    </div>
                </div>
                
                <div class="styleguide-section">
                    <h2>Typography</h2>
                    <div class="typography-showcase">
                        <h1>Heading 1 - Poppins Bold</h1>
                        <h2>Heading 2 - Poppins Semibold</h2>
                        <h3>Heading 3 - Poppins Medium</h3>
                        <p>Body text - Poppins Regular. This is a sample paragraph to show how body text looks in the design system.</p>
                        <p class="text-dim">Dimmed text - Used for secondary information and descriptions.</p>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(styleguidePage);
    }

    loadAdminDashboardPage() {
        if (document.getElementById('admin-dashboard')) return;
        
        const adminPage = this.createPage('admin-dashboard', `
            <div class="container">
                <div class="admin-header">
                    <h1 class="section-title">Admin Dashboard</h1>
                    <div class="admin-actions">
                        <button class="btn btn-primary" id="exportDataBtn">Export Data</button>
                        <button class="btn btn-secondary" id="systemSettingsBtn">System Settings</button>
                    </div>
                </div>
                
                <div class="admin-stats-grid">
                    <div class="stat-card students">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <h3 class="stat-number">2,547</h3>
                            <p class="stat-label">Total Students</p>
                            <span class="stat-change positive">+12% this month</span>
                        </div>
                    </div>
                    <div class="stat-card chapters">
                        <div class="stat-icon">🏫</div>
                        <div class="stat-content">
                            <h3 class="stat-number">52</h3>
                            <p class="stat-label">Active Chapters</p>
                            <span class="stat-change positive">+3 new</span>
                        </div>
                    </div>
                    <div class="stat-card applications">
                        <div class="stat-icon">📝</div>
                        <div class="stat-content">
                            <h3 class="stat-number">128</h3>
                            <p class="stat-label">Pending Applications</p>
                            <span class="stat-change neutral">Review needed</span>
                        </div>
                    </div>
                    <div class="stat-card submissions">
                        <div class="stat-icon">🚀</div>
                        <div class="stat-content">
                            <h3 class="stat-number">1,834</h3>
                            <p class="stat-label">Challenge Submissions</p>
                            <span class="stat-change positive">+15% this week</span>
                        </div>
                    </div>
                </div>
                
                <div class="admin-content-grid">
                    <div class="admin-card recent-activity">
                        <div class="card-header">
                            <h3 class="card-title">Recent Activity</h3>
                            <button class="btn btn-ghost btn-small">View All</button>
                        </div>
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-avatar">JS</div>
                                <div class="activity-content">
                                    <p><strong>John Smith</strong> submitted "Portfolio Website"</p>
                                    <span class="activity-time">2 minutes ago</span>
                                </div>
                                <div class="activity-status pending">Pending</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-avatar">MC</div>
                                <div class="activity-content">
                                    <p><strong>MIT Chapter</strong> created new event</p>
                                    <span class="activity-time">15 minutes ago</span>
                                </div>
                                <div class="activity-status approved">Created</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-avatar">SC</div>
                                <div class="activity-content">
                                    <p><strong>Sarah Chen</strong> featured in showcase</p>
                                    <span class="activity-time">1 hour ago</span>
                                </div>
                                <div class="activity-status featured">Featured</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-card quick-actions">
                        <div class="card-header">
                            <h3 class="card-title">Quick Actions</h3>
                        </div>
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn">
                                <div class="quick-action-icon">👥</div>
                                <span>Manage Students</span>
                            </button>
                            <button class="quick-action-btn">
                                <div class="quick-action-icon">🎯</div>
                                <span>Create Challenge</span>
                            </button>
                            <button class="quick-action-btn">
                                <div class="quick-action-icon">📧</div>
                                <span>Send Notification</span>
                            </button>
                            <button class="quick-action-btn">
                                <div class="quick-action-icon">📊</div>
                                <span>View Analytics</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(adminPage);
    }

    loadManageStudentsPage() {
        if (document.getElementById('manage-students')) return;
        
        const studentsPage = this.createPage('manage-students', `
            <div class="container">
                <div class="page-header">
                    <h1 class="section-title">Manage Students</h1>
                    <div class="page-actions">
                        <div class="search-box">
                            <input type="text" class="input" placeholder="Search students..." id="studentSearch">
                        </div>
                        <button class="btn btn-primary" id="addStudentBtn">Add Student</button>
                    </div>
                </div>
                
                <div class="filters-bar">
                    <div class="filter-group">
                        <label>Status:</label>
                        <select class="input" id="statusFilter">
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Chapter:</label>
                        <select class="input" id="chapterFilter">
                            <option value="">All Chapters</option>
                            <option value="stanford">Stanford</option>
                            <option value="mit">MIT</option>
                            <option value="berkeley">Berkeley</option>
                        </select>
                    </div>
                    <button class="btn btn-ghost" id="clearFilters">Clear Filters</button>
                </div>
                
                <div class="students-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Chapter</th>
                                <th>Join Date</th>
                                <th>Status</th>
                                <th>Submissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentsTableBody">
                            <tr>
                                <td>
                                    <div class="student-info">
                                        <div class="avatar avatar-sm">JS</div>
                                        <div>
                                            <div class="student-name">John Smith</div>
                                            <div class="student-id">#STU001</div>
                                        </div>
                                    </div>
                                </td>
                                <td>john.smith@student.stanford.edu</td>
                                <td>Stanford University</td>
                                <td>Jan 15, 2024</td>
                                <td><span class="status-pill status-accepted">Active</span></td>
                                <td>12</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-ghost btn-small">View</button>
                                        <button class="btn btn-ghost btn-small">Edit</button>
                                        <button class="btn btn-ghost btn-small text-red">Suspend</button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="student-info">
                                        <div class="avatar avatar-sm">SC</div>
                                        <div>
                                            <div class="student-name">Sarah Chen</div>
                                            <div class="student-id">#STU002</div>
                                        </div>
                                    </div>
                                </td>
                                <td>sarah.chen@student.stanford.edu</td>
                                <td>Stanford University</td>
                                <td>Feb 3, 2024</td>
                                <td><span class="status-pill status-accepted">Active</span></td>
                                <td>8</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-ghost btn-small">View</button>
                                        <button class="btn btn-ghost btn-small">Edit</button>
                                        <button class="btn btn-ghost btn-small text-red">Suspend</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="table-pagination">
                    <span class="pagination-info">Showing 1-25 of 2,547 students</span>
                    <div class="pagination-controls">
                        <button class="btn btn-ghost btn-small" disabled>Previous</button>
                        <span class="pagination-pages">
                            <button class="pagination-page active">1</button>
                            <button class="pagination-page">2</button>
                            <button class="pagination-page">3</button>
                            <span>...</span>
                            <button class="pagination-page">102</button>
                        </span>
                        <button class="btn btn-ghost btn-small">Next</button>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(studentsPage);
    }

    loadManageChallengesPage() {
        if (document.getElementById('manage-challenges')) return;
        
        const challengesPage = this.createPage('manage-challenges', `
            <div class="container">
                <div class="page-header">
                    <h1 class="section-title">Manage Challenges</h1>
                    <button class="btn btn-primary" id="createChallengeBtn">Create Challenge</button>
                </div>
                
                <div class="challenges-admin-grid">
                    <div class="challenge-admin-card">
                        <div class="challenge-status published">Published</div>
                        <h3 class="challenge-title">Build a Portfolio Website</h3>
                        <div class="challenge-meta">
                            <span class="challenge-difficulty">
                                <div class="difficulty-dots">
                                    <div class="difficulty-dot active"></div>
                                    <div class="difficulty-dot"></div>
                                    <div class="difficulty-dot"></div>
                                </div>
                                Beginner
                            </span>
                            <span class="challenge-submissions">45 submissions</span>
                        </div>
                        <p class="challenge-description">Create a personal portfolio website showcasing projects and skills.</p>
                        <div class="challenge-actions">
                            <button class="btn btn-ghost btn-small">Edit</button>
                            <button class="btn btn-ghost btn-small">View Submissions</button>
                            <button class="btn btn-ghost btn-small">Duplicate</button>
                            <button class="btn btn-ghost btn-small text-red">Archive</button>
                        </div>
                    </div>
                    
                    <div class="challenge-admin-card">
                        <div class="challenge-status draft">Draft</div>
                        <h3 class="challenge-title">React Component Library</h3>
                        <div class="challenge-meta">
                            <span class="challenge-difficulty">
                                <div class="difficulty-dots">
                                    <div class="difficulty-dot active"></div>
                                    <div class="difficulty-dot active"></div>
                                    <div class="difficulty-dot"></div>
                                </div>
                                Intermediate
                            </span>
                            <span class="challenge-submissions">0 submissions</span>
                        </div>
                        <p class="challenge-description">Build a reusable React component library with documentation.</p>
                        <div class="challenge-actions">
                            <button class="btn btn-primary btn-small">Publish</button>
                            <button class="btn btn-ghost btn-small">Edit</button>
                            <button class="btn btn-ghost btn-small">Preview</button>
                            <button class="btn btn-ghost btn-small text-red">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(challengesPage);
    }

    loadSubmissionsPage() {
        if (document.getElementById('submissions')) return;
        
        const submissionsPage = this.createPage('submissions', `
            <div class="container">
                <div class="section-title">My Submissions</div>
                <div class="submissions-grid">
                    <div class="submission-card">
                        <div class="submission-header">
                            <h3 class="submission-title">Weather Dashboard App</h3>
                            <span class="status-pill status-approved">Approved</span>
                        </div>
                        <div class="submission-meta">
                            <span>Challenge: API Integration Project</span>
                            <span>Submitted: Aug 10, 2024</span>
                        </div>
                        <div class="submission-links">
                            <a href="#" class="btn btn-ghost btn-small">View Live</a>
                            <a href="#" class="btn btn-ghost btn-small">Source Code</a>
                            <button class="btn btn-ghost btn-small">Edit</button>
                        </div>
                        <div class="submission-feedback">
                            <h4>Feedback:</h4>
                            <p>"Excellent implementation with clean code and great UI design. Well done!"</p>
                        </div>
                    </div>
                    
                    <div class="submission-card">
                        <div class="submission-header">
                            <h3 class="submission-title">Personal Portfolio</h3>
                            <span class="status-pill status-featured">Featured</span>
                        </div>
                        <div class="submission-meta">
                            <span>Challenge: Build a Portfolio Website</span>
                            <span>Submitted: Jul 28, 2024</span>
                        </div>
                        <div class="submission-links">
                            <a href="#" class="btn btn-ghost btn-small">View Live</a>
                            <a href="#" class="btn btn-ghost btn-small">Source Code</a>
                        </div>
                        <div class="submission-feedback">
                            <h4>Feedback:</h4>
                            <p>"Outstanding work! Featured in our showcase for exceptional design and functionality."</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(submissionsPage);
    }

    loadProfilePage() {
        if (document.getElementById('profile')) return;
        
        const profilePage = this.createPage('profile', `
            <div class="container">
                <div class="profile-layout">
                    <div class="profile-sidebar">
                        <div class="profile-card">
                            <div class="profile-avatar-section">
                                <div class="profile-avatar">
                                    <img src="" alt="Profile Picture" id="profileAvatar" class="hidden">
                                    <span id="profileInitials">JS</span>
                                    <button class="avatar-edit-btn" id="editAvatarBtn">📷</button>
                                </div>
                                <input type="file" id="avatarInput" accept="image/*" class="hidden">
                            </div>
                            <div class="profile-info">
                                <h2 class="profile-name" id="profileName">John Smith</h2>
                                <p class="profile-role" id="profileRole">Student</p>
                                <p class="profile-chapter" id="profileChapter">Stanford University</p>
                            </div>
                            <div class="profile-stats">
                                <div class="profile-stat">
                                    <span class="stat-number">12</span>
                                    <span class="stat-label">Submissions</span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-number">8</span>
                                    <span class="stat-label">Approved</span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-number">2</span>
                                    <span class="stat-label">Featured</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-content">
                        <div class="profile-tabs">
                            <button class="tab-btn active" data-tab="personal">Personal Info</button>
                            <button class="tab-btn" data-tab="account">Account Settings</button>
                            <button class="tab-btn" data-tab="notifications">Notifications</button>
                        </div>
                        
                        <div class="tab-content active" id="personalTab">
                            <form class="profile-form" id="personalInfoForm">
                                <div class="form-section">
                                    <h3>Basic Information</h3>
                                    <div class="form-row">
                                        <div class="input-group">
                                            <label class="input-label">First Name</label>
                                            <input type="text" class="input" value="John" id="firstName">
                                        </div>
                                        <div class="input-group">
                                            <label class="input-label">Last Name</label>
                                            <input type="text" class="input" value="Smith" id="lastName">
                                        </div>
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Email Address</label>
                                        <input type="email" class="input" value="john.smith@stanford.edu" id="email" readonly>
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Bio</label>
                                        <textarea class="input" rows="4" placeholder="Tell us about yourself..." id="bio"></textarea>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h3>Skills & Interests</h3>
                                    <div class="input-group">
                                        <label class="input-label">Programming Languages</label>
                                        <div class="skills-input">
                                            <div class="skill-chips">
                                                <div class="chip chip-removable">
                                                    JavaScript
                                                    <button class="chip-remove">&times;</button>
                                                </div>
                                                <div class="chip chip-removable">
                                                    Python
                                                    <button class="chip-remove">&times;</button>
                                                </div>
                                                <div class="chip chip-removable">
                                                    React
                                                    <button class="chip-remove">&times;</button>
                                                </div>
                                            </div>
                                            <input type="text" class="input" placeholder="Add a skill..." id="skillInput">
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                        
                        <div class="tab-content" id="accountTab">
                            <form class="profile-form" id="accountSettingsForm">
                                <div class="form-section">
                                    <h3>Security</h3>
                                    <div class="input-group">
                                        <label class="input-label">Current Password</label>
                                        <input type="password" class="input" id="currentPassword">
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">New Password</label>
                                        <input type="password" class="input" id="newPassword">
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Confirm New Password</label>
                                        <input type="password" class="input" id="confirmPassword">
                                    </div>
                                    <button type="submit" class="btn btn-secondary">Update Password</button>
                                </div>
                            </form>
                        </div>
                        
                        <div class="tab-content" id="notificationsTab">
                            <div class="notifications-settings">
                                <h3>Notification Preferences</h3>
                                <div class="notification-option">
                                    <label class="checkbox-label">
                                        <input type="checkbox" checked> Email notifications for new challenges
                                    </label>
                                </div>
                                <div class="notification-option">
                                    <label class="checkbox-label">
                                        <input type="checkbox" checked> Email notifications for submission updates
                                    </label>
                                </div>
                                <div class="notification-option">
                                    <label class="checkbox-label">
                                        <input type="checkbox"> Weekly digest emails
                                    </label>
                                </div>
                                <button class="btn btn-primary">Save Preferences</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.querySelector('.main').appendChild(profilePage);
    }

    createPage(id, content) {
        const page = document.createElement('section');
        page.id = id;
        page.className = `page page-${id}`;
        page.innerHTML = content;
        return page;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RTMSApp();
});

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn { position: relative; overflow: hidden; }
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
    .interests-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 8px;
    }
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background 0.2s;
    }
    .checkbox-label:hover {
        background: rgba(255, 212, 0, 0.05);
    }
    select.input {
        cursor: pointer;
    }
`;
document.head.appendChild(rippleStyle);