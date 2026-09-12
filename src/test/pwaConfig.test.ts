import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf-8');

describe('PWA installability configuration', () => {
  it('registers vite-plugin-pwa in the Vite build', () => {
    const config = read('vite.config.ts');
    expect(config).toContain('vite-plugin-pwa');
    expect(config).toContain('VitePWA(');
  });

  it('uses explicit user-driven updates (registerType prompt)', () => {
    const config = read('vite.config.ts');
    expect(config).toContain("registerType: 'prompt'");
  });

  it('precaches the app shell and serves an offline SPA navigation fallback', () => {
    const config = read('vite.config.ts');
    expect(config).toContain('globPatterns');
    expect(config).toContain("navigateFallback: 'index.html'");
    expect(config).toContain('cleanupOutdatedCaches: true');
  });

  it('declares a complete web app manifest', () => {
    const config = read('vite.config.ts');
    expect(config).toContain("short_name: 'BizFlow'");
    expect(config).toContain("start_url: '/'");
    expect(config).toContain("display: 'standalone'");
    expect(config).toContain("theme_color: '#3b82f6'");
    expect(config).toContain("background_color: '#ffffff'");
  });

  it('declares 192, 512 and maskable icons', () => {
    const config = read('vite.config.ts');
    expect(config).toContain("src: 'pwa-192x192.png'");
    expect(config).toContain("src: 'pwa-512x512.png'");
    expect(config).toContain("src: 'maskable-icon-512x512.png'");
    expect(config).toContain("purpose: 'maskable'");
  });

  it('ships the referenced icon assets in public/', () => {
    for (const icon of [
      'public/pwa-192x192.png',
      'public/pwa-512x512.png',
      'public/maskable-icon-512x512.png',
      'public/apple-touch-icon.png',
      'public/favicon.svg',
    ]) {
      expect(existsSync(resolve(process.cwd(), icon)), `${icon} should exist`).toBe(true);
    }
  });

  it('exposes theme-color and a same-origin social image in index.html', () => {
    const html = read('index.html');
    expect(html).toContain('name="theme-color"');
    expect(html).toContain('content="#3b82f6"');
    // The <link rel="manifest"> is injected by the plugin at build time, not authored here.
    expect(html).not.toContain('rel="manifest"');
    expect(html).not.toContain('bolt.new');
    expect(html).not.toContain('http://');
  });

  it('lists vite-plugin-pwa as a dev dependency', () => {
    const pkg = JSON.parse(read('package.json')) as {
      devDependencies?: Record<string, string>;
    };
    expect(pkg.devDependencies?.['vite-plugin-pwa']).toBeTruthy();
  });

  it('registers the update prompt without touching the IndexedDB API', () => {
    const prompt = read('src/pwa/PWAUpdatePrompt.tsx');
    expect(prompt).toContain('useRegisterSW');
    expect(prompt).not.toContain('indexedDB.');
    expect(prompt).not.toContain('deleteDatabase');
    expect(prompt).not.toContain('new Dexie');
  });
});
