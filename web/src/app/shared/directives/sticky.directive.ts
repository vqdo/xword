/**
 * Based on https://github.com/jonasmedeiros/ng-sticky
 */

import { Directive, ElementRef, Input, HostListener, OnInit, Renderer2 } from '@angular/core';

const PLACEHOLDER_CLASS = 'xw-sticky-placeholder';

@Directive({
  selector: '[xwSticky]',
})
export class StickyDirective implements OnInit {
  @Input() public addClass: string = 'xw-sticky';
  private isSticky: boolean = false;
  private targetOffset: number = -1;

  constructor(private el: ElementRef, private render: Renderer2) {

  }

  public ngOnInit() {
    this.targetOffset = this.el.nativeElement.offsetTop;
  }

  @HostListener('window:scroll', [])
  public onWindowScroll() {
    if (this.targetOffset < 0) { return; }
    const windowOffsetTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (!this.isSticky) {
      this.targetOffset = this.el.nativeElement.offsetTop;
      console.log(this.targetOffset);
    }

    this.toggleSticky(windowOffsetTop > this.targetOffset);
  }

  private toggleSticky(isSticky?: boolean) {
    if (isSticky == null) {
      isSticky = !!this.isSticky;
    }
    if (isSticky) {
      this.render.addClass(this.el.nativeElement, this.addClass);
    } else {
      this.render.removeClass(this.el.nativeElement, this.addClass);
    }
    this.isSticky = isSticky;
    this.updatePlaceholder();
  }

  private updatePlaceholder() {
    const next = this.render.nextSibling(this.el.nativeElement);
    if (next) {
      if (this.isSticky) {
        this.render.setStyle(next.nextElementSibling, 'margin-top', `${this.el.nativeElement.offsetHeight}px`);
      } else {
        this.render.setStyle(next.nextElementSibling, 'margin-top', `0`);
      }
    }
  }
}
