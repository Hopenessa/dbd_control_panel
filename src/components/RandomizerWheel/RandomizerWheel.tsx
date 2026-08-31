import React, { useMemo } from 'react';
import { Character } from '../../types/dbd';
import { Portrait } from '../Portrait/Portrait';
import { WheelSlice } from './WheelSlice';

type RandomizerWheelProps = {
  characters: Character[];
  winner: Character;
  winnerIndex: number;
  winnerVisible: boolean;
};

export function RandomizerWheel({
  characters,
  winner,
  winnerIndex,
  winnerVisible,
}: RandomizerWheelProps) {
  const wheelRotation = useMemo(() => {
    const sliceAngle = 360 / characters.length;
    const winnerAngle = winnerIndex * sliceAngle + sliceAngle / 2;
    return 360 * 7 - winnerAngle;
  }, [characters.length, winnerIndex]);

  return (
    <div className="randomizer">
      <div className={winnerVisible ? 'pointer hidden' : 'pointer'} />
      <svg
        className={winnerVisible ? 'wheel hiding' : 'wheel'}
        style={{ '--spin-rotation': `${wheelRotation}deg` } as React.CSSProperties}
        viewBox="-330 -330 660 660"
        role="img"
        aria-label="Колесо рандома"
      >
        {characters.map((character, index) => (
          <WheelSlice
            character={character}
            index={index}
            total={characters.length}
            key={character.name}
          />
        ))}
        <circle r="82" fill="#111827" stroke="#f8fafc" strokeWidth="8" />
        <text className="wheel-core-text" textAnchor="middle" dy="8">
          DBD
        </text>
      </svg>

      <div className={winnerVisible ? 'winner-card visible' : 'winner-card'}>
        <Portrait character={winner} large />
        <strong>{winner.name}</strong>
      </div>
    </div>
  );
}
