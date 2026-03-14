type CompactDatePickerWeekdayProps = {
    day: string;
};

export default function CompactDatePickerWeekday({ day }: CompactDatePickerWeekdayProps) {
    return <span>{day}</span>;
}
