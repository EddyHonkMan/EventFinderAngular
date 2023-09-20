import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSearchFormComponent } from './event-search-form.component';

describe('EventSearchFormComponent', () => {
  let component: EventSearchFormComponent;
  let fixture: ComponentFixture<EventSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
