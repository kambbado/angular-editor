import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AeSelectComponent, SelectOption } from './ae-select.component';
import { By } from '@angular/platform-browser';

describe('AeSelectComponent', () => {
  let component: AeSelectComponent;
  let fixture: ComponentFixture<AeSelectComponent>;

  const testOptions: SelectOption[] = [
    {
      label: 'test label1',
      value: 'test value1',
    },
    {
      label: 'test label2',
      value: 'test value2',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AeSelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be visible after initialized', () => {
    component.ngOnInit();
    expect(component.display()).toBe('inline-block');
  });

  it('should select first option after initialized', () => {
    fixture.componentRef.setInput('options', testOptions);
    component.ngOnInit();
    expect(component.selectedOption).toBe(testOptions[0]);
  });

  it('should be hidden when passed hidden: true', () => {
    fixture.componentRef.setInput('hidden', true);
    component.ngOnInit();
    expect(component.display()).toBe('none');
  });


  it('should render options', () => {
    fixture.componentRef.setInput('options', testOptions);
    component.selectedOption = testOptions[0];
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('.ae-picker-item'));
    expect(options.length).toBe(2);
  });

  it('should select option by click', () => {
    fixture.componentRef.setInput('options', testOptions);
    component.selectedOption = testOptions[0];
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('.ae-picker-item'));
    const optionSelect = vi.spyOn(component, 'optionSelect');
    options[1].triggerEventHandler('mousedown', {});
    expect(optionSelect).toHaveBeenCalledWith(testOptions[1], {} as MouseEvent);
  });

  it('should select option and close after', () => {
    const event = new MouseEvent('mousedown', { buttons: 1 });
    const stopPropagation = vi.spyOn(event, 'stopPropagation');
    const setValue = vi
      .spyOn(component, 'setValue')
      .mockImplementation(() => {});
    const onChange = vi
      .spyOn(component, 'onChange')
      .mockImplementation(() => {});
    const onTouched = vi.spyOn(component, 'onTouched');
    const changeEvent = vi
      .spyOn(component.change, 'emit')
      .mockImplementation(() => {});

    component.opened = true;

    component.selectedOption = testOptions[1];

    component.optionSelect(testOptions[1], event);

    expect(stopPropagation).toHaveBeenCalled();
    expect(setValue).toHaveBeenCalledWith(testOptions[1].value);
    expect(onChange).toHaveBeenCalledWith(testOptions[1].value);
    expect(onTouched).toHaveBeenCalled();
    expect(changeEvent).toHaveBeenCalledWith(testOptions[1].value);
    expect(component.opened).toBe(false);
  });
});
