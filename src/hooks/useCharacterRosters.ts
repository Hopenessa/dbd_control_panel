import { useEffect, useState } from 'react';
import { killers, survivors } from '../data/characters';
import { Character, CharacterType } from '../types/dbd';
import { rosterStorageKey, rosterStorageVersionKey } from '../utils/storageKeys';

export type CharacterRosters = {
  killer: Character[];
  survivor: Character[];
};

function readRosters(): CharacterRosters {
  const fallback = { killer: killers, survivor: survivors };

  try {
    const saved = window.localStorage.getItem(rosterStorageKey);
    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved) as Partial<CharacterRosters>;
    const hasMigratedRoster = window.localStorage.getItem(rosterStorageVersionKey) === '1';
    const mergeNewDefaults = (savedCharacters: unknown, defaultCharacters: Character[]) => {
      if (!Array.isArray(savedCharacters)) {
        return defaultCharacters;
      }
      if (hasMigratedRoster) {
        return savedCharacters as Character[];
      }

      const savedNames = new Set(savedCharacters.map((character) => (character as Character).name));
      return [
        ...(savedCharacters as Character[]),
        ...defaultCharacters.filter((character) => !savedNames.has(character.name)),
      ];
    };

    window.localStorage.setItem(rosterStorageVersionKey, '1');
    return {
      killer: mergeNewDefaults(parsed.killer, fallback.killer),
      survivor: mergeNewDefaults(parsed.survivor, fallback.survivor)
        .filter((character) => character.name !== 'Ken Kaneki'),
    };
  } catch {
    return fallback;
  }
}

export function useCharacterRosters() {
  const [rosters, setRosters] = useState<CharacterRosters>(readRosters);

  useEffect(() => {
    window.localStorage.setItem(rosterStorageKey, JSON.stringify(rosters));
  }, [rosters]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== rosterStorageKey || !event.newValue) {
        return;
      }

      try {
        const nextRosters = JSON.parse(event.newValue) as CharacterRosters;
        if (Array.isArray(nextRosters.killer) && Array.isArray(nextRosters.survivor)) {
          setRosters(nextRosters);
        }
      } catch {
        return;
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateRoster = (type: CharacterType, nextRoster: Character[]) => {
    setRosters((current) => ({ ...current, [type]: nextRoster }));
  };

  return { rosters, updateRoster };
}
