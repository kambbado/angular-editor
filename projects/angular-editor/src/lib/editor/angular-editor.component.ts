import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, contentChild, ElementRef, forwardRef,
  HostAttributeToken, HostBinding, HostListener, inject, OnDestroy, OnInit,
  output, Output, Renderer2, SecurityContext, TemplateRef,
  viewChild,
  input
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AeToolbarComponent } from '../ae-toolbar/ae-toolbar.component';
import { AngularEditorService } from '../angular-editor.service';
import { AngularEditorConfig, angularEditorConfig, CustomClass, Font } from '../config';
import { isDefined } from '../utils';

@Component({
  selector: 'angular-editor',
  templateUrl: './angular-editor.component.html',
  styleUrls: ['./angular-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AngularEditorComponent),
      multi: true
    },
    AngularEditorService
  ],
  standalone: false
})
export class AngularEditorComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {
  private r = inject(Renderer2);
  private editorService = inject(AngularEditorService);
  private doc = inject(DOCUMENT);
  private sanitizer = inject(DomSanitizer);
  private cdRef = inject(ChangeDetectorRef);
  private autoFocus = inject(new HostAttributeToken('autofocus'));


  private onChange: (value: string) => void;
  private onTouched: () => void;

  modeVisual = true;
  showPlaceholder = false;
  disabled = false;
  focused = false;
  touched = false;
  changed = false;

  focusInstance: any;
  blurInstance: any;

  readonly id = input('');
  readonly config = input<AngularEditorConfig>(angularEditorConfig);
  readonly placeholder = input('');
  readonly tabIndex = input<number | null>(undefined);

  @Output() html: any;

  readonly textArea = viewChild<ElementRef>('editor');
  readonly editorWrapper = viewChild<ElementRef>('editorWrapper');
  readonly editorToolbar = viewChild<AeToolbarComponent>('editorToolbar');
  readonly customButtonsTemplateRef = contentChild<TemplateRef<any>>('customButtons');
  executeCommandFn = this.executeCommand.bind(this);

  readonly viewMode = output<boolean>();

  /** emits `blur` event when focused out from the textarea */

  readonly blurEvent = output<FocusEvent>({ alias: 'blur' });

  /** emits `focus` event when focused in to the textarea */

  readonly focusEvent = output<FocusEvent>({ alias: 'focus' });

  @HostBinding('attr.tabindex') tabindex = -1;

  @HostListener('focus')
  onFocus() {
    this.focus();
  }

  constructor() {
    const defaultTabIndex = inject(new HostAttributeToken('tabindex'));

    const parsedTabIndex = Number(defaultTabIndex);
    this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
  }

  ngOnInit() {
    const config = this.config();
    const config = this.config();
    const config = this.config();
    this.config().toolbarPosition = config.toolbarPosition ? config.toolbarPosition : angularEditorConfig.toolbarPosition;
  }

  ngAfterViewInit() {
    if (isDefined(this.autoFocus)) {
      this.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    if (this.config().rawPaste) {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, text);
      return text;
    }
  }

  /**
   * Executed command from editor header buttons
   * @param command string from triggerCommand
   * @param value
   */
  executeCommand(command: string, value?: string) {
    this.focus();
    if (command === 'focus') {
      return;
    }
    if (command === 'toggleEditorMode') {
      this.toggleEditorMode(this.modeVisual);
    } else if (command !== '') {
      if (command === 'clear') {
        this.editorService.removeSelectedElements(this.getCustomTags());
        this.onContentChange(this.textArea().nativeElement);
      } else if (command === 'default') {
        this.editorService.removeSelectedElements('h1,h2,h3,h4,h5,h6,p,pre');
        this.onContentChange(this.textArea().nativeElement);
      } else {
        this.editorService.executeCommand(command, value);
      }
      this.exec();
    }
  }

  /**
   * focus event
   */
  onTextAreaFocus(event: FocusEvent): void {
    if (this.focused) {
      event.stopPropagation();
      return;
    }
    this.focused = true;
    this.focusEvent.emit(event);
    if (!this.touched || !this.changed) {
      this.editorService.executeInNextQueueIteration(() => {
        this.configure();
        this.touched = true;
      });
    }
  }

