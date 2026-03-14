type AppointmentCalendarWeekdayProps = {
    label: string;
};

export default function AppointmentCalendarWeekday({ label }: AppointmentCalendarWeekdayProps) {
    return <span>{label}</span>;
}
