"use client";
import { useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, DateSelectArg } from '@fullcalendar/core';
import { toast } from '@/components/ui/sonner';

interface CalendarProps {
  readonly onSlotSelect: (date: string, time: string) => void;
  readonly selectedDate?: string;
  readonly selectedTime?: string;
  readonly bookings?: EventInput[];
  readonly workerId?: number;
  readonly clientId?: number;
}

export function Calendar({ onSlotSelect, selectedDate, selectedTime, bookings = [], workerId, clientId }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Función para verificar si un slot está ocupado
  const isSlotOccupied = (date: string, time: string): { occupied: boolean; reason?: string } => {
    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(`${date}T${time}:00`);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hours + 1, minutes || 0, 0, 0);

    for (const booking of bookings) {
      if (!booking.start) continue;
      
      const bookingStart = new Date(booking.start as string);
      const bookingEnd = booking.end ? new Date(booking.end as string) : new Date(bookingStart.getTime() + 60 * 60 * 1000);
      
      // Verificar si hay superposición
      if (slotStart < bookingEnd && slotEnd > bookingStart) {
        return { 
          occupied: true, 
          reason: `Este horario no está disponible`
        };
      }
    }
    
    return { occupied: false };
  };

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
      backgroundColor: "rgba(212, 175, 55, 0.3)",
      borderColor: "rgba(212, 175, 55, 0.8)",
      classNames: ["selected-slot"],
    }];
  }, [selectedDate, selectedTime]);

  const events: EventInput[] = useMemo(
    () => [...bookings, ...selectedSlotEvent],
    [bookings, selectedSlotEvent]
  );

  const handleSelect = (selection: DateSelectArg) => {
    // Extraer fecha y hora del objeto Date local sin conversión de zona horaria
    const year = selection.start.getFullYear();
    const month = String(selection.start.getMonth() + 1).padStart(2, '0');
    const day = String(selection.start.getDate()).padStart(2, '0');
    const hours = String(selection.start.getHours()).padStart(2, '0');
    const minutes = String(selection.start.getMinutes()).padStart(2, '0');
    
    const datePart = `${year}-${month}-${day}`;
    const timePart = `${hours}:${minutes}`;
    
    console.log("Calendar handleSelect:", { 
      startStr: selection.startStr, 
      datePart, 
      timePart,
      localDate: selection.start,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Verificar si el slot está ocupado
    const { occupied, reason } = isSlotOccupied(datePart, timePart);
    
    if (occupied) {
      toast.error(reason || "Este horario no está disponible");
      return;
    }
    
    toast.success("Horario seleccionado correctamente");
    onSlotSelect(datePart, timePart);
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
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
          if (duration !== 60 * 60 * 1000) return false;
          
          // Verificar si el slot está ocupado
          const year = range.start.getFullYear();
          const month = String(range.start.getMonth() + 1).padStart(2, '0');
          const day = String(range.start.getDate()).padStart(2, '0');
          const hours = String(range.start.getHours()).padStart(2, '0');
          const minutes = String(range.start.getMinutes()).padStart(2, '0');
          
          const datePart = `${year}-${month}-${day}`;
          const timePart = `${hours}:${minutes}`;
          
          const { occupied } = isSlotOccupied(datePart, timePart);
          return !occupied; // Solo permitir si NO está ocupado
        }}
        eventClassNames={(arg) => {
          if (arg.event.id === 'selected-slot') return [];
          return ['event-occupied'];
        }}
        eventContent={(arg) => {
          if (arg.event.id === 'selected-slot') return null;
          
          const type = arg.event.extendedProps?.type;
          let label = 'Ocupado';
          
          if (type === 'client') label = 'Ocupado (Cliente)';
          else if (type === 'worker') label = 'Ocupado (Trabajador)';
          else if (type === 'both') label = 'Ocupado (Ambos)';
          
          return (
            <div className="p-1 text-xs leading-tight">
              <div className="font-semibold truncate text-white">{label}</div>
            </div>
          );
        }}
      />
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{background: 'rgba(34, 197, 94, 0.6)'}}></div>
          <span className="text-gray-300">Mi Selección (Disponible)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{background: 'rgba(212, 175, 55, 0.8)'}}></div>
          <span className="text-gray-300">Ocupado (Cliente)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{background: 'rgba(107, 114, 128, 0.8)'}}></div>
          <span className="text-gray-300">Ocupado (Trabajador)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{background: 'rgba(239, 68, 68, 0.8)'}}></div>
          <span className="text-gray-300">Ocupado (Ambos)</span>
        </div>
      </div>
      <style jsx global>{`
        .calendar-container {
          background: rgba(26, 26, 26, 0.6);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        .calendar-container .fc {
          font-family: inherit;
        }
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .calendar-container .fc-scrollgrid {
          border-color: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-container .fc-col-header-cell {
          background: rgba(212, 175, 55, 0.15);
          color: #D4AF37;
          font-weight: 700;
          padding: 12px 4px;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }
        .calendar-container .fc-timegrid-slot {
          height: 3.5em;
        }
        .calendar-container .fc-timegrid-slot-label {
          color: #9CA3AF;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .calendar-container .fc-day-today {
          background-color: rgba(212, 175, 55, 0.08) !important;
        }
        .calendar-container .fc-button {
          background-color: #D4AF37;
          border-color: #D4AF37;
          color: #1a1a1a;
          text-transform: capitalize;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .calendar-container .fc-button:hover {
          background-color: #C4A137;
          border-color: #C4A137;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        .calendar-container .fc-button-active {
          background-color: #B49127 !important;
          border-color: #B49127 !important;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .calendar-container .fc-toolbar-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 800;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .calendar-container .fc-timegrid-slot-lane:hover {
          background-color: rgba(212, 175, 55, 0.05);
        }
        .calendar-container .event-confirmed {
          background-color: rgba(34, 197, 94, 0.9);
          border-left: 4px solid rgb(34, 197, 94);
          color: white;
        }
        .calendar-container .event-pending {
          background-color: rgba(212, 175, 55, 0.9);
          border-left: 4px solid #D4AF37;
          color: #1a1a1a;
        }
        .calendar-container .event-cancelled {
          background-color: rgba(239, 68, 68, 0.7);
          border-left: 4px solid rgb(239, 68, 68);
          color: white;
          opacity: 0.6;
        }
        .calendar-container .event-occupied {
          background-color: rgba(107, 114, 128, 0.8);
          border-left: 4px solid rgb(107, 114, 128);
          color: white;
        }
        .calendar-container .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
          margin: 1px 2px;
          transition: all 0.2s;
        }
        .calendar-container .fc-event:hover {
          filter: brightness(1.15);
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .calendar-container .selected-slot {
          background-color: rgba(34, 197, 94, 0.3) !important;
          border: 2px solid rgba(34, 197, 94, 0.9) !important;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .calendar-container .fc-highlight {
          background-color: rgba(212, 175, 55, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
