import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';

function EventBox({ event, onUpdate, onPushToCalendar, session }) {
  const [start, setStart] = useState(event.start || new Date());
  const [end, setEnd] = useState(event.end || new Date());
  const [eventName, setEventName] = useState(event.name || '');
  const [eventDescription, setEventDescription] = useState(event.description || '');

  const handleUpdate = () => {
    onUpdate({
      ...event,
      name: eventName,
      description: eventDescription,
      start,
      end
    });
  };

  const handlePushToCalendar = async () => {
    if (!eventName) {
      alert("Please enter an event name");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    const calendarEvent = {
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': end.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + session.provider_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEvent)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert("Authentication error. Please sign out and sign in again.");
          return;
        }
        throw new Error(data.error?.message || 'Failed to create event');
      }

      if (data.id) {
        console.log('Event created successfully:', data);
        alert(`Event "${eventName}" created successfully! You can find it in your Google Calendar.`);
        window.open(data.htmlLink, '_blank');
        onPushToCalendar(event.id);
      } else {
        throw new Error('Event creation response did not include an event ID');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    }
  };

  return (
    <div style={{
      border: '1px solid #3a3a3a',
      borderRadius: '4px',
      padding: '24px',
      marginBottom: '16px',
      backgroundColor: '#242424'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: '500',
          color: '#a0a0a0',
          letterSpacing: '0.3px'
        }}>
          Event Name
        </label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a1a',
            border: '1px solid #2d2d2d',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontFamily: 'Jost, sans-serif',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#505050'}
          onBlur={(e) => { handleUpdate(); e.target.style.borderColor = '#2d2d2d'; }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: '500',
          color: '#a0a0a0',
          letterSpacing: '0.3px'
        }}>
          Description
        </label>
        <input
          type="text"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a1a',
            border: '1px solid #2d2d2d',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontFamily: 'Jost, sans-serif',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#505050'}
          onBlur={(e) => { handleUpdate(); e.target.style.borderColor = '#2d2d2d'; }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#a0a0a0',
            letterSpacing: '0.3px'
          }}>
            Start Time
          </label>
          <DateTimePicker
            onChange={setStart}
            value={start}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#a0a0a0',
            letterSpacing: '0.3px'
          }}>
            End Time
          </label>
          <DateTimePicker
            onChange={setEnd}
            value={end}
          />
        </div>
      </div>

      <button
        onClick={handlePushToCalendar}
        style={{
          background: '#ffffff',
          color: '#1a1a1a',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: 'Jost, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          letterSpacing: '0.3px',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f0f0f0';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#ffffff';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Push to Calendar
      </button>
    </div>
  );
}

export default EventBox; 