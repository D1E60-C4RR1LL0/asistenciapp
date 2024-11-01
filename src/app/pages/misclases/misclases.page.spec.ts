import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisclasesPage } from './misclases.page';

describe('MisclasesPage', () => {
  let component: MisclasesPage;
  let fixture: ComponentFixture<MisclasesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisclasesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
