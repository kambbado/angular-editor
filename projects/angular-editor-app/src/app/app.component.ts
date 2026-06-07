import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AngularEditorConfig } from 'angular-editor';
import { AngularEditorComponent } from '../../../angular-editor/src/lib/editor/angular-editor.component';
import { AeToolbarSetComponent } from '../../../angular-editor/src/lib/ae-toolbar-set/ae-toolbar-set.component';
import { AeButtonComponent } from '../../../angular-editor/src/lib/ae-button/ae-button.component';

const ANGULAR_EDITOR_LOGO_URL =
  'https://raw.githubusercontent.com/kolkov/angular-editor/master/docs/angular-editor-logo.png?raw=true';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorComponent,
    AeToolbarSetComponent,
    AeButtonComponent,
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  title = 'app';

  form!: FormGroup<{ signature: FormControl<string | null> }>;

  htmlContent1 = '';
  htmlContent2 = '';
  angularEditorLogo = `<img alt="angular editor logo" src="${ANGULAR_EDITOR_LOGO_URL}">`;

  config1: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    sanitize: false,
    // toolbarPosition: 'top',
    outline: true,
    defaultFontName: 'Comic Sans MS',
    defaultFontSize: '5',
    // showToolbar: false,
    defaultParagraphSeparator: 'p',
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    toolbarHiddenButtons: [['bold', 'italic']],
  };

  config2: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    sanitize: true,
    toolbarPosition: 'bottom',
    defaultFontName: 'Comic Sans MS',
    defaultFontSize: '5',
    defaultParagraphSeparator: 'p',
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  ngOnInit() {
    this.form = this.formBuilder.group({
      signature: ['', Validators.required],
    });
    console.warn(this.htmlContent1);
  }

  onChange(event: string | Event) {
    console.warn('changed');
  }

  onBlur(event: FocusEvent) {
    console.warn('blur', event);
  }

  onChange2(event: Event) {
    console.warn(this.form.value);
  }
}
