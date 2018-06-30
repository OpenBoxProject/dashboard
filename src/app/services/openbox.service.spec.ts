import { TestBed, inject } from '@angular/core/testing';

import { OpenboxService } from './openbox.service';

describe('OpenboxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenboxService]
    });
  });

  it('should be created', inject([OpenboxService], (service: OpenboxService) => {
    expect(service).toBeTruthy();
  }));
});
