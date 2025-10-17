import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { STORAGE_FACADE, StorageService } from './core/services/storage.service';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes,
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
		),
		provideClientHydration(),
		{ provide: STORAGE_FACADE, useExisting: StorageService }
	]
};
