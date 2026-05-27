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
    expect(component.spec).toEqual({ mode: 'fill', fill: 1 });
    expect(component.layout.fillX).toBe(1);
    expect(component.layout.width).toBeUndefined();
  });

  it('uses fixed width when width is set', () => {
    fixture.componentRef.setInput('width', 40);
    fixture.detectChanges();
    expect(component.spec).toEqual({ mode: 'fixed', cols: 40 });
    expect(component.layout.fillX).toBeUndefined();
  });

  it('uses fill weight when fillX is set', () => {
    fixture.componentRef.setInput('fillX', 3);
    fixture.detectChanges();
    expect(component.spec).toEqual({ mode: 'fill', fill: 3 });
  });

  it('prefers width over fillX when both are set', () => {
    fixture.componentRef.setInput('fillX', 3);
    fixture.componentRef.setInput('width', 40);
    fixture.detectChanges();
    expect(component.spec).toEqual({ mode: 'fixed', cols: 40 });
    expect(component.layout.fillX).toBeUndefined();
  });
});
