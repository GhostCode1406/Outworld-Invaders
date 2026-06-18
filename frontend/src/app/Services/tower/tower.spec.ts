import { TestBed } from '@angular/core/testing';

import { Tower } from './tower';

describe('Tower', () => {
  let service: Tower;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tower);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
