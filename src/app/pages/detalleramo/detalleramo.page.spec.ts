import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleramoPage } from './detalleramo.page';

describe('DetalleramoPage', () => {
  let component: DetalleramoPage;
  let fixture: ComponentFixture<DetalleramoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleramoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
