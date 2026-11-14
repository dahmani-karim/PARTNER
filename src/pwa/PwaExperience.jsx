import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { pwaConfig } from './config';
import {
  subscribe, getSnapshot, isIOS, isAuthRoute, reminderDue,
  openInstall, closeInstall, install, checkForUpdate, applyUpdate,
} from './runtime';
import './pwa.css';

const messages = {
  fr: {
    installTitle: `Installer ${pwaConfig.name}`,
    description: "Retrouvez votre application depuis l'écran d'accueil ou le bureau, dans sa propre fenêtre.",
    install: "Installer l'application", later: 'Plus tard', close: 'Fermer',
    installed: 'Application installée dans ce navigateur', help: "Installation et aide",
    ios: "Sur iPhone ou iPad, ouvrez cette page dans Safari, touchez Partager, puis « Sur l'écran d'accueil » et confirmez Ajouter.",
    manual: "Si votre navigateur le propose, utilisez son menu « Installer l'application » ou « Ajouter à l'écran d'accueil ». Sinon, ouvrez ce site dans un navigateur compatible, par exemple Chrome ou Edge sur Android ou ordinateur.",
    readyTitle: 'Une mise à jour est prête', readyText: "Elle sera appliquée uniquement lorsque vous le déciderez.",
    update: 'Mettre à jour', confirm: "L'application va se recharger. Enregistrez vos saisies et terminez toute activité en cours avant de continuer.",
    panel: 'Application et mises à jour', version: 'Version chargée', check: 'Rechercher une mise à jour',
    checking: 'Vérification en cours…', downloading: 'Téléchargement en cours…',
    applying: 'Application de la mise à jour…', current: 'Aucune nouvelle mise à jour détectée.',
    offlineReady: 'Application disponible hors ligne pour les contenus mis en cache.',
    ready: 'Nouvelle version prête à être appliquée.',
    offline: 'Vous êtes hors ligne. Reconnectez-vous pour vérifier les mises à jour.',
    registrationError: "Le service de mise à jour est indisponible. Rechargez la page pour réessayer.",
    checkError: "La vérification a échoué. Vérifiez votre connexion puis réessayez.",
    downloadError: "Le téléchargement a échoué. Réessayez la vérification.",
    activationError: "La mise à jour n'a pas pu être activée. Réessayez ou fermez puis rouvrez l'application après sauvegarde.",
    updateUnavailable: "Cette mise à jour n'est plus en attente. Relancez une vérification.",
    installUnavailable: "L'installation automatique n'est pas disponible. Suivez les instructions ci-dessous.",
    installError: "L'installation n'a pas abouti. Réessayez depuis le menu de votre navigateur.",
    storageError: "Votre préférence d'installation n'a pas pu être enregistrée.",
    development: 'Les mises à jour se testent avec un build de production et le serveur preview.',
    local: 'Développement local',
  },
  en: {
    installTitle: `Install ${pwaConfig.name}`,
    description: 'Open your app from your home screen or desktop, in its own window.',
    install: 'Install application', later: 'Later', close: 'Close',
    installed: 'Application installed in this browser', help: 'Installation and help',
    ios: 'On iPhone or iPad, open this page in Safari, tap Share, then Add to Home Screen and confirm Add.',
    manual: 'If available, use Install app or Add to Home Screen in your browser menu. Otherwise, open this site in a compatible browser, such as Chrome or Edge on Android or desktop.',
    readyTitle: 'An update is ready', readyText: 'It will only be applied when you choose.',
    update: 'Update now', confirm: 'The application will reload. Save your changes and finish any current activity before continuing.',
    panel: 'Application and updates', version: 'Loaded version', check: 'Check for updates',
    checking: 'Checking…', downloading: 'Downloading…', applying: 'Applying update…',
    current: 'No new update detected.', offlineReady: 'Cached content is available offline.',
    ready: 'A new version is ready to apply.', offline: 'You are offline. Reconnect to check for updates.',
    registrationError: 'The update service is unavailable. Reload the page to try again.',
    checkError: 'Update check failed. Check your connection and try again.',
    downloadError: 'Download failed. Check for updates again.',
    activationError: 'The update could not be activated. Try again, or save your work and reopen the app.',
    updateUnavailable: 'This update is no longer waiting. Check again.',
    installUnavailable: 'Automatic installation is unavailable. Follow the instructions below.',
    installError: 'Installation failed. Try from your browser menu.',
    storageError: 'Your installation preference could not be saved.',
    development: 'Test updates using a production build and the preview server.',
    local: 'Local development',
  },
};

