/**
 * Check if a date is Monday, Wednesday, or Friday
 */
export const isAllowedDay = (date: Date): boolean => {
  const day = date.getDay();
  return day === 1 || day === 3 || day === 5; // Monday=1, Wednesday=3, Friday=5
};

/**
 * Get the next available appointment date (next Monday, Wednesday, or Friday)
 */
export const getNextAvailableDate = (fromDate: Date = new Date()): Date => {
  const date = new Date(fromDate);
  date.setHours(0, 0, 0, 0);
  
  // Start checking from tomorrow
  date.setDate(date.getDate() + 1);
  
  while (!isAllowedDay(date)) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
};

/**
 * Format date in Romanian format (DD.MM.YYYY)
 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Format date for input type="date" (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get day name in Romanian
 */
export const getDayName = (date: Date): string => {
  const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
  return days[date.getDay()];
};

/**
 * Get month name in Romanian
 */
export const getMonthName = (date: Date): string => {
  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  return months[date.getMonth()];
};
