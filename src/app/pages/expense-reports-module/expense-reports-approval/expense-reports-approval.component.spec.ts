import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseReportsApprovalComponent } from './expense-reports-approval.component';

describe('ExpenseReportsApprovalComponent', () => {
  let component: ExpenseReportsApprovalComponent;
  let fixture: ComponentFixture<ExpenseReportsApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseReportsApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseReportsApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
