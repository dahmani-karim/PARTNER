import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { ECOSYSTEM_APPS, getAppUrl } from '../../config/ecosystem';
import { useTranslation } from '../../i18n';

export default function Access() {
  const { t, locale } = useTranslation();
  const entitlements = useAuthStore(s => s.entitlements);
  const accessError = useAuthStore(s => s.accessError);
  const refresh = useAuthStore(s => s.syncEntitlements);
  const [busy, setBusy] = useState(false);
  const status = entitlements?.status;
  const gift = entitlements?.reason === 'partner' || status === 'vip';
  const offer = gift ? 'Freemium' : ({ premium: 'Premium', complete: 'Pack Complet', team: 'Équipe' })[status] || 'Freemium';
  const periodEnd = entitlements?.subscription?.currentPeriodEnd;
  return <section className="account-access">
    <h2>{t('Mon accès')}</h2>
    <p>{t('Le programme PARTNER est gratuit. Aucun abonnement n’est nécessaire pour candidater.')}</p>
    {accessError && <p role="alert">{t(accessError)}</p>}
    {entitlements && <>
      <p>{t('Offre du compte')} : {t(offer)}</p>
      {gift && <p>{t('Accès offert, sans abonnement supplémentaire.')}</p>}
      {entitlements.selectedApp && <p>{t('Application Premium sélectionnée')} : {ECOSYSTEM_APPS.find(app => app.id === entitlements.selectedApp)?.name || entitlements.selectedApp}</p>}
      {entitlements.organization && <p>{t('Équipe')} : {entitlements.organization.name} · {entitlements.organization.role}</p>}
      {periodEnd && <p>{t(entitlements.subscription.cancelAtPeriodEnd ? 'Actif jusqu’au {date}' : 'Prochain renouvellement le {date}', { date: new Date(periodEnd).toLocaleDateString(locale) })}</p>}
      <ul>{ECOSYSTEM_APPS.filter(app => app.id !== 'partner').map(app => {
        const grant = entitlements.apps?.[app.id];
        const reason = ({ vip: 'VIP', vip_app: 'VIP', partner: 'Partner', partner_app: 'Partner', complete: 'Pack Complet', team: 'Équipe', premium_selected: 'Premium', always_free: 'Gratuit' })[grant?.reason];
        return <li key={app.id}><a href={getAppUrl(app)} target="_blank" rel="noopener noreferrer">{app.name}</a> : {t(grant?.premium ? reason || 'Premium' : 'Freemium')}</li>;
      })}</ul>
    </>}
    <div className="account-links"><button className="partner-btn" disabled={busy} onClick={async () => {
      setBusy(true);
      try { await refresh(); } catch { /* Displayed by accessError. */ } finally { setBusy(false); }
    }}>{t('Actualiser mes accès')}</button></div>
  </section>;
}
