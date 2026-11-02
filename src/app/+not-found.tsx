import { Gone } from '@/components/gone';
import { useStore } from '@/store/store';

export default function NotFound() {
  const { t } = useStore();
  return <Gone title={t('notFoundTitle')} body={t('notFoundBody')} icon="mapPin" />;
}
