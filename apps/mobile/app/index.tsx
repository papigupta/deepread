import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      router.replace(session ? "/(app)" : "/auth/login");
    }
  }, [isLoading, session]);

  return null;
} 