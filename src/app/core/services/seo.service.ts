import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SEOMetaData {
    title?: string;
    description?: string;
    keywords?: string;
    type?: string;
    url?: string;
    image?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SEOService {
    private readonly defaultDescription = 'Master blackjack basic strategy with interactive drills, flashcards, and personalized analytics. Improve your odds at the casino with our free strategy trainer.';
    private readonly defaultKeywords = 'blackjack, basic strategy, blackjack trainer, casino games, blackjack practice, blackjack odds';
    private readonly defaultImage = 'assets/images/blackjack-og-image.png';
    private readonly baseUrl: string;

    constructor(
        private meta: Meta,
        private title: Title,
        @Inject(DOCUMENT) private document: Document
    ) {
        // Determine the base URL dynamically
        this.baseUrl = this.document.location.origin || 'https://blackjacktrainer.app';
    }

    /**
     * Update SEO metadata for the current page
     */
    updateMetadata(metadata: SEOMetaData): void {
        const title = metadata.title || 'Blackjack Basic Strategy Trainer | Learn Optimal Blackjack Play';
        const description = metadata.description || this.defaultDescription;
        const keywords = metadata.keywords || this.defaultKeywords;
        const url = metadata.url ? `${this.baseUrl}/${metadata.url}` : this.baseUrl;
        const image = metadata.image || this.defaultImage;
        const type = metadata.type || 'website';

        // Update standard meta tags
        this.title.setTitle(title);
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ name: 'keywords', content: keywords });

        // Update Open Graph meta tags
        this.meta.updateTag({ property: 'og:title', content: title });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:url', content: url });
        this.meta.updateTag({ property: 'og:type', content: type });
        this.meta.updateTag({ property: 'og:image', content: `${this.baseUrl}/${image}` });

        // Update Twitter meta tags
        this.meta.updateTag({ property: 'twitter:title', content: title });
        this.meta.updateTag({ property: 'twitter:description', content: description });
        this.meta.updateTag({ property: 'twitter:url', content: url });
        this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ property: 'twitter:image', content: `${this.baseUrl}/${image}` });
    }

    /**
     * Generate canonical URL for the current page
     */
    setCanonicalURL(url?: string): void {
        const canonicalUrl = url ? `${this.baseUrl}/${url}` : this.baseUrl;

        // Remove any existing canonical links
        const existingLink = this.document.querySelector('link[rel="canonical"]');
        if (existingLink) {
            existingLink.remove();
        }

        // Add the new canonical link
        const link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', canonicalUrl);
        this.document.head.appendChild(link);
    }
}