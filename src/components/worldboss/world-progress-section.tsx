'use client';

interface WorldProgressProps {
  totalAdventurers: number;
  daysRemaining: number;
}

export default function WorldProgressSection({
  totalAdventurers,
  daysRemaining
}: WorldProgressProps) {
  return (
    <div className="bg-gradient-to-b from-yellow-950 to-black p-4 rounded-lg mt-4 border border-amber-900">
      <h4 className="text-amber-200 font-bold mb-3 text-center">World Progress</h4>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md">
          <div className="text-amber-300">Total Adventurers</div>
          <div className="text-amber-100 font-medium">{totalAdventurers}</div>
        </div>
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md">
          <div className="text-amber-300">Days Remaining</div>
          <div className="text-amber-100 font-medium">{daysRemaining}</div>
        </div>
      </div>
    </div>
  );
}
