
import React from 'react';
import { type SquareName, type SquareContent, type PieceType } from '../types';
import { KNIGHT_EMOJI } from '../constants';

interface SquareProps {
  name: SquareName;
  piece: SquareContent;
  onClick: (name: SquareName) => void;
  isSelected: boolean;
  isPossibleMove: boolean;
  isBlack: boolean;
}

const Square: React.FC<SquareProps> = React.memo(({ name, piece, onClick, isSelected, isPossibleMove, isBlack }) => {
  const bgColor = isBlack ? 'bg-slate-600' : 'bg-slate-400';
  const hoverBgColor = isBlack ? 'hover:bg-slate-500' : 'hover:bg-slate-300';
  
  const ringColor = isSelected ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-cyan-400' : '';
  const labelColor = isBlack ? 'text-slate-200' : 'text-slate-700';

  return (
    <div
      onClick={() => onClick(name)}
      className={`relative flex items-center justify-center aspect-square rounded-sm cursor-pointer transition-all duration-200 ${bgColor} ${hoverBgColor} ${ringColor}`}
    >
      {isPossibleMove && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 bg-cyan-400/50 rounded-full"></div>
        </div>
      )}
      {piece && (
        <span className="text-4xl sm:text-5xl md:text-6xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {KNIGHT_EMOJI[piece as PieceType]}
        </span>
      )}
      <span className={`absolute top-1 left-1.5 text-sm font-bold font-mono ${labelColor}`}>{name}</span>
    </div>
  );
});

export default Square;
