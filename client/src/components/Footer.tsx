
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-background border-t border-secondary py-10 relative overflow-hidden"
    >
      {/* Optional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-accent/5 to-primary/5 -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-foreground/60">
        <p>&copy; 2025 Rehnuma. All rights reserved.</p>
        <nav className="flex gap-6">
          <a href="#features" className="hover:text-primary transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-primary transition-colors">
            Pricing
          </a>
          <a
            href="mailto:faizanshaikh9262@gmail.com"
            className="hover:text-primary transition-colors"
          >
            Contact
          </a>
        </nav>
      </div>
    </motion.footer>
  );
}
