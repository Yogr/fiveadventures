'use client';

type SaveButtonProps = {
  onClick: () => void;
};

export default function SaveButton({ onClick }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:outline-none"
    >
      Save Changes
    </button>
  );
}
