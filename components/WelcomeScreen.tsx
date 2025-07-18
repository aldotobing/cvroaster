'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, FileText, CheckCircle, Shield } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'AI-Powered CV Review',
    description: 'Get instant, detailed feedback on your resume'
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Actionable Insights',
    description: 'Receive specific recommendations to improve your CV'
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Stand Out',
    description: 'Increase your chances of landing interviews'
  }
];

export default function WelcomeScreen({ onStart = () => {} }) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (!isMobile) return;
    
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isMobile]);
  
  const handleStart = () => {
    setIsVisible(false);
    setTimeout(onStart, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800 flex flex-col min-h-screen overflow-y-auto z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(148,163,184,0.15)_1px,_transparent_0)] [background-size:24px_24px]"></div>
          </div>
          
          {/* Main content container */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-6xl w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mr-3">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                  CV Roaster
                </h1>
              </div>
              
              {/* Subtitle */}
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 lg:mb-12 text-slate-600 leading-relaxed px-4 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Transform Your Resume into an Interview Magnet
              </motion.p>
              
              {/* Features grid */}
              <motion.div 
                className="mb-8 sm:mb-10 lg:mb-12 px-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* Mobile: Single feature with fade animation */}
                <div className="md:hidden">
                  <div className="h-48 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFeatureIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg w-full max-w-sm mx-auto"
                      >
                        <div className="text-blue-600 mb-4 flex justify-center">
                          <div className="p-3 rounded-xl bg-blue-50">
                            {features[currentFeatureIndex].icon}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-3 text-center text-slate-800">
                          {features[currentFeatureIndex].title}
                        </h3>
                        <p className="text-slate-600 text-base text-center leading-relaxed">
                          {features[currentFeatureIndex].description}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Dots indicator */}
                  <div className="flex justify-center space-x-2 mt-4">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeatureIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentFeatureIndex ? 'bg-blue-600 w-6' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Desktop: All features grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:bg-white/80"
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="text-blue-600 mb-4 flex justify-center sm:justify-start">
                        <div className="p-3 rounded-xl bg-blue-50">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-3 text-center sm:text-left text-slate-800">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-sm sm:text-base text-center sm:text-left leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="flex flex-col items-center space-y-4 px-4"
              >
                <button 
                  onClick={handleStart}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 sm:py-5 sm:px-10 lg:py-6 lg:px-12 text-base sm:text-lg lg:text-xl rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 w-full sm:w-auto max-w-sm backdrop-blur-sm"
                >
                  Get Started - It's Free
                </button>
                <p className="text-slate-500 text-sm sm:text-base font-medium">
                  No signup required. Start in seconds.
                </p>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Security notice */}
          <motion.div 
            className="flex items-center justify-center p-4 sm:p-6 text-slate-500 text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Shield className="w-4 h-4 mr-2 flex-shrink-0 text-slate-600" />
              <span className="text-center font-medium text-slate-600">
                Your CV data is processed securely and never stored
              </span>
            </div>
          </motion.div>
          
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -left-4 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-8 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}