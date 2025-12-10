// Post-build script to copy manifest and static assets
import { copyFileSync, mkdirSync, existsSync, renameSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

// Read and modify manifest for production paths
const manifest = {
  "manifest_version": 3,
  "name": "CareerFlow - Resume Auto-Fill",
  "version": "1.0.0",
  "description": "Auto-fill job applications with your tailored resume. AI-powered resume optimization.",
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/index.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
};

// Write manifest to dist
import { writeFileSync } from 'fs';
writeFileSync(join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Fix popup HTML to reference correct JS path
const popupHtmlPath = join(dist, 'src', 'popup', 'index.html');
if (existsSync(popupHtmlPath)) {
  let html = readFileSync(popupHtmlPath, 'utf-8');
  // Update script path to point to built popup.js (handles both Vite output and source format)
  html = html.replace(/src="[^"]*popup\.js"/, 'src="../../popup/popup.js"');
  html = html.replace('crossorigin ', ''); // Remove crossorigin attribute (not needed in extension)
  writeFileSync(popupHtmlPath, html);
  console.log('Fixed popup.html script path');
}

// Copy icons
const iconsDir = join(dist, 'icons');
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Copy icons from public/icons
const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const srcIcon = join(root, 'public', 'icons', `icon${size}.png`);
  const destIcon = join(iconsDir, `icon${size}.png`);

  if (existsSync(srcIcon)) {
    copyFileSync(srcIcon, destIcon);
    console.log(`Copied icon${size}.png`);
  } else {
    console.warn(`Warning: icon${size}.png not found in public/icons`);
  }
}

console.log('Manifest and assets copied to dist/');
