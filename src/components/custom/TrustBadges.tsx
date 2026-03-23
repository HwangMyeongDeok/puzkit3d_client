import { Droplets, TreePine, Cog, Zap } from 'lucide-react';

const BADGES = [
  {
    icon: Droplets,
    title: 'No Glue Needed',
    description: 'No glue required',
  },
  {
    icon: TreePine,
    title: 'Eco-friendly Wood',
    description: 'Environmentally friendly wood',
  },
  {
    icon: Cog,
    title: 'Self Assembly',
    description: 'Fully self-assembled',
  },
  {
    icon: Zap,
    title: 'Mechanical Motion',
    description: 'Real mechanical movement',
  },
];

export default function TrustBadges() {
  return (
    <section className="border-border bg-card/50 border-y">
      <div className="container-custom py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((badge) => (
            <div
              key={badge.title}
              className="hover:bg-secondary/50 flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
            >
              <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <badge.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">{badge.title}</p>
                <p className="text-muted-foreground text-xs">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
