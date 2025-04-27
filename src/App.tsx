import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
    });

    // Listen for auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto p-4" style={{ maxWidth: '500px' }}>
      {!session ? (
        <div className="p-4 border rounded shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Virtual Coach</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']} // Add other providers like 'github' if enabled
            theme="dark"
          />
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
          <p>You are logged in.</p>
          {/* TODO: Add Onboarding check and main app components here */}
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default App; 