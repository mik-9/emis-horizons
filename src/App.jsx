import { supabase } from './supabaseClient';
import AuthPage from './components/AuthPage';
import { useAuth } from './hooks/useAuth';
import { listReports, saveReport, SUBJECT_LIMIT, ACTION_LIMIT } from './lib/reports';
import { authErrorMessage, reportErrorMessage } from './lib/errors';
import { useState, useEffect, useCallback, useRef } from "react";
import "./report.css";
import { 
  ArrowRight, ArrowLeft, Printer, Save,
  LogOut, Search, Target, Rocket, LayoutDashboard, Database,
  ShieldCheck, FileText, Plus, BrainCircuit
} from "lucide-react";

// --- UI COMPONENTS ---

const Button = ({ children, onClick, disabled, variant = "default", size = "default", className = "", style, type = "button", title }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 gap-2";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800 print:hidden",
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 print:hidden",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 print:hidden",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 print:hidden",
    sidebar: "bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white print:hidden",
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

const Textarea = ({ value, onChange, placeholder, className = "", maxLength = ACTION_LIMIT }) => (
  <textarea
    value={value}
    maxLength={maxLength}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all print:border-none print:resize-none print:p-0 print:bg-transparent ${className}`}
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
    <div className={`future-matrix relative mx-auto aspect-square bg-white border border-slate-200 shadow-sm overflow-hidden p-2 md:p-4
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
      
      <span className={`absolute top-2 left-1/2 -translate-x-1/2 font-semibold text-slate-500 uppercase tracking-wider bg-white/90 px-2 rounded-full shadow-sm print:shadow-none ${isPrint ? 'text-[8px]' : 'text-xs'}`}>Forte marge d'action</span>
      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 font-semibold text-slate-500 uppercase tracking-wider bg-white/90 px-2 rounded-full shadow-sm print:shadow-none ${isPrint ? 'text-[8px]' : 'text-xs'}`}>Faible marge d'action</span>
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
    { id: 1, title: "Quadrant 1 : Acteur du changement", desc: "Futur désirable / Marge d'action forte" },
    { id: 2, title: "Quadrant 2 : Résistant engagé", desc: "Futur contraint / Marge d'action forte" },
    { id: 3, title: "Quadrant 3 : Spectateur inquiet", desc: "Futur contraint / Marge d'action faible" },
    { id: 4, title: "Quadrant 4 : Observateur confiant", desc: "Futur désirable / Marge d'action faible" },
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

const GuidedSynthesis = ({ subject, currentQuadrant, desiredQuadrant, actionSteps, analysis, onAnalysis }) => {

  const getQuadrantName = (q) => ["Acteur du changement", "Résistant engagé", "Spectateur inquiet", "Observateur confiant"][q-1];
  const isPlanComplete = Object.values(actionSteps).every((value) => value.trim().length >= 5);

  const generateAnalysis = () => {
    const planElements = [actionSteps.observe, actionSteps.act, actionSteps.transform].filter(Boolean);
    const transition = currentQuadrant === desiredQuadrant
      ? `Vous souhaitez consolider votre position « ${getQuadrantName(currentQuadrant)} ».`
      : `Vous souhaitez évoluer de « ${getQuadrantName(currentQuadrant)} » vers « ${getQuadrantName(desiredQuadrant)} ».`;
    const result = {
      diagnostic: `Sujet analysé : « ${subject.trim()} ». ${transition} Cette synthèse met en relation votre objectif et les actions que vous avez vous-même formulées.`,
      vigilance: `Vérifiez que chacun des ${planElements.length} éléments de votre plan décrit un résultat observable, une échéance et, si nécessaire, une personne ressource. Une intention générale ne permet pas encore de mesurer les progrès.`,
      reco: `Commencez par l'action suivante : « ${actionSteps.act.trim()} ». Associez-lui un premier jalon réalisable sous sept jours. Pour vérifier son effet, observez : « ${actionSteps.observe.trim()} ». Votre transformation visée reste : « ${actionSteps.transform.trim()} ».`
    };
    onAnalysis(result);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="font-bold text-lg flex items-center gap-2">
          Synthèse guidée
        </h3>
      </div>
      
      <div className="relative z-10">
          {!analysis && (
            <Button onClick={generateAnalysis} disabled={!isPlanComplete} variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
              Générer une synthèse de mon plan
            </Button>
          )}
          {!analysis && !isPlanComplete && (
            <p className="text-xs text-slate-400 mt-3">Renseignez les trois parties du plan pour générer une synthèse contextualisée.</p>
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
                <h4 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">Prochaine étape recommandée</h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{analysis.reco}</p>
              </div>
            </div>
          )}
      </div>
      
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

// --- SAAS VIEWS ---

const LandingPage = ({ onNavigate, onDemo }) => (
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
          <BrainCircuit className="w-4 h-4" /> Autoévaluation prospective guidée
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          Cartographiez votre posture face au <span className="text-blue-600">changement.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Structurez votre perception d'un changement, identifiez vos marges de manœuvre et repartez avec un plan d'action contextualisé.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={() => onNavigate('auth')} className="gap-2">
            Commencer mon exploration <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" onClick={onDemo}>Essayer la démo</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-32">
        {[
          { icon: <Target className="w-6 h-6 text-emerald-600" />, title: "Matrice prospective", desc: "Croisez votre vision du futur et votre marge de manœuvre pour situer votre posture actuelle." },
          { icon: <FileText className="w-6 h-6 text-blue-600" />, title: "Rapport de réflexion", desc: "Retrouvez vos réponses, votre indice exploratoire et les prochaines étapes que vous avez formulées." },
          { icon: <Database className="w-6 h-6 text-purple-600" />, title: "Espace personnel", desc: "Avec un compte, conservez vos rapports et retrouvez vos plans d’action lors de votre prochaine connexion." }
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

const Dashboard = ({ user, sessions, onLogout, onNewSession, onViewReport, history, onRetry, onLoadMore, logoutBusy, logoutError, demo }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:fixed md:h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Database className="w-6 h-6 text-blue-400" />
          <span className="font-bold tracking-tight">EMIS Horizons</span>
        </div>
        <div className="p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Espace Personnel</div>
          <nav className="space-y-2">
            <Button variant="sidebar" onClick={() => setShowPrivacy(false)} className="w-full justify-start">
              <LayoutDashboard className="w-4 h-4" /> Tableau de bord
            </Button>
            <Button variant="sidebar" onClick={() => setShowPrivacy(value => !value)} className="w-full justify-start">
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
              <div className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">{demo ? "Démonstration" : "Compte personnel"}</div>
            </div>
          </div>
          <Button variant="sidebar" disabled={logoutBusy} onClick={onLogout} className="w-full justify-start">
            <LogOut className="w-4 h-4" /> {logoutBusy ? "Déconnexion…" : demo ? "Quitter la démo" : "Déconnexion"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-5 md:p-10 max-w-6xl w-full min-w-0">
        {logoutError && <p role="alert" className="bg-red-50 text-red-800 p-4 rounded-xl mb-4">{logoutError}</p>}
        {showPrivacy && <section className="bg-white border rounded-xl p-4 mb-6" aria-label="Confidentialité et données">
          <h2 className="font-bold mb-2">Vos données</h2>
          <p>{demo ? "Les rapports de démonstration restent en mémoire dans cet onglet et disparaissent à sa fermeture." : "Vos rapports sont associés à votre compte. Les autres utilisateurs n’y ont pas accès. Vous pouvez conserver une copie de chaque rapport avec le bouton d’impression PDF."}</p>
          <p className="mt-2 text-sm">Les réponses libres ne sont pas anonymisées. Évitez les noms et informations confidentielles concernant des tiers.</p>
        </section>}
        <div className="flex flex-wrap gap-4 justify-between items-end mb-10 animate-in fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, {user.name.split(' ')[0]}</h1>
            <p className="text-slate-600">Retrouvez l’historique de vos explorations et de vos plans d’action.</p>
          </div>
          <Button variant="primary" onClick={onNewSession} disabled={history.loading}>
            <Plus className="w-4 h-4" /> Nouvelle Exploration
          </Button>
        </div>

        {history.loading && <p role="status" className="p-6">Chargement de vos rapports…</p>}
        {history.error && <div role="alert" className="p-4 mb-5 rounded-xl bg-red-50 text-red-800">
          <p>{history.error}</p><Button variant="outline" onClick={onRetry} disabled={history.loading}>Réessayer le chargement</Button>
        </div>}
        {!history.loading && !history.error && sessions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune exploration</h3>
            <p className="text-slate-500 mb-6 max-w-sm">Vous n'avez pas encore généré de rapport d'état d'esprit du futur.</p>
            <Button variant="primary" onClick={onNewSession} disabled={history.loading}>Commencer maintenant</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {sessions.map((session, index) => (
              <div key={session.id || index} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{new Date(session.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                    <FileText className="w-3 h-3" /> Rapport prêt
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2" title={session.subject}>{session.subject}</h3>
                
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <div className="text-slate-500 font-medium">Indice exploratoire : <span className="font-bold text-slate-900">{session.resilienceScore?.total || 0}/100</span></div>
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
        {history.hasMore && <Button variant="outline" onClick={onLoadMore} disabled={history.loadingMore} className="mt-6">
          {history.loadingMore ? "Chargement…" : "Charger les rapports précédents"}
        </Button>}
      </main>
    </div>
  );
};

// --- PDF REPORT VIEW ---

const ReportView = ({ session, onBack, autoPrint }) => {
  const [printError, setPrintError] = useState(false);
  const printPending = useRef(false);

  const handlePrint = useCallback(async () => {
    if (printPending.current) return;
    printPending.current = true;
    setPrintError(false);
    try {
      // Wait for font metrics before the browser paginates the report.
      await document.fonts.ready;
      window.focus();
      window.print();
    } catch (error) {
      console.error("Impression bloquée :", error);
      setPrintError(true);
    } finally {
      printPending.current = false;
    }
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `EMIS-Horizons-Rapport-${session.id}`;
    return () => { document.title = previousTitle; };
  }, [session.id]);

  useEffect(() => {
    if (!autoPrint) return;
    // Cleanup prevents duplicate dialogs in React StrictMode and printing after leaving.
    const timer = setTimeout(() => { void handlePrint(); }, 150);
    return () => clearTimeout(timer);
  }, [autoPrint, handlePrint]);

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
  const preparationLabel = scores.total >= 75 ? "Élevé" : scores.total >= 45 ? "Intermédiaire" : "À consolider";

  return (
    <div className="report-view min-h-screen bg-slate-100 text-slate-900">
      <header className="report-toolbar sticky top-0 w-full bg-white border-b border-slate-200 z-50 p-4 no-print shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quitter le rapport
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Imprimer / Enregistrer en PDF
          </Button>
        </div>
        <p className="text-sm text-slate-600 mt-2 text-center">
          Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF » pour télécharger le rapport.
          Format conseillé : A4, portrait, échelle 100 %, en-têtes et pieds de page du navigateur désactivés.
        </p>
        {printError && <p role="alert" className="text-sm text-red-700 mt-2 text-center">
          La fenêtre d’impression n’a pas pu s’ouvrir. Utilisez Ctrl + P (ou Cmd + P sur Mac).
        </p>}
      </header>

      <article className="report-document bg-white shadow-2xl text-slate-900 font-sans" aria-label="Rapport individuel">
        {/* En-tête */}
        <div className="report-heading border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">Mon État d'esprit du Futur</h1>
            <p className="text-lg font-medium text-slate-500">EMIS Consulting - Rapport individuel</p>
          </div>
          <div className="report-meta text-right text-sm font-bold text-slate-500">
            {new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            ID: {session.id}
          </div>
        </div>

        {/* 1. Sujet */}
        <div className="mb-8 report-subject">
          <h2 className="text-xl font-bold text-blue-700 mb-3 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">1. Sujet d'avenir exploré</h2>
          <p className="report-response text-lg font-medium bg-slate-50 p-4 rounded-xl text-slate-800">{session.subject}</p>
        </div>

        {/* Axes */}
        <div className="report-columns grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 avoid-break">
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
              Score: {session.futureAxis > 0 ? `Désirable (+${session.futureAxis}%)` : session.futureAxis < 0 ? `Contraint (${session.futureAxis}%)` : "Neutre"}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">3. Marge de manœuvre</h2>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
              <span>Peu de leviers</span><span>Plusieurs leviers</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300"></div>
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(0, (session.powerAxis + 100) / 2)}%` }}></div>
            </div>
            <div className="text-center mt-2 font-bold text-sm text-slate-700">
              Score: {session.powerAxis > 0 ? `Marge forte (+${session.powerAxis}%)` : session.powerAxis < 0 ? `Marge limitée (${session.powerAxis}%)` : "Marge intermédiaire"}
            </div>
          </div>
        </div>

        {/* 4. Score de résilience */}
        <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-200 avoid-break">
          <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">4. Indice exploratoire de préparation</h2>
          <div className="report-score flex items-center gap-8">
            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center shrink-0 bg-white shadow-sm">
              <span className="text-3xl font-black text-slate-900 leading-none">{scores.total}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-slate-800 mb-3">Niveau indicatif : {preparationLabel}</div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                <span>Pouvoir <strong className="text-slate-900">{scores.pouvoir}/40</strong></span>
                <span>Optimisme <strong className="text-slate-900">{scores.optimisme}/25</strong></span>
                <span>Clarté <strong className="text-slate-900">{scores.clarte}/15</strong></span>
                <span>Transformation recherchée <strong className="text-slate-900">{scores.ambition}/20</strong></span>
              </div>
              <p className="text-xs text-slate-500 mt-3 italic">Indice exploratoire basé sur vos réponses. Il soutient la réflexion et ne constitue pas une mesure psychologique ou scientifique validée.</p>
            </div>
          </div>
        </div>

        {/* 5. Matrice & Pistes */}
        <div className="report-columns grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 avoid-break">
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

        {/* 6. Projection */}
        <div className="report-projection mb-10 avoid-break">
          <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">6. Ma projection souhaitée</h2>
          <div className="text-lg">
            Je souhaite évoluer vers / maintenir : <strong className="text-blue-600">{getQuadrantName(session.desiredQuadrant)}</strong>
          </div>
        </div>

        {/* 7. Plan d'action */}
        <div className="report-actions mb-10">
          <h2 className="text-xl font-bold text-blue-700 mb-6 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">7. Mon plan d'action</h2>
          <div className="report-action-list grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="report-action-card border border-slate-300 p-5 rounded-xl bg-white shadow-sm">
              <div className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">1. Observer</div>
              <p className="report-response text-sm text-slate-800 leading-relaxed">{session.actionSteps?.observe || "—"}</p>
            </div>
            <div className="report-action-card border border-slate-300 p-5 rounded-xl bg-white shadow-sm">
              <div className="text-sm font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">2. Agir</div>
              <p className="report-response text-sm text-slate-800 leading-relaxed">{session.actionSteps?.act || "—"}</p>
            </div>
            <div className="report-action-card border border-slate-300 p-5 rounded-xl bg-white shadow-sm">
              <div className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">3. Transformer</div>
              <p className="report-response text-sm text-slate-800 leading-relaxed">{session.actionSteps?.transform || "—"}</p>
            </div>
          </div>
        </div>

        {/* 8. Synthèse guidée */}
        {session.aiAnalysis && (
          <div className="report-synthesis">
            <h2 className="text-xl font-bold text-blue-700 mb-6 uppercase tracking-wider flex items-center gap-2 border-l-4 border-blue-600 pl-3">8. Synthèse guidée</h2>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-6">
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Diagnostic express</h4>
                <p className="report-response text-slate-700 text-sm leading-relaxed">{session.aiAnalysis.diagnostic}</p>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> Points de vigilance</h4>
                <p className="report-response text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{session.aiAnalysis.vigilance}</p>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                <h4 className="text-emerald-700 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Prochaine étape recommandée</h4>
                <p className="report-response text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{session.aiAnalysis.reco}</p>
              </div>
            </div>
          </div>
        )}

        <div className="report-footer mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
          EMIS Horizons - Exploration du changement • Document généré le {new Date(session.date).toLocaleDateString('fr-FR')}
        </div>

      </article>
    </div>
  );
};

// --- ASSESSMENT TOOL ---

const AssessmentTool = ({ onSave, onCancel, saving, saveError }) => {
  const submission = useRef(null);
  const TOTAL_STEPS = 7; // Ajout d'une étape pour les sous-scores
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("");
  
  // Axes principaux
  const [futureAxis, setFutureAxis] = useState(0); // Vision du futur
  const [powerAxis, setPowerAxis] = useState(0); // Marge de manœuvre perçue
  
  // Dimensions complémentaires de l'indice exploratoire
  const [clarity, setClarity] = useState(7); // 0-15
  const [ambition, setAmbition] = useState(10); // 0-20
  const [answered, setAnswered] = useState({ future: false, power: false, clarity: false, transformation: false });
  
  const [desiredQuadrant, setDesiredQuadrant] = useState(null);
  const [actionSteps, setActionSteps] = useState({ observe: "", act: "", transform: "" });
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const synthesisSource = JSON.stringify({ subject, futureAxis, powerAxis, clarity, ambition, desiredQuadrant, actionSteps });
  const currentAnalysis = aiAnalysis?.source === synthesisSource ? aiAnalysis.result : null;

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
    if (step === 0) return subject.trim().length >= 10 && subject.length <= SUBJECT_LIMIT;
    if (step === 1) return answered.future;
    if (step === 2) return answered.power;
    if (step === 3) return answered.clarity && answered.transformation;
    if (step === 5) return desiredQuadrant !== null;
    return true;
  };

  const next = () => step < TOTAL_STEPS - 1 && canProceed() && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  const handleSave = () => {
    if (!currentAnalysis || saving) return;
    if (!submission.current) {
      submission.current = { id: crypto.randomUUID() };
    }
    onSave({
      id: submission.current.id,
      date: new Date().toISOString(),
      subject,
      futureAxis,
      powerAxis,
      resilienceScore: calculateResilience(),
      currentQuadrant: getQuadrant(),
      desiredQuadrant,
      actionSteps,
      aiAnalysis: currentAnalysis
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel} disabled={saving} className="text-slate-500 p-0 hover:bg-transparent">
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
        <fieldset disabled={saving} className="min-w-0">
        {step === 0 && (
          <QuestionnaireStep title="1. Quel sujet d'avenir vous préoccupe ?" description="Personnel, professionnel, sociétal… Identifiez la transformation qui compte le plus pour vous en ce moment.">
            <Textarea value={subject} maxLength={SUBJECT_LIMIT} onChange={(e) => setSubject(e.target.value)} placeholder="Ex. : Réussir mon examen, faire évoluer mon activité ou mieux m'adapter à un changement..." className="min-h-[160px] text-base" />
          </QuestionnaireStep>
        )}
        
        {step === 1 && (
          <QuestionnaireStep title="2. Votre Vision du futur" description="Sur ce sujet précis, percevez-vous un horizon plutôt contraint (sombre) ou désirable (lumineux) ?">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <span className="text-rose-500">Futur contraint</span><span className="text-emerald-500">Futur désirable</span>
              </div>
              <Slider value={[futureAxis]} onValueChange={([v]) => { setFutureAxis(v); setAnswered((previous) => ({ ...previous, future: true })); }} min={-100} max={100} step={1} />
              <div className="text-center mt-8 font-bold text-slate-700">
                {futureAxis === 0 ? "Neutre" : futureAxis > 0 ? `Désirable (+${futureAxis}%)` : `Contraint (${futureAxis}%)`}
              </div>
            </div>
          </QuestionnaireStep>
        )}

        {step === 2 && (
          <QuestionnaireStep title="3. Votre marge de manœuvre" description="Face à ce sujet, dans quelle mesure pouvez-vous influencer la situation, mobiliser de l'aide ou adapter votre manière d'agir ?">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <span className="text-amber-500">Peu de leviers actuellement</span><span className="text-blue-500">Plusieurs leviers concrets</span>
              </div>
              <Slider value={[powerAxis]} onValueChange={([v]) => { setPowerAxis(v); setAnswered((previous) => ({ ...previous, power: true })); }} min={-100} max={100} step={1} />
              <div className="text-center mt-8 font-bold text-slate-700">
                {powerAxis === 0 ? "Marge intermédiaire" : powerAxis > 0 ? `Marge plutôt forte (+${powerAxis}%)` : `Marge plutôt limitée (${powerAxis}%)`}
              </div>
            </div>
          </QuestionnaireStep>
        )}

        {step === 3 && (
          <QuestionnaireStep title="4. Préparation au changement" description="Cet indice exploratoire aide à structurer votre réflexion ; il ne constitue pas une mesure psychologique ou scientifique validée.">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Clarté de la vision</h3>
                <p className="text-sm text-slate-500 mb-6">Avez-vous une idée précise des étapes à franchir ?</p>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  <span>Vision floue</span><span>Vision très claire</span>
                </div>
                <Slider value={[clarity]} onValueChange={([v]) => { setClarity(v); setAnswered((previous) => ({ ...previous, clarity: true })); }} min={0} max={15} step={1} />
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Ampleur du changement recherché</h3>
                <p className="text-sm text-slate-500 mb-6">Quel niveau d'évolution vous paraît à la fois souhaitable et soutenable dans votre contexte ? Stabiliser une situation peut être un objectif pleinement pertinent.</p>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  <span>Stabiliser</span><span>Transformer en profondeur</span>
            </div>
                <Slider value={[ambition]} onValueChange={([v]) => { setAmbition(v); setAnswered((previous) => ({ ...previous, transformation: true })); }} min={0} max={20} step={1} />
              </div>
            </div>
          </QuestionnaireStep>
        )}

        {step === 4 && (
          <QuestionnaireStep title="5. Votre position actuelle" description="Voici où vous vous situez sur la matrice de votre exploration.">
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
                  <p className="text-sm text-slate-500">Repérez des indices observables qui montrent assez tôt si vous progressez ou vous éloignez de l'objectif.</p>
                  <Textarea value={actionSteps.observe} onChange={(e) => setActionSteps(prev => ({...prev, observe: e.target.value}))} placeholder="Ex. examen : score aux annales, erreurs récurrentes, chapitres maîtrisés, fatigue ou régularité du travail." />
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
              <GuidedSynthesis
                subject={subject} 
                currentQuadrant={getQuadrant()} 
                desiredQuadrant={desiredQuadrant} 
                actionSteps={actionSteps} 
                analysis={currentAnalysis}
                onAnalysis={(result) => setAiAnalysis({ source: synthesisSource, result })}
              />
            </div>
          </QuestionnaireStep>
        )}
        </fieldset>
      </main>

      <footer className="border-t border-slate-200 bg-white p-4 sticky bottom-0 z-10">
        {saveError && <div role="alert" className="max-w-4xl mx-auto mb-4 text-red-800 bg-red-50 rounded-xl p-3">
          <p>{saveError}</p><p>Vos réponses restent disponibles sur cette page. Ne la fermez pas ; réessayez avec le bouton ci-dessous.</p>
        </div>}
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={prev} disabled={step === 0 || saving} className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <div className="text-right">
              <Button variant="primary" onClick={next} disabled={saving || !canProceed()}>
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {!canProceed() && <p className="text-xs text-slate-500 mt-2">Répondez à cette étape pour continuer.</p>}
            </div>
          ) : (
            <Button variant="primary" onClick={handleSave} disabled={saving || !currentAnalysis} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Enregistrement…" : "Terminer et ouvrir le rapport"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

// A keyed workspace owns private state. Changing accounts unmounts it completely.
const UserWorkspace = ({ user, demo = false, onExit }) => {
  const [view, setView] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [history, setHistory] = useState({ loading: !demo, loadingMore: false, error: '', hasMore: false, offset: 0 });
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const savePending = useRef(false);
  const historyPending = useRef(false);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    listReports(user.id, 0, AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]))
      .then(result => {
        if (controller.signal.aborted) return;
        setSessions(result.reports);
        setHistory({ loading: false, loadingMore: false, error: '', hasMore: result.hasMore, offset: result.reports.length });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setHistory(previous => ({ ...previous, loading: false, error: 'Vos rapports n’ont pas pu être chargés. Réessayez ; un échec de chargement ne signifie pas qu’ils ont été supprimés.' }));
      });
    return () => controller.abort();
  }, [user.id, demo, reload]);

  useEffect(() => {
    if (view !== 'tool') return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [view]);

  const loadMore = async () => {
    if (historyPending.current) return;
    historyPending.current = true;
    setHistory(previous => ({ ...previous, loadingMore: true, error: '' }));
    try {
      const result = await listReports(user.id, history.offset);
      if (!active.current) return;
      setSessions(previous => [...new Map([...previous, ...result.reports].map(report => [report.id, report])).values()]);
      setHistory(previous => ({ ...previous, hasMore: result.hasMore, offset: previous.offset + result.reports.length }));
    } catch {
      if (active.current) setHistory(previous => ({ ...previous, error: 'Les rapports précédents n’ont pas pu être chargés. Réessayez.' }));
    } finally {
      historyPending.current = false;
      if (active.current) setHistory(previous => ({ ...previous, loadingMore: false }));
    }
  };

  const viewReport = (report, shouldPrint = false) => {
    setSelectedSession(report); setAutoPrint(shouldPrint); setView('report');
  };

  const saveSession = async report => {
    if (savePending.current) return;
    savePending.current = true; setSaving(true); setSaveError('');
    try {
      const saved = demo ? { ...report, saved: false } : await saveReport(report, user.id);
      if (!active.current) return;
      setSessions(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
      viewReport(saved);
    } catch (error) {
      if (active.current) setSaveError(reportErrorMessage(error));
    } finally {
      savePending.current = false;
      if (active.current) setSaving(false);
    }
  };

  const logout = async () => {
    if (demo) { onExit(); return; }
    setLogoutBusy(true); setLogoutError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      onExit();
    } catch (error) {
      if (active.current) { setLogoutError(authErrorMessage(error)); setLogoutBusy(false); }
    }
  };

  return <>
    {demo && <div role="status" className="no-print bg-amber-50 border-b border-amber-200 text-amber-900 p-3 text-center text-sm">
      Mode démo : aucun rapport n’est enregistré en ligne. Les réponses disparaissent au rechargement ou à la fermeture de cet onglet.
    </div>}
    {view === 'dashboard' && <Dashboard user={user} sessions={sessions} demo={demo}
      onLogout={logout} logoutBusy={logoutBusy} logoutError={logoutError}
      onNewSession={() => { setSaveError(''); setView('tool'); }} onViewReport={viewReport}
      history={history} onLoadMore={loadMore}
      onRetry={() => { setHistory(previous => ({ ...previous, loading: true, error: '' })); setReload(value => value + 1); }} />}
    {view === 'tool' && <AssessmentTool onSave={saveSession} saving={saving} saveError={saveError}
      onCancel={() => { if (window.confirm('Quitter cette exploration ? Les réponses non enregistrées seront perdues.')) setView('dashboard'); }} />}
    {view === 'report' && <>
      {!demo && <p role="status" className="no-print bg-green-50 text-green-800 p-3 text-center">Rapport enregistré dans votre espace personnel.</p>}
      <ReportView session={selectedSession} onBack={() => setView('dashboard')} autoPrint={autoPrint} />
    </>}
  </>;
};

export default function App() {
  const auth = useAuth();
  const [publicView, setPublicView] = useState('landing');
  const exit = () => { auth.clearError(); auth.finishRecovery(); setPublicView('landing'); };
  const startDemo = () => setPublicView('demo');
  if (auth.loading) return <main className="p-10" role="status">Restauration de votre session…</main>;
  if (auth.session && auth.recovering) return <AuthPage recovery onRecovered={auth.finishRecovery} />;
  if (auth.session) {
    const account = auth.session.user;
    const displayName = account.user_metadata?.display_name;
    const user = { id: account.id, name: typeof displayName === 'string' && displayName.trim() ? displayName.trim().slice(0, 100) : account.email?.split('@')[0] || 'Utilisateur' };
    return <UserWorkspace key={user.id} user={user} onExit={exit} />;
  }
  if (publicView === 'demo') return <UserWorkspace key="demo" user={{ id: 'demo', name: 'Utilisateur Démo' }} demo onExit={exit} />;
  if (publicView === 'auth' || auth.error || auth.recovering) {
    return <AuthPage onBack={exit} onDemo={startDemo}
      initialError={auth.error || (auth.recovering ? 'Ce lien ne permet pas de réinitialiser votre mot de passe. Demandez un nouveau lien.' : '')} />;
  }
  return <LandingPage onNavigate={setPublicView} onDemo={startDemo} />;
}
