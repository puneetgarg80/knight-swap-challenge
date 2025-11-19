
import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { type BoardState, type SquareName, type PieceType, SQUARE_NAMES } from './types';
import { INITIAL_BOARD_STATE, TARGET_BOARD_STATE, LEGAL_MOVES } from './constants';
import Board from './components/Board';
import Controls from './components/Controls';
import WinModal from './components/WinModal';
import InvestigationBoard from './components/InvestigationBoard';
import InvestigationPromptModal from './components/InvestigationPromptModal';
import { walkthroughSteps } from './walkthroughSteps';
const Chat = lazy(() => import('./components/Chat.tsx'));
const Walkthrough = lazy(() => import('./components/Walkthrough'));

type View = 'board' | 'map';
type MainView = 'puzzle' | 'chat';

const App: React.FC = () => {
  const [history, setHistory] = useState<BoardState[]>([INITIAL_BOARD_STATE]);
  const [selectedSquare, setSelectedSquare] = useState<SquareName | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [view, setView] = useState<View>('board');
  const [showInvestigationPrompt, setShowInvestigationPrompt] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(false);
  const [isShowingTarget, setIsShowingTarget] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [mainView, setMainView] = useState<MainView>('puzzle');
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const currentBoard = history[history.length - 1];
  const moveCount = history.length - 1;

  // Lock Map View and AI Helper until 50 attempts are made
  const areFeaturesUnlocked = totalAttempts >= 50;

  useEffect(() => {
    try {
      const hasSeenWalkthrough = localStorage.getItem('knightSwapWalkthroughSeen');
      if (!hasSeenWalkthrough) {
        setShowWalkthrough(true);
      }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
  }, []);

  const handleFinishWalkthrough = useCallback(() => {
    try {
        localStorage.setItem('knightSwapWalkthroughSeen', 'true');
    } catch (error) {
        console.error("Could not write to localStorage:", error);
    }
    setShowWalkthrough(false);
  }, []);

  const possibleMoves = useMemo((): SquareName[] => {
    if (!selectedSquare) {
      return [];
    }
    return (LEGAL_MOVES[selectedSquare] || []).filter(
      (targetSquare) => currentBoard[targetSquare] === null
    );
  }, [selectedSquare, currentBoard]);

  // Prompt the user to use AI helper if they are struggling (e.g., > 50 moves)
  useEffect(() => {
    if (totalAttempts >= 50 && !hasBeenPrompted && mainView === 'puzzle') {
      setShowInvestigationPrompt(true);
      setHasBeenPrompted(true);
    }
  }, [totalAttempts, hasBeenPrompted, mainView]);
  
  const checkWinCondition = useCallback((board: BoardState) => {
    const solved = SQUARE_NAMES.every(square => board[square] === TARGET_BOARD_STATE[square]);
    if (solved) {
      setIsSolved(true);
    }
  }, []);

  const handleSquareClick = useCallback((squareName: SquareName) => {
    if (isSolved) return;

    if (selectedSquare) {
      const pieceToMove = currentBoard[selectedSquare] as PieceType;
      const isValidMove = LEGAL_MOVES[selectedSquare]?.includes(squareName);
      const isTargetEmpty = currentBoard[squareName] === null;

      if (isValidMove && isTargetEmpty) {
        const newBoardState = { ...currentBoard };
        newBoardState[squareName] = pieceToMove;
        newBoardState[selectedSquare] = null;
        
        const newHistory = [...history, newBoardState];
        setHistory(newHistory);
        setTotalAttempts(prev => prev + 1);
        checkWinCondition(newBoardState);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }
      setSelectedSquare(null);
    } else {
      if (currentBoard[squareName]) {
        setSelectedSquare(squareName);
      }
    }
  }, [selectedSquare, currentBoard, history, isSolved, checkWinCondition]);

  const handleReset = useCallback(() => {
    setHistory([INITIAL_BOARD_STATE]);
    setSelectedSquare(null);
    setIsSolved(false);
    setIsShowingTarget(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
      setSelectedSquare(null);
      if (isSolved) setIsSolved(false);
    }
  }, [history, isSolved]);

  const handleSwitchToChat = () => {
    setMainView('chat');
    setShowInvestigationPrompt(false);
  };

  const handleDismissPrompt = () => {
    setShowInvestigationPrompt(false);
  };

  const boardToDisplay = isShowingTarget ? TARGET_BOARD_STATE : currentBoard;
  const clickHandler = isShowingTarget || isSolved || showWalkthrough ? () => {} : handleSquareClick;

  const BottomNavButton: React.FC<{ view: MainView; label: string; children: React.ReactNode; disabled?: boolean }> = ({ view, label, children, disabled }) => {
    const isActive = mainView === view;
    return (
      <button
        onClick={() => !disabled && setMainView(view)}
        disabled={disabled}
        className={`relative flex flex-col items-center justify-center gap-1 w-28 h-14 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isActive ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        aria-label={`Switch to ${label} view`}
      >
        {children}
        <span className="text-xs font-medium tracking-wide flex items-center gap-1">
          {label}
          {disabled && <span className="text-[10px]">🔒</span>}
        </span>
      </button>
    );
  };

  return (
    <div className="h-[100dvh] bg-gray-900 text-gray-100 flex flex-col font-sans overflow-hidden">
      <Suspense fallback={null}>
        {showWalkthrough && <Walkthrough onFinish={handleFinishWalkthrough} />}
      </Suspense>

      {isSolved && <WinModal moveCount={moveCount} onReset={handleReset} />}
      {showInvestigationPrompt && <InvestigationPromptModal onSwitchToChat={handleSwitchToChat} onDismiss={handleDismissPrompt} />}
      
      <div className="flex-grow overflow-y-auto">
        {/* Puzzle View */}
        <div className={`${mainView === 'puzzle' ? 'flex' : 'hidden'} flex-col items-center p-4 min-h-full`}>
            <header className="w-full text-center mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">The Knight Swap Puzzle</h1>
              <p className="text-gray-300">Swap the positions of the white (♘) and black (♞) knights.</p>
            </header>

            <main className="w-full flex flex-col items-center justify-center gap-2 max-w-[85vmin] md:max-w-2xl mb-2">
              <Controls 
                moveCount={moveCount} 
                onReset={handleReset} 
                onUndo={handleUndo} 
                canUndo={history.length > 1 && !isSolved}
                currentView={view}
                onViewChange={setView}
                isShowingTarget={isShowingTarget}
                onToggleTarget={() => setIsShowingTarget(p => !p)}
                isMapUnlocked={areFeaturesUnlocked}
              />
              <div data-walkthrough="board-container" className={`relative w-full transition-all duration-300 ${isShowingTarget ? 'ring-2 ring-amber-400 rounded-lg shadow-lg' : ''}`}>
                 {isShowingTarget && <p className="absolute -top-6 left-0 right-0 text-center text-amber-400 text-sm font-semibold">TARGET STATE (VIEW-ONLY)</p>}
                {view === 'board' ? (
                  <Board 
                    boardState={boardToDisplay} 
                    onSquareClick={clickHandler} 
                    selectedSquare={isShowingTarget ? null : selectedSquare}
                    possibleMoves={isShowingTarget ? [] : possibleMoves}
                    shake={shake}
                  />
                ) : (
                  <InvestigationBoard
                    boardState={boardToDisplay}
                    onSquareClick={clickHandler}
                    selectedSquare={isShowingTarget ? null : selectedSquare}
                    possibleMoves={isShowingTarget ? [] : possibleMoves}
                    shake={shake}
                  />
                )}
              </div>
            </main>

            <footer className="w-full text-center">
              <div className="bg-gray-800 p-4 rounded-lg text-sm max-w-md mx-auto">
                <p className="font-semibold mb-2">Rules:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Knights move in an 'L' shape (or follow the lines in Map View).</li>
                  <li>A knight can only move to an empty square.</li>
                  <li>Click a knight to select it, then click an empty square to move.</li>
                </ul>
              </div>
            </footer>
        </div>

        {/* Chat View */}
        <div className={`${mainView === 'chat' ? 'flex' : 'hidden'} h-full items-center justify-center p-4`}>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="animate-spin h-8 w-8 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg">Loading AI Helper...</p>
            </div>
          }>
            <Chat />
          </Suspense>
        </div>
      </div>

      <nav className="flex-shrink-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 z-10">
          <div className="flex justify-center items-center gap-4 h-20 max-w-md mx-auto">
              <BottomNavButton view="puzzle" label="Puzzle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </BottomNavButton>
              <div data-walkthrough="ai-helper-tab">
                <BottomNavButton view="chat" label="AI Helper" disabled={!areFeaturesUnlocked}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </BottomNavButton>
              </div>
          </div>
      </nav>
    </div>
  );
};

export default App;
