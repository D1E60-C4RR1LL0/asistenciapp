import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminClasesPage } from './admin-clases.page';

describe('AdminClasesPage', () => {
  let component: AdminClasesPage;
  let fixture: ComponentFixture<AdminClasesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminClasesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
