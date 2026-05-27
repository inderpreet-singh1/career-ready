/**
 * auth.js — Career Ready Interactive Auth System
 * Features: modal open/close, tab switching, real-time validation,
 * password strength meter, show/hide password, remember me,
 * localStorage-backed register/login, toast notifications,
 * logged-in nav state, logout, Google sign-in simulation.
 * 
 * Safe for Multi-page Injection: Dynamically injects toastContainer and authModal
 * if they are missing from the DOM on load.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Show a styled toast notification */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);
  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

/** Simple email validator */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Show inline field error */
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  // Shake the parent input
  const wrapper = el.previousElementSibling;
  if (wrapper) {
    wrapper.classList.add('input-shake');
    wrapper.addEventListener('animationend', () => wrapper.classList.remove('input-shake'), { once: true });
  }
}

/** Clear inline field error */
function clearFieldError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.classList.remove('visible'); }
}

/** Mark input as valid/invalid visually */
function setInputState(inputId, isValid) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.toggle('input-valid', isValid);
  input.classList.toggle('input-error', !isValid);
}

// ─── localStorage Auth Store ──────────────────────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem('cr_users') || '{}'); } catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem('cr_users', JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('cr_session') || 'null'); } catch { return null; }
}

function saveSession(data, remember = false) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem('cr_session', JSON.stringify(data));
  localStorage.setItem('loggedInUser', data.email); // legacy compat
}

// Global function so updateNavAuth can be called anywhere
function updateNavAuth() {
  const session = getSession() || (localStorage.getItem('loggedInUser') ? { email: localStorage.getItem('loggedInUser'), name: localStorage.getItem('loggedInUser').split('@')[0] } : null);
  const loginBtn = document.getElementById('navLoginBtn');
  const navUser = document.getElementById('navUser');
  const navAvatar = document.getElementById('navAvatar');
  const navUserName = document.getElementById('navUserName');
  if (!loginBtn || !navUser) return;

  if (session) {
    loginBtn.classList.add('hidden');
    navUser.classList.remove('hidden');
    const name = session.name || session.email.split('@')[0];
    navAvatar.textContent = name.charAt(0).toUpperCase();
    navUserName.textContent = name.length > 14 ? name.slice(0, 13) + '…' : name;
  } else {
    loginBtn.classList.remove('hidden');
    navUser.classList.add('hidden');
  }
}

function clearSession() {
  localStorage.removeItem('cr_session');
  sessionStorage.removeItem('cr_session');
  localStorage.removeItem('loggedInUser');
}

// ─── Dynamic DOM Injection ───────────────────────────────────────────────────

