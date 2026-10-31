PERSPECTRA WEBSITE - SEPARATED FILE STRUCTURE

Files:
- index.html: page content and structure
- css/styles.css: all page styling and responsive rules
- js/main.js: mobile navigation, current year and subtle card tilt
- js/three-scene.js: Three.js hero prism scene
- assets/: approved PERSPECTRA logo assets

Run locally:
1. Extract this folder.
2. Open the folder in VS Code.
3. Start index.html using Live Server (or another local HTTP server).
4. Internet is required for Google Fonts and Three.js CDN.

Deploy:
Upload the complete PERSPECTRA_Website_Separated folder to a Git repository and import it into Vercel.
Framework preset: Other
Build command: leave empty
Output directory: . (project root)
Install command: leave empty

Notes:
- The Three.js script now selects the .heroart container correctly.
- If WebGL is unavailable or reduced motion is enabled, the static logo fallback remains.
- Replace hello@perspectra.studio with your confirmed email before launch.
- Selected work items are concept directions and should be replaced with approved portfolio work.
