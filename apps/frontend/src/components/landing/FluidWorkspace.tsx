import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/* ── Activity item data ─────────────────────────────────────── */
const ACTIVITY_ITEMS = [
  {
    color: 'bg-landing-primary',
    label: 'SESSION COMPLETED',
    labelClass: 'text-primary-fixed-dim',
    text: 'Refactoring legacy React code with Alex',
  },
  {
    color: 'bg-landing-secondary',
    label: 'NEW RESOURCE',
    labelClass: 'text-secondary-fixed-dim',
    text: '"Advanced Postgres Indexing" shared by Elena',
  },
  {
    color: 'bg-outline-variant',
    label: 'SCHEDULED',
    labelClass: 'text-muted-foreground',
    text: 'Mock Architecture Interview - Friday',
    dimmed: true,
  },
] as const;

interface ActivityItemProps {
  color: string;
  label: string;
  labelClass: string;
  text: string;
  dimmed?: boolean;
}

/* ── ActivityItem ───────────────────────────────────────────── */
function ActivityItem({ color, label, labelClass, text, dimmed }: ActivityItemProps) {
  return (
    <div className={`flex gap-3 ${dimmed ? 'opacity-50' : ''}`}>
      <div className={`w-1 ${color} rounded-full shrink-0`} />
      <div>
        <p className={`text-xs font-medium tracking-wider uppercase ${labelClass}`}>{label}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

/* ── FluidWorkspace ─────────────────────────────────────────── */
export function FluidWorkspace() {
  return (
    <section className="py-8 max-w-7xl mx-auto px-6">
      {/* Section header */}
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-semibold tracking-tight text-on-background dark:text-inverse-on-surface">
          The Fluid Workspace
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          A workspace designed for precision, clarity, and growth.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* AI Discovery Engine — large card */}
        <div className="md:col-span-8">
          <Card className="glass-card h-full border-0 hover:border-landing-primary/50 transition-colors duration-500">
            <CardContent className="p-8 flex flex-col justify-between h-full">
              <div>
                <span className="material-symbols-outlined text-primary-fixed-dim text-4xl mb-4 block">
                  neurology
                </span>
                <CardTitle className="text-xl text-on-background dark:text-inverse-on-surface mb-2">
                  AI Discovery Engine
                </CardTitle>
                <p className="text-sm text-muted-foreground max-w-md">
                  Our neural network matches you with mentors based on your actual
                  GitHub contributions, technical stack, and learning velocity.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <Badge className="bg-landing-primary/20 text-primary-fixed-dim border-0 hover:bg-landing-primary/30">
                  Stack Alignment: 98%
                </Badge>
                <Badge className="bg-landing-secondary/20 text-secondary-fixed-dim border-0 hover:bg-landing-secondary/30">
                  Velocity Prediction
                </Badge>
                <Badge className="bg-tertiary-container/20 text-tertiary-fixed-dim border-0 hover:bg-tertiary-container/30">
                  Soft-Skill Sync
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stream — side card */}
        <div className="md:col-span-4">
          <Card className="glass-card h-full border-dashed border-outline-variant/30">
            <CardHeader>
              <CardTitle className="text-lg text-on-background dark:text-inverse-on-surface">
                Activity Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ACTIVITY_ITEMS.map((item) => (
                <ActivityItem key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Code Evaluation — full-width card */}
        <div className="md:col-span-12">
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <CardTitle className="text-xl text-on-background dark:text-inverse-on-surface mb-2">
                    Interactive Code Evaluation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Collaborate in real-time with our embedded studio. Mentors can
                    leave architectural annotations directly in your codebase.
                  </p>
                  <button className="mt-4 flex items-center gap-2 text-primary-fixed-dim text-xs font-medium hover:gap-3 transition-all">
                    SEE STUDIO DEMO
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>

                <div className="md:w-1/2 w-full h-64 glass-card border-outline-variant/20 rounded-xl p-4 overflow-hidden text-xs text-blue-300 font-mono">
                  <pre>
                    <code>
                      <span className="text-pink-400">async function</span>{' '}
                      <span className="text-yellow-300">optimizePipeline</span>(data) {'{\n'}
                      {'  '}<span className="text-primary-fixed-dim">// Mentor feedback: Consider using a worker thread here</span>{'\n'}
                      {'  '}<span className="text-pink-400">return</span> data.map(item =&gt; ({'{\n'}
                      {'    '}...item,{'\n'}
                      {'    '}processed: <span className="text-green-300">true</span>{'\n'}
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
