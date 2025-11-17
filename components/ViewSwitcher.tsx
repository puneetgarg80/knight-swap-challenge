import React from 'react';

interface ViewSwitcherProps {
  currentView: 'board' | 'map';
  onViewChange: (view: 'board' | 'map') => void;
  isMapUnlocked: boolean;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange, isMapUnlocked }) => {
  const baseClasses = "flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500";
  
  const activeClasses = "bg-cyan-500 text-white";
  const boardInactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  const mapButtonClasses = isMapUnlocked
    ? `bg-gray-700 text-gray-300 hover:bg-gray-600`
    : `bg-gray-800 text-gray-500 cursor-not-allowed`;

  return (
    <div className="flex p-1 bg-gray-900 rounded-lg">
      <button
        onClick={() => onViewChange('board')}
        className={`${baseClasses} ${currentView === 'board' ? activeClasses : boardInactiveClasses}`}
      >
        Chessboard
      </button>
      <button
        onClick={() => onViewChange('map')}
        disabled={!isMapUnlocked}
        title={!isMapUnlocked ? 'Make 50 total moves to unlock Map View' : 'Switch to Map View'}
        className={`${baseClasses} ${currentView === 'map' ? activeClasses : mapButtonClasses}`}
      >
        Map View {!isMapUnlocked && <span className="ml-1.5" role="img" aria-label="locked">🔒</span>}
      </button>
    </div>
  );
};

export default ViewSwitcher;