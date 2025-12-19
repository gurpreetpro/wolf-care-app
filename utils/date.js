/**
 * Date Utility
 * Validates dates and calculates age
 */

/**
 * Calculates age from Date of Birth (YYYY-MM-DD)
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number|string} - Age in years or empty string if invalid
 */
export const calculateAge = (dob) => {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) return '';
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

/**
 * Validates if the string is a valid date (YYYY-MM-DD)
 * And ensures it's a reasonable birth date (not future, not < 1900)
 * @param {string} dateString 
 * @returns {boolean}
 */
export const isValidDate = (dateString) => {
    // Regex for YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    // Check reasonable year range
    if (year < 1900 || year > currentYear) return false;

    // Check future date
    if (date > new Date()) return false;

    return true;
};
