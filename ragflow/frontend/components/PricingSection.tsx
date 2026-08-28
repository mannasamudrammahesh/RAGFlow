import { Button } from "@/components/ui/button";

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding bg-card/50">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-2xl md:text-3xl font-light leading-relaxed mb-8">
          Pay for what you use.
          <br />
          Scale when you need.
          <br />
          <span className="text-muted-foreground">No surprises.</span>
        </p>
        
        <Button variant="heroOutline" size="lg">
          Request Pricing
        </Button>
      </div>
    </section>
  );
};

export default PricingSection;
