import Calendar from "react-calendar";

export type ValuePiece = Date | null;
export type Value = ValuePiece | [ValuePiece, ValuePiece];
import "@/styles/components/BasicCalendar.css";

export default function BasicCalendar({
  value,
  onChange,
  events,
}: {
  value: Value;
  onChange: (value: Value) => void;
  events?: Date[];
}) {
  return (
    <div>
      <Calendar
        onChange={onChange}
        value={value}
        tileContent={({ date }) => {
          if (events) {
            const isEvent = events.some((event) =>
              isSameYearMonthDay(event, date)
            );
            return isEvent ? <div className="event" /> : null;
          }
          return null;
        }}
      />
    </div>
  );
}

function isSameYearMonthDay(date1: Date, date2: Date): boolean {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
