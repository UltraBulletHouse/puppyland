// TODO: zrobic zeby dzialalo po buildzie
// if (!(globalThis as any).URLPattern) {
//   await import('urlpattern-polyfill');
// }
import { Router } from '@thepassle/app-tools/router.js';
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';
// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';
import { html } from 'lit';

import '../pages/app-signin.js';

const baseURL: string = (import.meta as any).env.BASE_URL;

export const router = new Router({
  fallback: '/',
  routes: [
    {
      path: resolveRouterPath(),
      title: 'Sign-in',
      render: () => html`<app-signin></app-signin>`,
    },
    {
      path: resolveRouterPath('home'),
      title: 'Home',
      plugins: [lazy(() => import('../pages/app-home.js'))],
      render: () => html`<app-home></app-home>`,
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
