//src/utils/dateUtils.ts

/**
 * Format a date string to a localized format
 * @param dateString ISO date string
 * @param format Format options: 'short', 'medium', 'long', 'full'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    let formatOptions: Intl.DateTimeFormatOptions;
    
    switch (format) {
      case 'short':
        formatOptions = { month: 'numeric', day: 'numeric', year: '2-digit' };
        break;
      case 'medium':
        formatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        break;
      case 'long':
        formatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        break;
      case 'full':
        formatOptions = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        };
        break;
      default:
        formatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    }
    
    return date.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'Unknown date';
  }
}