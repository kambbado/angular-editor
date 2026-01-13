
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, ApplicationRef, enableProdMode, InjectionToken, NgModuleRef, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment.prod';

export interface EnvironmentConfig {
  production: boolean;
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('ENVIRONMENT_CONFIG');

/**
 * Retrieves the base URL from the HTML base tag
 * @returns The base URL as string
 */
export function getBaseUrl(): string {
  const baseTag = document.getElementsByTagName('base')[0];
  if (!baseTag) {
    throw new Error('Base tag not found in HTML document');
  }
  return baseTag.href;
}

// Enable production mode if environment specifies it
if (environment.production) {
  enableProdMode();
}

export const appConfig: ApplicationConfig = {
  providers: [

    // Core services
    { provide: 'BASE_URL', useFactory: getBaseUrl },

    provideHttpClient(withInterceptorsFromDi(), withFetch()),

    // Performance
    provideZonelessChangeDetection(),

    // Environment
    { provide: ENVIRONMENT_CONFIG, useValue: environment },
  ],
};

type AppWindow = Window & {
  ngRef?: NgModuleRef<unknown>;
};

/**
 * Bootstrap the Angular application
 */
bootstrapApplication(AppComponent, appConfig)
  .then((appRef: ApplicationRef) => {
    const appWindow = window as AppWindow;

    if (appWindow.ngRef) {
      appWindow.ngRef.destroy();
    }
    appWindow.ngRef = appRef.injector.get(NgModuleRef);
  })
  .catch((error: Error) => {
    console.error('Application failed to start:', error);
    throw error;
  });
