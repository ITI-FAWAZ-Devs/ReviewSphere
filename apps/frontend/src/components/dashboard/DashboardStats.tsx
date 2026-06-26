import { useTranslation } from 'react-i18next';
import { Clock, GraduationCap, Star, ClipboardList } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    hoursCompleted: string;
    skillsMastered: number;
    avgRating: string;
    pendingTasks: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const { t } = useTranslation();

  const statItems = [
    {
      label: t('dashboard.stats.hoursCompleted'),
      value: stats.hoursCompleted,
      icon: Clock,
      color: 'text-rs-accent',
      bg: 'bg-rs-accent/10',
    },
    {
      label: t('dashboard.stats.skillsMastered'),
      value: stats.skillsMastered,
      icon: GraduationCap,
      color: 'text-purple-400 dark:text-purple-300',
      bg: 'bg-purple-500/10',
    },
    {
      label: t('dashboard.stats.avgRating'),
      value: stats.avgRating,
      icon: Star,
      color: 'text-rs-warning',
      bg: 'bg-rs-warning/10',
    },
    {
      label: t('dashboard.stats.pendingTasks'),
      value: String(stats.pendingTasks).padStart(2, '0'),
      icon: ClipboardList,
      color: 'text-cyan-400 dark:text-cyan-300',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5 font-mono">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
