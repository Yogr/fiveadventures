'use client';

import { motion } from 'framer-motion';
import type { AdventureOutcome, Character } from '@/lib/types';
import AnimatedText from '@/components/ui/animated-text';
import { useAdventure } from '../AdventureContext';

interface PreCombatViewProps {
  outcome: AdventureOutcome;
  character: Character;
}

const PreCombatView: React.FC<PreCombatViewProps> = ({
  outcome,
  character
}) => {
  const { dispatch } = useAdventure();
  
  const handleBeginCombat = () => {
    // Set the show combat flag to true to start combat
    dispatch({ type: 'SET_SHOW_PRE_COMBAT', payload: false });
    dispatch({ type: 'SET_SHOW_COMBAT', payload: true });
  };
  
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      <h2 className="text-3xl mb-4 text-amber-400">
        Encounter!
      </h2>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-md">
        <AnimatedText
          text={outcome.description}
          className="text-xl mb-4"
          speed={80}
        />
      </div>
      
      <motion.div 
        className="flex justify-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <button 
          onClick={handleBeginCombat} 
          className="pixel-button text-xl bg-red-700 hover:bg-red-600 active:bg-red-800"
        >
          Begin Combat
        </button>
      </motion.div>
    </div>
  );
};

export default PreCombatView;
