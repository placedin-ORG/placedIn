// utils/helpers.js

/**
 * Formats a date string into a more readable format
 * @param {string} dateString - The date string to format
 * @param {object} options - Formatting options for Intl.DateTimeFormat
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return "Not specified";
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...options
      };
      
      return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };
  
  /**
   * Checks if a date is in the past
   * @param {string} dateString - The date string to check
   * @returns {boolean} True if the date is in the past
   */
  export const isDatePassed = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      return date < now;
    } catch (error) {
      console.error("Error checking date:", error);
      return false;
    }
  };
  
  /**
   * Truncates text to a specified length and adds ellipsis
   * @param {string} text - The text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  /**
   * Formats a number with commas for better readability
   * @param {number} number - The number to format
   * @returns {string} Formatted number
   */
  export const formatNumber = (number) => {
    if (number === undefined || number === null) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };