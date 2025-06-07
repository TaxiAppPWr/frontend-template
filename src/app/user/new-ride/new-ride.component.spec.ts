import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRideComponent } from './new-ride.component';

describe('NewRideComponent', () => {
  let component: NewRideComponent;
  let fixture: ComponentFixture<NewRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
