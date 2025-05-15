import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostBinding, HostListener, inject, Input, OnInit, output, Renderer2, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isDefined } from '../utils';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'ae-select',
  templateUrl: './ae-select.component.html',
  styleUrls: ['./ae-select.component.scss'],
  changeDetection:  ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeSelectComponent),
      multi: true,
    }
  ],
  standalone: false
})
export class AeSelectComponent implements OnInit, ControlValueAccessor {
  private elRef = inject(ElementRef);
  private r = inject(Renderer2);

  @Input() options: SelectOption[] = [];

  @Input('hidden') isHidden: boolean;

  selectedOption: SelectOption;
  disabled = false;
  optionId = 0;

  get label(): string {
    return this.selectedOption && this.selectedOption.hasOwnProperty('label') ? this.selectedOption.label : 'Select';
  }

  opened = false;

  get value(): string {
    return this.selectedOption.value;
  }

  @HostBinding('style.display') hidden = 'inline-block';


  readonly changeEvent = output<string>({ alias: 'change' });

  readonly labelButton = viewChild<ElementRef>('labelButton');

  ngOnInit() {
    this.selectedOption = this.options[0];
    if (isDefined(this.isHidden) && this.isHidden) {
      this.hide();
    }
  }

  hide() {
    this.hidden = 'none';
  }

  optionSelect(option: SelectOption, event: MouseEvent) {
    //console.log(event.button, event.buttons);
    if (event.buttons !== 1) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.setValue(option.value);
    this.onChange(this.selectedOption.value);
    this.changeEvent.emit(this.selectedOption.value);
    this.onTouched();
    this.opened = false;
  }

  toggleOpen(event: MouseEvent) {
    // event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.opened = !this.opened;
  }

  @HostListener('document:click', ['$event'])
  onClick($event: MouseEvent) {
    if (!this.elRef.nativeElement.contains($event.target)) {
      this.close();
    }
  }

  close() {
    this.opened = false;
  }

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Returns the current open state of the select component.
 *
 * @returns A boolean indicating if the select component is open.
 */

/*******  62e72532-e3ef-47c4-b143-4bbaf0055b57  *******/
  get isOpen(): boolean {
    return this.opened;
  }

  writeValue(value: any) {
    if (!value || typeof value !== 'string') {
      return;
    }
    this.setValue(value);
  }

  setValue(value: any) {
    let index = 0;
    const selectedEl = this.options.find((el:SelectOption, i:number) => {
      index = i;
      return el.value === value;
    });
    if (selectedEl) {
      this.selectedOption = selectedEl;
      this.optionId = index;
    }
  }

  onChange: any = () => {
  };
  onTouched: any = () => {
  };

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.labelButton().nativeElement.disabled = isDisabled;
    const div = this.labelButton().nativeElement;
    const action = isDisabled ? 'addClass' : 'removeClass';
    this.r[action](div, 'disabled');
    this.disabled = isDisabled;
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown($event: KeyboardEvent) {
    if (!this.opened) {
      return;
    }
    // console.log($event.key);
    // if (KeyCode[$event.key]) {
    switch ($event.key) {
      case 'ArrowDown':
        this._handleArrowDown($event);
        break;
      case 'ArrowUp':
        this._handleArrowUp($event);
        break;
      case 'Space':
        this._handleSpace($event);
        break;
      case 'Enter':
        this._handleEnter($event);
        break;
      case 'Tab':
        this._handleTab($event);
        break;
      case 'Escape':
        this.close();
        $event.preventDefault();
        break;
      case 'Backspace':
        this._handleBackspace();
        break;
    }
    // } else if ($event.key && $event.key.length === 1) {
    // this._keyPress$.next($event.key.toLocaleLowerCase());
    // }
  }

  _handleArrowDown($event: any) {
    if (this.optionId < this.options.length - 1) {
      this.optionId++;
    }
  }

  _handleArrowUp($event: any) {
    if (this.optionId >= 1) {
      this.optionId--;
    }
  }

  _handleSpace($event: any) {

  }

  _handleEnter($event: any) {
    this.optionSelect(this.options[this.optionId], $event);
  }

  _handleTab($event: any) {

  }

  _handleBackspace() {

  }
}
