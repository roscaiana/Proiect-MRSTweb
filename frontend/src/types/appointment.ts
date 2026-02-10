export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentFormData {
  fullName: string;
  idOrPhone: string;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
}

export interface FormErrors {
  fullName?: string;
  idOrPhone?: string;
  date?: string;
  slot?: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  {
    id: 'slot1',
    startTime: '12:00',
    endTime: '12:30',
    available: true
  },
  {
    id: 'slot2',
    startTime: '13:00',
    endTime: '13:30',
    available: true
  },
  {
    id: 'slot3',
    startTime: '15:00',
    endTime: '15:30',
    available: true
  }
];
