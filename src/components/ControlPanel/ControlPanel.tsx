import { FormEvent, useState } from 'react';
import { useCharacterRosters } from '../../hooks/useCharacterRosters';
import { useAppSocket } from '../../hooks/useAppSocket';
import { useSyncedQueue } from '../../hooks/useSyncedQueue';
import { CharacterType, QueueItem, SpinEvent } from '../../types/dbd';
import { pickRandomCharacter } from '../../utils/characters';
import { createQueueItem, insertByPriority } from '../../utils/queue';
import { spinStorageKey } from '../../utils/storageKeys';
import { CharacterSettings } from '../CharacterSettings/CharacterSettings';

export function ControlPanel() {
  const [queue, setQueue] = useSyncedQueue();
  const [inputValue, setInputValue] = useState('');
  const [lowPriority, setLowPriority] = useState(false);
  const [settingsType, setSettingsType] = useState<CharacterType | null>(null);
  const { rosters, updateRoster } = useCharacterRosters();
  const { sendMessage } = useAppSocket();
  const appBasePath = window.location.pathname.replace(/\/$/, '');
  const overlayUrl = `${appBasePath}/#/overlay`;

  const addItem = (title: string, randomType?: CharacterType) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setQueue((currentQueue) =>
      insertByPriority(currentQueue, createQueueItem(trimmedTitle, lowPriority, randomType)),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addItem(inputValue);
    setInputValue('');
  };

  const removeItem = (id: string) => {
    setQueue((currentQueue) => currentQueue.filter((queueItem) => queueItem.id !== id));
  };

  const playRandom = (item: QueueItem) => {
    if (!item.randomType) {
      return;
    }

    const result = pickRandomCharacter(item.randomType, rosters[item.randomType]);
    if (!result) {
      return;
    }

    const { winner, winnerIndex } = result;
    const spinEvent: SpinEvent = {
      id: crypto.randomUUID(),
      itemId: item.id,
      type: item.randomType,
      winner,
      winnerIndex,
    };

    window.localStorage.setItem(spinStorageKey, JSON.stringify(spinEvent));
    sendMessage({ type: 'spin', spin: spinEvent });

    window.setTimeout(() => {
      setQueue((currentQueue) =>
        currentQueue.map((queueItem) =>
          queueItem.id === item.id
            ? { ...queueItem, title: winner.name, randomType: undefined }
            : queueItem,
        ),
      );
    }, 5600);
  };

  return (
    <main className="control-shell">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dead by Daylight</p>
            <h1>Очередь заказов</h1>
          </div>
          <div className="heading-actions">
            <button className="settings-button" type="button" onClick={() => setSettingsType('survivor')}>Настроить сурвов</button>
            <button className="settings-button" type="button" onClick={() => setSettingsType('killer')}>Настроить маньяков</button>
            <a className="overlay-link" href={overlayUrl} target="_blank" rel="noreferrer">Открыть оверлей</a>
          </div>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            aria-label="Название выжившего или убийцы"
            placeholder="Название выжившего или убийцы"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <button type="submit">Добавить</button>
        </form>

        <div className="quick-actions">
          <button type="button" onClick={() => addItem('Рандомный киллер', 'killer')}>
            Рандомный киллер
          </button>
          <button type="button" onClick={() => addItem('Рандомный сурв', 'survivor')}>
            Рандомный сурв
          </button>
          <label className="priority-toggle">
            <input
              type="checkbox"
              checked={lowPriority}
              onChange={(event) => setLowPriority(event.target.checked)}
            />
            Низкий приоритет
          </label>
        </div>

        <ol className="queue-list">
          {queue.map((item) => (
            <li className={item.lowPriority ? 'queue-card low' : 'queue-card'} key={item.id}>
              <span className="queue-title">{item.title}</span>
              <div className="item-actions">
                {item.randomType && (
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Запустить ${item.title}`}
                    title={`Запустить ${item.title}`}
                    onClick={() => playRandom(item)}
                  >
                    ▶
                  </button>
                )}
                <button type="button" onClick={() => removeItem(item.id)}>
                  Выполнено / удалить
                </button>
              </div>
            </li>
          ))}
        </ol>

        {queue.length === 0 && <p className="empty-state">Очередь пуста</p>}
      </section>
      {settingsType && (
        <CharacterSettings
          type={settingsType}
          characters={rosters[settingsType]}
          onUpdate={(characters) => updateRoster(settingsType, characters)}
          onClose={() => setSettingsType(null)}
        />
      )}
    </main>
  );
}
