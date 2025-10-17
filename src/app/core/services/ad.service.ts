import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Service to manage AdSense integration in the application
 * Handles conditional loading based on environment
 */
@Injectable({
    providedIn: 'root'
})
export class AdService {
    private adsInitialized = false;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    /**
     * Initialize AdSense script if in production environment and browser platform
     */
    initAds(): void {
        // Only proceed if in browser and not already initialized
        if (!isPlatformBrowser(this.platformId) || this.adsInitialized) {
            return;
        }

        // Skip ad loading in development environment
        if (!environment.adsEnabled || this.isLocalhost()) {
            console.log('AdSense disabled in development environment');
            return;
        }

        this.adsInitialized = true;

        // Add AdSense script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${environment.adClient}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }

    /**
     * Display an ad in a specific container
     * @param adSlot The AdSense ad slot ID
     * @param container The HTML element to insert the ad into
     */
    displayAd(adSlot: string, container: HTMLElement): void {
        // Skip in local development
        if (!environment.adsEnabled || this.isLocalhost()) {
            container.style.display = 'none';
            return;
        }

        // Create ad element
        const adElement = document.createElement('ins');
        adElement.style.display = 'block';
        adElement.className = 'adsbygoogle';
        adElement.setAttribute('data-ad-client', environment.adClient);
        adElement.setAttribute('data-ad-slot', adSlot);
        adElement.setAttribute('data-ad-format', 'auto');
        adElement.setAttribute('data-full-width-responsive', 'true');

        // Add to container and push to AdSense
        container.appendChild(adElement);

        // Need to handle this safely for TypeScript
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
    }

    /**
     * Check if app is running on localhost
     */
    private isLocalhost(): boolean {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
    }
}