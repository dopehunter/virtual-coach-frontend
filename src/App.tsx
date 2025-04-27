import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import OnboardingForm from './components/Onboarding/OnboardingForm';

// Define a type for the profile data we expect
interface Profile {
  id: string;
  onboarding_completed: boolean;
  // Add other profile fields if needed later
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // Function to fetch profile data
  const fetchProfile = async (user: User | undefined | null) => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`id, onboarding_completed`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Handle case where profile might not exist yet after signup
        // This shouldn't happen if Supabase triggers are set up correctly
        // but good to handle defensively.
        setProfile(null); 
      }
    } catch (error) {
      console.error('Exception fetching profile:', error);
      setProfile(null); // Ensure profile is null on error
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      fetchProfile(data.session?.user);
    });

    // Listen for auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        // If logging out, clear profile. If logging in, fetch profile.
        if (_event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (_event === 'SIGNED_IN') {
          fetchProfile(session?.user);
        }
        // Handle other events like USER_UPDATED if necessary
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Function to be called when onboarding is completed
  const handleOnboardingComplete = () => {
     // Re-fetch profile to get updated onboarding_completed status
     if (session?.user) {
       fetchProfile(session.user);
     } else {
       // Fallback if session/user somehow null, though unlikely here
       setProfile(prev => prev ? { ...prev, onboarding_completed: true } : null);
     }
  };

  // --- Render Logic --- 

  // Show Auth UI if not logged in
  if (!session) {
    return (
      <div className="container mx-auto p-4" style={{ maxWidth: '500px' }}>
        <div className="p-4 border rounded shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Virtual Coach</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']} // Add other providers if enabled
            theme="dark"
          />
        </div>
      </div>
    );
  }

  // Show loading state while fetching profile
  if (loadingProfile) {
     return <div className="p-4 text-center">Loading profile...</div>;
  }

  // Show Onboarding if logged in but onboarding is not complete
  if (!profile?.onboarding_completed) {
     return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  // Show Main App if logged in and onboarding is complete
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
      <p>Your main dashboard / plan view will go here.</p>
      <button 
        onClick={() => supabase.auth.signOut()} 
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}

export default App; 