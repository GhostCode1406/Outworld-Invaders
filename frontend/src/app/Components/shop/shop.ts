import { Component, inject } from '@angular/core';
import { Game as GameService } from '../../Services/game/game';
import { TOWER_TYPES, TowerType, TowerKind } from '../../Models/tower-type.model';

@Component({
  selector: 'app-shop',
  imports: [],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class Shop {
  private gameService = inject(GameService);

  readonly gold = this.gameService.gold;
  readonly selectedKind = this.gameService.selectedTowerKind;
  readonly towerTypes: TowerType[] = Object.values(TOWER_TYPES);

  select(kind: TowerKind): void {
    this.gameService.selectTowerKind(kind);
  }

  canAfford(type: TowerType): boolean {
    return this.gold() >= type.cost;
  }
}