import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight, faBold,
  faCode, faFont, faImage, faIndent, faItalic, faLink, faLinkSlash, faListOl,
  faListUl, faMinus, faOutdent, faRepeat, faStrikethrough, faSubscript,
  faUnderline, faUndo, faVideo, faXmark, fas
} from '@fortawesome/free-solid-svg-icons';
import { AeButtonComponent } from './ae-button/ae-button.component';
import { AeSelectComponent } from './ae-select/ae-select.component';
import { AeToolbarSetComponent } from './ae-toolbar-set/ae-toolbar-set.component';
import { AeToolbarComponent } from './ae-toolbar/ae-toolbar.component';
import { AngularEditorComponent } from './editor/angular-editor.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  declarations: [
    AngularEditorComponent,
    AeToolbarComponent,
    AeSelectComponent,
    AeButtonComponent,
    AeToolbarSetComponent],
  exports: [
    AngularEditorComponent,
    AeToolbarComponent,
    AeButtonComponent,
    AeToolbarSetComponent]
})
export class AngularEditorModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas);
    library.addIcons(faUndo, faRepeat, faBold, faItalic, faUnderline,
      faStrikethrough, faSubscript, faAlignLeft, faAlignCenter,
      faAlignRight, faAlignJustify,
      faIndent, faOutdent, faListUl, faListOl, faFont, faLink,
      faLinkSlash, faImage, faVideo, faMinus, faXmark, faCode);
  }
}
