import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export function useAuth() {
  const [state, setState] = useState({ session: null, loading: isSupabaseConfigured, error: '' });
  const [recovering, setRecovering] = useState(() => new URLSearchParams(window.location.search).get('mode') === 'recovery');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let eventCount = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      eventCount += 1;
      setState({ session, loading: false, error: '' });
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
    });
    const revision = eventCount;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || eventCount !== revision) return;
      setState({ session: data?.session ?? null, loading: false, error: error ? 'Impossible de restaurer votre session. Veuillez vous reconnecter.' : '' });
    }).catch(() => {
      if (active && eventCount === revision) setState({ session: null, loading: false, error: 'Impossible de restaurer votre session. Veuillez vous reconnecter.' });
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const finishRecovery = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url);
    setRecovering(false);
  };
  const clearError = () => setState(previous => ({ ...previous, error: '' }));
  return { ...state, recovering, finishRecovery, clearError };
}
