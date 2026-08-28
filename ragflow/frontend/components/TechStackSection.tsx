const TechStackSection = () => {
  const technologies = [
    "LangChain",
    "FastAPI", 
    "React",
    "Supabase",
    "Modern Vector Databases",
  ];

  return (
    <section className="section-padding">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8">
          Engineered on Proven Infrastructure
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {technologies.map((tech) => (
            <span 
              key={tech} 
              className="px-5 py-2.5 rounded-full border border-border text-muted-foreground hover:border-muted-foreground/50 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
        
        <p className="text-muted-foreground">
          No magic. Just solid systems.
        </p>
      </div>
    </section>
  );
};

export default TechStackSection;
