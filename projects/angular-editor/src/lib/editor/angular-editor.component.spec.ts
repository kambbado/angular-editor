import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularEditorComponent } from './angular-editor.component';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { AngularEditorConfig, angularEditorConfig } from '../config';
import { vi } from 'vitest';

@Component({
  standalone: true,
  imports: [AngularEditorComponent],
  template:
    '<angular-editor autofocus tabindex="0" [config]="config"></angular-editor>',
})
class HostComponent {
  config: AngularEditorConfig = { ...angularEditorConfig };
}

describe('AngularEditorComponent', () => {
  let component: AngularEditorComponent;
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.query(
      By.directive(AngularEditorComponent),
    ).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should paste raw text', () => {
    const htmlText = '<h1>Hello!</h1>';
    const rawText = 'Hello!';
    hostComponent.config = { ...hostComponent.config, rawPaste: true };
    fixture.detectChanges();

    const execSpy = vi.fn((..._args: any[]) => true);
    const previousExec = (document as any).execCommand;
    Object.defineProperty(document, 'execCommand', {
      value: execSpy,
      configurable: true,
    });

    const clipboardEvent = {
      preventDefault: vi.fn(),
      clipboardData: {
        getData: (type: string) => (type === 'text/plain' ? rawText : htmlText),
      },
    } as unknown as ClipboardEvent;

    const outputRawText = component.onPaste(clipboardEvent);

    expect(outputRawText).toEqual(rawText);
    expect(execSpy).toHaveBeenCalledWith('insertHTML', false, rawText);
    Object.defineProperty(document, 'execCommand', {
      value: previousExec,
      configurable: true,
    });
  });
});
