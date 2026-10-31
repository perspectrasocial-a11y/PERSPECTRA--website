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

3D EXPERIENCE: Transparent glass prism follows a curved path through the viewport as visitors scroll. Includes spectral refraction streaks, linked neural-network nodes, pointer response, responsive opacity, and reduced-motion support. Implemented in js/three-scene.js and css/styles.css. Three.js loads from jsDelivr CDN.

OPTICAL ART DIRECTION UPDATE
Replaced the generic extruded triangular object with a faceted transparent optical crystal, environment reflections, internal facets, spectral dispersion beams and restrained neural connections. The crystal follows a diagonal path as the page scrolls. Main implementation: js/three-scene.js. Uses Three.js and its RoomEnvironment helper from jsDelivr.

ADVANCED OPTICS UPDATE
Added a Python-generated spectral caustics texture, layered additive light sheet, and MeshPhysicalMaterial dispersion. The implementation combines Python-generated texture assets with GLSL spectral beam shaders and Three.js physically based glass. Texture asset: assets/spectral-caustics.png.
