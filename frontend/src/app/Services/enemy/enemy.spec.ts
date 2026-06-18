import { TestBed } from '@angular/core/testing';

import { Enemy } from './enemy';

describe('Enemy', () => {
  let service: Enemy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Enemy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
