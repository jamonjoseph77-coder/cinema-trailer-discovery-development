import { Radio, Ticket } from 'lucide-react';
import { EmptyState } from '@/components/ui/StatusViews';
import { BUTTON_SECONDARY, PAGE_CONTAINER } from '@/components/ui/styles';
import type { ComingSoonSection } from '@/lib/router';

const SECTIONS: Record<ComingSoonSection, { title: string; intro: string; planned: string[]; icon: typeof Ticket }> = {
  'box-office': {
    title: 'Digital Box Office',
    intro: 'Rent and buy new releases directly from Cinema.',
    planned: ['Rentals and purchases', 'Secure checkout', 'Receipts and purchase history'],
    icon: Ticket,
  },
};

export function ComingSoonPage({ section }: { section: ComingSoonSection }) {
  const config = SECTIONS[section];
  const Icon = config.icon;

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <EmptyState
        icon={<Icon className="h-7 w-7 text-cinema-300" />}
        title={config.title}
        description={`${config.intro} This section is not connected yet, so nothing is simulated here.`}
        action={
          <a href="/" className={BUTTON_SECONDARY}>
            <Radio className="h-4 w-4" /> Back to Home
          </a>
        }
      />
      <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-ink-850/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cinema-300">Status: in development</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
          {config.planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
