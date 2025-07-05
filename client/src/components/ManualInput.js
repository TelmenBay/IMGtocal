import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

function ManualInput({ session, supabase, onSignOut }) {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  async function createEvent() {
    if (!eventName) {
      alert("Please enter an event name");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    const event = {
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
        body: JSON.stringify(event)
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
      } else {
        throw new Error('Event creation response did not include an event ID');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    }
  }

  return (
    <div style={{ width: '400px', margin: '30px auto'}}>
      <h2>Hello {session.user.email}</h2>
      <p>Start of your event</p>
      <DateTimePicker onChange={setStart} value={start}/>
      <p>End of your event</p>
      <DateTimePicker onChange={setEnd} value={end}/>
      <p>Name of your event</p>
      <input type='text' onChange={(e) => setEventName(e.target.value)}/>
      <p>Description of your event</p>
      <input type='text' onChange={(e) => setEventDescription(e.target.value)}/>
      <hr/>
      <button onClick={createEvent}>Create Event</button>
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  );
}

export default ManualInput; 