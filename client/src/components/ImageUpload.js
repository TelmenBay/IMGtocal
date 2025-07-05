import React, { useState } from 'react';
import UploadArea from './UploadArea';
import EventBox from './EventBox';
import { createWorker } from 'tesseract.js';

function ImageUpload({ session, onSignOut }) {
  const [events, setEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Only process image files
  const processImage = async (file) => {
    const worker = await createWorker();
    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      // Create an image element to ensure the image is valid
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      const { data: { text } } = await worker.recognize(img);
      URL.revokeObjectURL(imageUrl); // Clean up
      return text;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image file');
    } finally {
      await worker.terminate();
    }
  };

  const parseTextWithAI = async (text) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an event extraction assistant. Extract all events from the provided text.
              For each event, identify:
              - name: The title or name of the event
              - description: Any additional details about the event
              - start: The start date and time (in ISO format)
              - end: The end date and time (in ISO format)
              Return a JSON array of events, where each event is an object with these fields.
              If a field cannot be determined, use null.
              If there are multiple events, create separate objects for each one.
              Example format:
              [{"name": "Team Meeting","description": "Weekly sync","start": "2024-03-20T10:00:00Z","end": "2024-03-20T11:00:00Z"},
              {"name": "Project Review","description": "Q1 review","start": "2024-03-21T14:00:00Z","end": "2024-03-21T15:30:00Z"}]`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API');
      }

      const content = data.choices[0].message.content;
      let parsedEvents;
      try {
        parsedEvents = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse event information from AI response');
      }

      // Ensure we always return an array
      return Array.isArray(parsedEvents) ? parsedEvents : [parsedEvents];
    } catch (error) {
      console.error('Error parsing text with AI:', error);
      throw new Error(`Failed to parse event information: ${error.message}`);
    }
  };

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setError(null);
    try {
      // Only allow image files
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported.');
      }
      const text = await processImage(file);
      if (!text) {
        throw new Error('No text could be extracted from the image');
      }
      const parsedEvents = await parseTextWithAI(text);
      setEvents(parsedEvents.map((event, index) => ({
        id: index,
        name: event.name || '',
        description: event.description || '',
        start: event.start ? new Date(event.start) : new Date(),
        end: event.end ? new Date(event.end) : new Date()
      })));
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handlePushToCalendar = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  return (
    <div style={{ width: '600px', margin: '30px auto' }}>
      <h2>Upload Event Image</h2>
      <UploadArea onFileUpload={handleFileUpload} />
      
      {isProcessing && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          Processing file... Please wait.
        </div>
      )}

      {error && (
        <div style={{ color: 'red', margin: '20px 0' }}>
          Error: {error}
        </div>
      )}

      {events.length > 0 && (
        <div>
          <h3>Detected Events</h3>
          {events.map(event => (
            <EventBox
              key={event.id}
              event={event}
              onUpdate={handleEventUpdate}
              onPushToCalendar={handlePushToCalendar}
              session={session}
            />
          ))}
        </div>
      )}

      <button
        onClick={onSignOut}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default ImageUpload; 