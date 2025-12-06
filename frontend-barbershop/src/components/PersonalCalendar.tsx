"use client";
import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventInput } from '@fullcalendar/core';

interface PersonalCalendarProps {
  readonly bookings: EventInput[];
  readonly title?: string;
}

export function PersonalCalendar({ bookings, title = "Mi Calendario" }: PersonalCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <div className="personal-calendar-container bg-gray-dark border border-gray-light/20 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-4 pb-2 border-b border-gold/30">
        {title}
      </h3>
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin]}
          initialView="timeGridWeek"
          timeZone="local"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek'
          }}
          locale="es"
          firstDay={1}
          height="auto"
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
          slotDuration="01:00:00"
          allDaySlot={false}
          dayMaxEvents={true}
          nowIndicator={true}
          events={bookings}
          eventDisplay="block"
          displayEventTime={true}
          displayEventEnd={false}
          eventClassNames={(arg) => {
            const status = arg.event.extendedProps?.status;
            if (status === 'CONFIRMED') return ['event-confirmed'];
            if (status === 'PENDING') return ['event-pending'];
            if (status === 'CANCELLED') return ['event-cancelled'];
            return [];
          }}
          eventContent={(arg) => {
            const status = arg.event.extendedProps?.status;
            const serviceName = arg.event.title;
            const clientName = arg.event.extendedProps?.clientName;
            const workerName = arg.event.extendedProps?.workerName;
            
            return (
              <div className="p-1 text-xs leading-tight">
                <div className="font-semibold truncate">{serviceName}</div>
                {clientName && <div className="truncate opacity-90">Cliente: {clientName}</div>}
                {workerName && <div className="truncate opacity-90">Barbero: {workerName}</div>}
                <div className="text-[10px] mt-1 opacity-75">
                  {status === 'CONFIRMED' && '✓ Confirmada'}
                  {status === 'PENDING' && '⏳ Pendiente'}
                  {status === 'CANCELLED' && '✗ Cancelada'}
                </div>
              </div>
            );
          }}
          businessHours={{
            startTime: '09:00',
            endTime: '18:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          }}
        />
      </div>
      <style jsx global>{`
        .personal-calendar-container .fc {
          font-family: inherit;
        }
        .personal-calendar-container .fc-theme-standard td,
        .personal-calendar-container .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .personal-calendar-container .fc-scrollgrid {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .personal-calendar-container .fc-col-header-cell {
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          font-weight: 600;
          padding: 8px 4px;
        }
        .personal-calendar-container .fc-timegrid-slot {
          height: 3em;
        }
        .personal-calendar-container .fc-timegrid-slot-label {
          color: #9CA3AF;
          font-size: 0.75rem;
        }
        .personal-calendar-container .fc-daygrid-day-number {
          color: #D4AF37;
          font-weight: 600;
        }
        .personal-calendar-container .fc-day-today {
          background-color: rgba(212, 175, 55, 0.05) !important;
        }
        .personal-calendar-container .fc-button {
          background-color: #D4AF37;
          border-color: #D4AF37;
          color: #1a1a1a;
          text-transform: capitalize;
          font-weight: 600;
        }
        .personal-calendar-container .fc-button:hover {
          background-color: #C4A137;
          border-color: #C4A137;
        }
        .personal-calendar-container .fc-button-active {
          background-color: #B49127 !important;
          border-color: #B49127 !important;
        }
        .personal-calendar-container .fc-toolbar-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .personal-calendar-container .event-confirmed {
          background-color: rgba(34, 197, 94, 0.9);
          border-color: rgb(34, 197, 94);
          color: white;
        }
        .personal-calendar-container .event-pending {
          background-color: rgba(212, 175, 55, 0.9);
          border-color: #D4AF37;
          color: #1a1a1a;
        }
        .personal-calendar-container .event-cancelled {
          background-color: rgba(239, 68, 68, 0.7);
          border-color: rgb(239, 68, 68);
          color: white;
          text-decoration: line-through;
        }
        .personal-calendar-container .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px;
        }
        .personal-calendar-container .fc-event:hover {
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
}
