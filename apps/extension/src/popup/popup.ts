// Popup Script
// Handles login/logout and displays user status

const loadingEl = document.getElementById('loading')!;
const loginView = document.getElementById('login-view')!;
const loggedInView = document.getElementById('logged-in-view')!;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const errorContainer = document.getElementById('error-container')!;
const userAvatar = document.getElementById('user-avatar')!;
const userEmail = document.getElementById('user-email')!;
const logoutBtn = document.getElementById('logout-btn')!;
const createProfileBtn = document.getElementById('create-profile-btn')!;

// Check auth status on load
async function checkAuth(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });

    loadingEl.style.display = 'none';

    if (response.authenticated && response.user) {
      showLoggedInView(response.user);
    } else {
      showLoginView();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    loadingEl.style.display = 'none';
    showLoginView();
  }
}

function showLoginView(): void {
  loginView.style.display = 'block';
  loggedInView.style.display = 'none';
}

async function showLoggedInView(user: { email: string }): Promise<void> {
  loginView.style.display = 'none';
  loggedInView.style.display = 'block';

  userEmail.textContent = user.email;
  userAvatar.textContent = user.email.charAt(0).toUpperCase();

  // Check if user has profiles
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILES' });
    if (!response.profiles || response.profiles.length === 0) {
      createProfileBtn.style.display = 'block';
    } else {
      createProfileBtn.style.display = 'none';
    }
  } catch (e) {
    console.error('Error checking profiles:', e);
  }
}

function showError(message: string): void {
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
}

function hideError(): void {
  errorContainer.style.display = 'none';
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'LOGIN',
      email,
      password,
    });

    if (response.success) {
      showLoggedInView(response.user);
    } else {
      showError(response.error || 'Login failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

// Create Profile button
createProfileBtn?.addEventListener('click', async () => {
  createProfileBtn.textContent = 'Creating...';
  createProfileBtn.setAttribute('disabled', 'true');

  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'CREATE_PROFILE',
      name: 'Default Profile',
      data: {
        personalInfo: {
          fullName: 'Your Name',
          email: userEmail.textContent || '',
          phone: '',
          location: '',
          linkedin: '',
          website: ''
        }
      }
    });

    if (response.success) {
      createProfileBtn.style.display = 'none';
      alert('Profile created! You can now use the extension on job pages.');
    } else {
      alert('Failed to create profile: ' + (response.error || 'Unknown error'));
      createProfileBtn.textContent = 'Create Default Profile';
      createProfileBtn.removeAttribute('disabled');
    }
  } catch (error) {
    console.error('Create profile error:', error);
    alert('Network error');
    createProfileBtn.textContent = 'Create Default Profile';
    createProfileBtn.removeAttribute('disabled');
  }
});

// Logout button
logoutBtn.addEventListener('click', async () => {
  logoutBtn.textContent = 'Signing out...';
  logoutBtn.setAttribute('disabled', 'true');

  try {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    showLoginView();
    emailInput.value = '';
    passwordInput.value = '';
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.removeAttribute('disabled');
  }
});

// Initialize
checkAuth();
