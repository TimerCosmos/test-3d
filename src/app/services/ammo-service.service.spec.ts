import { TestBed } from '@angular/core/testing';

import { AmmoServiceService } from './ammo-service.service';

describe('AmmoServiceService', () => {
  let service: AmmoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmmoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
