export const WEEKDAY_OPTIONS: { value: number; label: string }[] = [
    { value: 1, label: "Luni" }, { value: 2, label: "Marți" }, { value: 3, label: "Miercuri" },
    { value: 4, label: "Joi" }, { value: 5, label: "Vineri" }, { value: 6, label: "Sâmbătă" }, { value: 0, label: "Duminică" },
];

export const formatAllowedWeekdayNames = (allowedWeekdays: number[]): string =>
    allowedWeekdays
        .map((d) => WEEKDAY_OPTIONS.find((o) => o.value === d)?.label ?? '')
        .filter(Boolean)
        .join(', ');

/**
 * Check if a date falls on one of the allowed weekdays (default: Mon/Wed/Fri)
 */
export const isAllowedDay = (date: Date, allowedWeekdays: number[] = [1, 3, 5]): boolean =>
    allowedWeekdays.includes(date.getDay());

/**
 * Get the next available appointment date based on allowed weekdays
 */
export const getNextAvailableDate = (fromDate: Date = new Date(), allowedWeekdays: number[] = [1, 3, 5]): Date => {
  const date = new Date(fromDate);
  date.setHours(0, 0, 0, 0);

  // Start checking from tomorrow
  date.setDate(date.getDate() + 1);

  while (!isAllowedDay(date, allowedWeekdays)) {
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

/**
 * Format a Date as a short DD.MM Romanian date: "14.03"
 */
export const formatDayMonth = (date: Date): string =>
    date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" });

/**
 * Format an ISO date string as a long Romanian date: "14 martie 2026"
 */
export const formatDateLong = (value: string): string =>
    new Date(value).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" });

/**
 * Format an ISO date string as a short Romanian date: "14 mar. 2026"
 */
export const formatDateShort = (value: string): string => {
  return new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format an ISO date string as a long Romanian date+time: "14 martie 2026, 10:30"
 */
export const formatDateTimeLong = (value: string): string => {
  return new Date(value).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
