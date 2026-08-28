import { motion } from "framer-motion";

const AnimatedText = ({ 
  text, 
  className = "",
  delay = 0,
  staggerDelay = 0.03
}: { 
  text: string; 
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) => {
  const words = text.split(" ");
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.4,
                delay: delay + (wordIndex * word.length + charIndex) * staggerDelay,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};

const HighlightedText = ({ 
  text, 
  delay = 0 
}: { 
  text: string; 
  delay?: number;
}) => {
  return (
    <span className="relative inline-block">
      <AnimatedText 
        text={text} 
        className="font-medium text-foreground relative z-10"
        delay={delay}
        staggerDelay={0.04}
      />
      <motion.span
        className="absolute inset-0 bg-foreground/10 rounded-lg -mx-2 -my-1 px-2 py-1"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration: 0.6, 
          delay: delay + 0.3,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        style={{ originX: 0 }}
      />
    </span>
  );
};

const PhilosophySection = () => {
  return (
    <section className="section-padding">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed">
          <AnimatedText 
            text="RagFlow is not a chatbot builder." 
            className="text-muted-foreground"
            delay={0}
          />
          <br />
          <br />
          <AnimatedText 
            text="It is an" 
            delay={0.8}
          />{" "}
          <HighlightedText text="intelligence layer" delay={1.0} />
          <br />
          <AnimatedText 
            text="between your data and your users." 
            delay={1.6}
          />
        </p>
        
        <motion.div 
          className="mt-16 flex items-center justify-center gap-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 2.5, duration: 0.6 }}
        >
          <span className="px-4 py-2 border-2 border-foreground/20 rounded-lg text-sm">
            Built with clarity.
          </span>
          <span className="px-4 py-2 border-2 border-foreground/20 rounded-lg text-sm">
            Built for scale.
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default PhilosophySection;