function usePwa(language) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const locale = language || 'fr';
  const text = messages[locale?.startsWith('en') ? 'en' : 'fr'];
  return { ...state, text };
}

function UpdateButton({ state }) {
  return (
    <button type="button" className="cavern-pwa__primary" disabled={state.applying}
      onClick={() => { if (window.confirm(state.text.confirm)) applyUpdate(); }}>
      {state.applying ? state.text.applying : state.text.update}
    </button>
  );
}

export default function PwaExperience({ language }) {
  const state = usePwa(language);
  const { text } = state;
  const dialog = useRef(null);
  const [route, setRoute] = useState(window.location.hash);
  const [hiddenUpdate, setHiddenUpdate] = useState(false);
  useEffect(() => {
    const changed = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  useEffect(() => {
    if (state.installed || isAuthRoute() || (!state.canPrompt && !isIOS()) || !reminderDue()) return;
    const timer = setTimeout(openInstall, 5000);
    return () => clearTimeout(timer);
  }, [state.installed, state.canPrompt, route]);
  const visible = state.installOpen && !state.installed && !isAuthRoute();
  useEffect(() => {
    if (visible && !dialog.current.open) dialog.current.showModal();
    else if (!visible && dialog.current.open) dialog.current.close();
  }, [visible]);

  return (
    <div className="cavern-pwa" style={{ '--pwa-accent': pwaConfig.color }}>
      <dialog ref={dialog} className="cavern-pwa__dialog" aria-labelledby="pwa-install-title"
        onCancel={event => { event.preventDefault(); closeInstall(); }}>
        <button type="button" className="cavern-pwa__close" onClick={closeInstall} aria-label={text.close}>×</button>
        <img src={pwaConfig.icon} width="72" height="72" alt="" className="cavern-pwa__icon" />
        <h2 id="pwa-install-title">{text.installTitle}</h2>
        <p>{text.description}</p>
        {state.canPrompt
          ? <button type="button" className="cavern-pwa__primary" onClick={install}>{text.install}</button>
          : <p className="cavern-pwa__instructions">{isIOS() ? text.ios : text.manual}</p>}
        {state.error && <p role="alert">{text[state.error]}</p>}
        <button type="button" className="cavern-pwa__secondary" onClick={closeInstall}>{text.later}</button>
      </dialog>
      {state.ready && !hiddenUpdate && (
        <section className="cavern-pwa__update" aria-label={text.readyTitle}>
          <strong role="status">{text.readyTitle}</strong>
          <p>{text.readyText}</p>
          {state.error && <p role="alert">{text[state.error]}</p>}
          <UpdateButton state={state} />
          <button type="button" className="cavern-pwa__secondary" onClick={() => setHiddenUpdate(true)}>{text.later}</button>
        </section>
      )}
    </div>
  );
}

export function PwaSettings({ language }) {
  const state = usePwa(language);
  const { text } = state;
  return (
    <section className="cavern-pwa cavern-pwa__settings" style={{ '--pwa-accent': pwaConfig.color }} aria-label={text.panel}>
      <h2>{text.panel}</h2>
      <p>{text.version} : <code>{import.meta.env.VITE_PWA_BUILD || text.local}</code></p>
      {state.installed ? <p>{text.installed}</p>
        : <button type="button" className="cavern-pwa__secondary" onClick={openInstall}>{state.canPrompt ? text.install : text.help}</button>}
      <button type="button" className="cavern-pwa__secondary" disabled={state.checking || state.applying}
        onClick={() => checkForUpdate(true)}>{text.check}</button>
      {state.ready && <UpdateButton state={state} />}
      {state.status && <p role="status">{text[state.status]}</p>}
      {state.error && <p role="alert">{text[state.error]}</p>}
    </section>
  );
}
