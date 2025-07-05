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
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '15px',
      margin: '10px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <label>Event Name:</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          onBlur={handleUpdate}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Description:</label>
        <input
          type="text"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          onBlur={handleUpdate}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Start Time:</label>
        <DateTimePicker
          onChange={setStart}
          value={start}
          onBlur={handleUpdate}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>End Time:</label>
        <DateTimePicker
          onChange={setEnd}
          value={end}
          onBlur={handleUpdate}
        />
      </div>

      <button
        onClick={handlePushToCalendar}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Push to Calendar
      </button>
    </div>
  );
}

export default EventBox; 