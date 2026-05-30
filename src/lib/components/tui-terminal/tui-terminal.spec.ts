import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiTerminal } from './tui-terminal';

describe('TuiTerminal', () => {
  let fixture: ComponentFixture<TuiTerminal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuiTerminal],
    }).compileComponents();

    fixture = TestBed.createComponent(TuiTerminal);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
