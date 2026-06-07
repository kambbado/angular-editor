import { ApplicationRef, enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
  provideHttpClient(),
];

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, { providers })
  .then((ref: ApplicationRef) => {
    const appWindow = globalThis as typeof globalThis & {
      ngRef?: ApplicationRef;
    };

    // Ensure Angular destroys itself on hot reloads.
    if (appWindow.ngRef) {
      appWindow.ngRef.destroy();
    }
    appWindow.ngRef = ref;
  })
  .catch((err: any) => {
    console.error(err);
  });
