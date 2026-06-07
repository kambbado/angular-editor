import { DOCUMENT } from '@angular/common';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  computed,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AeButtonComponent } from '../ae-button/ae-button.component';
import {
  AeSelectComponent,
  SelectOption,
} from '../ae-select/ae-select.component';
import { AeToolbarSetComponent } from '../ae-toolbar-set/ae-toolbar-set.component';
import {
  AngularEditorService,
  UploadResponse,
} from '../angular-editor.service';
import { CustomClass } from '../config';

@Component({
  selector: 'angular-editor-toolbar, ae-toolbar, div[aeToolbar]',
  templateUrl: './ae-toolbar.component.html',
  styleUrls: ['./ae-toolbar.component.scss'],
  imports: [
    FormsModule,
    AeButtonComponent,
    AeSelectComponent,
    AeToolbarSetComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AeToolbarComponent implements OnInit {
  private readonly r = inject(Renderer2);
  private readonly editorService = inject(AngularEditorService);
  private readonly er = inject(ElementRef);
  private readonly doc = inject(DOCUMENT);

  htmlMode = false;
  linkSelected = false;
  block = 'default';
  fontName = 'Times New Roman';
  fontSize = '3';
  foreColour: string | null = null;
  backColor: string | null = null;

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
      value: 'pre',
    },
    {
      label: 'Standard',
      value: 'div',
    },
    {
      label: 'default',
      value: 'default',
    },
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
    },
  ];

  customClassId = '-1';

  readonly customClassList = computed(() => {
    const classes = this.customClasses() ?? [];
    const list: SelectOption[] = classes.map((x, i) => ({
      label: x.name,
      value: i.toString(),
    }));
    list.unshift({ label: 'Clear Class', value: '-1' });
    return list;
  });

  // uploadUrl: string;

  tagMap: Record<string, string> = {
    BLOCKQUOTE: 'indent',
    A: 'link',
  };

  select = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'DIV'];

  buttons = [
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'subscript',
    'superscript',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    'justifyFull',
    'indent',
    'outdent',
    'insertUnorderedList',
    'insertOrderedList',
    'link',
  ];

  readonly id = input<string | undefined>(undefined);
  readonly uploadUrl = input<string | undefined>(undefined);
  readonly upload = input<
    ((file: File) => Observable<HttpEvent<UploadResponse>>) | undefined
  >(undefined);
  readonly showToolbar = input<boolean | undefined>(undefined);
  readonly fonts = input<SelectOption[]>([{ label: '', value: '' }]);
  readonly customClasses = input<CustomClass[] | undefined>(undefined);
  readonly defaultFontName = input<string | undefined>(undefined);
  readonly defaultFontSize = input<string | undefined>(undefined);

  ngOnInit(): void {
    const fontName = this.defaultFontName();
    if (fontName) {
      this.fontName = fontName;
    }
    const fontSize = this.defaultFontSize();
    if (fontSize) {
      this.fontSize = fontSize;
    }
  }

  readonly hiddenButtons = input<string[][] | undefined>(undefined);

  readonly execute = output<string>();

  readonly myInputFile = viewChild<ElementRef>('fileInput');

  public get isLinkButtonDisabled(): boolean {
    return this.htmlMode || !this.editorService.selectedText;
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
    this.linkSelected = nodes.some((x: Node) => x.nodeName === 'A');
    let found = false;
    this.select.forEach((y: string) => {
      const node = nodes.find((x: Node) => x.nodeName === y);
      if (y === node?.nodeName) {
        if (found === false) {
          this.block = node.nodeName.toLowerCase();
          found = true;
        }
      } else if (found === false) {
        this.block = 'default';
      }
    });

    found = false;
    const customClasses = this.customClasses() ?? [];
    if (customClasses.length > 0) {
      customClasses.forEach((y: CustomClass, index: number) => {
        const node = nodes.find((x: Node) => {
          if (x instanceof Element) {
            return x.className === y.class;
          }
          return false;
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

    Object.keys(this.tagMap).forEach((e: string) => {
      const elementById = this.doc.getElementById(
        this.tagMap[e] + '-' + this.id(),
      );
      const node = nodes.find((x: Node) => x.nodeName === e);
      if (e === node?.nodeName) {
        this.r.addClass(elementById, 'active');
      } else {
        this.r.removeClass(elementById, 'active');
      }
    });

    this.foreColour = this.getForeColor();
    this.fontSize = this.getFontSize() ?? this.fontSize;
    this.fontName = this.getFontName()?.replaceAll('"', '') ?? this.fontName;
    this.backColor = this.getBackColor();
  }

  getFontName(): string | null {
    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null; // No selection
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;

    // Find the closest element node in the selection
    let element =
      startNode instanceof Element ? startNode : startNode.parentElement;

    while (element) {
      const fontName =
        this.doc.defaultView?.getComputedStyle(element).fontFamily;
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
    let element =
      startNode instanceof Element ? startNode : startNode.parentElement;

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
    let element =
      startNode instanceof Element ? startNode : startNode.parentElement;

    while (element) {
      const backColor =
        this.doc.defaultView?.getComputedStyle(element).backgroundColor;
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
    let element =
      startNode instanceof Element ? startNode : startNode.parentElement;

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
    let url = 'https://';
    const selection = this.editorService.savedSelection;
    if (
      selection &&
      selection.commonAncestorContainer.parentElement?.nodeName === 'A'
    ) {
      const parent = selection.commonAncestorContainer
        .parentElement as HTMLAnchorElement;
      if (parent.href !== '') {
        url = parent.href;
      }
    }
    const promptUrl = prompt('Insert URL link', url);
    if (promptUrl && promptUrl !== '' && promptUrl !== 'https://') {
      this.editorService.createLink(promptUrl);
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
    const toggleEditorModeButton = this.doc.getElementById(
      'toggleEditorMode' + '-' + this.id(),
    );
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
          upload(selectedFile).subscribe(
            (response: HttpEvent<UploadResponse>) => {
              if (response instanceof HttpResponse) {
                this.watchUploadImage(response, event);
              }
            },
          );
        } else if (this.uploadUrl()) {
          this.editorService
            .uploadImage(selectedFile)
            .subscribe((response: HttpEvent<UploadResponse>) => {
              if (response instanceof HttpResponse) {
                this.watchUploadImage(response, event);
              }
            });
        } else {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent) => {
            const fr = e.currentTarget as FileReader;
            if (typeof fr.result === 'string') {
              this.editorService.insertImage(fr.result);
            }
          };
          reader.readAsDataURL(selectedFile);
        }
      }
    }
  }

  watchUploadImage(
    response: HttpResponse<{ imageUrl: string }>,
    event: Event,
  ): void {
    const imageUrl = response.body?.imageUrl;
    if (!imageUrl) {
      return;
    }
    this.editorService.insertImage(imageUrl);
    (event.target as HTMLInputElement).value = '';
  }

  /**
   * Set custom class
   */
  setCustomClass(classId: string) {
    if (classId === '-1') {
      this.execute.emit('clear');
    } else {
      const classes = this.customClasses();
      if (classes) {
        this.editorService.createCustomClass(classes[+classId]);
      }
    }
  }

  isButtonHidden(name: string): boolean {
    if (!name) {
      return false;
    }
    const hiddenButtons = this.hiddenButtons();
    if (!Array.isArray(hiddenButtons)) {
      return false;
    }
    let result: string | undefined;
    for (const arr of hiddenButtons) {
      if (Array.isArray(arr)) {
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