function injectAuthModalIfNeeded() {
  if (!document.getElementById('authModal')) {
    // Inject Toast Container
    if (!document.getElementById('toastContainer')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Inject Auth Modal Overlay & Card
    const authModal = document.createElement('div');
    authModal.id = 'authModal';
    authModal.className = 'modal-overlay hidden';
    authModal.innerHTML = `
      <div class="modal-card" id="modalCard">
          <button class="modal-close" id="closeModal" title="Close">&times;</button>
          <div class="modal-header">
              <div class="modal-brand" style="font-size: 1.8rem; font-weight: 800; background: linear-gradient(45deg, #8b5cf6, #38bdf8, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">🎯 Career Ready</div>
              <p class="eyebrow" style="font-size: 0.95rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #3b82f6; margin-bottom: 0.75rem;">Access Career Ready</p>
              <h2 style="margin: 0.5rem 0; color: #f1f5f9; font-size: 1.8rem;">Sign in or create your account</h2>
              <p class="modal-subtitle" style="margin: 0; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">Use your email to get started and keep your progress synced across devices.</p>
          </div>
          <div class="modal-tabs" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;">
              <button class="tab active" data-form="login" id="tabLogin">Log In</button>
              <button class="tab" data-form="signup" id="tabSignup">Sign Up</button>
          </div>
          <div class="modal-body">
              <form id="loginForm" class="auth-form active" novalidate>
                  <div class="form-group">
                      <label for="loginId">Email address</label>
                      <div class="input-wrapper">
                          <span class="input-icon">✉</span>
                          <input type="email" id="loginId" placeholder="you@example.com" autocomplete="email">
                      </div>
                      <span class="field-error" id="loginIdError"></span>
                  </div>
                  <div class="form-group">
                      <div class="label-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem;">
                          <label for="loginPassword" style="margin: 0;">Password</label>
                          <a href="#" class="forgot-link" id="forgotLink" style="color: #3b82f6; text-decoration: none; font-size: 0.95rem;">Forgot password?</a>
                      </div>
                      <div class="input-wrapper">
                          <span class="input-icon">🔒</span>
                          <input type="password" id="loginPassword" placeholder="Enter your password" autocomplete="current-password">
                          <button type="button" class="toggle-password" data-target="loginPassword">👁</button>
                      </div>
                      <span class="field-error" id="loginPasswordError"></span>
                  </div>
                  <div class="form-extras" style="margin-bottom: 1.1rem;">
                      <label class="remember-label">
                          <input type="checkbox" id="rememberMe" class="remember-check">
                          <span class="check-custom"></span>
                          Remember me for 30 days
                      </label>
                  </div>
                  <button type="submit" class="submit-btn" id="loginSubmitBtn">
                      <span class="btn-text">Sign In</span>
                      <span class="btn-loader hidden">⏳</span>
                  </button>
                  <p class="modal-note">Don't have an account? <a href="#" class="switch-tab-link" data-switch="signup">Create one</a></p>
              </form>

              <form id="signupForm" class="auth-form" novalidate>
                  <div class="form-group">
                      <label for="signupName">Full name</label>
                      <div class="input-wrapper">
                          <span class="input-icon">👤</span>
                          <input type="text" id="signupName" placeholder="Your full name" autocomplete="name">
                      </div>
                      <span class="field-error" id="signupNameError"></span>
                  </div>
                  <div class="form-group">
                      <label for="signupEmail">Email address</label>
                      <div class="input-wrapper">
                          <span class="input-icon">✉</span>
                          <input type="email" id="signupEmail" placeholder="you@example.com" autocomplete="email">
                      </div>
                      <span class="field-error" id="signupEmailError"></span>
                  </div>
                  <div class="form-group">
                      <label for="signupPassword">Create password</label>
                      <div class="input-wrapper">
                          <span class="input-icon">🔒</span>
                          <input type="password" id="signupPassword" placeholder="Min 8 chars, A-Z, 0-9, #" autocomplete="new-password">
                          <button type="button" class="toggle-password" data-target="signupPassword">👁</button>
                      </div>
                      <span class="field-error" id="signupPasswordError"></span>
                      <div class="strength-bar-wrap"><div class="strength-bar" id="strengthBar"></div></div>
                      <div class="strength-label" id="strengthLabel"></div>
                      <div class="password-checklist" id="signupChecklist">
                          <div class="password-checklist__item invalid" data-rule="length"><span class="password-checklist__icon">✕</span><span>At least 8 characters</span></div>
                          <div class="password-checklist__item invalid" data-rule="capital"><span class="password-checklist__icon">✕</span><span>One capital letter</span></div>
                          <div class="password-checklist__item invalid" data-rule="special"><span class="password-checklist__icon">✕</span><span>One special character</span></div>
                          <div class="password-checklist__item invalid" data-rule="number"><span class="password-checklist__icon">✕</span><span>One number</span></div>
                      </div>
                  </div>
                  <div class="form-group">
                      <label for="signupConfirm">Confirm password</label>
                      <div class="input-wrapper">
                          <span class="input-icon">🔒</span>
                          <input type="password" id="signupConfirm" placeholder="Repeat your password" autocomplete="new-password">
                          <button type="button" class="toggle-password" data-target="signupConfirm">👁</button>
                      </div>
                      <span class="field-error" id="signupConfirmError"></span>
                  </div>
                  <div class="form-group terms-group" style="margin-bottom: 0.4rem;">
                      <label class="remember-label">
                          <input type="checkbox" id="agreeTerms" class="remember-check">
                          <span class="check-custom"></span>
                          I agree to the <a href="#" class="terms-link">Terms &amp; Privacy Policy</a>
                      </label>
                      <span class="field-error" id="termsError"></span>
                  </div>
                  <button type="submit" class="submit-btn" id="signupSubmitBtn">
                      <span class="btn-text">Create Account</span>
                      <span class="btn-loader hidden">⏳</span>
                  </button>
                  <p class="modal-note">Already have an account? <a href="#" class="switch-tab-link" data-switch="login">Sign in</a></p>
              </form>
          </div>
          <div class="modal-footer" style="margin-top: 1rem;">
              <span class="login-divider"><span>or continue with</span></span>
              <button class="google-btn" type="button" id="googleSignInBtn">
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                  Continue with Google
              </button>
          </div>
      </div>
    `;
    document.body.appendChild(authModal);
  }
}

// ─── Modal Control & Functional Setup ──────────────────────────────────────────

let modal, modalCard, tabs, authForms;

function openModal(tab = 'login') {
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  switchTab(tab);
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('modal-visible')));
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('modal-visible');
  document.body.classList.remove('modal-open');
  setTimeout(() => modal.classList.add('hidden'), 280);
  clearAllErrors();
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(e => { e.textContent = ''; e.classList.remove('visible'); });
  document.querySelectorAll('.auth-form input').forEach(i => { i.classList.remove('input-valid', 'input-error'); });
}

