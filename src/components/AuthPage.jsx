import { useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { authErrorMessage } from '../lib/errors';

const fieldStyle = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500';
const buttonStyle = 'rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold disabled:opacity-50 hover:bg-blue-700';

export default function AuthPage({ onBack, onDemo, recovery = false, onRecovered, initialError = '' }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const activeMode = recovery ? 'recovery' : mode;

  const changeMode = (next) => {
    setMode(next); setError(''); setMessage(''); setPassword(''); setConfirmation('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase || pending.current) return;
    setError(''); setMessage('');
    if (['signup', 'recovery'].includes(activeMode) && password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.'); return;
    }
    pending.current = true; setBusy(true);
    try {
      let result;
      if (activeMode === 'signup') {
        result = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin } });
        if (!result.error && !result.data.session) {
          setMessage('Consultez votre messagerie pour confirmer votre adresse. Si un compte existe déjà, connectez-vous ou réinitialisez votre mot de passe.');
          setPassword(''); setConfirmation('');
        }
      } else if (activeMode === 'reset') {
        result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/?mode=recovery` });
        if (!result.error) setMessage('Si cette adresse correspond à un compte, un lien de réinitialisation a été envoyé. Consultez aussi vos courriers indésirables.');
      } else if (activeMode === 'resend') {
        result = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin } });
        if (!result.error) setMessage('Si une confirmation est nécessaire, un nouveau lien vous sera envoyé.');
      } else if (activeMode === 'recovery') {
        result = await supabase.auth.updateUser({ password });
        if (!result.error) onRecovered();
      } else {
        result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      }
      if (result.error) throw result.error;
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      pending.current = false; setBusy(false);
    }
  };

  const titles = { login: 'Connexion à EMIS Horizons', signup: 'Créer un compte', reset: 'Réinitialiser le mot de passe', recovery: 'Choisir un nouveau mot de passe', resend: 'Confirmer mon adresse email' };
  const labels = { login: 'Se connecter', signup: 'Créer mon compte', reset: 'Envoyer le lien', recovery: 'Enregistrer le mot de passe', resend: 'Renvoyer le lien de confirmation' };
  return <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {!recovery && <button disabled={busy} onClick={onBack} className="text-blue-700 mb-6">Retour à l’accueil</button>}
      <h1 className="text-2xl font-bold mb-6">{titles[activeMode]}</h1>
      {!isSupabaseConfigured ? <>
        <p role="status" className="mb-4">L’espace connecté est momentanément indisponible. La démonstration reste accessible, sans sauvegarde en ligne.</p>
        <button onClick={onDemo} className={buttonStyle}>Essayer la démo</button>
      </> : <>
        <form onSubmit={submit} className="space-y-4">
          {activeMode === 'signup' && <label className="block">Prénom ou nom d’usage
            <input className={fieldStyle} autoComplete="nickname" value={name} onChange={e => setName(e.target.value)} required maxLength={100} disabled={busy} />
          </label>}
          {!recovery && <label className="block">Email
            <input className={fieldStyle} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} disabled={busy} />
          </label>}
          {!['reset', 'resend'].includes(activeMode) && <label className="block">{recovery ? 'Nouveau mot de passe' : 'Mot de passe'}
            <input className={fieldStyle} type="password" autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={activeMode === 'login' ? 1 : 12} maxLength={128} disabled={busy} />
          </label>}
          {['signup', 'recovery'].includes(activeMode) && <>
            <p className="text-sm text-slate-600">Utilisez au moins 12 caractères.</p>
            <label className="block">Confirmer le mot de passe
              <input className={fieldStyle} type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required minLength={12} maxLength={128} disabled={busy} />
            </label>
          </>}
          {error && <p role="alert" className="text-red-700">{error}</p>}
          {message && <p role="status" className="text-green-800">{message}</p>}
          <button type="submit" disabled={busy} className={`${buttonStyle} w-full`}>{busy ? 'Veuillez patienter…' : labels[activeMode]}</button>
        </form>
        {!recovery && <div className="mt-5 flex flex-col gap-3 text-sm text-blue-700">
          {activeMode !== 'login' && <button disabled={busy} onClick={() => changeMode('login')}>Déjà un compte ? Se connecter</button>}
          {activeMode === 'login' && <>
            <button disabled={busy} onClick={() => changeMode('signup')}>Créer un compte</button>
            <button disabled={busy} onClick={() => changeMode('reset')}>Mot de passe oublié ?</button>
            <button disabled={busy} onClick={() => changeMode('resend')}>Email de confirmation non reçu ?</button>
          </>}
        </div>}
        <p className="text-xs text-slate-500 mt-6">Vos rapports sont conservés dans votre espace personnel. Évitez d’y saisir des informations confidentielles concernant d’autres personnes.</p>
      </>}
    </div>
  </main>;
}
