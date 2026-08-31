export type CharacterType = 'killer' | 'survivor';

export type Character = {
  name: string;
  type: CharacterType;
  color: string;
  portrait?: string;
  enabled?: boolean;
};

export type QueueItem = {
  id: string;
  title: string;
  lowPriority: boolean;
  randomType?: CharacterType;
};

export type SpinEvent = {
  id: string;
  itemId: string;
  type: CharacterType;
  winner: Character;
  winnerIndex: number;
};