function switchTab(target) {
  if (!tabs || !authForms) return;
  tabs.forEach(t => {
    const isActive = t.dataset.form === target;
    t.classList.toggle('active', isActive);
  });
  authForms.forEach(f => {
    f.classList.toggle('active', f.id === target + 'Form');
  });
  clearAllErrors();
}

// Strength meter helper
function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
  return score; // 0–6
}

function updateStrengthBar(pw) {
  const bar = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');
  if (!bar || !label) return;
  const score = getPasswordStrength(pw);
  const levels = [
    { label: '', color: 'transparent', width: '0%' },
    { label: 'Very Weak', color: '#ef4444', width: '16%' },
    { label: 'Weak', color: '#f97316', width: '33%' },
    { label: 'Fair', color: '#eab308', width: '50%' },
    { label: 'Good', color: '#22c55e', width: '66%' },
    { label: 'Strong', color: '#3b82f6', width: '83%' },
    { label: 'Very Strong', color: '#8b5cf6', width: '100%' },
  ];
  const level = levels[score] || levels[0];
  bar.style.width = level.width;
  bar.style.background = level.color;
  label.textContent = pw ? level.label : '';
  label.style.color = level.color;
}

function updateChecklist(password) {
  const checklist = document.getElementById('signupChecklist');
  if (!checklist) return;
  const rules = {
    length:  password.length >= 8,
    capital: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number:  /[0-9]/.test(password),
  };
  checklist.querySelectorAll('.password-checklist__item').forEach(item => {
    const rule = item.dataset.rule;
    const isValid = !!rules[rule];
    item.classList.toggle('valid', isValid);
    item.classList.toggle('invalid', !isValid);
    item.querySelector('.password-checklist__icon').textContent = isValid ? '✓' : '✕';
  });
}

function setLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = isLoading;
  if (text) text.classList.toggle('hidden', isLoading);
  if (loader) loader.classList.toggle('hidden', !isLoading);
}

// ─── Initialize System ────────────────────────────────────────────────────────

