import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black text-rs-accent/20 mb-2 font-mono">
        {t('notFound.code')}
      </p>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {t('notFound.title')}
      </h1>
      <p className="text-muted-foreground text-sm max-w-md mb-8">
        {t('notFound.message')}
      </p>
      <Button asChild className="bg-rs-accent hover:bg-rs-accent-hover text-white rounded-xl">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('notFound.goHome')}
        </Link>
      </Button>
    </div>
  );
}
