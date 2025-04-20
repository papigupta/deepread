import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';   // ✅ adjust dots if file moves

export default function LoginCallbackScreen() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) window.location.replace('/'); // 🚀 simple web redirect
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return null; // TODO: add a spinner later
}
