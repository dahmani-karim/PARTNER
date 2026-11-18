import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import styles from './StatusBadge.module.scss';
import { PARTNER_STATUS, APPLICATION_STATUS, VIDEO_STATUS } from '../../config/apps';
const STATUS_MAPS = {
  partner: PARTNER_STATUS,
  application: APPLICATION_STATUS,
  video: VIDEO_STATUS
};
const StatusBadge = ({
  status,
  type = 'partner'
}) => {
  useTranslation();
  const map = STATUS_MAPS[type] || PARTNER_STATUS;
  const info = map[status] || {
    label: status,
    icon: '•'
  };
  return <span className={`${styles.badge} ${styles[status] || ''}`}>
      {info.icon} {translate(info.label)}
    </span>;
};
export default StatusBadge;
