import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const FinalCTA = () => {
  const router = useRouter();
  
  return (
    <section className="section-padding py-32 md:py-40">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <div className="w-14 h-14 rounded-full border-2 border-foreground/20 flex items-center justify-center">
            <span className="text-xl font-semibold">R</span>
          </div>
        </motion.div>
        
        {/* Headline with letter animation */}
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-12 leading-tight"
        >
          Turn Knowledge Into
          <br />
          Intelligence.
        </motion.h2>
        
        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            variant="hero" 
            size="xl"
            className="min-w-[180px] rounded-lg"
            onClick={() => router.push('/contact?source=waitlist')}
          >
            Join the Waitlist
          </Button>
          <Button 
            variant="heroOutline" 
            size="xl"
            className="min-w-[180px] rounded-lg"
            onClick={() => router.push('/contact?source=contact')}
          >
            Talk to Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
