import React, { createContext, useContext, useState, ReactNode } from 'react';

export type GameName = 'Heartopia' | 'Petit Planet' | 'Loftia';

export interface GameOption {
  name: GameName;
  icon: string;
}

export const GAME_OPTIONS: GameOption[] = [
  { name: 'Heartopia', icon: '🌸' },
  { name: 'Petit Planet', icon: '🪐' },
  { name: 'Loftia', icon: '☁️' },
];

interface GameContextType {
  selectedGame: GameName;
  setSelectedGame: (game: GameName) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedGame, setSelectedGameState] = useState<GameName>(() => {
    try {
      const saved = localStorage.getItem('bunny_selected_game') as GameName;
      if (saved && (saved === 'Heartopia' || saved === 'Petit Planet' || saved === 'Loftia')) {
        return saved;
      }
    } catch {}
    return 'Heartopia';
  });

  const setSelectedGame = (game: GameName) => {
    setSelectedGameState(game);
    try {
      localStorage.setItem('bunny_selected_game', game);
    } catch {}
  };

  return (
    <GameContext.Provider value={{ selectedGame, setSelectedGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
