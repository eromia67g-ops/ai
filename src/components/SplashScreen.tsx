import React from 'react';
import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  React.useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-700 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]">
          <Bot size={64} className="text-white" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500 rounded-[2rem] blur-2xl -z-10"
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tighter text-white">
          Emu<span className="text-blue-500">.ai</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 uppercase tracking-[0.3em] font-medium">
          Futuristic Intelligence
        </p>
      </motion.div>

      <div className="absolute bottom-12">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
