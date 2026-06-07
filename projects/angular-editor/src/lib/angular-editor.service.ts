import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CustomClass } from './config';

export interface UploadResponse {
  imageUrl: string;
}

@Injectable()
export class AngularEditorService {
  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);

  savedSelection: Range | null = null;
  selectedText = '';
  uploadUrl = '';
  uploadWithCredentials = false;

  /**
   * Executed command from editor header buttons exclude toggleEditorMode
   * @param command string from triggerCommand
   * @param value
   */
  executeCommand(command: string, value?: string) {
    const commands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
    if (commands.includes(command)) {
      this.doc.execCommand('formatBlock', false, command);
      return;
    }
    this.doc.execCommand(command, false, value);
  }

  /**
   * Create URL link
   * @param url string from UI prompt
   */
  createLink(url: string) {
    if (url.includes('http')) {
      const newUrl =
        '<a href="' + url + '" target="_blank">' + this.selectedText + '</a>';
      this.insertHtml(newUrl);
    } else {
      this.doc.execCommand('createlink', false, url);
    }
  }

  /**
   * insert color either font or background
   *
   * @param color color to be inserted
   * @param where where the color has to be inserted either text/background
   */
  insertColor(color: string, where: string): void {
    const restored = this.restoreSelection();
    if (restored) {
      if (where === 'textColor') {
        this.doc.execCommand('foreColor', false, color);
      } else {
        this.doc.execCommand('hiliteColor', false, color);
      }
    }
  }

  /**
   * Set font name
   * @param fontName string
   */
  setFontName(fontName: string) {
    this.doc.execCommand('fontName', false, fontName);
  }

  /**
   * Set font size
   * @param fontSize string
   */
  setFontSize(fontSize: string) {
    this.doc.execCommand('fontSize', false, fontSize);
  }

  /**
   * Create raw HTML
   * @param html HTML string
   */
  insertHtml(html: string): void {
    const isHTMLInserted = this.doc.execCommand('insertHTML', false, html);

    if (!isHTMLInserted) {
      throw new Error('Unable to perform the operation');
    }
  }

  /**
   * save selection when the editor is focussed out
   */
  public saveSelection = (): void => {
    if (this.doc.getSelection) {
      const sel = this.doc.getSelection();
      if (sel?.getRangeAt && sel.rangeCount) {
        this.savedSelection = sel.getRangeAt(0);
        this.selectedText = sel.toString();
      }
    } else if (this.doc.createRange != null && this.doc.getSelection != null) {
      this.savedSelection = document.createRange();
    } else {
      this.savedSelection = null;
    }
  };

  /**
   * restore selection when the editor is focused in
   *
   * saved selection when the editor is focused out
   */
  restoreSelection(): boolean {
    if (this.savedSelection) {
      if (this.doc.getSelection) {
        const sel = this.doc.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(this.savedSelection);
          return true;
        }
      }
    } else {
      return false;
    }
    return false;
  }

  /**
   * setTimeout used for execute 'saveSelection' method in next event loop iteration
   */
  public executeInNextQueueIteration(
    callbackFn: (...args: unknown[]) => unknown,
    timeout: number = 100,
  ): void {
    setTimeout(callbackFn, timeout);
  }

  /** check any selection is made or not */
  private checkSelection(): boolean {
    if (!this.savedSelection) {
      throw new Error('No Selection Made');
    }

    const selectedText = this.savedSelection.toString();

    if (selectedText.length === 0) {
      throw new Error('No Selection Made');
    }
    return true;
  }

  /**
   * Upload file to uploadUrl
   * @param file The file
   */
  uploadImage(file: File): Observable<HttpEvent<UploadResponse>> {
    const uploadData: FormData = new FormData();

    uploadData.append('file', file, file.name);

    return this.http.post<UploadResponse>(this.uploadUrl, uploadData, {
      reportProgress: true,
      observe: 'events',
      withCredentials: this.uploadWithCredentials,
    });
  }

  /**
   * Insert image with Url
   * @param imageUrl The imageUrl.
   */
  insertImage(imageUrl: string) {
    this.doc.execCommand('insertImage', false, imageUrl);
  }

  setDefaultParagraphSeparator(separator: string) {
    this.doc.execCommand('defaultParagraphSeparator', false, separator);
  }

  createCustomClass(customClass: CustomClass) {
    let newTag = this.selectedText;
    if (customClass) {
      const tagName = customClass.tag ? customClass.tag : 'span';
      newTag =
        '<' +
        tagName +
        ' class="' +
        customClass.class +
        '">' +
        this.selectedText +
        '</' +
        tagName +
        '>';
    }
    this.insertHtml(newTag);
  }

  insertVideo(videoUrl: string) {
    if (/www.youtube.com/.exec(videoUrl)) {
      this.insertYouTubeVideoTag(videoUrl);
    }
    if (/vimeo.com/.exec(videoUrl)) {
      this.insertVimeoVideoTag(videoUrl);
    }
  }

  private insertYouTubeVideoTag(videoUrl: string): void {
    const id = videoUrl.split('v=')[1];
    const imageUrl = `https://img.youtube.com/vi/${id}/0.jpg`;
    const thumbnail = `
      <div style='position: relative'>
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="click to watch"/>
          <img style='position: absolute; left:200px; top:140px'
          src="https://img.icons8.com/color/96/000000/youtube-play.png"/>
        </a>
      </div>`;
    this.insertHtml(thumbnail);
  }

  private insertVimeoVideoTag(videoUrl: string): void {
    const sub = this.http
      .get<any>(`https://vimeo.com/api/oembed.json?url=${videoUrl}`)
      .subscribe((data: any) => {
        const imageUrl = data.thumbnail_url_with_play_button;
        const thumbnail = `<div>
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="${data.title}"/>
        </a>
      </div>`;
        this.insertHtml(thumbnail);
        sub.unsubscribe();
      });
  }

  nextNode(node: Node | null): Node | null {
    if (!node) {
      return null;
    }
    if (node.hasChildNodes()) {
      return node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        node = node.parentNode;
      }
      if (!node) {
        return null;
      }
      return node.nextSibling;
    }
  }

  getRangeSelectedNodes(
    range: Range,
    includePartiallySelectedContainers: boolean,
  ): Node[] {
    let node: Node | null = range.startContainer;
    const endNode = range.endContainer;
    let rangeNodes: Node[] = [];

    // Special case for a range that is contained within a single node
    if (node === endNode) {
      rangeNodes = [node];
    } else {
      // Iterate nodes until we hit the end container
      while (node && node !== endNode) {
        node = this.nextNode(node);
        if (node) {
          rangeNodes.push(node);
        }
      }

      // Add partially selected nodes at the start of the range
      node = range.startContainer;
      while (node && node !== range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
      }
    }

    // Add ancestors of the range container, if required
    if (includePartiallySelectedContainers) {
      node = range.commonAncestorContainer;
      while (node) {
        rangeNodes.push(node);
        node = node.parentNode;
      }
    }

    return rangeNodes;
  }

  getSelectedNodes(): Node[] {
    const nodes: Node[] = [];
    if (this.doc.getSelection) {
      const sel = this.doc.getSelection();
      if (!sel) {
        return nodes;
      }
      for (let i = 0, len = sel.rangeCount; i < len; ++i) {
        nodes.push(...this.getRangeSelectedNodes(sel.getRangeAt(i), true));
      }
    }
    return nodes;
  }

  replaceWithOwnChildren(el: Node): void {
    const parent = el.parentNode;
    if (!parent) {
      return;
    }
    while (el.hasChildNodes()) {
      const firstChild = el.firstChild;
      if (!firstChild) {
        break;
      }
      (el as ChildNode).before(firstChild);
    }
    (el as ChildNode).remove();
  }

  removeSelectedElements(tagNames: string): void {
    const tagNamesArray = new Set(tagNames.toLowerCase().split(','));
    this.getSelectedNodes().forEach((node: Node) => {
      if (
        node.nodeType === 1 &&
        tagNamesArray.has((node as Element).tagName.toLowerCase())
      ) {
        // Remove the node and replace it with its children
        this.replaceWithOwnChildren(node);
      }
    });
  }
}
