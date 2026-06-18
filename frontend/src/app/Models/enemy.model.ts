export interface Enemy {
  id: number;
  hp: number;
  maxHp: number;
  speed: number;    // progression par seconde sur le chemin
  progress: number; // position actuelle sur le chemin (float)
}
