// TODO: zrobic zeby dzialalo po buildzie
// if (!(globalThis as any).URLPattern) {
//   await import('urlpattern-polyfill');
// }
import { Router } from '@thepassle/app-tools/router.js';
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';
// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';
import { html } from 'lit';

import '../views/app-signin-view.js';

const baseURL: string = (import.meta as any).env.BASE_URL;

export const router = new Router({
  fallback: '/',
  routes: [
    {
      path: resolveRouterPath(),
      title: 'Signin-view',
      render: () => html`<app-signin-view></app-signin-view>`,
    },
    {
      path: resolveRouterPath('map-view'),
      title: 'Map-view',
      plugins: [lazy(() => import('../views/app-map-view.js'))],
      render: () => html`<app-map-view></app-map-view>`,
    },
  ],
});

export function resolveRouterPath(unresolvedPath?: string) {
  var resolvedPath = baseURL;
  if (unresolvedPath) {
    resolvedPath = resolvedPath + unresolvedPath;
  }

  return resolvedPath;
}
