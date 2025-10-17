import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * This directive enhances images with proper loading attributes and 
 * ensures alt text is always provided for accessibility and SEO.
 */
@Directive({
    selector: 'img:not([loading])',
    standalone: true
})
export class OptimizedImageDirective implements OnInit {
    @Input() alt = '';

    constructor(private el: ElementRef<HTMLImageElement>) { }

    ngOnInit(): void {
        const img = this.el.nativeElement;

        // Set loading="lazy" for images that are not in the initial viewport
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        // Ensure all images have alt text for accessibility and SEO
        if (!img.hasAttribute('alt') || img.alt === '') {
            // If no alt text provided, extract a sensible default from src
            if (!this.alt || this.alt === '') {
                const src = img.getAttribute('src') || '';
                const fileName = src.split('/').pop()?.split('.')[0] || '';
                const altText = fileName
                    .replace(/-|_/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());

                img.alt = altText || 'Blackjack training image';
            }
            else {
                img.alt = this.alt;
            }
        }

        // Add decoding="async" for performance
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    }
}