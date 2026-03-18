export type AppointmentWizardTab = 1 | 2 | 3 | 4;

export const WIZARD_TAB_LABELS = [
    'Alege data',
    'Alege interval',
    'Date personale',
    'Confirmare',
] as const;

export const PHONE_NUMBER_PATTERN = /^\+373\d{8}$/;
