import React, { useState, useEffect } from "react";
import { 
  ArrowRight, ArrowLeft, Compass, Printer, Sparkles, History, Save, Check, 
  LogOut, Search, Target, Rocket, LayoutDashboard, Database, Lock, TrendingUp, 
  ShieldCheck, FileText, ChevronRight, Plus, BrainCircuit
} from "lucide-react";

// --- UI COMPONENTS ---

const Button = ({ children, onClick, disabled, variant = "default", size = "default", className = "", style, type = "button", title }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 gap-2";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800 print:hidden",
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 print:hidden",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 print:hidden",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 print:hidden",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-sm",
    lg: "h-12 rounded-xl px-8 py-3 text-lg",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} title={title} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Textarea = ({ value, onChange, placeholder, className = "" }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all print:border-none print:resize-none print:p-0 print:bg-transparent ${className}`}
  />
);

const Input = ({ type = "text", placeholder, className = "", required }) => (
  <input
    type={type}
    placeholder={placeholder}
    required={required}
    className={`flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
  />
);

const Slider = ({ value, onValueChange, min, max, step }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([Number(e.target.value)])}
    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
  />
);

// --- TOOL SUB-COMPONENTS ---

const QuestionnaireStep = ({ title, description, children }) => (
  <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-600 text-lg">{description}</p>
    </div>
    {children}
  </div>
);

