import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Logo from "./Logo";

const Footer = () => {
  const router = useRouter();
  
  const links = [
    { name: "Features", href: "/#features" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "API", href: "/api" },
    { name: "Contact", href: "mailto:hello@ragflow.com" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('mailto:')) {
      return; // Let mailto links work normally
    }
    
    e.preventDefault();
    
    if (href === '/api') {
      router.push('/api');
    } else if (href.startsWith('/#')) {
      const elementId = href.substring(2);
      if (window.location.pathname !== '/') {
        router.push('/');
        setTimeout(() => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="border-t border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-2">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <Logo variant="full" className="h-7" />
            </a>
          </div>
          
          <nav className="flex items-center gap-8">
            {links.map((link, index) => (
              <motion.a 
                key={link.name} 
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
              >
                {link.name}
              </motion.a>
            ))}
          </nav>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 pt-6 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RagFlow. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
