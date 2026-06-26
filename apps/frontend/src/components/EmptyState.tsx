import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  const { t } = useTranslation();
  const displayMessage = message || t('common.noResults');

  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border border-border">
        <SearchX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{t('common.noResults')}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{displayMessage}</p>
    </div>
  );
}
