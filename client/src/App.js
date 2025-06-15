import logo from './logo.svg';
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';


function App() {

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

  console.log(session);

  return (
    <div className="App">
      <div style={{ width: '400px', margin: '30px auto'}}>
        {session ? 
          <>
            <h2>Hello {session.user.email}</h2>
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
