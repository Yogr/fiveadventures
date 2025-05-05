'use client';

import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

interface AdventureDisplayProps {
  title: string;
  description: string;
  imageUrl: string;
}

const AdventureDisplay = ({ title, description, imageUrl }: AdventureDisplayProps) => {
  
  return (
    <div className="relative w-full h-48">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl === 'default' 
            ? '/image/ui/default_adventure.png' 
            : ImageSource.getAdventureImagePath({ image_url: imageUrl })}
          alt={title}
          fill
          className="object-cover rounded-md"
          priority
        />
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col p-4 z-10">
        <h2 className="text-xl md:text-2xl mb-2 text-amber-300" 
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 4px rgba(0,0,0,0.9)" }}
        >
          {title}
        </h2>
        <p className="text-sm md:text-base text-amber-200"
          style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default AdventureDisplay;
