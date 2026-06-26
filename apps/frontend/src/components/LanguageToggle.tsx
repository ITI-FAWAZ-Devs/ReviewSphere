import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="relative h-9 w-9"
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold leading-none text-muted-foreground">
        {i18n.language === 'ar' ? 'EN' : 'عر'}
      </span>
    </Button>
  );
}
