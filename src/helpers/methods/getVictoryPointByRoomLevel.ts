import { LevelEnum } from '../enum/levelEnum';

export function getVictoryPointByRoomLevel(roomLevel: number): number {
  const victoryPoints = {
    [LevelEnum.EASY]: 3, // Fácil -> 3 pontos para vencer (3x2)
    [LevelEnum.MEDIUM]: 5, // Médio -> 5 pontos para vencer (5x4)
    [LevelEnum.HARD]: 8, // Difícil -> 8 pontos para vencer (8x7)
  };

  return victoryPoints[roomLevel] || 0; // Retorna 0 se o nível não for válido
}
