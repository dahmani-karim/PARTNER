import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import '../pages/Admin/UserAdministration.scss';

export default function AdminBackLink() {
  const { t } = useTranslation();
  return <Link className="admin-back-link" to="/admin" aria-label={t('Administration')}>◀️</Link>;
}
