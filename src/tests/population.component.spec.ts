import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopulationComponent } from '../app/components/population/population.component';

describe('PopulationComponent', () => {
  let component: PopulationComponent;
  let fixture: ComponentFixture<PopulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
