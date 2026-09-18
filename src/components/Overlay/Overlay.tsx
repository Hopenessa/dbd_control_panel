import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useAppSocket } from '../../hooks/useAppSocket';
import { useCharacterRosters } from '../../hooks/useCharacterRosters';
import { useOverlayConfig } from '../../hooks/useOverlayConfig';
import { useSyncedQueue } from '../../hooks/useSyncedQueue';
import { SpinEvent } from '../../types/dbd';
import { spinStorageKey } from '../../utils/storageKeys';
import { RandomizerWheel } from '../RandomizerWheel/RandomizerWheel';

export function Overlay() {
  const [queue] = useSyncedQueue();
  const [spinEvent, setSpinEvent] = useState<SpinEvent | null>(null);
  const [winnerVisible, setWinnerVisible] = useState(false);
  const { rosters } = useCharacterRosters();
  const { config } = useOverlayConfig();
  const handledSpinIds = useRef(new Set<string>());

  const wheelCharacters = spinEvent
    ? rosters[spinEvent.type].filter((character) => character.enabled !== false)
    : [];

  const showSpin = (nextSpinEvent: SpinEvent) => {
    if (handledSpinIds.current.has(nextSpinEvent.id)) {
      return;
    }

    handledSpinIds.current.add(nextSpinEvent.id);
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

  useAppSocket((message) => {
    if (message.type === 'spin') {
      showSpin(message.spin);
    }
  });

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== spinStorageKey || !event.newValue) {
        return;
      }

      showSpin(JSON.parse(event.newValue) as SpinEvent);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <main
      className="overlay-stage"
      style={{
        '--queue-x': `${config.queue.x}px`,
        '--queue-y': `${config.queue.y}px`,
        '--queue-scale': config.queue.scale,
        '--queue-font-size': `${config.queue.fontSize}px`,
        '--paused-queue-x': `${config.pausedQueue.x}px`,
        '--paused-queue-y': `${config.pausedQueue.y}px`,
        '--paused-queue-scale': config.pausedQueue.scale,
        '--paused-queue-font-size': `${config.pausedQueue.fontSize}px`,
        '--wheel-x': `${config.wheel.x}px`,
        '--wheel-y': `${config.wheel.y}px`,
        '--wheel-scale': config.wheel.scale,
      } as CSSProperties}
    >
      <ol className="overlay-queue">
        {queue.filter((item) => !item.paused).map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ol>

      {queue.some((item) => item.paused) && (
        <section className="overlay-paused-group" aria-label="Заказы на паузе">
          <h2>На паузе</h2>
          <ol className="overlay-queue overlay-paused-queue">
            {queue.filter((item) => item.paused).map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ol>
        </section>
      )}

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
