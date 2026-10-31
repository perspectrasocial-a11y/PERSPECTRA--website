PERSPECTRA — Hover Glass Update

Run: python tools/serve.py
Open http://localhost:8000 (internet required for Three.js and fonts).

Hover the header logo or the hero prism: glass expands, tilts and catches
blue/violet/champagne light. It stays illuminated until you leave.
Keyboard focus also activates the effect. Clicking the logo only navigates home.
A broad matte violet-blue cursor light follows mouse movement above the page.
Touch and reduced-motion users retain a static logo without cursor animation.
If WebGL or the CDN is unavailable, the original logo remains visible.
Glass uses transparent facets and stylized spectral highlights; it does not
physically refract HTML text behind the canvas.

Python source included:
  tools/generate_caustics.py — generate spectral texture (see requirements-python.txt)
  tools/serve.py — local preview server (standard library only)

Upload index.html, css/, js/ and assets/ to your static host.
