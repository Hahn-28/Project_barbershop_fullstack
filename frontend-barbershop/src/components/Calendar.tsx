"use client";
import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, EventInput } from '@fullcalendar/core';

interface CalendarProps {
  readonly onDateSelect: (date: string) => void;
  readonly selectedDate?: string;
  readonly bookings?: EventInput[];
}

export function Calendar({ onDateSelect, selectedDate, bookings = [] }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleDateClick = (arg: DateClickArg) => {
    const clickedDate = arg.dateStr;
    onDateSelect(clickedDate);
  };

  const handleEventClick = (arg: EventClickArg) => {
    console.log('Event clicked:', arg.event);
  };

  // Eventos de ejemplo (puedes pasarlos como prop)
  const events: EventInput[] = [
    ...bookings,
    // Ejemplo: marcar las fechas ocupadas
  ];

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="es"
        firstDay={1}
        height="auto"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        validRange={{
          start: new Date().toISOString().split('T')[0]
        }}
        dayCellClassNames={(arg) => {
          const dateStr = arg.date.toISOString().split('T')[0];
          if (dateStr === selectedDate) {
            return ['selected-date'];
          }
          return [];
        }}
      />
    </div>
  );
}
