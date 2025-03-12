import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { lilgrotesk } from "@/lib/fonts";

interface IOSLogoProps {
  className?: string;
}

export function IOSLogo({ className }: IOSLogoProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Capitalize first letters of crawl and metric
  const text = "Crawl";
  const text2 = "Metric";
  
  // Animation variants for each letter
  const letterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1], // Custom easing for handwritten feel
      },
    }),
  };

  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <div className="relative flex items-center">
        <div className="flex items-baseline">
          {/* Letter by letter animation for Crawl */}
          <div className="flex">
            {text.split("").map((letter, i) => (
              <motion.span
                key={`crawl-${letter}-${i}`}
                custom={i}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={letterVariants}
                className={`text-[#06c] text-2xl font-bold ${lilgrotesk.className}`}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          
          {/* Letter by letter animation for Metric */}
          <div className="flex">
            {text2.split("").map((letter, i) => (
              <motion.span
                key={`metric-${letter}-${i}`}
                custom={i + text.length} // Continue delay from where first word left off
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={letterVariants}
                className={`text-[#06c] text-2xl font-bold ${lilgrotesk.className}`}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className={`ml-1 text-xs text-[#06c] font-medium align-super ${lilgrotesk.className}`}
          >
            beta
          </motion.span>
        </div>
      </div>
    </Link>
  );
}
