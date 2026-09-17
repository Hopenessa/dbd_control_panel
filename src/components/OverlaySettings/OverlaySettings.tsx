import { MouseEvent, useRef, useState } from 'react';
import { OverlayConfig, QueueItem } from '../../types/dbd';

type OverlaySettingsProps = {
  config: OverlayConfig;
  queue: QueueItem[];
  onSave: (config: OverlayConfig) => void;
  onClose: () => void;
};

type DragTarget = 'queue' | 'wheel' | null;

const previewWidth = 1920;
const previewHeight = 1080;

export function OverlaySettings({ config, queue, onSave, onClose }: OverlaySettingsProps) {
  const [draft, setDraft] = useState(config);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const dragStart = useRef({ x: 0, y: 0, configX: 0, configY: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const startDrag = (target: Exclude<DragTarget, null>, event: MouseEvent) => {
    event.preventDefault();
    const position = target === 'queue' ? draft.queue : draft.wheel;
    dragStart.current = { x: event.clientX, y: event.clientY, configX: position.x, configY: position.y };
    setDragTarget(target);
  };

  const moveDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragTarget || !previewRef.current) return;
    const bounds = previewRef.current.getBoundingClientRect();
    const scaleX = previewWidth / bounds.width;
    const scaleY = previewHeight / bounds.height;
    const x = dragStart.current.configX + (event.clientX - dragStart.current.x) * scaleX;
    const y = dragStart.current.configY + (event.clientY - dragStart.current.y) * scaleY;

    setDraft((current) => ({
      ...current,
      [dragTarget]: { ...current[dragTarget], x: Math.round(x), y: Math.round(y) },
    }));
  };

  const stopDrag = () => setDragTarget(null);
  const updateQueue = (changes: Partial<OverlayConfig['queue']>) => setDraft((current) => ({ ...current, queue: { ...current.queue, ...changes } }));
  const updateWheel = (changes: Partial<OverlayConfig['wheel']>) => setDraft((current) => ({ ...current, wheel: { ...current.wheel, ...changes } }));

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-modal overlay-settings-modal" role="dialog" aria-modal="true" aria-labelledby="overlay-settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="settings-heading">
          <div>
            <p className="eyebrow">Настройки оверлея</p>
            <h2 id="overlay-settings-title">Положение и размеры</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <p className="settings-hint">Перетаскивай список или колесо прямо в превью. Изменения применятся только после сохранения.</p>

        <div
          className="overlay-preview"
          ref={previewRef}
          onMouseMove={moveDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <ol
            className="preview-queue"
            style={{ left: `${draft.queue.x / previewWidth * 100}%`, top: `${draft.queue.y / previewHeight * 100}%`, fontSize: `${draft.queue.fontSize / 2}px`, transform: `scale(${draft.queue.scale})` }}
            onMouseDown={(event) => startDrag('queue', event)}
          >
            {(queue.length ? queue : [{ id: 'preview', title: 'Пример элемента', lowPriority: false }]).slice(0, 5).map((item) => <li key={item.id}>{item.title}</li>)}
          </ol>
          <div
            className="preview-wheel"
            style={{ left: `calc(50% + ${draft.wheel.x / 2}px)`, top: `calc(50% + ${draft.wheel.y / 2}px)`, transform: `translate(-50%, -50%) scale(${draft.wheel.scale})` }}
            onMouseDown={(event) => startDrag('wheel', event)}
          >
            <span>КОЛЕСО</span>
          </div>
        </div>

        <div className="overlay-controls">
          <label>Размер шрифта списка: {draft.queue.fontSize}px<input type="range" min="18" max="72" value={draft.queue.fontSize} onChange={(event) => updateQueue({ fontSize: Number(event.target.value) })} /></label>
          <label>Масштаб списка: {draft.queue.scale.toFixed(1)}<input type="range" min="0.5" max="2" step="0.1" value={draft.queue.scale} onChange={(event) => updateQueue({ scale: Number(event.target.value) })} /></label>
          <label>Масштаб колеса: {draft.wheel.scale.toFixed(1)}<input type="range" min="0.4" max="1.6" step="0.1" value={draft.wheel.scale} onChange={(event) => updateWheel({ scale: Number(event.target.value) })} /></label>
        </div>

        <div className="overlay-settings-actions">
          <button type="button" onClick={onClose}>Закрыть без сохранения</button>
          <button type="button" onClick={() => { onSave(draft); onClose(); }}>Сохранить</button>
        </div>
      </section>
    </div>
  );
}
