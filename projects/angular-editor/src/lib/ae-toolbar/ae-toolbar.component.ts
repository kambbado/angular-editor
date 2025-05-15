import { DOCUMENT } from '@angular/common';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, Input, Renderer2, inject, output, viewChild, input } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectOption } from '../ae-select/ae-select.component';
import { AngularEditorService, UploadResponse } from '../angular-editor.service';
import { CustomClass } from '../config';

@Component({
  selector: 'angular-editor-toolbar, ae-toolbar, div[aeToolbar]',
  templateUrl: './ae-toolbar.component.html',
  styleUrls: ['./ae-toolbar.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AeToolbarComponent {
  private r = inject(Renderer2);
  private editorService = inject(AngularEditorService);
  private er = inject(ElementRef);
  private doc = inject(DOCUMENT);

  htmlMode = false;
  linkSelected = false;
  block = 'default';
  fontName = 'Times New Roman';
  fontSize = '3';
  foreColour;
  backColor;

  headings: SelectOption[] = [
    {
      label: 'Heading 1',
      value: 'h1',
    },
    {
      label: 'Heading 2',
      value: 'h2',
    },
    {
      label: 'Heading 3',
      value: 'h3',
    },
    {
      label: 'Heading 4',
      value: 'h4',
    },
    {
      label: 'Heading 5',
      value: 'h5',
    },
    {
      label: 'Heading 6',
      value: 'h6',
    },
    {
      label: 'Paragraph',
      value: 'p',
    },
    {
      label: 'Predefined',
      value: 'pre'
    },
    {
      label: 'Standard',
      value: 'div'
    },
    {
      label: 'default',
      value: 'default'
    }
  ];

  fontSizes: SelectOption[] = [
    {
      label: '1',
      value: '1',
    },
    {
      label: '2',
      value: '2',
    },
    {
      label: '3',
      value: '3',
    },
    {
      label: '4',
      value: '4',
    },
    {
      label: '5',
      value: '5',
    },
    {
      label: '6',
      value: '6',
    },
    {
      label: '7',
      value: '7',
    }
  ];

  customClassId = '-1';

  _customClasses: CustomClass[];
  customClassList: SelectOption[] = [{ label: '', value: '' }];
  // uploadUrl: string;

  tagMap = {
    BLOCKQUOTE: 'indent',
    A: 'link'
  };

  select = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'DIV'];

  buttons = ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'justifyLeft', 'justifyCenter',
    'justifyRight', 'justifyFull', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'link'];

  readonly id = input<string>(undefined);
  readonly uploadUrl = input<string>(undefined);
  readonly upload = input<(file: File) => Observable<HttpEvent<UploadResponse>>>(undefined);
  readonly showToolbar = input<boolean>(undefined);
  readonly fonts = input<SelectOption[]>([{ label: '', value: '' }]);

  @Input()
  set customClasses(classes: CustomClass[]) {
    if (classes) {
      this._customClasses = classes;
      this.customClassList = this._customClasses.map((x: CustomClass, i: number) => ({ label: x.name, value: i.toString() }));
      this.customClassList.unshift({ label: 'Clear Class', value: '-1' });
    }
  }

  @Input()
  set defaultFontName(value: string) {
    if (value) {
      this.fontName = value;
    }
  }

  @Input()
  set defaultFontSize(value: string) {
    if (value) {
      this.fontSize = value;
    }
  }

  readonly hiddenButtons = input<string[][]>(undefined);

  readonly execute = output<string>();

  readonly myInputFile = viewChild<ElementRef>('fileInput');

  public get isLinkButtonDisabled(): boolean {
    return this.htmlMode || !Boolean(this.editorService.selectedText);
  }

  /**
   * Trigger command from editor header buttons
   * @param command string from toolbar buttons
   */
  triggerCommand(command: string) {
    this.execute.emit(command);
  }

  /**
   * highlight editor buttons when cursor moved or positioning
   */
  triggerButtons() {
    if (!this.showToolbar()) {
      return;
    }

    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.buttons.forEach((e: string) => {
        const elementById = this.doc.getElementById(e + '-' + this.id());
        this.r.removeClass(elementById, 'active');
      });
    }
  }

  /**
   * trigger highlight editor buttons when cursor moved or positioning in block
   */
  triggerBlocks(nodes: Node[]) {
    if (!this.showToolbar()) {
      return;
    }
    this.linkSelected = nodes.findIndex((x: Node) => x.nodeName === 'A') > -1;
    let found = false;
    this.select.forEach((y: string) => {
      const node = nodes.find((x: Node) => x.nodeName === y);
      if (node !== undefined && y === node.nodeName) {
        if (found === false) {
          this.block = node.nodeName.toLowerCase();
          found = true;
        }
      } else if (found === false) {
        this.block = 'default';
      }
    });

    found = false;
    if (this._customClasses) {
      this._customClasses.forEach((y: CustomClass, index: number) => {
        const node = nodes.find((x: Node) => {
          if (x instanceof Element) {
            return x.className === y.class;
          }
        });
        if (node !== undefined) {
          if (found === false) {
            this.customClassId = index.toString();
            found = true;
          }
        } else if (found === false) {
          this.customClassId = '-1';
        }
      });
    }

    Object.keys(this.tagMap).map((e: string) => {
      const elementById = this.doc.getElementById(this.tagMap[e] + '-' + this.id());
      const node = nodes.find((x: Node) => x.nodeName === e);
      if (node !== undefined && e === node.nodeName) {
        this.r.addClass(elementById, 'active');
      } else {
        this.r.removeClass(elementById, 'active');
      }
    });

    this.foreColour = this.getForeColor();
    this.fontSize = this.getFontSize();
    this.fontName = this.getFontName()?.replace(/"/g, '');
    this.backColor = this.getBackColor;
  }

  getFontName(): string | null {
    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null; // No selection
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;

    // Find the closest element node in the selection
    let element = startNode instanceof Element ? startNode : startNode.parentElement;

    while (element) {
      const fontName = this.doc.defaultView?.getComputedStyle(element).fontFamily;
      if (fontName) {
        return fontName;
      }
      element = element.parentElement;
    }

    return null; // No font name found in the ancestors
  }
  getFontSize(): string | null {
    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null; // No selection
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;

    // Find the closest element node in the selection
    let element = startNode instanceof Element ? startNode : startNode.parentElement;

    while (element) {
      const fontSize = this.doc.defaultView?.getComputedStyle(element).fontSize;
      if (fontSize) {
        return fontSize;
      }
      element = element.parentElement;
    }

    return null; // No color found in the ancestors
  }
  getBackColor(): string | null {
    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null; // No selection
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    // Find the closest element node in the selection
    let element = startNode instanceof Element ? startNode : startNode.parentElement;

    while (element) {
      const backColor = this.doc.defaultView?.getComputedStyle(element).backgroundColor;
      if (backColor) {
        return backColor;
      }
      element = element.parentElement;
    }

    return null; // No color found in the ancestors
  }

  getForeColor(): string | null {
    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null; // No selection
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;

    // Find the closest element node in the selection
    let element = startNode instanceof Element ? startNode : startNode.parentElement;

    while (element) {
      const color = this.doc.defaultView?.getComputedStyle(element).color;
      if (color) {
        return color;
      }
      element = element.parentElement;
    }

    return null; // No color found in the ancestors
  }
  /**
   * insert URL link
   */
  insertUrl() {
    let url = 'https:\/\/';
    const selection = this.editorService.savedSelection;
    if (selection && selection.commonAncestorContainer.parentElement.nodeName === 'A') {
      const parent = selection.commonAncestorContainer.parentElement as HTMLAnchorElement;
      if (parent.href !== '') {
        url = parent.href;
      }
    }
    url = prompt('Insert URL link', url);
    if (url && url !== '' && url !== 'https://') {
      this.editorService.createLink(url);
    }
  }

  /**
   * insert Video link
   */
  insertVideo() {
    this.execute.emit('');
    const url = prompt('Insert Video link', 'https://');
    if (url && url !== '' && url !== 'https://') {
      this.editorService.insertVideo(url);
    }
  }

  /** insert color */
  insertColor(color: string, where: string) {
    this.editorService.insertColor(color, where);
    this.execute.emit('');
  }

  /**
   * set font Name/family
   * @param foreColor string
   */
  setFontName(foreColor: string): void {
    this.editorService.setFontName(foreColor);
    this.execute.emit('');
  }

  /**
   * set font Size
   * @param fontSize string
   */
  setFontSize(fontSize: string): void {
    this.editorService.setFontSize(fontSize);
    this.execute.emit('');
  }

  /**
   * toggle editor mode (WYSIWYG or SOURCE)
   * @param m boolean
   */
  setEditorMode(m: boolean) {
    const toggleEditorModeButton = this.doc.getElementById('toggleEditorMode' + '-' + this.id());
    if (m) {
      this.r.addClass(toggleEditorModeButton, 'active');
    } else {
      this.r.removeClass(toggleEditorModeButton, 'active');
    }
    this.htmlMode = m;
  }

  /**
   * Upload image when file is selected.
   */
  onFileChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const selectedFile: File = inputElement.files[0]; // Access the first selected file
      if (selectedFile.type.includes('image/')) {
        const upload = this.upload();
        if (upload) {
          upload(selectedFile).subscribe((response: HttpResponse<UploadResponse>) => this.watchUploadImage(response, event));
        } else if (this.uploadUrl()) {
          this.editorService.uploadImage(selectedFile).subscribe((response: HttpResponse<UploadResponse>) => this.watchUploadImage(response, event));
        } else {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent) => {
            const fr = e.currentTarget as FileReader;
            this.editorService.insertImage(fr.result.toString());
          };
          reader.readAsDataURL(selectedFile);
        }
      }
    }
  }

  watchUploadImage(response: HttpResponse<{ imageUrl: string }>, event: Event) {
    const { imageUrl } = response.body;
    this.editorService.insertImage(imageUrl);
    (event.target as HTMLInputElement).value = null;
  }

  /**
   * Set custom class
   */
  setCustomClass(classId: string) {
    if (classId === '-1') {
      this.execute.emit('clear');
    } else {
      this.editorService.createCustomClass(this._customClasses[+classId]);
    }
  }

  isButtonHidden(name: string): boolean {
    if (!name) {
      return false;
    }
    const hiddenButtons = this.hiddenButtons();
    if (!(hiddenButtons instanceof Array)) {
      return false;
    }
    let result: any;
    for (const arr of hiddenButtons) {
      if (arr instanceof Array) {
        result = arr.find((item: string) => item === name);
      }
      if (result) {
        break;
      }
    }
    return result !== undefined;
  }

  focus() {
    this.execute.emit('focus');
    console.warn('focused');
  }
}
