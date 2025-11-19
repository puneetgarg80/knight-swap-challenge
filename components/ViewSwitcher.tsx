
import React from 'react';

interface ViewSwitcherProps {
  currentView: 'board' | 'map';
  onViewChange: (view: 'board' | 'map') => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const baseClasses = "flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500";
  
  const activeClasses = "bg-cyan-500 text-white";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="flex p-1 bg-gray-900 rounded-lg">
      <button
        onClick={() => onViewChange('board')}
        className={`${baseClasses} ${currentView === 'board' ? activeClasses : inactiveClasses}`}
      >
        Chessboard
      </button>
      <button
        onClick={() => onViewChange('map')}
        title="Switch to Map View"
        className={`${baseClasses} ${currentView === 'map' ? activeClasses : inactiveClasses}`}
      >
        Map View
      </button>
    </div>
  );
};

export default ViewSwitcher;
