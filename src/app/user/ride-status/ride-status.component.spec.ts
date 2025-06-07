import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideStatusComponent } from './ride-status.component';

describe('RideStatusComponent', () => {
  let component: RideStatusComponent;
  let fixture: ComponentFixture<RideStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
