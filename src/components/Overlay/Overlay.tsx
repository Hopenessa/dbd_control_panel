import { useEffect, useState } from 'react';
import { useCharacterRosters } from '../../hooks/useCharacterRosters';
import { useSyncedQueue } from '../../hooks/useSyncedQueue';
import { SpinEvent } from '../../types/dbd';
import { spinStorageKey } from '../../utils/storageKeys';
import { RandomizerWheel } from '../RandomizerWheel/RandomizerWheel';

export function Overlay() {
  const [queue] = useSyncedQueue();
  const [spinEvent, setSpinEvent] = useState<SpinEvent | null>(null);
  const [winnerVisible, setWinnerVisible] = useState(false);
  const { rosters } = useCharacterRosters();

  const wheelCharacters = spinEvent
    ? rosters[spinEvent.type].filter((character) => character.enabled !== false)
    : [];

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== spinStorageKey || !event.newValue) {
        return;
      }

      const nextSpinEvent = JSON.parse(event.newValue) as SpinEvent;
      setWinnerVisible(false);
      setSpinEvent(nextSpinEvent);

      window.setTimeout(() => setWinnerVisible(true), 4200);
      window.setTimeout(() => {
        setSpinEvent((currentEvent) =>
          currentEvent?.id === nextSpinEvent.id ? null : currentEvent,
        );
        setWinnerVisible(false);
      }, 8200);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <main className="overlay-stage">
      <ol className="overlay-queue">
        {queue.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ol>

      {spinEvent && (
        <RandomizerWheel
          characters={wheelCharacters}
          winner={spinEvent.winner}
          winnerIndex={spinEvent.winnerIndex}
          winnerVisible={winnerVisible}
        />
      )}
    </main>
  );
}
