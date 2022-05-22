import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ExternalWindowComponent } from '@flogo-web/lib-client/logs';

import { resourcePlugins } from '../plugins';
import { ResourceGuard } from './core/resource.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.FlogoHomeModule),
  },
  {
    path: 'apps',
    loadChildren: () => import('./app/app.module').then(m => m.FlogoApplicationModule),
  },
  {
    path: 'logs',
    component: ExternalWindowComponent,
  },
  {
    path: 'resources/:resourceId',
    data: {
      id: 'resourceParent',
    },
    canActivate: [ResourceGuard],
    children: resourcePlugins,
  },
  {
    path: '_config',
    loadChildren: () => import('./config/config.module').then(m => m.ConfigModule),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
  preloadingStrategy: PreloadAllModules,
  // enableTracing: true,
});
