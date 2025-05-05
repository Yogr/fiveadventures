'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Item } from '@/lib/types';
import { ImageSource } from '@/lib/image-source';

interface ItemRewardViewProps {
  item: Item;
  onComplete?: () => void;
}

export default function ItemRewardView({ item, onComplete }: ItemRewardViewProps) {
  const [animationState, setAnimationState] = useState<'chest' | 'chestOpen' | 'item'>('chest');
  const [shakeIntensity, setShakeIntensity] = useState(1);
  
  useEffect(() => {
    // Increase shake intensity over time, but with a more subtle effect
    const intensityInterval = setInterval(() => {
      if (shakeIntensity < 5) {
        setShakeIntensity(prev => prev + 1);
      } else {
        clearInterval(intensityInterval);
        
        // After max intensity, show the open chest briefly
        setTimeout(() => {
          setAnimationState('chestOpen');
          
          // Then show the item after a brief delay
          setTimeout(() => {
            setAnimationState('item');
            if (onComplete) {
              setTimeout(onComplete, 1000);
            }
          }, 500); // Show open chest for half a second
        }, 300);
      }
    }, 500);
    
    return () => clearInterval(intensityInterval);
  }, [shakeIntensity, onComplete]);
  
  // Shake animation variants - reduced intensity
  const shakeVariants = {
    shake: (intensity: number) => ({
      x: [0, -2 * intensity, 2 * intensity, -2 * intensity, 2 * intensity, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    })
  };
  
  // Item reveal animation variants
  const itemContentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };
  
  return (
    <div className="flex justify-center items-center my-4">
      <AnimatePresence mode="wait">
        {/* Closed chest with shake animation */}
        {animationState === 'chest' && (
          <motion.div
            key="chest"
            custom={shakeIntensity}
            variants={shakeVariants}
            animate="shake"
            exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.3 } }}
            className="relative w-24 h-24"
          >
            <Image
              src="/image/ui/chest.png"
              alt="Treasure chest"
              width={96}
              height={96}
              className="object-contain"
            />
          </motion.div>
        )}
        
        {/* Open chest shown briefly */}
        {animationState === 'chestOpen' && (
          <motion.div
            key="chestOpen"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="relative w-24 h-24"
          >
            <Image
              src="/image/ui/chest_open.png"
              alt="Open treasure chest"
              width={96}
              height={96}
              className="object-contain"
            />
          </motion.div>
        )}
        
        {/* Item reveal with background appearing immediately and content fading in */}
        {animationState === 'item' && (
          <motion.div
            key="item"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative flex justify-center items-center">
              {/* Background image - larger, rotating, and semi-transparent */}
              <motion.div
                className="absolute"
                initial={{ opacity: 1 }}
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Image
                  src="/image/ui/item_reward_bg.png"
                  alt="Item background"
                  width={360}
                  height={360}
                  className="object-contain opacity-60"
                />
              </motion.div>
              
              {/* Item icon and text fade in */}
              <motion.div
                variants={itemContentVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center"
              >
                {/* Item icon in the center */}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-md flex items-center justify-center">
                    <Image
                      src={ImageSource.getItemImagePath(item)}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                </div>
                
                {/* Item details */}
                <div className="mt-1 text-center relative z-10">
                  <h4 className="text-lg font-medium text-purple-300" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>{item.name}</h4>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
