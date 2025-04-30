'use client';

interface AdventureTrackerProps {
  totalAdventures: number;
  completedAdventures: number;
}

export default function AdventureTracker({
  totalAdventures,
  completedAdventures
}: AdventureTrackerProps) {
  return (
    <div className="adventure-tracker">
      {Array.from({ length: totalAdventures }).map((_, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <div className="adventure-connector"></div>}
          <div 
            className={`adventure-node ${
              index < completedAdventures 
                ? 'completed' 
                : index === completedAdventures 
                  ? 'current' 
                  : 'upcoming'
            }`}
          >
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
}
