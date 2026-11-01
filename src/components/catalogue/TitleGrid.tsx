import type { Title } from '@/lib/types';
import { TitleCard } from '@/components/catalogue/TitleCard';

export function TitleGrid({ titles }: { titles: Title[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {titles.map((title) => (
        <TitleCard key={title.id} title={title} />
      ))}
    </div>
  );
}
