import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, AnimatePresenceProps } from 'framer-motion';
import { Check, FileText, Sparkles, Wand2 } from 'lucide-react';

interface ConfettiProps {
  showConfetti: boolean;
  isDarkMode: boolean;
}

const CheckIcon = () => (
  <motion.div
    className="relative"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 15,
        delay: 0.2
      } 
    }}
  >
    <div className="relative">
      <div className="absolute inset-0 bg-green-400 rounded-full opacity-0 animate-ping" 
           style={{ animationDuration: '1.5s' }} />
      <Check className="w-5 h-5 relative" />
    </div>
  </motion.div>
);

const LoadingAnimation = () => (
  <div className="relative w-5 h-5">
    <Wand2 className="w-full h-full text-indigo-400" />
  </div>
);

const Confetti: React.FC<ConfettiProps> = ({ showConfetti, isDarkMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      setIsLoading(true);
      setShowParticles(true);
      
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      const particlesTimer = setTimeout(() => {
        setShowParticles(false);
      }, 5000); // Increased from 3000ms to 5000ms

      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(particlesTimer);
      };
    }
  }, [showConfetti]);

  // Floating particles
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    size: 4 + Math.random() * 8,
  }));

  return (
    <AnimatePresence>
      {showConfetti && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main Notification */}
          <motion.div
            className={`relative px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 ${
              isDarkMode
                ? 'bg-gray-800/95 text-white backdrop-blur-sm'
                : 'bg-white/95 text-gray-800 border border-gray-100 backdrop-blur-sm'
            }`}
            initial={{ y: 20, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 500, 
              damping: 30,
              opacity: { duration: 0.4 }
            }}
          >
            <motion.div 
              className="relative"
              animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: 'reverse' 
              }}
            >
                <LoadingAnimation />
            </motion.div>
            
            {!isLoading && (
              <motion.div
                className="ml-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring',
                  delay: 0.3,
                  stiffness: 500,
                  damping: 15
                }}
              >
                <CheckIcon />
              </motion.div>
            )}
          </motion.div>

          {/* Floating Particles */}
          {showParticles && (
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full bg-indigo-400/30"
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    left: `${particle.x}%`,
                    top: '50%',
                  }}
                  initial={{ y: 0, x: 0, opacity: 0 }}
                  animate={{
                    y: [-20, -150],
                    x: [
                      0,
                      Math.random() > 0.5 
                        ? Math.random() * 50 
                        : -Math.random() * 50
                    ],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0.5],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: 'easeOut',
                    opacity: { duration: particle.duration * 0.6 },
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(Confetti);
