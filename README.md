# Online Static Runner

Deploy this small server to Railway or another HTTPS host.

What stays online:
- the tiny Express static server
- the runner shell
- the runner Service Worker

What stays in the Chromebook browser:
- the static website folder you select
- HTML/CSS/JS/images/fonts/WASM stored in IndexedDB

This package intentionally does not include a proxy, Wisp, or network-bypass functionality.

## Railway
1. Upload these files to a GitHub repo.
2. Deploy the repo in Railway.
3. Railway will run `npm start`.
4. Open the generated HTTPS URL on the Chromebook.
5. Click Select Folder.

## Limitation
This runner is for static websites. Anything needing Node/PHP/Python/WebSocket backends must be hosted separately.
