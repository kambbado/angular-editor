import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';


export function isDefined(value: any) {
  return value !== undefined && value !== null;
}

export class ExecCommandReplacement {
  private static doc = inject(DOCUMENT);

  private static getSelectionAndRange(): { selection: Selection | null; range: Range | null } {
    const selection = this.doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { selection: null, range: null };
    }
    return { selection, range: selection.getRangeAt(0) };
  }

  private static insertNodeAtRange(range: Range, node: Node, selectNewNode: boolean = false): void {
    range.deleteContents();
    range.insertNode(node);
    if (selectNewNode) {
      range.selectNode(node);
    } else {
      range.collapse(false); // Collapse to the end
    }
    const selection = this.doc.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private static surroundRangeWithElement(range: Range, element: Element): void {
    range.surroundContents(element);
    const selection = this.doc.getSelection();
    selection?.removeAllRanges();
  }

  public static defaultParagraphSeparator(separator: string = 'div'): void {
    const { selection, range } = this.getSelectionAndRange();
    if (!range) {
      return;
    }

    const div = this.doc.createElement(separator);
    const br = this.doc.createElement('br'); // Ensure an empty div takes up some space

    div.appendChild(br);
    this.insertNodeAtRange(range, div, true); // Select the new div
  }

  public static formatBlock(blockType: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (!range) {
      return;
    }

    const selectedNodes: Node[] = [];

    // Helper function to get all nodes within a range
    function getNodesInRange(r: Range, nodeList: Node[]) {
      const walker = this.doc.createTreeWalker(r.commonAncestorContainer, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, (node: Node) => {
        if (r.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      });
      let node = walker.firstChild();
      while (node) {
        nodeList.push(node);
        node = walker.nextNode();
      }
    }

    getNodesInRange.call(this, range, selectedNodes);

    if (selectedNodes.length > 0) {
      // Find the closest parent block elements encompassing the selection
      const blockParents: Element[] = [];
      selectedNodes.forEach(node => {
        let parent: Element | null = node instanceof Element ? node : node.parentElement;
        while (parent && this.doc.defaultView?.getComputedStyle(parent).display !== 'block') {
          parent = <HTMLElement | null>parent.parentElement;
        }
        if (parent && !blockParents.includes(parent) && (<HTMLElement>parent).isContentEditable) {
          blockParents.push(parent);
        } else if (!parent && node.parentNode && (<HTMLElement>node.parentNode).isContentEditable && !blockParents.includes(<HTMLElement>node.parentNode)) {
          blockParents.push(<HTMLElement>node.parentNode);
        }
      });

      if (blockParents.length > 0) {
        blockParents.forEach(block => {
          const newBlock = this.doc.createElement(blockType);
          // Move all child nodes of the current block to the new block
          while (block.firstChild) {
            newBlock.appendChild(block.firstChild);
          }
          // Replace the old block with the new one
          block.parentNode?.insertBefore(newBlock, block);
          block.parentNode?.removeChild(block);
        });
      } else if (selectedNodes.length > 0) {
        // If no parent block elements are found, wrap the selected content
        const newBlock = this.doc.createElement(blockType);
        this.surroundRangeWithElement(range, newBlock);
        selection?.selectAllChildren(newBlock); // Re-select the content
      }
    }
  }

  public static insertLink(url: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (!range) {
      return; // No text selected
    }

    const selectedText = range.toString();
    const link = this.doc.createElement('a');
    link.href = url;

    if (selectedText) {
      link.textContent = selectedText;
      this.insertNodeAtRange(range, link, true); // Select the new link
    } else {
      link.textContent = url;
      const caretRange = range.cloneRange();
      caretRange.collapse(true);
      caretRange.insertNode(link);
      caretRange.setStartAfter(link);
      caretRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(caretRange);
    }
  }

  public static replaceInsertColor(colorClass: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (range) {
      const span = this.doc.createElement('span');
      span.classList.add(colorClass);
      this.surroundRangeWithElement(range, span);
    }
  }

  public static replaceHighlightColorWithSpan(color: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (range) {
      const span = this.doc.createElement('span');
      span.style.backgroundColor = color;
      this.surroundRangeWithElement(range, span);
    }
  }

  public static replaceFontNameWithSpan(fontName: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (range) {
      const span = this.doc.createElement('span');
      span.style.fontFamily = fontName;
      this.surroundRangeWithElement(range, span);
    }
  }

  public static replaceFontSizeWithSpan(fontSize: string): void {
    const { selection, range } = this.getSelectionAndRange();
    if (range) {
      const span = this.doc.createElement('span');
      span.style.fontSize = fontSize;
      this.surroundRangeWithElement(range, span);
    }
  }

  public static replaceInsertHTML(html: string): boolean {
    const { selection, range } = this.getSelectionAndRange();
    if (!range) {
      return false;
    }

    const tempElement = this.doc.createElement('div');
    tempElement.innerHTML = html;
    const fragment = this.doc.createDocumentFragment();
    while (tempElement.firstChild) {
      fragment.appendChild(tempElement.firstChild);
    }

    this.insertNodeAtRange(range, fragment);
    return true;
  }

  public static replaceInsertImage(imageUrl: string): boolean {
    const { selection, range } = this.getSelectionAndRange();
    if (!range) {
      return false;
    }

    const img = this.doc.createElement('img');
    img.src = imageUrl;
    this.insertNodeAtRange(range, img);
    return true;
  }

  public static replaceExecCommand(command: string, value?: any): boolean {
    const { selection, range } = this.getSelectionAndRange();
    if (!range) {
      return false;
    }

    switch (command) {
      case 'foreColor':
        if (typeof value === 'string') {
          const span = this.doc.createElement('span');
          span.style.color = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'hiliteColor':
      case 'backColor':
        if (typeof value === 'string') {
          const span = this.doc.createElement('span');
          span.style.backgroundColor = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'fontName':
        if (typeof value === 'string') {
          const span = this.doc.createElement('span');
          span.style.fontFamily = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'fontSize':
        if (typeof value === 'string') {
          const span = this.doc.createElement('span');
          span.style.fontSize = value;
          this.surroundRangeWithElement(range, span);
          return true;
        }
        return false;

      case 'insertHTML':
        if (typeof value === 'string') {
          const tempElement = this.doc.createElement('div');
          tempElement.innerHTML = value;
          const fragment = this.doc.createDocumentFragment();
          while (tempElement.firstChild) {
            fragment.appendChild(tempElement.firstChild);
          }
          this.insertNodeAtRange(range, fragment);
          return true;
        }
        return false;

      case 'insertImage':
        if (typeof value === 'string') {
          const img = this.doc.createElement('img');
          img.src = value;
          this.insertNodeAtRange(range, img);
          return true;
        }
        return false;

      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'p':
      case 'pre':
        const newElement = this.doc.createElement(command);
        const selectedContent = range.extractContents();
        newElement.appendChild(selectedContent);
        this.insertNodeAtRange(range, newElement);
        return true;

      case 'bold':
      case 'italic':
      case 'underline':
        return this.doc.execCommand(command, false, value);

      case 'createLink':
        if (typeof value === 'string') {
          const link = this.doc.createElement('a');
          link.href = value;
          const selectedText = selection?.toString();
          if (selectedText) {
            link.textContent = selectedText;
            this.insertNodeAtRange(range, link, true);
            return true;
          } else {
            link.textContent = value;
            const caretRange = range.cloneRange();
            caretRange.collapse(true);
            caretRange.insertNode(link);
            caretRange.setStartAfter(link);
            caretRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(caretRange);
            return true;
          }
        }
        return false;

      default:
        console.warn(`Command "${command}" is not handled by the replacement.`);
        return false;
    }
  }
}
