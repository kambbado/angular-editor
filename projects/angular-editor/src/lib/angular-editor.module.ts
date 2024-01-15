import { NgModule } from "@angular/core";
import { AngularEditorComponent } from "./angular-editor.component";
import { AngularEditorToolbarComponent } from "./angular-editor-toolbar.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AeSelectComponent } from "./ae-select/ae-select.component";
import { AeButtonComponent } from "./ae-button/ae-button.component";
import { AeToolbarSetComponent } from "./ae-toolbar-set/ae-toolbar-set.component";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight, faBold, faCode, faFont, faImage, faIndent, faItalic, faLink, faLinkSlash, faListOl, faListUl, faMinus, faOutdent, faRepeat, faStrikethrough, faSubscript, faUnderline, faUndo, faVideo, faXmark, fas } from "@fortawesome/free-solid-svg-icons";

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  declarations: [
    AngularEditorComponent,
    AngularEditorToolbarComponent,
    AeSelectComponent,
    AeButtonComponent,
    AeToolbarSetComponent,
  ],
  exports: [
    AngularEditorComponent,
    AngularEditorToolbarComponent,
    AeButtonComponent,
    AeToolbarSetComponent,
  ],
})
export class AngularEditorModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas);
    library.addIcons(faUndo, faRepeat, faBold, faItalic, faUnderline, faStrikethrough, faSubscript, faAlignLeft, faAlignCenter, faAlignRight, faAlignJustify,
      faIndent, faOutdent, faListUl, faListOl, faFont, faLink, faLinkSlash, faImage, faVideo, faMinus, faXmark, faCode);
  }
}
