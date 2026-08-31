import { getRoster } from '../data/characters';
import { Character, CharacterType } from '../types/dbd';

export function getInitials(name: string) {
  return name
    .replace(/["']/g, '')
    .split(/\s+/)
    .filter((part) => !['the', '-'].includes(part.toLowerCase()))
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function pickRandomCharacter(type: CharacterType, customRoster?: Character[]) {
  const roster = customRoster ?? getRoster(type);
  const availableRoster = roster.filter((character) => character.enabled !== false);
  if (roster.length === 0) {
    throw new Error(`Ростер ${type} пуст`);
  }
  if (availableRoster.length === 0) {
    return null;
  }
  const winner = availableRoster[Math.floor(Math.random() * availableRoster.length)];
  const winnerIndex = availableRoster.findIndex((character) => character.name === winner.name);

  return {
    winner,
    winnerIndex,
  };
}