const FutureMatrix = ({ x, y, size = "md", hideDot = false }) => {
  const dotX = (x + 1) * 50; 
  const dotY = (1 - y) * 50; 
  const isPrint = size === "print";

  return (
    <div className={`relative mx-auto aspect-square bg-white border border-slate-200 shadow-sm overflow-hidden p-2 md:p-4
      ${size === "md" ? "w-full max-w-md rounded-2xl" : ""}
      ${size === "sm" ? "w-full max-w-xs rounded-xl" : ""}
      ${isPrint ? "w-64 rounded-xl border-2 print:border-slate-300" : ""}
    `}>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-50">
        {/* Ligne 1 : Pouvoir Fort (Y > 0) */}
        {/* Q2: Résistant engagé (Futur Contraint X < 0, Pouvoir Fort Y > 0) */}
        <div className="bg-amber-50 flex items-center justify-center"><span className={`font-bold text-amber-700/30 uppercase ${isPrint ? 'text-xs' : 'text-lg md:text-2xl'} text-center px-2`}>Résistant engagé</span></div>
        {/* Q1: Acteur du changement (Futur Désirable X > 0, Pouvoir Fort Y > 0) */}
        <div className="bg-emerald-50 flex items-center justify-center"><span className={`font-bold text-emerald-700/30 uppercase ${isPrint ? 'text-xs' : 'text-lg md:text-2xl'} text-center px-2`}>Acteur du changement</span></div>
        
        {/* Ligne 2 : Pouvoir Faible (Y < 0) */}
        {/* Q3: Spectateur inquiet (Futur Contraint X < 0, Pouvoir Faible Y < 0) */}
        <div className="bg-rose-50 flex items-center justify-center"><span className={`font-bold text-rose-700/30 uppercase ${isPrint ? 'text-xs' : 'text-lg md:text-2xl'} text-center px-2`}>Spectateur inquiet</span></div>
        {/* Q4: Observateur confiant (Futur Désirable X > 0, Pouvoir Faible Y < 0) */}
        <div className="bg-blue-50 flex items-center justify-center"><span className={`font-bold text-blue-700/30 uppercase ${isPrint ? 'text-xs' : 'text-lg md:text-2xl'} text-center px-2`}>Observateur confiant</span></div>
      </div>
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-300 print:bg-slate-400" />
      <div className="absolute top-0 left-1/2 w-[2px] h-full bg-slate-300 print:bg-slate-400" />
      
      <span className={`absolute top-2 left-1/2 -translate-x-1/2 font-semibold text-slate-500 uppercase tracking-wider bg-white/90 px-2 rounded-full shadow-sm print:shadow-none ${isPrint ? 'text-[8px]' : 'text-xs'}`}>Puissant</span>
      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 font-semibold text-slate-500 uppercase tracking-wider bg-white/90 px-2 rounded-full shadow-sm print:shadow-none ${isPrint ? 'text-[8px]' : 'text-xs'}`}>Impuissant</span>
      <span className={`absolute top-1/2 right-2 -translate-y-1/2 font-semibold text-slate-500 uppercase tracking-wider bg-white/90 px-2 rounded-full shadow-sm print:shadow-none ${isPrint ? 'text-[8px] rotate-90 origin-right' : 'text-xs'}`}>Désirable</span>
      <span className={`absolute top-1/2 left-2 -translate-y-1/2 font-semibold text-slate-500 uppercase tracking-wider bg-white/90 px-2 rounded-full shadow-sm print:shadow-none ${isPrint ? 'text-[8px] -rotate-90 origin-left' : 'text-xs'}`}>Contraint</span>
      
      {!hideDot && (
        <div
          className={`absolute bg-slate-900 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-white print:border-slate-300 print:shadow-none
            ${isPrint ? 'w-4 h-4 border-2' : 'w-6 h-6 border-4 transition-all duration-700 ease-out'}`}
          style={{ left: `${Math.max(5, Math.min(95, dotX))}%`, top: `${Math.max(5, Math.min(95, dotY))}%` }}
        />
      )}
    </div>
  );
};

const QuadrantSelector = ({ value, onChange }) => {
  const options = [
    { id: 1, title: "Quadrant 1 : Acteur du changement", desc: "Futur désirable / Agence forte" },
    { id: 2, title: "Quadrant 2 : Résistant engagé", desc: "Futur contraint / Agence forte" },
    { id: 3, title: "Quadrant 3 : Spectateur inquiet", desc: "Futur contraint / Agence faible" },
    { id: 4, title: "Quadrant 4 : Observateur confiant", desc: "Futur désirable / Agence faible" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            value === opt.id 
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="font-bold text-slate-900 mb-1">{opt.title}</div>
          <div className="text-sm text-slate-500">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
};

const CrashTestCoach = ({ subject, currentQuadrant, desiredQuadrant, actionSteps, userPlan, onSimulatedAnalysis }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const getQuadrantName = (q) => ["Acteur du changement", "Résistant engagé", "Spectateur inquiet", "Observateur confiant"][q-1];

  const generateAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // Structure formatée pour le PDF
      const result = {
        diagnostic: `Ton positionnement "${getQuadrantName(currentQuadrant)}" est cohérent avec l'ambition de ce projet, mais tes scores révèlent une dynamique complexe. ${currentQuadrant === desiredQuadrant ? "Tu cherches à maintenir cette posture, ce qui nécessitera une grande constance." : `Tu souhaites basculer vers "${getQuadrantName(desiredQuadrant)}", ce qui imposera un changement de paradigme profond.`} Ta posture actuelle suggère que tu avances à la force du poignet dans un environnement que tu perçois comme potentiellement incertain.`,
        vigilance: `L'épuisement du bâtisseur : Avec tes scores actuels, tu portes potentiellement beaucoup sur tes épaules. Sans une vision claire de l'avenir, tu risques l'épuisement avant d'atteindre l'échelle souhaitée.\n\nLe biais d'exécution : Tu te focalises sur tes actions de court terme. Or, le véritable saut stratégique ne vient pas seulement de l'outil, mais de la valeur perçue et du modèle d'affaires global.`,
        reco: `Passe du mode "artisanat" au mode "système". Ton levier principal n'est pas d'accumuler les tâches, mais de déconnecter ton temps de ton revenu ou de ton impact direct. Délègue ce qui peut l'être et concentre-toi exclusivement sur la stratégie.\n\nQuestion puissante : Si tu devais atteindre cet objectif en n'y consacrant que 4 heures par semaine, quel verrou mental devrais-tu faire sauter aujourd'hui ?`
      };
      setAnalysis(result);
      if (onSimulatedAnalysis) onSimulatedAnalysis(result);
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="font-bold text-lg flex items-center gap-2">
          Coach IA : Crash-test
          <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">Pro</span>
        </h3>
      </div>
      
      {userPlan !== 'pro' ? (
        <div className="relative z-10 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
          <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-300 mb-4">Le Crash-Test par Intelligence Artificielle est réservé aux abonnés Pro.</p>
          <Button variant="primary" size="sm">Mettre à niveau</Button>
        </div>
      ) : (
        <div className="relative z-10">
          {!analysis && !analyzing && (
            <Button onClick={generateAnalysis} variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
              Générer une analyse critique
            </Button>
          )}
          {analyzing && (
            <div className="text-slate-400 text-sm flex items-center gap-2 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              Génération du rapport d'analyse en cours...
            </div>
          )}
          {analysis && (
            <div className="space-y-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wider">Diagnostic express</h4>
                <p className="text-slate-200 text-sm leading-relaxed">{analysis.diagnostic}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <h4 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wider">Points de vigilance</h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{analysis.vigilance}</p>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30">
                <h4 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">Recommandation du Coach</h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{analysis.reco}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

// --- SAAS VIEWS ---

const LandingPage = ({ onNavigate }) => (
  <div className="min-h-screen bg-slate-50">
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-slate-900 tracking-tight">EMIS Horizons</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => onNavigate('auth')}>Connexion</Button>
          <Button variant="primary" onClick={() => onNavigate('auth')}>Commencer l'évaluation</Button>
        </div>
      </div>
    </nav>

    <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6">
          <BrainCircuit className="w-4 h-4" /> Analyse scientifique & IA intégrée
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          Cartographiez votre posture face au <span className="text-blue-600">changement.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Le premier outil francophone d'auto-diagnostic de résilience prospective. Obtenez un rapport PDF détaillé, identifiez vos leviers d'action et contribuez à l'observatoire scientifique des transitions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={() => onNavigate('auth')} className="gap-2">
            Obtenir mon rapport stratégique <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-32">
        {[
          { icon: <Target className="w-6 h-6 text-emerald-600" />, title: "Matrice Prospective", desc: "Croisez votre 'Vision du futur' et votre 'Capacité d'agence' pour définir précisément votre posture (Acteur, Résistant...)." },
          { icon: <FileText className="w-6 h-6 text-blue-600" />, title: "Rapport Haute Valeur", desc: "Générez un document PDF complet incluant votre Score de Résilience (Pouvoir, Optimisme, Clarté, Ambition)." },
          { icon: <Database className="w-6 h-6 text-purple-600" />, title: "Base Scientifique", desc: "En utilisant EMIS Horizons, vous enrichissez une base de données anonymisée pour faire avancer la recherche sur le changement." }
        ].map((feature, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">{feature.icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  </div>
);

const AuthPage = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && !consent) return alert("Veuillez accepter de partager vos données anonymisées pour la recherche.");
    onLogin({ name: "Utilisateur Démo", email: "demo@emis.com", plan: "pro" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6">
      <Button variant="ghost" onClick={onBack} className="absolute top-6 left-6 text-slate-500">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Button>
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
          <Compass className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
          {isLogin ? "Bon retour !" : "Créer un compte"}
        </h2>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? "Connectez-vous à EMIS Horizons" : "Rejoignez l'observatoire prospectif"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nom complet</label>
              <Input placeholder="Jean Dupont" required={!isLogin} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input type="email" placeholder="jean@entreprise.com" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <Input type="password" placeholder="••••••••" required />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                <strong>Consentement scientifique :</strong> J'accepte que les résultats de mes évaluations (scores et quadrants) soient anonymisés et agrégés dans la base de données EMIS Consulting à des fins de recherche sur la psychologie du changement.
              </label>
            </div>
          )}

          <Button variant="primary" type="submit" className="w-full mt-4">
            {isLogin ? "Se connecter" : "S'inscrire et commencer"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 font-medium hover:underline">
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, sessions, onLogout, onNewSession, onViewReport }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Database className="w-6 h-6 text-blue-400" />
          <span className="font-bold tracking-tight">EMIS Horizons</span>
        </div>
        <div className="p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Espace Personnel</div>
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-white bg-slate-800 hover:bg-slate-700">
              <LayoutDashboard className="w-4 h-4" /> Tableau de bord
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
              <ShieldCheck className="w-4 h-4" /> Confidentialité & Données
            </Button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">{user.plan} Plan</div>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10 max-w-6xl">
        <div className="flex justify-between items-end mb-10 animate-in fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-600">Retrouvez l'historique de vos rapports de résilience prospective.</p>
          </div>
          <Button variant="primary" onClick={onNewSession}>
            <Plus className="w-4 h-4" /> Nouvelle Exploration
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune exploration</h3>
            <p className="text-slate-500 mb-6 max-w-sm">Vous n'avez pas encore généré de rapport d'état d'esprit du futur.</p>
            <Button variant="primary" onClick={onNewSession}>Commencer maintenant</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {sessions.map((session, index) => (
              <div key={session.id || index} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{new Date(session.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                    <FileText className="w-3 h-3" /> PDF Prêt
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2" title={session.subject}>{session.subject}</h3>
                
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <div className="text-slate-500 font-medium">Résilience : <span className="font-bold text-slate-900">{session.resilienceScore?.total || 0}/100</span></div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onViewReport(session, false)} className="flex-1 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors text-sm">
                    Ouvrir le rapport
                  </Button>
                  <Button variant="outline" onClick={() => onViewReport(session, true)} className="px-3 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors" title="Imprimer PDF">
                    <Printer className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// --- PDF REPORT VIEW ---

const ReportView = ({ session, onBack, autoPrint }) => {
  const [showPrintWarning, setShowPrintWarning] = useState(false);

  useEffect(() => {
    // Styling intensif pour l'impression A4
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page { size: A4 portrait; margin: 15mm; }
        html, body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print\\:shadow-none { box-shadow: none !important; border: none !important; }
        .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
        .print\\:p-0 { padding: 0 !important; }
        .print\\:text-sm { font-size: 0.875rem !important; }
        .page-break { page-break-before: always; break-before: page; margin-top: 2rem; }
        .avoid-break { page-break-inside: avoid; break-inside: avoid; }
      }
    `;
    document.head.appendChild(style);

    if (autoPrint) {
      setTimeout(() => handlePrint(), 500);
    }

    return () => document.head.removeChild(style);
  }, [autoPrint]);

  const handlePrint = () => {
    window.focus();
    try {
      window.print();
      setShowPrintWarning(true);
      setTimeout(() => setShowPrintWarning(false), 8000); // Reste visible plus longtemps
    } catch (e) {
      console.error("Impression bloquée :", e);
    }
  };

  if (!session) return null;

  const getQuadrantName = (q) => ["Acteur du changement", "Résistant engagé", "Spectateur inquiet", "Observateur confiant"][q-1];
  
  // Logique des pistes de réflexion par quadrant
  const getPistes = (q) => {
    switch(q) {
      case 1: return ["Identifiez les tendances positives et amplifiez-les par vos actions concrètes.", "Partagez votre vision optimiste pour inspirer votre entourage.", "Défi : Imaginez comment les prochaines années pourraient être encore meilleures."];
      case 2: return ["Capitalisez sur votre énergie pour surmonter les obstacles actuels.", "Cherchez des alliés pour changer la donne collectivement.", "Vigilance : Protégez-vous de l'épuisement face à un contexte perçu comme hostile."];
      case 3: return ["Retrouvez des petites marges de manœuvre locales et immédiates.", "Focalisez-vous uniquement sur ce qui est sous votre contrôle direct.", "Défi : Prenez du recul pour identifier une opportunité cachée dans la contrainte."];
      case 4: return ["Impliquez-vous davantage en utilisant le contexte favorable.", "Prenez des risques mesurés puisque la tendance de fond est positive.", "Défi : Sortez de votre zone de confort pour devenir acteur de cette dynamique."];
      default: return [];
    }
  };

  const scores = session.resilienceScore || { total: 0, optimisme: 0, pouvoir: 0, clarte: 0, ambition: 0 };
  const resilienceLabel = scores.total >= 75 ? "Élevée" : scores.total >= 45 ? "Moyenne" : "Basse";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 print:py-0 print:bg-white overflow-x-hidden">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-slate-200 z-50 p-4 flex justify-between items-center no-print shadow-sm">
        <Button variant="ghost" onClick={onBack} className="text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quitter le rapport
        </Button>
        <div className="flex gap-3">
          {showPrintWarning && (
             <div className="flex items-center text-sm text-amber-700 font-medium px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
               Impression lancée. Si rien ne se passe, appuyez sur <strong className="mx-1">Ctrl + P</strong> (ou <strong className="mx-1">Cmd + P</strong> sur Mac).
             </div>
          )}
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Télécharger / Imprimer PDF
          </Button>
        </div>
      </header>

      {/* DOCUMENT A4 */}
      <div className="w-[210mm] min-h-[297mm] bg-white mt-16 p-[15mm] shadow-2xl print:shadow-none print:mt-0 print:p-0 text-slate-900 font-sans">
        
        {/* En-tête */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">Mon État d'esprit du Futur</h1>
            <p className="text-lg font-medium text-slate-500">EMIS Consulting - Rapport individuel</p>
          </div>
          <div className="text-right text-sm font-bold text-slate-400">
            {new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            ID: {session.id}
          </div>
        </div>

        {/* 1. Sujet */}
        <div className="mb-8 avoid-break">
          <h2 className="text-xl font-bold text-blue-700 mb-3 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">1. Sujet d'avenir exploré</h2>
          <p className="text-lg font-medium bg-slate-50 p-4 rounded-xl text-slate-800">{session.subject}</p>
        </div>

        {/* Axes */}
        <div className="grid grid-cols-2 gap-8 mb-8 avoid-break">
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">2. Vision du futur</h2>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
              <span>Futur contraint</span><span>Futur désirable</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300"></div>
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, (session.futureAxis + 100) / 2)}%` }}></div>
            </div>
            <div className="text-center mt-2 font-bold text-sm text-slate-700">
              Score: {session.futureAxis > 0 ? `Désirable (+${session.futureAxis}%)` : `Contraint (${session.futureAxis}%)`}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">3. Capacité d'agence</h2>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
              <span>Subi (Impuissant)</span><span>Acteur (Puissant)</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300"></div>
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(0, (session.powerAxis + 100) / 2)}%` }}></div>
            </div>
            <div className="text-center mt-2 font-bold text-sm text-slate-700">
              Score: {session.powerAxis > 0 ? `Acteur (+${session.powerAxis}%)` : `Subi (${session.powerAxis}%)`}
            </div>
          </div>
        </div>

        {/* 4. Score de résilience */}
        <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-200 avoid-break">
          <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">4. Score de résilience prospective</h2>
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center shrink-0 bg-white shadow-sm">
              <span className="text-3xl font-black text-slate-900 leading-none">{scores.total}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-slate-800 mb-3">Résilience : {resilienceLabel}</div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                <span>Pouvoir <strong className="text-slate-900">{scores.pouvoir}/40</strong></span>
                <span>Optimisme <strong className="text-slate-900">{scores.optimisme}/25</strong></span>
                <span>Clarté <strong className="text-slate-900">{scores.clarte}/15</strong></span>
                <span>Ambition <strong className="text-slate-900">{scores.ambition}/20</strong></span>
              </div>
              <p className="text-xs text-slate-500 mt-3 italic">Ce score mesure votre capacité d'adaptation face aux transformations à venir, basé sur vos réponses comportementales.</p>
            </div>
          </div>
        </div>

        {/* 5. Matrice & Pistes */}
        <div className="grid grid-cols-2 gap-8 mb-8 avoid-break">
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">5. Ma position sur la matrice</h2>
            <FutureMatrix x={session.futureAxis/100} y={session.powerAxis/100} size="print" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <div className="text-sm text-slate-500 font-bold uppercase mb-1">Position actuelle</div>
              <div className="text-2xl font-black text-slate-900">{getQuadrantName(session.currentQuadrant)}</div>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Pistes de réflexion</div>
              <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
                {getPistes(session.currentQuadrant).map((piste, i) => (
                  <li key={i}>{piste}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="page-break" />

        {/* 6. Projection */}
        <div className="mb-10 avoid-break">
          <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">6. Ma projection souhaitée</h2>
          <div className="text-lg">
            Je souhaite évoluer vers / maintenir : <strong className="text-blue-600">{getQuadrantName(session.desiredQuadrant)}</strong>
          </div>
        </div>

        {/* 7. Plan d'action */}
        <div className="mb-10 avoid-break">
          <h2 className="text-xl font-bold text-blue-700 mb-6 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">7. Mon plan d'action</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-slate-300 p-5 rounded-xl bg-white shadow-sm">
              <div className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">1. Observer</div>
              <p className="text-sm text-slate-800 leading-relaxed">{session.actionSteps?.observe || "—"}</p>
            </div>
            <div className="border border-slate-300 p-5 rounded-xl bg-white shadow-sm">
              <div className="text-sm font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">2. Agir</div>
              <p className="text-sm text-slate-800 leading-relaxed">{session.actionSteps?.act || "—"}</p>
            </div>
            <div className="border border-slate-300 p-5 rounded-xl bg-white shadow-sm">
              <div className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">3. Transformer</div>
              <p className="text-sm text-slate-800 leading-relaxed">{session.actionSteps?.transform || "—"}</p>
            </div>
          </div>
        </div>

        {/* 8. Coach IA */}
        {session.aiAnalysis && (
          <div className="avoid-break">
            <h2 className="text-xl font-bold text-blue-700 mb-6 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">8. Crash-test du Coach IA</h2>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-6">
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Diagnostic express</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{session.aiAnalysis.diagnostic}</p>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> Points de vigilance</h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{session.aiAnalysis.vigilance}</p>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                <h4 className="text-emerald-700 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Recommandation du Coach</h4>
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{session.aiAnalysis.reco}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
          EMIS Horizons - Observatoire Scientifique des Transitions • Document généré le {new Date(session.date).toLocaleDateString('fr-FR')}
        </div>

      </div>
    </div>
  );
};

// --- ASSESSMENT TOOL ---

const AssessmentTool = ({ user, onSave, onCancel }) => {
  const TOTAL_STEPS = 7; // Ajout d'une étape pour les sous-scores
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("");
  
  // Axes principaux
  const [futureAxis, setFutureAxis] = useState(0); // Vision du futur
  const [powerAxis, setPowerAxis] = useState(0); // Capacité d'agence
  
  // Sous-scores pour Résilience Prospective
  const [clarity, setClarity] = useState(7); // 0-15
  const [ambition, setAmbition] = useState(10); // 0-20
  
  const [desiredQuadrant, setDesiredQuadrant] = useState(null);
  const [actionSteps, setActionSteps] = useState({ observe: "", act: "", transform: "" });
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const x = futureAxis / 100;
  const y = powerAxis / 100;

  const getQuadrant = () => {
    if (x >= 0 && y >= 0) return 1;
    if (x < 0 && y >= 0) return 2;
    if (x < 0 && y < 0) return 3;
    return 4;
  };

  const calculateResilience = () => {
    const optimisme = Math.round(((futureAxis + 100) / 200) * 25); // max 25
    const pouvoir = Math.round(((powerAxis + 100) / 200) * 40); // max 40
    return {
      optimisme,
      pouvoir,
      clarte: clarity,
      ambition,
      total: optimisme + pouvoir + clarity + ambition
    };
  };

  const canProceed = () => {
    if (step === 0) return subject.trim().length > 0;
    if (step === 5) return desiredQuadrant !== null;
    return true;
  };

  const next = () => step < TOTAL_STEPS - 1 && canProceed() && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  const handleSave = () => {
    onSave({
      id: "EMIS-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toISOString(),
      subject,
      futureAxis,
      powerAxis,
      resilienceScore: calculateResilience(),
      currentQuadrant: getQuadrant(),
      desiredQuadrant,
      actionSteps,
      aiAnalysis
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel} className="text-slate-500 p-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Dashboard
          </Button>
          <div className="text-xs font-bold text-slate-400 tracking-wider">
            ÉTAPE {step + 1} / {TOTAL_STEPS}
          </div>
        </div>
        <div className="h-1 bg-slate-100 w-full">
          <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-12">
        {step === 0 && (
          <QuestionnaireStep title="1. Quel sujet d'avenir vous préoccupe ?" description="Personnel, professionnel, sociétal… Identifiez la transformation qui compte le plus pour vous en ce moment.">
            <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex : Accroître fortement mon CA et multiplier mon revenu par 10..." className="min-h-[160px] text-base" />
          </QuestionnaireStep>
        )}
        
        {step === 1 && (
          <QuestionnaireStep title="2. Votre Vision du futur" description="Sur ce sujet précis, percevez-vous un horizon plutôt contraint (sombre) ou désirable (lumineux) ?">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <span className="text-rose-500">Futur contraint</span><span className="text-emerald-500">Futur désirable</span>
              </div>
              <Slider value={[futureAxis]} onValueChange={([v]) => setFutureAxis(v)} min={-100} max={100} step={1} />
              <div className="text-center mt-8 font-bold text-slate-700">
                {futureAxis === 0 ? "Neutre" : futureAxis > 0 ? `Désirable (+${futureAxis}%)` : `Contraint (${futureAxis}%)`}
              </div>
            </div>
          </QuestionnaireStep>
        )}

        {step === 2 && (
          <QuestionnaireStep title="3. Votre Capacité d'agence" description="Vous sentez-vous plutôt acteur (avec des leviers d'action) ou soumis à cette transformation ?">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <span className="text-amber-500">Subi (Impuissant)</span><span className="text-blue-500">Acteur (Puissant)</span>
              </div>
              <Slider value={[powerAxis]} onValueChange={([v]) => setPowerAxis(v)} min={-100} max={100} step={1} />
              <div className="text-center mt-8 font-bold text-slate-700">
                {powerAxis === 0 ? "Neutre" : powerAxis > 0 ? `Acteur (+${powerAxis}%)` : `Subi (${powerAxis}%)`}
              </div>
            </div>
          </QuestionnaireStep>
        )}

        {step === 3 && (
          <QuestionnaireStep title="4. Résilience Prospective" description="Pour calculer votre score scientifique complet, affinons deux dernières dimensions.">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Clarté de la vision</h3>
                <p className="text-sm text-slate-500 mb-6">Avez-vous une idée précise des étapes à franchir ?</p>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  <span>Vision floue</span><span>Vision très claire</span>
                </div>
                <Slider value={[clarity]} onValueChange={([v]) => setClarity(v)} min={0} max={15} step={1} />
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Niveau d'ambition</h3>
                <p className="text-sm text-slate-500 mb-6">Cherchez-vous simplement à vous maintenir, ou à vous déployer radicalement ?</p>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  <span>Maintien (Prudence)</span><span>Déploiement (Audace)</span>
            </div>
                <Slider value={[ambition]} onValueChange={([v]) => setAmbition(v)} min={0} max={20} step={1} />
              </div>
            </div>
          </QuestionnaireStep>
        )}

        {step === 4 && (
          <QuestionnaireStep title="5. Votre position actuelle" description="Voici où vous vous situez sur la matrice prospective de l'observatoire.">
            <FutureMatrix x={x} y={y} />
            <div className="mt-8 text-center bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-lg text-slate-900 mb-2">Vous êtes : {["Acteur du changement", "Résistant engagé", "Spectateur inquiet", "Observateur confiant"][getQuadrant()-1]}</h3>
              <p className="text-slate-600 text-sm">Ce positionnement reflète votre état d'esprit face à la transformation choisie.</p>
            </div>
          </QuestionnaireStep>
        )}

        {step === 5 && (
          <QuestionnaireStep title="6. Où aimeriez-vous vous trouver ?" description="Sélectionnez la position vers laquelle vous souhaitez évoluer ou vous consolider.">
            <QuadrantSelector value={desiredQuadrant} onChange={setDesiredQuadrant} />
          </QuestionnaireStep>
        )}

        {step === 6 && (
          <QuestionnaireStep title="7. Votre plan d'action" description="Que pouvez-vous faire dès aujourd'hui pour rendre l'avenir souhaité plus probable ?">
            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider"><Search className="w-4 h-4"/> 1. Observer</div>
                  <Textarea value={actionSteps.observe} onChange={(e) => setActionSteps(prev => ({...prev, observe: e.target.value}))} placeholder="Quels signaux faibles devez-vous surveiller ?" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider"><Target className="w-4 h-4"/> 2. Agir</div>
                  <Textarea value={actionSteps.act} onChange={(e) => setActionSteps(prev => ({...prev, act: e.target.value}))} placeholder="Quelles actions concrètes lancer dès maintenant ?" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider"><Rocket className="w-4 h-4"/> 3. Transformer</div>
                  <Textarea value={actionSteps.transform} onChange={(e) => setActionSteps(prev => ({...prev, transform: e.target.value}))} placeholder="Quel changement profond visez-vous ?" />
                </div>
              </div>
              <CrashTestCoach 
                subject={subject} 
                currentQuadrant={getQuadrant()} 
                desiredQuadrant={desiredQuadrant} 
                actionSteps={actionSteps} 
                userPlan={user.plan} 
                onSimulatedAnalysis={setAiAnalysis}
              />
            </div>
          </QuestionnaireStep>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white p-4 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={prev} disabled={step === 0} className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button variant="primary" onClick={next} disabled={!canProceed()}>
              Continuer <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSave} disabled={!aiAnalysis} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30">
              <Save className="w-4 h-4 mr-2" /> Terminer & Générer le PDF
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

// --- MAIN ROUTER COMPONENT ---

export default function App() {
  const [currentView, setCurrentView] = useState("landing"); // landing, auth, dashboard, tool, report
  const [user, setUser] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  
  // Storage en mémoire
  const [sessions, setSessions] = useState([]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("landing");
  };

  const saveSession = (newSession) => {
    setSessions(prev => [newSession, ...prev]);
    handleViewReport(newSession, false); // Ouvre directement le rapport généré
  };

  const handleViewReport = (session, shouldPrint = false) => {
    setSelectedSession(session);
    setAutoPrint(shouldPrint);
    setCurrentView("report");
  };

  // Routing basique
  if (currentView === "landing") return <LandingPage onNavigate={setCurrentView} />;
  if (currentView === "auth") return <AuthPage onLogin={handleLogin} onBack={() => setCurrentView("landing")} />;
  if (currentView === "dashboard" && user) return <Dashboard user={user} sessions={sessions} onLogout={handleLogout} onNewSession={() => setCurrentView("tool")} onViewReport={handleViewReport} />;
  if (currentView === "tool" && user) return <AssessmentTool user={user} onSave={saveSession} onCancel={() => setCurrentView("dashboard")} />;
  if (currentView === "report" && selectedSession) return <ReportView session={selectedSession} onBack={() => setCurrentView("dashboard")} autoPrint={autoPrint} />;

  return <LandingPage onNavigate={setCurrentView} />;
}