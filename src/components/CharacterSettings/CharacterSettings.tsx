import { FormEvent, useState } from 'react';
import { Character } from '../../types/dbd';

type CharacterSettingsProps = {
  type: 'killer' | 'survivor';
  characters: Character[];
  onUpdate: (characters: Character[]) => void;
  onClose: () => void;
};

const labels = { killer: 'маньяков', survivor: 'сурвов' };

export function CharacterSettings({ type, characters, onUpdate, onClose }: CharacterSettingsProps) {
  const [newName, setNewName] = useState('');
  const [newPortrait, setNewPortrait] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  const [error, setError] = useState('');

  const updateCharacter = (index: number, changes: Partial<Character>) => {
    onUpdate(characters.map((character, characterIndex) =>
      characterIndex === index ? { ...character, ...changes } : character,
    ));
  };

  const removeCharacter = (index: number) => {
    onUpdate(characters.filter((_, characterIndex) => characterIndex !== index));
  };

  const handleFile = (index: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateCharacter(index, { portrait: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleNewFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewPortrait(String(reader.result));
    reader.readAsDataURL(file);
  };

  const addCharacter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError('Укажи имя персонажа.');
      return;
    }

    onUpdate([...characters, { name, type, color: newColor, portrait: newPortrait || undefined }]);
    setNewName('');
    setNewPortrait('');
    setError('');
  };

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="settings-heading">
          <div>
            <p className="eyebrow">Настройки</p>
            <h2 id="settings-title">Список {labels[type]}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="character-settings-list">
          {characters.map((character, index) => (
            <div className="character-setting" key={`${character.name}-${index}`}>
              {character.portrait ? <img className="settings-portrait" src={character.portrait} alt="" /> : <span className="settings-portrait">?</span>}
              <div className="character-fields">
                <input
                  aria-label={`Имя персонажа ${index + 1}`}
                  value={character.name}
                  onChange={(event) => updateCharacter(index, { name: event.target.value })}
                />
                <input
                  aria-label={`Картинка персонажа ${index + 1}`}
                  placeholder="Путь, URL или имя картинки"
                  value={character.portrait ?? ''}
                  onChange={(event) => updateCharacter(index, { portrait: event.target.value })}
                />
                <label className="file-button">Загрузить<input type="file" accept="image/*" onChange={(event) => handleFile(index, event.target.files?.[0])} /></label>
              </div>
              <label className="exclude-toggle">
                <input type="checkbox" checked={character.enabled !== false} onChange={(event) => updateCharacter(index, { enabled: event.target.checked })} />
                {character.enabled === false ? 'Исключён' : 'В рандоме'}
              </label>
              <button className="delete-character-button" type="button" onClick={() => removeCharacter(index)}>Удалить</button>
            </div>
          ))}
        </div>

        <form className="new-character-form" onSubmit={addCharacter}>
          <h3>Добавить нового персонажа</h3>
          <div className="new-character-fields">
            <input placeholder="Имя" value={newName} onChange={(event) => setNewName(event.target.value)} />
            <input placeholder="Путь, URL или имя картинки" value={newPortrait} onChange={(event) => setNewPortrait(event.target.value)} />
            <label className="file-button">Загрузить<input type="file" accept="image/*" onChange={(event) => handleNewFile(event.target.files?.[0])} /></label>
            <input className="color-input" type="color" value={newColor} onChange={(event) => setNewColor(event.target.value)} aria-label="Цвет-заполнитель" />
            <button type="submit">Добавить</button>
          </div>
          <p className="settings-hint">Можно вставить URL или путь к файлу из папки с портретами. Загрузка сразу сохраняет картинку в браузере.</p>
          {error && <p className="settings-error">{error}</p>}
        </form>
      </section>
    </div>
  );
}
