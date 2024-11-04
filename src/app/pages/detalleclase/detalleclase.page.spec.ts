import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleclasePage } from './detalleclase.page';

describe('DetalleclasePage', () => {
  let component: DetalleclasePage;
  let fixture: ComponentFixture<DetalleclasePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleclasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
