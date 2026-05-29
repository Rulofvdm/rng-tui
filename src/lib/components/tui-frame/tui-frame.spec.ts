import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiFrame } from './tui-frame';

describe('TuiFrame', () => {
  let component: TuiFrame;
  let fixture: ComponentFixture<TuiFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuiFrame],
    }).compileComponents();

    fixture = TestBed.createComponent(TuiFrame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to fill mode with weight 1', () => {
    expect(component.resolvedFillX()).toBe(1);
    expect(component.layout().fillX).toBe(1);
    expect(component.layout().width).toBeUndefined();
  });

  it('uses fixed width when width is set', () => {
    fixture.componentRef.setInput('width', 40);
    fixture.detectChanges();
    expect(component.layout().width).toBe(40);
    expect(component.resolvedFillX()).toBeUndefined();
  });

  it('uses fill weight when fillX is set', () => {
    fixture.componentRef.setInput('fillX', 3);
    fixture.detectChanges();
    expect(component.resolvedFillX()).toBe(3);
    expect(component.layout().fillX).toBe(3);
  });

  it('prefers width over fillX when both are set', () => {
    fixture.componentRef.setInput('fillX', 3);
    fixture.componentRef.setInput('width', 40);
    fixture.detectChanges();
    expect(component.layout().width).toBe(40);
    expect(component.resolvedFillX()).toBeUndefined();
  });

  it('shows header text when top border is hidden', () => {
    fixture.componentRef.setInput('hideBorders', { top: true });
    fixture.componentRef.setInput('borderContent', { top: { left: 'HEADER' } });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topRowVisible()).toBe(true);
    expect(component.topEdgeRun()).toBe('HEADER    ');
  });

  it('truncates header text to preserve corners on small frames', () => {
    fixture.componentRef.setInput('borderContent', { top: { left: 'HEADER_TOO_LONG' } });
    component.applySize({ width: 6, height: 4 });
    fixture.detectChanges();

    expect(component.topEdgeRun()).toBe('HEAD');
  });

  it('does not render hidden top row without header text', () => {
    fixture.componentRef.setInput('hideBorders', { top: true });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topRowVisible()).toBe(false);
  });

  it('keeps footer text when bottom border is hidden', () => {
    fixture.componentRef.setInput('hideBorders', { bottom: true });
    fixture.componentRef.setInput('borderContent', { bottom: { left: 'FOOT' } });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.bottomRowVisible()).toBe(true);
    expect(component.bottomEdgeRun()).toBe('FOOT      ');
  });

  it('centers header text in the border run', () => {
    fixture.componentRef.setInput('borderContent', { top: { center: 'HI' } });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topEdgeRun()).toBe('───HI───');
  });

  it('right-aligns footer text in the border run', () => {
    fixture.componentRef.setInput('borderContent', { bottom: { right: 'HI' } });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.bottomEdgeRun()).toBe('──────HI');
  });

  it('supports simultaneous top left/center/right slots', () => {
    fixture.componentRef.setInput('borderContent', {
      top: { left: 'L', center: 'C', right: 'R' },
    });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topEdgeRun()).toBe('L──C───R');
  });

  it('allows top and bottom slots at the same time', () => {
    fixture.componentRef.setInput('borderContent', {
      top: { left: 'TopL', right: 'TopR' },
      bottom: { left: 'BotL', center: 'BotC', right: 'BotR' },
    });
    component.applySize({ width: 12, height: 4 });
    fixture.detectChanges();

    expect(component.topEdgeRun()).toBe('TopL──TopR');
    expect(component.bottomEdgeRun()).toBe('BotLotBotR');
  });

  it('keeps top row text length equal to applied width', () => {
    fixture.componentRef.setInput('borderContent', {
      top: { left: 'L', center: 'C', right: 'R' },
    });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topRowText().length).toBe(10);
    expect(component.horizontalRunWidth('top')).toBe('8ch');
    expect(component.cornerVisible('top', 'start')).toBe(true);
    expect(component.cornerVisible('top', 'end')).toBe(true);
  });

  it('keeps top row width when left border is hidden', () => {
    fixture.componentRef.setInput('hideBorders', { left: true });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topRowText().length).toBe(10);
    expect(component.horizontalRunWidth('top')).toBe('9ch');
    expect(component.cornerVisible('top', 'start')).toBe(false);
    expect(component.cornerVisible('top', 'end')).toBe(true);
  });

  it('keeps top row width when right border is hidden', () => {
    fixture.componentRef.setInput('hideBorders', { right: true });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topRowText().length).toBe(10);
    expect(component.horizontalRunWidth('top')).toBe('9ch');
    expect(component.cornerVisible('top', 'start')).toBe(true);
    expect(component.cornerVisible('top', 'end')).toBe(false);
  });

  it('exposes resolved border slots for styled header divs', () => {
    fixture.componentRef.setInput('borderContent', {
      top: { left: 'L', center: 'C', right: 'R' },
    });
    component.applySize({ width: 10, height: 4 });
    fixture.detectChanges();

    expect(component.topBorderSlots().left?.text).toBe('L');
    expect(component.topBorderSlots().center?.startCol).toBe(3);
    expect(component.borderSlotId('top', 'right')).toBe('tui-border-top-right');
    expect(component.topFillRun()).toBe(' ── ─── ');
  });

});
