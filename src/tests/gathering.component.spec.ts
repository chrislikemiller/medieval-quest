import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatheringComponent } from '../app/components/gathering/gathering.component';

describe('GatheringComponent', () => {
  let component: GatheringComponent;
  let fixture: ComponentFixture<GatheringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatheringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatheringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
