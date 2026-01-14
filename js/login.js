document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const CORRECT_PASSWORD = 'sdx2026';

    // Focus input on load
    passwordInput.focus();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = passwordInput.value;

        if (password === CORRECT_PASSWORD) {
            // Success
            sessionStorage.setItem('sin_authenticated', 'true');

            // Subtle success animation or direct redirect?
            // Let's redirect immediately but maybe change button state
            const btn = loginForm.querySelector('button');
            btn.textContent = 'Acessando...';
            btn.style.backgroundColor = 'var(--color-success)';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        } else {
            // Error
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
