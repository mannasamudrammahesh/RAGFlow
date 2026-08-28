import { Code, Rocket, Building2 } from "lucide-react";

const PersonaGrid = () => {
  const personas = [
    {
      icon: Code,
      title: "Developers",
      points: ["Full pipeline control", "API-first design", "No black boxes"],
    },
    {
      icon: Rocket,
      title: "Startups",
      points: ["Launch AI features fast", "Predictable costs", "Scale without re-architecture"],
    },
    {
      icon: Building2,
      title: "Enterprises",
      points: ["Secure data isolation", "Multiple chatbots", "Org-level control"],
    },
  ];

  return (
    <section className="section-padding bg-card/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          Who It's For
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Built for teams that take AI seriously.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((persona, index) => (
            <div key={index} className="bento-card">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
                <persona.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{persona.title}</h3>
              <ul className="space-y-3">
                {persona.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonaGrid;
