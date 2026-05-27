import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiTerminal } from './tui-terminal';

describe('TuiTerminal', () => {
  let component: TuiTerminal;
  let fixture: ComponentFixture<TuiTerminal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuiTerminal],
    }).compileComponents();

    fixture = TestBed.createComponent(TuiTerminal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
