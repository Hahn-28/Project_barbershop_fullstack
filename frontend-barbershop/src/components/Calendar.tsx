"use client";
import { useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateSelectArg } from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';

interface CalendarProps {
  readonly onSlotSelect: (date: string, time: string) => void;
  readonly selectedDate?: string;
  readonly selectedTime?: string;
  readonly bookings?: EventInput[];
}

export function Calendar({ onSlotSelect, selectedDate, selectedTime, bookings = [] }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const selectedSlotEvent = useMemo(() => {
    if (!selectedDate || !selectedTime) return [] as EventInput[];
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const endHour = Math.min(hours + 1, 23);
    const paddedStart = `${selectedDate}T${selectedTime}:00`;
    const paddedEnd = `${selectedDate}T${String(endHour).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}:00`;
    return [{
      id: "selected-slot",
      start: paddedStart,
      end: paddedEnd,
      display: "background",
      backgroundColor: "rgba(212, 175, 55, 0.25)",
      borderColor: "rgba(212, 175, 55, 0.6)",
      classNames: ["selected-slot"],
    }];
  }, [selectedDate, selectedTime]);

  const events: EventInput[] = useMemo(
    () => [...bookings, ...selectedSlotEvent],
    [bookings, selectedSlotEvent]
  );

  const handleSelect = (selection: DateSelectArg) => {
    const datePart = selection.startStr.split("T")[0];
    const timePart = selection.start.toTimeString().slice(0, 5);
    onSlotSelect(datePart, timePart);
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        locale="es"
        firstDay={1}
        height="auto"
        slotMinTime="09:00:00"
        slotMaxTime="18:00:00"
        slotDuration="01:00:00"
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={false}
        nowIndicator={true}
        events={events}
        select={handleSelect}
        validRange={{
          start: new Date().toISOString().split('T')[0]
        }}
        businessHours={{
          startTime: '09:00',
          endTime: '18:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        }}
        selectAllow={(range) => {
          const duration = range.end.getTime() - range.start.getTime();
          return duration === 60 * 60 * 1000;
        }}
      />
    </div>
  );
}
