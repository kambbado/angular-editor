import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';


export function isDefined(value: any) {
  return value !== undefined && value !== null;
}

export class ExecCommandReplacement {
  private static doc = inject(DOCUMENT);

  private static getSelectionAndRange(): { selection: Selection | null; range: Range | null } {
    const selection = this.doc.getSelection();
    return selection && selection.rangeCount > 0
      ? { selection, range: selection.getRangeAt(0) }
      : { selection: null, range: null };
  }

private static insertNodeAtRange(range: Range, node: Node, selectNewNode = false): void {
  range.deleteContents();
  range.insertNode(node);
  selectNewNode ? range.selectNode(node) : range.collapse(false);
  const selection = this.doc.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

  private static surroundRangeWithElement(range: Range, element: HTMLElement): void {
    try {
      range.surroundContents(element);
      const selection = this.doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch (e) {
      console.warn('Failed to surround range:', e);
    }
  }

  public static defaultParagraphSeparator(separator: string ='div'): void {
    const { range } = this.getSelectionAndRange();
    if (!range) return;

    const block = this.doc.createElement(separator);
    block.appendChild(this.doc.createElement('br')); // Ensure empty block takes space
    this.insertNodeAtRange(range, block, true);
  }

  public static formatBlock(blockType: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (!range || !selection) return;

    const newBlock = this.doc.createElement(blockType);
    const commonAncestor = range.commonAncestorContainer;

    if (commonAncestor.nodeType === Node.TEXT_NODE) {
      this.surroundRangeWithElement(range, newBlock);
      selection.selectAllChildren(newBlock);
      return;
    }

    const blockParents = new Set<HTMLElement>();
    const walker = this.doc.createTreeWalker(
      commonAncestor,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: HTMLElement) =>
          range.intersectsNode(node) && this.doc.defaultView?.getComputedStyle(node).display === 'block' && node.isContentEditable
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      },
    );

    let node: HTMLElement | null = walker.firstChild() as HTMLElement;
    while (node) {
      blockParents.add(node);
      node = walker.nextNode() as HTMLElement;
    }

    if (blockParents.size > 0) {
      blockParents.forEach((block) => {
        const newBlockClone = this.doc.createElement(blockType);
        while (block.firstChild) newBlockClone.appendChild(block.firstChild);
        block.replaceWith(newBlockClone);
      });
    } else {
      this.surroundRangeWithElement(range, newBlock);
      selection.selectAllChildren(newBlock);
    }
  }

  public static insertLink(url: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (!range || !selection) return;

    const link = this.doc.createElement('a');
    link.href = url;
    const selectedText = range.toString();

    if (selectedText) {
      link.textContent = selectedText;
      this.insertNodeAtRange(range, link, true);
    } else {
      link.textContent = url;
      const caretRange = range.cloneRange();
      caretRange.collapse(true);
      caretRange.insertNode(link);
      caretRange.setStartAfter(link);
      selection.removeAllRanges();
      selection.addRange(caretRange);
    }
  }

  public static replaceInsertColor(colorClass: string): void {
    const { range } = this.getSelectionAndRange();
    if (!range) return;

    const span = this.doc.createElement('span');
    span.classList.add(colorClass);
    this.surroundRangeWithElement(range, span);
  }

  public static replaceHighlightColorWithSpan(color: string): void {
    const { range } = this.getSelectionAndRange();
    if (!range) return;

    const span = this.doc.createElement('span');
    span.style.backgroundColor = color;
    this.surroundRangeWithElement(range, span);
  }

  public static replaceFontNameWithSpan(fontName: string): void {
    const { range } = this.getSelectionAndRange();
    if (!range) return;

    const span = this.doc.createElement('span');
    span.style.fontFamily = fontName;
    this.surroundRangeWithElement(range, span);
  }

  public static replaceFontSizeWithSpan(fontSize: string): void {
    const { range } = this.getSelectionAndRange();
    if (!range) return;

    const span = this.doc.createElement('span');
    span.style.fontSize = fontSize;
    this.surroundRangeWithElement(range, span);
  }

  public static replaceInsertHTML(html: string): boolean {
    const { range } = this.getSelectionAndRange();
    if (!range) return false;

    const fragment = this.doc.createDocumentFragment();
    const tempElement = this.doc.createElement('div');
    tempElement.innerHTML = html;
    while (tempElement.firstChild) fragment.appendChild(tempElement.firstChild);

    this.insertNodeAtRange(range, fragment);
    return true;
  }

  public static replaceInsertImage(imageUrl: string): boolean {
    const { range } = this.getSelectionAndRange();
    if (!range) return false;

    const img = this.doc.createElement('img');
    img.src = imageUrl;
    this.insertNodeAtRange(range, img);
    return true;
  }

  public static replaceExecCommand(command: string, value?: string): boolean {
    const { range, selection } = this.getSelectionAndRange();
    if (!range || !selection) return false;

    const blockCommands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
    if (blockCommands.includes(command)) {
      this.formatBlock(command);
      return true;
    }

    const inlineTagMap: Record<string, string> = {
      bold: 'b',
      italic: 'i',
      underline: 'u',
    };

    if (command in inlineTagMap) {
      const element = this.doc.createElement(inlineTagMap[command]);
      this.surroundRangeWithElement(range, element);
      return true;
    }

    switch (command) {
      case 'foreColor':
        if (value) {
          const span = this.doc.createElement('span');
          span.style.color = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'hiliteColor':
      case 'backColor':
        if (value) {
          const span = this.doc.createElement('span');
          span.style.backgroundColor = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'fontName':
        if (value) {
          const span = this.doc.createElement('span');
          span.style.fontFamily = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'fontSize':
        if (value) {
          const span = this.doc.createElement('span');
          span.style.fontSize = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'insertHTML':
        if (value) return this.replaceInsertHTML(value);
        return false;

      case 'insertImage':
        if (value) return this.replaceInsertImage(value);
        return false;

      case 'createLink':
        if (value) {
          this.insertLink(value);
          return true;
        }
        return false;

      default:
        console.warn(`Unsupported command: ${command}`);
        return false;
    }
  }
}
