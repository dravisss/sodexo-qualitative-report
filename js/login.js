document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const PASSWORDS = {
        sdx2026: 'user',
        admin123: 'admin'
    };

    passwordInput.focus();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = passwordInput.value;
        const role = PASSWORDS[password];

        if (role) {
            sessionStorage.setItem('sin_authenticated', 'true');
            sessionStorage.setItem('sin_role', role);

            const btn = loginForm.querySelector('button');
            btn.textContent = 'Acessando...';
            btn.style.backgroundColor = 'var(--color-success)';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        } else {
            showError();
        }
    });

    passwordInput.addEventListener('input', () => {
        // Clear error when user types
        if (passwordInput.classList.contains('error')) {
            passwordInput.classList.remove('error');
            errorMessage.classList.remove('visible');
        }
    });

    function showError() {
        passwordInput.classList.add('error');
        errorMessage.classList.add('visible');
        passwordInput.value = '';
        passwordInput.focus();

        // Remove shake class after animation so it can be re-triggered
        setTimeout(() => {
            passwordInput.classList.remove('error');
        }, 500);
    }
});