  /**
   * @description fires when cursor leaves textarea
   */
  public onTextAreaMouseOut(event: MouseEvent): void {
    this.editorService.saveSelection();
  }

  /**
   * blur event
   */
  onTextAreaBlur(event: FocusEvent) {
    /**
     * save selection if focussed out
     */
    this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);

    if (typeof this.onTouched === 'function') {
      this.onTouched();
    }

    if (event.relatedTarget !== null) {
      const parent = (event.relatedTarget as HTMLElement).parentElement;
      if (!parent.classList.contains('angular-editor-toolbar-set') && !parent.classList.contains('ae-picker')) {
        this.blurEvent.emit(event);
        this.focused = false;
      }
    }
  }

  /**
   *  focus the text area when the editor is focused
   */
  focus() {
    if (this.modeVisual) {
      this.textArea().nativeElement.focus();
    } else {
      const sourceText = this.doc.getElementById('sourceText' + this.id());
      sourceText.focus();
      this.focused = true;
    }
  }

  /**
   * Executed from the contenteditable section while the input property changes
   * @param element html element from contenteditable
   */
  onContentChange(event: Event): void {
    const element: HTMLElement = event.target as HTMLElement;

    let html = '';
    if (this.modeVisual) {
      html = element.innerHTML;
    } else {
      html = element.innerText;
    }
    if ((!html || html === '<br>')) {
      html = '';
    }
    if (typeof this.onChange === 'function') {
      const config = this.config();
      const config = this.config();
      const config = this.config();
      this.onChange(config.sanitize || config.sanitize === undefined ?
        this.sanitizer.sanitize(SecurityContext.HTML, html) : html);
      if ((!html) !== this.showPlaceholder) {
        this.togglePlaceholder(this.showPlaceholder);
      }
    }
    this.changed = true;
  }

  /**
   * Set the function to be called
   * when the control receives a change event.
   *
   * @param fn a function
   */
  registerOnChange(fn: any): void {
    this.onChange = (e: string) => (e === '<br>' ? fn('') : fn(e));
  }

  /**
   * Set the function to be called
   * when the control receives a touch event.
   *
   * @param fn a function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Write a new value to the element.
   *
   * @param value value to be executed when there is a change in contenteditable
   */
  writeValue(value: any): void {

    if ((!value || value === '<br>' || value === '') !== this.showPlaceholder) {
      this.togglePlaceholder(this.showPlaceholder);
    }

    if (value === undefined || value === '' || value === '<br>') {
      value = null;
    }

    this.refreshView(value);
  }

  /**
   * refresh view/HTML of the editor
   *
   * @param value html string from the editor
   */
  refreshView(value: string): void {
    const normalizedValue = value === null ? '' : value;
    this.r.setProperty(this.textArea().nativeElement, 'innerHTML', normalizedValue);

    return;
  }

  /**
   * toggles placeholder based on input string
   *
   * @param value A HTML string from the editor
   */
  togglePlaceholder(value: boolean): void {
    if (!value) {
      this.r.addClass(this.editorWrapper().nativeElement, 'show-placeholder');
      this.showPlaceholder = true;

    } else {
      this.r.removeClass(this.editorWrapper().nativeElement, 'show-placeholder');
      this.showPlaceholder = false;
    }
  }

  /**
   * Implements disabled state for this element
   *
   * @param isDisabled Disabled flag
   */
  setDisabledState(isDisabled: boolean): void {
    const div = this.textArea().nativeElement;
    const action = isDisabled ? 'addClass' : 'removeClass';
    this.r[action](div, 'disabled');
    this.disabled = isDisabled;
  }

  /**
   * toggles editor mode based on bToSource bool
   *
   * @param bToSource A boolean value from the editor
   */
  toggleEditorMode(bToSource: boolean) {
    let oContent: any;
    const editableElement = this.textArea().nativeElement;

    if (bToSource) {
      oContent = this.r.createText(editableElement.innerHTML);
      this.r.setProperty(editableElement, 'innerHTML', '');
      this.r.setProperty(editableElement, 'contentEditable', false);

      const oPre = this.r.createElement('pre');
      this.r.setStyle(oPre, 'margin', '0');
      this.r.setStyle(oPre, 'outline', 'none');

      const oCode = this.r.createElement('code');
      this.r.setProperty(oCode, 'id', 'sourceText' + this.id());
      this.r.setStyle(oCode, 'display', 'block');
      this.r.setStyle(oCode, 'white-space', 'pre-wrap');
      this.r.setStyle(oCode, 'word-break', 'keep-all');
      this.r.setStyle(oCode, 'outline', 'none');
      this.r.setStyle(oCode, 'margin', '0');
      this.r.setStyle(oCode, 'background-color', '#fff5b9');
      this.r.setProperty(oCode, 'contentEditable', true);
      this.r.appendChild(oCode, oContent);
      this.focusInstance = this.r.listen(oCode, 'focus', (event: FocusEvent) => this.onTextAreaFocus(event));
      this.blurInstance = this.r.listen(oCode, 'blur', (event: FocusEvent) => this.onTextAreaBlur(event));
      this.r.appendChild(oPre, oCode);
      this.r.appendChild(editableElement, oPre);

      // ToDo move to service
      this.doc.execCommand('defaultParagraphSeparator', false, 'div');

      this.modeVisual = false;
      this.viewMode.emit(false);
      oCode.focus();
    } else {
      if (this.doc.querySelectorAll) {
        this.r.setProperty(editableElement, 'innerHTML', editableElement.innerText);
      } else {
        oContent = this.doc.createRange();
        oContent.selectNodeContents(editableElement.firstChild);
        this.r.setProperty(editableElement, 'innerHTML', oContent.toString());
      }
      this.r.setProperty(editableElement, 'contentEditable', true);
      this.modeVisual = true;
      this.viewMode.emit(true);
      this.onContentChange(editableElement);
      editableElement.focus();
    }
    this.editorToolbar().setEditorMode(!this.modeVisual);
  }

  /**
   * toggles editor buttons when cursor moved or positioning
   *
   * Send a node array from the contentEditable of the editor
   */
  exec() {
    this.editorToolbar().triggerButtons();

    let userSelection;
    if (this.doc.getSelection) {
      userSelection = this.doc.getSelection();
      this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);
    }

    let a = userSelection.focusNode;
    const els = [];
    while (a && a.id !== 'editor') {
      els.unshift(a);
      a = a.parentNode;
    }
    this.editorToolbar().triggerBlocks(els);
  }

  private configure() {
    this.editorService.uploadUrl = this.config().uploadUrl;
    this.editorService.uploadWithCredentials = this.config().uploadWithCredentials;
    const config = this.config();
    const config = this.config();
    const config = this.config();
    if (config.defaultParagraphSeparator) {
      this.editorService.setDefaultParagraphSeparator(config.defaultParagraphSeparator);
    }
    if (config.defaultFontName) {
      this.editorService.setFontName(config.defaultFontName);
    }
    if (config.defaultFontSize) {
      this.editorService.setFontSize(config.defaultFontSize);
    }
  }

  getFonts() {
    const config = this.config();
    const config = this.config();
    const config = this.config();
    const fonts = config.fonts ? config.fonts : angularEditorConfig.fonts;
    return fonts.map((x: Font) => {
      return { label: x.name, value: x.name };
    });
  }

  getCustomTags() {
    const tags = ['span'];
    this.config().customClasses.forEach((x: CustomClass) => {
      if (x.tag !== undefined) {
        if (!tags.includes(x.tag)) {
          tags.push(x.tag);
        }
      }
    });
    return tags.join(',');
  }

  ngOnDestroy() {
    if (this.blurInstance) {
      this.blurInstance();
    }
    if (this.focusInstance) {
      this.focusInstance();
    }
  }

  filterStyles(html: string): string {
    html = html.replace('position: fixed;', '');
    return html;
  }
}
