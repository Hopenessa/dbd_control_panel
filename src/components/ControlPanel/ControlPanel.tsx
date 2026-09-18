import { DragEvent, FormEvent, useRef, useState } from 'react';
import { useCharacterRosters } from '../../hooks/useCharacterRosters';
import { useAppSocket } from '../../hooks/useAppSocket';
import { useOverlayConfig } from '../../hooks/useOverlayConfig';
import { useSyncedQueue } from '../../hooks/useSyncedQueue';
import { CharacterType, QueueItem, SpinEvent } from '../../types/dbd';
import { pickRandomCharacter } from '../../utils/characters';
import { createQueueItem, insertByPriority, moveQueueItem } from '../../utils/queue';
import { createId } from '../../utils/id';
import { spinStorageKey } from '../../utils/storageKeys';
import { CharacterSettings } from '../CharacterSettings/CharacterSettings';
import { OverlaySettings } from '../OverlaySettings/OverlaySettings';

export function ControlPanel() {
  const [queue, setQueue] = useSyncedQueue();
  const [inputValue, setInputValue] = useState('');
  const [lowPriority, setLowPriority] = useState(false);
  const [settingsType, setSettingsType] = useState<CharacterType | null>(null);
  const [overlaySettingsOpen, setOverlaySettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const { rosters, updateRoster } = useCharacterRosters();
  const { config, saveConfig } = useOverlayConfig();
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

  const startEditing = (item: QueueItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const saveEditing = () => {
    const trimmedTitle = editingTitle.trim();

    if (!editingId || !trimmedTitle) {
      return;
    }

    setQueue((currentQueue) => currentQueue.map((item) => (
      item.id === editingId ? { ...item, title: trimmedTitle } : item
    )));
    setEditingId(null);
  };

  const togglePaused = (id: string) => {
    setQueue((currentQueue) => {
      const item = currentQueue.find((queueItem) => queueItem.id === id);
      if (!item) {
        return currentQueue;
      }

      if (item.paused) {
        return insertByPriority(
          currentQueue.filter((queueItem) => queueItem.id !== id),
          { ...item, paused: false },
        );
      }

      return [
        ...currentQueue.filter((queueItem) => queueItem.id !== id),
        { ...item, paused: true },
      ];
    });
  };

  const handleDragStart = (event: DragEvent<HTMLSpanElement>, id: string) => {
    event.stopPropagation();
    draggedIdRef.current = id;
    setDraggedId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = draggedIdRef.current || draggedId || event.dataTransfer.getData('text/plain');
    const bounds = event.currentTarget.getBoundingClientRect();
    const placeAfter = event.clientY > bounds.top + bounds.height / 2;
    if (sourceId) {
      setQueue((currentQueue) => moveQueueItem(currentQueue, sourceId, targetId, placeAfter));
    }
    draggedIdRef.current = null;
    setDraggedId(null);
  };

  const renderQueueItem = (item: QueueItem) => (
    <li
      className={`${item.paused ? 'queue-card paused' : item.lowPriority ? 'queue-card low' : 'queue-card'}${draggedId === item.id ? ' dragging' : ''}`}
      key={item.id}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => handleDrop(event, item.id)}
    >
      <span
        className="drag-handle"
        draggable
        title="Перетащить заказ"
        aria-label={`Перетащить ${item.title}`}
        onDragStart={(event) => handleDragStart(event, item.id)}
        onDragEnd={() => {
          draggedIdRef.current = null;
          setDraggedId(null);
        }}
      >
        ⋮⋮
      </span>
      {editingId === item.id ? (
        <div className="queue-edit-row">
          <input
            aria-label="Новое название заказа"
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveEditing();
              if (event.key === 'Escape') setEditingId(null);
            }}
            autoFocus
          />
          <button type="button" onClick={saveEditing}>Сохранить</button>
          <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
        </div>
      ) : (
        <span className="queue-title">
          {item.title}
          {item.paused && <small>На паузе</small>}
        </span>
      )}
      <div className="item-actions">
        {!editingId && item.randomType && !item.paused && (
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
        {!editingId && (
          <>
            <button className="icon-button" type="button" onClick={() => startEditing(item)} title="Редактировать" aria-label="Редактировать">✎</button>
            <button className="icon-button" type="button" onClick={() => togglePaused(item.id)} title={item.paused ? 'Продолжить' : 'Поставить на паузу'} aria-label={item.paused ? 'Продолжить' : 'Поставить на паузу'}>{item.paused ? '▶' : 'Ⅱ'}</button>
            <button type="button" onClick={() => removeItem(item.id)}>Выполнено / удалить</button>
          </>
        )}
      </div>
    </li>
  );

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
      id: createId(),
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
            <button className="settings-button" type="button" onClick={() => setOverlaySettingsOpen(true)}>Настроить оверлей</button>
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
          {queue.filter((item) => !item.paused).map(renderQueueItem)}
        </ol>

        {queue.some((item) => item.paused) && (
          <>
            <h2 className="paused-heading">Заказы на паузе</h2>
            <ol className="queue-list paused-list">
              {queue.filter((item) => item.paused).map(renderQueueItem)}
            </ol>
          </>
        )}

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
      {overlaySettingsOpen && (
        <OverlaySettings
          config={config}
          queue={queue}
          onSave={saveConfig}
          onClose={() => setOverlaySettingsOpen(false)}
        />
      )}
    </main>
  );
}
