import { useState } from 'react';
import { useTranslation } from '../../i18n';
import api from '../../services/adminApi';
import useQuotaConfig from '../../hooks/useQuotaConfig';
import './QuotaSettings.scss';
import { Link } from 'react-router-dom';
import './UserAdministration.scss';

const RESOURCES = { households: 'Foyers administrés', gardens: 'Potagers possédés', animals: 'Animaux', incubations: 'Incubations actives', sources: 'Sources suivies', trackers: 'Trackers', zones: 'Zones surveillées', dossiers: 'Dossiers personnels' };
export default function QuotaSettings() {
  const { t } = useTranslation();
  const { config, loading, error: loadError, refresh } = useQuotaConfig();
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const edit = (app, resource, tier, value) => {
    setSaved(false);
    setDraft(previous => {
      const next = structuredClone(previous || config);
      next.apps[app][resource][tier] = value;
      return next;
    });
  };
  const submit = async event => {
    event.preventDefault();
    if (!draft || busy || !window.confirm(t('Appliquer ces quotas à tous les comptes ? Les foyers et potagers excédentaires seront gelés sans suppression.'))) return;
    setBusy(true); setError(''); setSaved(false);
    try {
      await api.put('/admin/quota-config', { apps: draft.apps, revision: draft.revision });
      await refresh();
      setDraft(null); setSaved(true);
    } catch (failure) { setError(failure.response?.data?.error?.message || failure.message); }
    finally { setBusy(false); }
  };
  return <section className="quota-settings admin-page">
    <h1>{t('Quotas des applications')}</h1>
    <p>{t('Réglages globaux partagés entre les applications. VIP, Partner, Pack et Équipe utilisent les quotas Premium sur les applications couvertes. Les tarifs et contrôles sont actualisés sous une minute ou au retour sur la fenêtre.')}</p>
    <p>{t('Les foyers administrés et potagers possédés excédentaires sont gelés, sans effacement, en conservant les plus anciens. Un quota relevé les réactive dans la limite disponible. Pour Farmly et LYNX, les données existantes sont conservées et seuls les nouveaux ajouts sont bloqués.')}</p>
    {(loadError || error) && <p role="alert">{t('Impossible de charger ou enregistrer les quotas.')} {error || loadError}</p>}
    {saved && <p role="status">{t('Quotas enregistrés et ressources rééquilibrées.')}</p>}
    <form onSubmit={submit}><fieldset disabled={busy || loading || !!loadError}>
      {Object.entries((draft || config).apps).map(([app, resources]) => <section key={app}>
        <h2>{app === 'smartcellar' ? 'SmartCellar' : app === 'progarden' ? 'ProGarden' : app === 'lynx' ? 'LYNX' : 'Farmly'}</h2>
        {Object.entries(resources).map(([resource, tiers]) => <fieldset className="quota-resource" key={resource}>
          <legend>{t(RESOURCES[resource])}</legend>
          {Object.entries(tiers).map(([tier, value]) => <div key={tier}>
            <label>{tier === 'freemium' ? 'Freemium' : t('Accès Premium (VIP et Partner inclus)')}<input type="number" min="0" max="1000000" step="1" required={value !== null}
              disabled={value === null} value={value === null ? '' : value} onChange={event => edit(app, resource, tier, event.target.value === '' ? '' : Number(event.target.value))} /></label>
            <label className="quota-unlimited"><input type="checkbox" checked={value === null}
              onChange={event => edit(app, resource, tier, event.target.checked ? null : 0)} />{t('Illimité')}</label>
          </div>)}
        </fieldset>)}
      </section>)}
      <button type="submit" disabled={!draft || busy}>{busy ? t('Enregistrement…') : t('Enregistrer les quotas')}</button>
      <button type="button" disabled={busy} onClick={() => { setDraft(null); setSaved(false); refresh().catch(failure => setError(failure.message)); }}>{t('Recharger')}</button>
    </fieldset></form>
    <Link className="admin-back-link" to="/admin" aria-label={t('Administration')}>◀️</Link>
  </section>;
}