function initAuthSystem() {
  modal = document.getElementById('authModal');
  modalCard = document.getElementById('modalCard');
  tabs = document.querySelectorAll('.modal-tabs .tab');
  authForms = document.querySelectorAll('.auth-form');

  if (!modal) return;

  // Open modal buttons
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal('login'));
  });

  // Close button
  const closeModalBtn = document.getElementById('closeModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  // Click backdrop
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Escape key
  document.addEventListener('keydown', e => { 
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); 
  });

  // Tab switching
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.form)));

  // Switch-tab links inside forms
  document.querySelectorAll('.switch-tab-link').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); switchTab(link.dataset.switch); });
  });

  // Password Show/Hide
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isHidden = target.type === 'password';
      target.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? '🙈' : '👁';
    });
  });

  // Live password validation
  const signupPassword = document.getElementById('signupPassword');
  if (signupPassword) {
    signupPassword.addEventListener('input', function () {
      updateChecklist(this.value);
      updateStrengthBar(this.value);
      clearFieldError('signupPasswordError');
      if (this.value) setInputState('signupPassword', getPasswordStrength(this.value) >= 3);
    });
  }

  // Live email validation on blur
  const loginId = document.getElementById('loginId');
  if (loginId) {
    loginId.addEventListener('blur', function () {
      if (this.value && !isValidEmail(this.value)) {
        showFieldError('loginIdError', 'Please enter a valid email address.');
        setInputState('loginId', false);
      } else if (this.value) {
        clearFieldError('loginIdError');
        setInputState('loginId', true);
      }
    });
    loginId.addEventListener('input', function () {
      clearFieldError('loginIdError');
      this.classList.remove('input-error', 'input-valid');
    });
  }

  const signupEmail = document.getElementById('signupEmail');
  if (signupEmail) {
    signupEmail.addEventListener('blur', function () {
      if (this.value && !isValidEmail(this.value)) {
        showFieldError('signupEmailError', 'Please enter a valid email address.');
        setInputState('signupEmail', false);
      } else if (this.value) {
        clearFieldError('signupEmailError');
        setInputState('signupEmail', true);
      }
    });
    signupEmail.addEventListener('input', function () {
      clearFieldError('signupEmailError');
      this.classList.remove('input-error', 'input-valid');
    });
  }

  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('input', function () {
      clearFieldError('loginPasswordError');
      this.classList.remove('input-error', 'input-valid');
    });
  }

  const signupName = document.getElementById('signupName');
  if (signupName) {
    signupName.addEventListener('input', function () {
      clearFieldError('signupNameError');
      this.classList.remove('input-error', 'input-valid');
    });
  }

  // Confirm password live check
  const signupConfirm = document.getElementById('signupConfirm');
  if (signupConfirm) {
    signupConfirm.addEventListener('input', function () {
      const pw = document.getElementById('signupPassword').value;
      if (this.value && this.value !== pw) {
        showFieldError('signupConfirmError', 'Passwords do not match.');
        setInputState('signupConfirm', false);
      } else if (this.value) {
        clearFieldError('signupConfirmError');
        setInputState('signupConfirm', true);
      }
    });
  }

  // Forgot password link
  const forgotLink = document.getElementById('forgotLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', e => {
      e.preventDefault();
      const email = document.getElementById('loginId').value.trim();
      if (!email || !isValidEmail(email)) {
        showFieldError('loginIdError', 'Enter your email first, then click "Forgot password?"');
        setInputState('loginId', false);
        return;
      }
      showToast(`Password reset link sent to ${email}`, 'info');
    });
  }

  // ─── Login Form Submit ───
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      const email = document.getElementById('loginId').value.trim();
      const password = document.getElementById('loginPassword').value;
      const remember = document.getElementById('rememberMe').checked;
      let valid = true;

      if (!email) {
        showFieldError('loginIdError', 'Email is required.');
        setInputState('loginId', false);
        valid = false;
      } else if (!isValidEmail(email)) {
        showFieldError('loginIdError', 'Please enter a valid email address.');
        setInputState('loginId', false);
        valid = false;
      }

      if (!password) {
        showFieldError('loginPasswordError', 'Password is required.');
        setInputState('loginPassword', false);
        valid = false;
      }

      if (!valid) return;

      const users = getUsers();
      if (!users[email]) {
        showFieldError('loginIdError', 'No account found with this email. Sign up first.');
        setInputState('loginId', false);
        showToast('Account not found. Please sign up.', 'error');
        return;
      }

      if (users[email].password !== password) {
        showFieldError('loginPasswordError', 'Incorrect password. Try again.');
        setInputState('loginPassword', false);
        showToast('Incorrect password.', 'error');
        return;
      }

      setLoading('loginSubmitBtn', true);
      setTimeout(() => {
        saveSession({ email, name: users[email].name }, remember);
        setLoading('loginSubmitBtn', false);
        closeModal();
        updateNavAuth();
        showToast(`Welcome back, ${users[email].name}! 🎉`, 'success');
        document.getElementById('loginForm').reset();
      }, 1200);
    });
  }

  // ─── Signup Form Submit ───
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;
      const agreed = document.getElementById('agreeTerms').checked;
      let valid = true;

      if (!name || name.length < 2) {
        showFieldError('signupNameError', 'Please enter your full name (min 2 chars).');
        setInputState('signupName', false);
        valid = false;
      }

      if (!email) {
        showFieldError('signupEmailError', 'Email is required.');
        setInputState('signupEmail', false);
        valid = false;
      } else if (!isValidEmail(email)) {
        showFieldError('signupEmailError', 'Please enter a valid email address.');
        setInputState('signupEmail', false);
        valid = false;
      }

      const strength = getPasswordStrength(password);
      if (!password) {
        showFieldError('signupPasswordError', 'Password is required.');
        setInputState('signupPassword', false);
        valid = false;
      } else if (password.length < 8) {
        showFieldError('signupPasswordError', 'Password must be at least 8 characters.');
        setInputState('signupPassword', false);
        valid = false;
      } else if (strength < 3) {
        showFieldError('signupPasswordError', 'Password is too weak. Use letters, numbers, and symbols.');
        setInputState('signupPassword', false);
        valid = false;
      }

      if (password && confirm !== password) {
        showFieldError('signupConfirmError', 'Passwords do not match.');
        setInputState('signupConfirm', false);
        valid = false;
      }

      if (!agreed) {
        const termsError = document.getElementById('termsError');
        if (termsError) {
          termsError.textContent = 'You must agree to the Terms & Privacy Policy.';
          termsError.classList.add('visible');
        }
        valid = false;
      }

      if (!valid) return;

      const users = getUsers();
      if (users[email]) {
        showFieldError('signupEmailError', 'An account with this email already exists.');
        setInputState('signupEmail', false);
        showToast('Email already registered. Please log in.', 'warning');
        return;
      }

      setLoading('signupSubmitBtn', true);
      setTimeout(() => {
        users[email] = { name, email, password, createdAt: new Date().toISOString() };
        saveUsers(users);
        saveSession({ email, name }, false);
        setLoading('signupSubmitBtn', false);
        closeModal();
        updateNavAuth();
        showToast(`Welcome to Career Ready, ${name}! 🚀`, 'success');
        document.getElementById('signupForm').reset();
        updateStrengthBar('');
        updateChecklist('');
      }, 1400);
    });
  }

  // ─── Google Sign-In Simulation ───
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function () {
      const btn = this;
      btn.disabled = true;
      btn.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite">⟳</span> Connecting…`;

      setTimeout(() => {
        const mockGoogleUser = {
          name: 'Demo User',
          email: 'demo@gmail.com',
        };
        const users = getUsers();
        if (!users[mockGoogleUser.email]) {
          users[mockGoogleUser.email] = { ...mockGoogleUser, password: '__google__', createdAt: new Date().toISOString() };
          saveUsers(users);
        }
        saveSession(mockGoogleUser, true);
        btn.disabled = false;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg> Continue with Google`;
        closeModal();
        updateNavAuth();
        showToast(`Signed in with Google as ${mockGoogleUser.name} 🎉`, 'success');
      }, 1800);
    });
  }

  // ─── Logout ───
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      clearSession();
      updateNavAuth();
      showToast('You have been signed out.', 'info');
    });
  }
}

// ─── Initial Execution ────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  injectAuthModalIfNeeded();
  initAuthSystem();
  updateNavAuth();
});
