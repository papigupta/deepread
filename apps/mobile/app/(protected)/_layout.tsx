import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function ProtectedLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Show loading indicator while checking auth
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Redirect href={'/auth/login' as const} />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
} 