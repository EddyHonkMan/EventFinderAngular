import { TestBed } from '@angular/core/testing';

import { VenueLocationService } from './venue-location.service';

describe('VenueLocationService', () => {
  let service: VenueLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
