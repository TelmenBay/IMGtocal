import React, { useState } from 'react';
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import ManualInput from './components/ManualInput';
import ImageUpload from './components/ImageUpload';

function App() {
  const [view, setView] = useState('upload'); // 'manual' or 'upload'
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

  return (
    <div className="App">
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">IMGtoCal</h1>
          <p className="app-subtitle">Transform images into calendar events</p>
          {session && (
            <p style={{
              fontSize: '14px',
              color: '#a0a0a0',
              marginTop: '8px'
            }}>
              Signed in as {session.user.email}
            </p>
          )}
        </div>

        <div className="tab-container">
          <button
            className={`tab-button ${view === 'upload' ? 'active' : ''}`}
            onClick={() => setView('upload')}
          >
            Upload Image
          </button>
          <button
            className={`tab-button ${view === 'manual' ? 'active' : ''}`}
            onClick={() => setView('manual')}
          >
            Manual Input
          </button>
        </div>

        {view === 'manual' ? (
          session ? (
            <ManualInput
              session={session}
              supabase={supabase}
              onSignOut={signOut}
            />
          ) : (
            <div style={{
              background: '#242424',
              border: '1px solid #3a3a3a',
              borderRadius: '4px',
              padding: '60px 40px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Sign In Required
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#a0a0a0',
                marginBottom: '24px',
                lineHeight: '1.5'
              }}>
                Sign in with your Google account to create calendar events
              </p>
              <button className="btn-primary" onClick={() => googleSignIn()} style={{ maxWidth: '300px', margin: '0 auto' }}>
                Sign in with Google
              </button>
            </div>
          )
        ) : (
          <ImageUpload
            session={session}
            onSignIn={googleSignIn}
            onSignOut={signOut}
          />
        )}
      </div>
    </div>
  );
}

export default App;
