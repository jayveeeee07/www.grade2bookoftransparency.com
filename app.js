// User Database Management
class UserDatabase {
    constructor() {
        this.storageKey = 'pangkatDalawaUsers';
        this.currentUserKey = 'currentUser';
        this.initializeDefaultUsers();
    }

    // Initialize with default users
    initializeDefaultUsers() {
        let users = this.getUsers();
        
        // Add default users if none exist
        if (users.length === 0) {
            const defaultUsers = [
                { username: 'admin', password: 'ADMIN01', role: 'admin' },
                { username: 'jayvee', password: 'ADMIN01', role: 'member' },
                { username: 'marjhon', password: 'SECMJ', role: 'member' },
                { username: 'christian', password: 'TREASCL', role: 'member' },
                { username: 'princess', password: 'VPRESPL', role: 'member' },
                { username: 'guest', password: 'guest', role: 'guest' }
            ];
            
            users = defaultUsers.map(user => ({
                ...user,
                createdAt: new Date().toISOString(),
                lastLogin: null
            }));
            
            this.saveUsers(users);
        }
        
        this.updateMemberCount();
    }

    // Get all users
    getUsers() {
        const usersJson = localStorage.getItem(this.storageKey);
        return usersJson ? JSON.parse(usersJson) : [];
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
        this.updateMemberCount();
    }

    // Update member count display
    updateMemberCount() {
        const users = this.getUsers();
        const memberCountElement = document.getElementById('memberCount');
        if (memberCountElement) {
            memberCountElement.textContent = users.length;
        }
    }

    // Check if username exists
    usernameExists(username) {
        const users = this.getUsers();
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    // Register new user
    registerUser(username, password) {
        if (this.usernameExists(username)) {
            return { success: false, message: 'Username already exists' };
        }

        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const users = this.getUsers();
        const newUser = {
            username: username.trim(),
            password: password,
            role: 'member', // Default role for new users
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        this.saveUsers(users);
        
        return { success: true, message: 'Account created successfully!' };
    }

    // Authenticate user
    authenticate(username, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );

        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers(users);
            
            // Store current user with role
            localStorage.setItem(this.currentUserKey, JSON.stringify({
                username: user.username,
                role: user.role || 'member',
                loginTime: new Date().toISOString()
            }));
            
            return { 
                success: true, 
                user,
                isAdmin: user.role === 'admin'
            };
        }
        
        return { success: false, message: 'Invalid username or password' };
    }

    // Get current user
    getCurrentUser() {
        const userJson = localStorage.getItem(this.currentUserKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    // Logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
    }

    // Get user role
    getUserRole(username) {
        const users = this.getUsers();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        return user ? user.role : 'guest';
    }
}

// Initialize database
const userDB = new UserDatabase();

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPanel = document.getElementById('forgotPanel');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Navigation links
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const showForgotLink = document.getElementById('showForgot');
    const backFromForgotBtn = document.getElementById('backFromForgot');

    // Password toggle functionality
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    });

    // Show login form
    function showLoginForm() {
        loginForm.classList.add('active-form');
        registerForm.style.display = 'none';
        forgotPanel.style.display = 'none';
        clearMessages();
    }

    // Show register form
    function showRegisterForm() {
        loginForm.classList.remove('active-form');
        registerForm.style.display = 'block';
        forgotPanel.style.display = 'none';
        clearMessages();
    }

    // Show forgot password panel
    function showForgotPanel() {
        loginForm.classList.remove('active-form');
        registerForm.style.display = 'none';
        forgotPanel.style.display = 'block';
        clearMessages();
    }

    // Clear all messages
    function clearMessages() {
        loginError.style.display = 'none';
        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';
    }

    // Show loading
    function showLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // Show message with animation
    function showMessage(element, message, isError = true) {
        element.textContent = message;
        element.style.display = 'block';
        
        if (isError) {
            element.className = 'error-message';
            element.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        } else {
            element.className = 'success-message';
        }
    }

    // Add shake animation for errors
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    // Event Listeners for navigation
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
        document.getElementById('regUsername').focus();
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
        document.getElementById('loginUsername').focus();
    });

    showForgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotPanel();
    });

    backFromForgotBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Validation
        if (!username || !password) {
            showMessage(loginError, 'Please enter both username and password');
            return;
        }
        
        showLoading(true);
        
        // Simulate network delay
        setTimeout(() => {
            const result = userDB.authenticate(username, password);
            
            showLoading(false);
            
            if (result.success) {
                // Store login state
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('userRole', result.user.role || 'member');
                
                // Show success message briefly before redirecting
                const welcomeMsg = result.isAdmin 
                    ? 'Welcome, Administrator! Redirecting...' 
                    : 'Login successful! Redirecting...';
                showMessage(loginError, welcomeMsg, false);
                
                // Redirect based on role
                setTimeout(() => {
                    if (result.isAdmin) {
                        window.location.href = 'adminpanel.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            } else {
                showMessage(loginError, result.message || 'Invalid credentials');
                
                // Shake animation
                loginForm.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    loginForm.style.animation = '';
                }, 500);
            }
        }, 1000);
    });

    // Register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!username || !password || !confirmPassword) {
            showMessage(registerError, 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage(registerError, 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showMessage(registerError, 'Password must be at least 6 characters');
            return;
        }
        
        if (username.length < 3) {
            showMessage(registerError, 'Username must be at least 3 characters');
            return;
        }
        
        // Prevent registering as admin
        if (username.toLowerCase() === 'admin') {
            showMessage(registerError, 'Cannot register as admin. Please choose another username.');
            return;
        }
        
        showLoading(true);
        
        // Simulate network delay
        setTimeout(() => {
            const result = userDB.registerUser(username, password);
            
            showLoading(false);
            
            if (result.success) {
                // Show success message
                showMessage(registerSuccess, result.message, false);
                
                // Clear form
                registerForm.reset();
                
                // Auto-switch to login form after delay
                setTimeout(() => {
                    showLoginForm();
                    document.getElementById('loginUsername').value = username;
                    document.getElementById('loginUsername').focus();
                }, 2000);
            } else {
                showMessage(registerError, result.message);
            }
        }, 1000);
    });

    // Auto-focus username field on page load
    document.getElementById('loginUsername').focus();
    
    // Add input validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#3949ab';
            } else {
                this.style.borderColor = '#e0e0e0';
            }
        });
    });
});
