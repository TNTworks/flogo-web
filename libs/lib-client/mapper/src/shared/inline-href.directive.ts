import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * TAKEN FROM https://github.com/Tsmith18256/ng-inline-href
 * Provides a fix for broken href attributes in Firefox when referring to an ID. This is an especially common issue when
 * using the SVG <use> tag with an inline SVG file. Any href that refers to a local ID, such as href="#icon-close", will
 * be broken in Firefox because of the <base> tag.
 *
 * This directive fixes this issue by appending the absolute URL of the current page to the href. For example,
 * <use inlineHref="#icon-close" /> could create <use xlink:href="http://www.mysite.com/mypage#icon-close />.
 *
 * Note that this directive uses the xlink namespace for SVG <use> tags, but just normal href for everything else. The
 * spec has called for the xlink namespace to be removed, but it stays in this directive, for now, to maintain browser
 * support.
 *
 * @version 1.0.0
 * @author Tyler Smith
 */
@Directive({ selector: '[fgMapperInlineHref]' })
export class InlineHrefDirective implements OnInit {
  private static readonly HREF_ATTR = 'href';
  private static readonly SVG_USE_TAG = 'use';
  private static readonly XLINK_NS = 'http://www.w3.org/1999/xlink';

  // tslint:disable-next-line:no-input-rename
  @Input('fgMapperInlineHref') inlineHref: string;

  constructor(private element: ElementRef) {}

  /**
   * Takes the relative href that has been provided and converts it to an absolute URL. The URL is applied to either the
   * href or xlink:href attribute, depending on the tag type.
   */
  ngOnInit(): void {
    if (!window) {
      this.element.nativeElement.href = this.inlineHref;
    }

    const fixedHref =
      window.location.href.replace(window.location.hash, '') + this.inlineHref;

    if (this.element.nativeElement.tagName === InlineHrefDirective.SVG_USE_TAG) {
      this.element.nativeElement.setAttributeNS(
        InlineHrefDirective.XLINK_NS,
        InlineHrefDirective.HREF_ATTR,
        fixedHref
      );
    } else {
      this.element.nativeElement.href = fixedHref;
    }
  }
}
