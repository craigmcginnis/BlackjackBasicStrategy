import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
	.then(() => {
		if ('serviceWorker' in navigator && !/localhost/.test(location.hostname)) {
			navigator.serviceWorker.register('sw-basic.js').catch((e) => console.warn('SW registration failed', e));
		}
	})
	.catch((err) => console.error(err));
