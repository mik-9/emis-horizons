export function authErrorMessage(error) {
  const code = error?.code;
  if (code === 'invalid_credentials' || error?.message === 'Invalid login credentials') return 'Email ou mot de passe incorrect.';
  if (code === 'email_not_confirmed' || error?.message === 'Email not confirmed') return 'Confirmez votre adresse email avec le lien reçu avant de vous connecter.';
  if (code === 'weak_password' || code === 'same_password') return 'Choisissez un nouveau mot de passe plus robuste.';
  if (code === 'over_email_send_rate_limit' || error?.status === 429) return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
  if (code === 'signup_disabled') return 'La création de compte est momentanément indisponible.';
  return 'La connexion au service a échoué. Vérifiez votre connexion et réessayez.';
}

export function reportErrorMessage(error) {
  if (error?.code === '42501' || error?.status === 401) return 'Votre accès n’a pas pu être confirmé. Reconnectez-vous avant de réessayer.';
  if (['42P01', '42703', 'PGRST204', 'PGRST205'].includes(error?.code)) return 'Le service de sauvegarde n’est pas encore prêt. Réessayez plus tard ou contactez votre accompagnateur.';
  if (error?.code === '23514') return 'Certaines réponses ne respectent pas les limites autorisées. Vérifiez leur longueur avant de réessayer.';
  return 'Le service n’a pas confirmé l’enregistrement. Vérifiez votre connexion puis réessayez.';
}
