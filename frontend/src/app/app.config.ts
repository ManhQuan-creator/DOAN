import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import {TranslateHttpLoader} from '@ngx-translate/http-loader'
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { userAuthInterceptor } from './core/interceptors/user.auth-interceptor';
import { adminAuthInterceptor } from './core/interceptors/admin.auth-interceptor';
import {provideAnimations  } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader{
  return new TranslateHttpLoader(http,'./assets/i18n/','.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    
    provideRouter(routes,withViewTransitions()),
    provideHttpClient(withInterceptors([
      userAuthInterceptor,
      adminAuthInterceptor
    ])),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'vi',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
