import React, { useState } from 'react';
import UploadArea from './UploadArea';
import EventBox from './EventBox';
import { createWorker } from 'tesseract.js';

function ImageUpload({ session, onSignIn, onSignOut }) {
  const [events, setEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [showEventParsing, setShowEventParsing] = useState(false);

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
    setExtractedText('');
    setEvents([]);
    setShowEventParsing(false);
    try {
      // Only allow image files
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported.');
      }
      const text = await processImage(file);
      if (!text) {
        throw new Error('No text could be extracted from the image');
      }
      setExtractedText(text);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseEvents = async () => {
    if (!extractedText) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const parsedEvents = await parseTextWithAI(extractedText);
      setEvents(parsedEvents.map((event, index) => ({
        id: index,
        name: event.name || '',
        description: event.description || '',
        start: event.start ? new Date(event.start) : new Date(),
        end: event.end ? new Date(event.end) : new Date()
      })));
      setShowEventParsing(true);
    } catch (error) {
      console.error('Error parsing events:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
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
    <div>
      <UploadArea onFileUpload={handleFileUpload} />
      
      {isProcessing && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#242424',
          border: '1px solid #3a3a3a',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <div style={{
            fontSize: '15px',
            color: '#a0a0a0',
            marginBottom: '12px'
          }}>
            Processing image...
          </div>
          <div style={{
            fontSize: '13px',
            color: '#707070'
          }}>
            Extracting text and analyzing events
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(255, 82, 82, 0.1)',
          border: '1px solid #ff5252',
          borderRadius: '4px',
          padding: '16px',
          marginTop: '20px',
          color: '#ff5252',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {extractedText && (
        <div style={{
          background: '#242424',
          border: '1px solid #3a3a3a',
          borderRadius: '4px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff'
            }}>
              Extracted Text
            </h3>
            <button
              onClick={copyToClipboard}
              style={{
                background: showCopied ? '#4CAF50' : 'transparent',
                color: showCopied ? '#1a1a1a' : '#ffffff',
                padding: '8px 16px',
                border: showCopied ? 'none' : '1px solid #404040',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Jost, sans-serif',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px'
              }}
            >
              {showCopied ? '✓ Copied!' : 'Copy Text'}
            </button>
          </div>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #2d2d2d',
            borderRadius: '4px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#d0d0d0',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {extractedText}
          </div>
          
          {!showEventParsing && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#1a1a1a',
              border: '1px solid #2d2d2d',
              borderRadius: '4px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#a0a0a0',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                Want to convert this to calendar events?
              </p>
              <button
                onClick={handleParseEvents}
                style={{
                  background: '#ffffff',
                  color: '#1a1a1a',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.background = '#ffffff'}
              >
                Parse Events with AI
              </button>
            </div>
          )}
        </div>
      )}

      {events.length > 0 && showEventParsing && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            Detected Events
          </h3>
          {session ? (
            <>
              {events.map(event => (
                <EventBox
                  key={event.id}
                  event={event}
                  onUpdate={handleEventUpdate}
                  onPushToCalendar={handlePushToCalendar}
                  session={session}
                />
              ))}
            </>
          ) : (
            <>
              <div style={{
                background: '#242424',
                border: '1px solid #3a3a3a',
                borderRadius: '4px',
                padding: '24px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '12px'
                }}>
                  Sign in to push events to your calendar
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#a0a0a0',
                  marginBottom: '20px'
                }}>
                  We found {events.length} event{events.length !== 1 ? 's' : ''} in your image. Sign in to add them to Google Calendar.
                </p>
                <button
                  onClick={onSignIn}
                  className="btn-primary"
                  style={{ maxWidth: '300px', margin: '0 auto' }}
                >
                  Sign in with Google
                </button>
              </div>
              
              {/* Show events in read-only mode */}
              {events.map(event => (
                <div key={event.id} style={{
                  background: '#242424',
                  border: '1px solid #3a3a3a',
                  borderRadius: '4px',
                  padding: '20px',
                  marginBottom: '12px',
                  opacity: 0.7
                }}>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {event.name || 'Untitled Event'}
                  </h4>
                  {event.description && (
                    <p style={{
                      fontSize: '13px',
                      color: '#a0a0a0',
                      marginBottom: '8px'
                    }}>
                      {event.description}
                    </p>
                  )}
                  <p style={{
                    fontSize: '13px',
                    color: '#707070'
                  }}>
                    {event.start.toLocaleString()} - {event.end.toLocaleString()}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {(session || extractedText) && (
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #3a3a3a',
          textAlign: 'center'
        }}>
          {session ? (
            <button
              onClick={onSignOut}
              className="btn-danger"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="btn-secondary"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload; 