import logo from './logo.svg';
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';


function App() {
  const [ start, setStart] = useState(new Date());
  const [ end, setEnd] = useState(new Date());
  const [ eventName, setEventName] = useState("");
  const [ eventDescription, setEventDescription] = useState("");


  const session = useSession(); // tokens, when session exists then we have a user
  const supabase = useSupabaseClient(); // talk to supabase
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <div></div>;
  }

  async function googleSignIn() {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("error signing in");
      console.log(error);
    }
  };
  

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createEvent() {
    
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
    }
      await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + session.provider_token // google token
        },
        body: JSON.stringify(event)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data);
        alert("Event created successfully");
      })
      
    
  }

  console.log(session);
  console.log(start);

  return (
    <div className="App">
      <div style={{ width: '400px', margin: '30px auto'}}>
        {session ? 
          <>
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
            <button onClick={() => createEvent()}>Create Event</button>
            <br/><br/>
            <button onClick={() => signOut()}>Sign Out</button>
          </>
          :
          <>
            <button onClick={() => googleSignIn()}>Sign in with Google</button>
          </>
        }
      </div>
    </div>
  );
}

export default App;
