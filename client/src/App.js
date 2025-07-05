import React, { useState } from 'react';
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import ManualInput from './components/ManualInput';
import ImageUpload from './components/ImageUpload';

function App() {
  const [view, setView] = useState('manual'); // 'manual' or 'upload'
  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <div></div>;
  }

  async function googleSignIn() {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    if (error) {
      alert("error signing in");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <div className="App">
        <div style={{ width: '400px', margin: '30px auto'}}>
          <button onClick={() => googleSignIn()}>Sign in with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{ width: '600px', margin: '30px auto'}}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setView('manual')}
            style={{
              backgroundColor: view === 'manual' ? '#4CAF50' : '#f0f0f0',
              color: view === 'manual' ? 'white' : 'black',
              padding: '10px 20px',
              margin: '0 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Manual Input
          </button>
          <button
            onClick={() => setView('upload')}
            style={{
              backgroundColor: view === 'upload' ? '#4CAF50' : '#f0f0f0',
              color: view === 'upload' ? 'white' : 'black',
              padding: '10px 20px',
              margin: '0 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Upload Image
          </button>
        </div>

        {view === 'manual' ? (
          <ManualInput
            session={session}
            supabase={supabase}
            onSignOut={signOut}
          />
        ) : (
          <ImageUpload
            session={session}
            onSignOut={signOut}
          />
        )}
      </div>
    </div>
  );
}

export default App;
