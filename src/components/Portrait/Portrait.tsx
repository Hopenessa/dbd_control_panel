import { Character } from '../../types/dbd';
import { getInitials } from '../../utils/characters';

type PortraitProps = {
  character: Character;
  large?: boolean;
};

export function Portrait({ character, large = false }: PortraitProps) {
  const className = large ? 'portrait large' : 'portrait';

  if (character.portrait) {
    return (
      <img
        className={className}
        src={character.portrait}
        alt={character.name}
        style={{ backgroundColor: character.color }}
      />
    );
  }

  return (
    <span className={className} style={{ backgroundColor: character.color }}>
      {getInitials(character.name)}
    </span>
  );
}
