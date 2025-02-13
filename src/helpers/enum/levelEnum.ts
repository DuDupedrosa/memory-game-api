export const LevelEnum = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
} as const;

export type LevelEnumType = (typeof LevelEnum)[keyof typeof LevelEnum];
