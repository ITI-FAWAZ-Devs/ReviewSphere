import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ChevronRight } from 'lucide-react';

interface ActivityItemProps {
  color: string;
  label: string;
  labelClass: string;
  text: string;
  dimmed?: boolean;
}

function ActivityItem({ color, label, labelClass, text, dimmed }: ActivityItemProps) {
  return (
    <div className={`flex gap-3 ${dimmed ? 'opacity-50' : ''}`}>
      <div className={`w-1 ${color} rounded-full shrink-0`} />
      <div>
        <p className={`text-xs font-semibold tracking-wider uppercase ${labelClass}`}>{label}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

export function FluidWorkspace() {
  const { t } = useTranslation();

  const activityItems = [
    {
      color: 'bg-rs-accent',
      label: 'SESSION COMPLETED',
      labelClass: 'text-rs-accent',
      text: 'Refactoring legacy React code with Alex',
    },
    {
      color: 'bg-purple-500',
      label: 'NEW RESOURCE',
      labelClass: 'text-purple-400',
      text: '"Advanced Postgres Indexing" shared by Elena',
    },
    {
      color: 'bg-border',
      label: 'SCHEDULED',
      labelClass: 'text-muted-foreground',
      text: 'Mock Architecture Interview - Friday',
      dimmed: true,
    },
  ];

  return (
    <section className="py-8 max-w-7xl mx-auto px-6">
      {/* Section header */}
      <div className="mb-8 text-center lg:text-start">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t('landing.workspace.title')}
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          {t('landing.workspace.subtitle')}
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* AI Discovery Engine — large card */}
        <div className="md:col-span-8">
          <Card className="bg-card border border-border h-full hover:border-rs-accent/50 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md">
            <CardContent className="p-8 flex flex-col justify-between h-full">
              <div>
                <Brain className="text-rs-accent w-10 h-10 mb-4 block" />
                <CardTitle className="text-xl text-foreground mb-2">
                  AI Discovery Engine
                </CardTitle>
                <p className="text-sm text-muted-foreground max-w-md">
                  Our neural network matches you with mentors based on your actual
                  GitHub contributions, technical stack, and learning velocity.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <Badge className="bg-rs-accent/15 text-rs-accent border-0 hover:bg-rs-accent/25 font-mono">
                  Stack Alignment: 98%
                </Badge>
                <Badge className="bg-purple-500/15 text-purple-400 border-0 hover:bg-purple-500/25 font-mono">
                  Velocity Prediction
                </Badge>
                <Badge className="bg-cyan-500/15 text-cyan-400 border-0 hover:bg-cyan-500/25 font-mono">
                  Soft-Skill Sync
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stream — side card */}
        <div className="md:col-span-4">
          <Card className="bg-card border border-dashed border-border h-full rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">
                Activity Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activityItems.map((item) => (
                <ActivityItem key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Code Evaluation — full-width card */}
        <div className="md:col-span-12">
          <Card className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <CardTitle className="text-xl text-foreground mb-2">
                    Interactive Code Evaluation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Collaborate in real-time with our embedded studio. Mentors can
                    leave architectural annotations directly in your codebase.
                  </p>
                  <button className="mt-4 flex items-center gap-2 text-rs-accent text-xs font-bold hover:gap-3 transition-all">
                    SEE STUDIO DEMO
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="md:w-1/2 w-full h-64 bg-muted border border-border rounded-xl p-4 overflow-hidden text-xs text-foreground font-mono">
                  <pre>
                    <code>
                      <span className="text-pink-500 dark:text-pink-400">async function</span>{' '}
                      <span className="text-yellow-600 dark:text-yellow-300">optimizePipeline</span>(data) {'{\n'}
                      {'  '}<span className="text-muted-foreground font-mono">// Mentor feedback: Consider using a worker thread here</span>{'\n'}
                      {'  '}<span className="text-pink-500 dark:text-pink-400">return</span> data.map(item =&gt; ({'{\n'}
                      {'    '}...item,{'\n'}
                      {'    '}processed: <span className="text-rs-success">true</span>{'\n'}
                      {'  '}{'}'}))){'\n'}
                      {'}'}
                    </code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
