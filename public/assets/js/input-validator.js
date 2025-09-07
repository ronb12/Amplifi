
// Input Validation Middleware
class InputValidator {
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        if (email.length > 254) {
            throw new Error('Email too long');
        }
        return email.toLowerCase().trim();
    }
    
    static validatePassword(password) {
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        if (password.length > 128) {
            throw new Error('Password too long');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error('Password must contain uppercase, lowercase, and number');
        }
        return password;
    }
    
    static validateUsername(username) {
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
            throw new Error('Username must be 3-20 characters, letters, numbers, underscore, or dash only');
        }
        return username.toLowerCase().trim();
    }
    
    static validateTitle(title) {
        const sanitized = SecurityUtils.validateInput(title, 'text', 100);
        if (sanitized.length < 3) {
            throw new Error('Title must be at least 3 characters');
        }
        return sanitized;
    }
    
    static validateDescription(description) {
        return SecurityUtils.validateInput(description, 'text', 500);
    }
    
    static validateAmount(amount) {
        const num = parseFloat(amount);
        if (isNaN(num) || num < 0.50 || num > 1000) {
            throw new Error('Amount must be between $0.50 and $1000.00');
        }
        return Math.round(num * 100) / 100; // Round to 2 decimal places
    }
}

window.InputValidator = InputValidator;
