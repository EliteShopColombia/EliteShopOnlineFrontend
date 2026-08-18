# EliteShop Colombia Frontend: Figma MCP Integration Rules

This document defines implementation rules for converting Figma designs into code that matches the current codebase architecture and conventions.

## 1) Design System Structure

### 1.1 Token Definitions

Current state:
- There is no centralized design token file (no JSON token source, no CSS variables map, no theme object).
- Tokens are implemented as literal values directly in CSS files.
- Base global values are in src/index.css.
- App-level background shell styles are in src/App.css.
- Component-scoped values are in each component CSS file under src/components.

Primary token sources in code:
- Colors: hardcoded hex values such as #1E293B, #2778d4, #f8fafc.
- Typography: root font stack and per-component font-size/font-weight.
- Spacing/radius/shadows: component-local numeric values.
- Breakpoints: repeated media queries at 1100px, 850px, 600px.

Example pattern (global base in src/index.css):

    :root {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
      font-weight: 400;
      color: #1f2937;
      background-color: #ffffff;
    }

Example pattern (component token usage in src/components/Header/Header.css):

    .header {
      background-color: #1E293B;
      color: #ffffff;
      border-radius: 0 0 25px 25px;
    }

Token transformation systems:
- None detected.
- No Style Dictionary, no Tailwind config, no CSS-in-JS theme transformer, no build-time token pipeline.

Rules for Figma MCP handoff:
- Convert Figma style values into existing literal CSS values unless a token refactor is explicitly requested.
- Prefer existing palette and spacing cadence already present in component CSS.
- Reuse breakpoints 1100/850/600 to stay consistent with current responsive strategy.

---

### 1.2 Component Library

Component locations:
- src/components/Header/Header.jsx + Header.css
- src/components/Hero/Hero.jsx + Hero.css
- src/components/Gallery/Gallery.jsx + Gallery.css
- src/components/ProductCard/ProductCard.jsx + ProductCard.css
- src/components/CartModal/CartModal.jsx + CartModal.css

Architecture:
- React function components.
- Co-located styling per component (plain CSS files imported into JSX).
- Props-driven composition (example: Header receives onCartClick; CartModal receives isOpen and onClose).
- Presentational-first structure with local mock data arrays inside components.

Example pattern (container composition in src/App.jsx):

    <Header onCartClick={() => setIsCartOpen(true)} />
    <main>
      <Gallery />
    </main>
    <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

Documentation / Storybook:
- No Storybook configuration detected.
- No component docs system detected.

Rules for Figma MCP handoff:
- Map Figma sections to existing component boundaries first (Header, Gallery, ProductCard, CartModal).
- Add new component folders under src/components/<FeatureName>/ when needed, with paired JSX+CSS.
- Preserve current naming style using BEM-like class names with component prefix.

---

### 1.3 Frameworks and Libraries

Detected stack:
- UI framework: React 19 (react, react-dom).
- Language: JavaScript + JSX (ES modules).
- Bundler/dev server: Vite 8.
- React integration: @vitejs/plugin-react.
- Linting: ESLint flat config with @eslint/js, react-hooks, react-refresh.

Evidence:
- package.json scripts: dev, build, lint, preview.
- vite.config.js uses defineConfig and react plugin.
- eslint.config.js defines JS/JSX lint scope and dist ignore.

Rules for Figma MCP handoff:
- Generate React JSX components, not framework-agnostic HTML snippets.
- Keep styles in imported CSS files (no CSS-in-JS unless requested).
- Keep compatibility with Vite ESM imports and asset handling.

---

### 1.4 Asset Management

Storage and reference patterns:
- Local assets live under src/assets and src/assets/images.
- Public static files exist under public (favicon.svg, icons.svg).
- Most images are imported as modules in JSX (recommended in this repo).
- One component also uses root-like string paths to src assets (CartModal), which is less consistent.

Preferred pattern example (src/components/Gallery/Gallery.jsx):

    import prenda from "../../assets/images/Prenda.jpg";

Inconsistent pattern example (src/components/CartModal/CartModal.jsx):

    image: "/src/assets/images/Niños.jpg"

Optimization/CDN:
- No explicit image optimization pipeline detected.
- No CDN config detected in Vite config.
- No asset hashing strategy customized beyond default Vite build behavior.

Rules for Figma MCP handoff:
- For new component assets, use relative module imports from src/assets/images.
- Keep asset names stable and descriptive; avoid spaces and special characters for future portability.
- If exporting from Figma, prefer web-optimized formats and sizes before commit.

---

### 1.5 Icon System

Where icons are stored:
- Emoji icons inline in JSX (search, cart, help, delete).
- Inline SVG icon in ProductCard cart button.
- Sprite-like symbol file exists at public/icons.svg but is not consumed by current components.

Usage patterns:
- Inline emoji:

    <button className="header__cart" aria-label="Carrito">🛒</button>

- Inline SVG:

    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.4 10.2..." />
    </svg>

Naming convention:
- No project-wide enforced icon naming convention.
- In icons.svg, symbol IDs follow kebab-case (for example bluesky-icon, github-icon).

Rules for Figma MCP handoff:
- If icon consistency is required, prefer inline SVG components over emojis.
- If using sprite symbols, standardize on kebab-case IDs and document usage.
- Align stroke width, size, and color behavior with current CSS currentColor approach.

---

### 1.6 Styling Approach

Methodology:
- Plain global CSS + component-scoped CSS files.
- Not using CSS Modules, Styled Components, Tailwind, or Sass.
- BEM-like class naming with component prefix (header__, product-card__, cart-modal__).

Global styles:
- Reset-like defaults and base typography in src/index.css.
- Application shell gradient and layout in src/App.css.

Responsive implementation:
- Media query breakpoints repeated across components:
  - max-width: 1100px
  - max-width: 850px
  - max-width: 600px
- Layout strategies include grid-to-fewer-columns collapse, horizontal scroll for category nav, and footer stacking on mobile.

Responsive pattern example (src/components/Gallery/Gallery.css):

    .gallery__grid {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 850px) {
      .gallery__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

Rules for Figma MCP handoff:
- Keep class naming BEM-like and local to component.
- Match existing breakpoint tiers instead of introducing ad-hoc breakpoints.
- Ensure mobile behavior is explicitly implemented for any new section.

---

### 1.7 Project Structure

Current organization:
- Root config files: package.json, vite.config.js, eslint.config.js.
- Entry HTML: index.html.
- Source root: src.
- App composition in src/App.jsx and src/main.jsx.
- Components grouped by folder under src/components.
- Component folder pattern: ComponentName/ComponentName.jsx + ComponentName.css.
- Assets in src/assets and public.

Feature organization pattern:
- UI grouped by reusable component blocks rather than route/domain modules.
- Data currently embedded in components (Gallery products, CartModal cartProducts).
- State lifting at app level for modal open/close.

Rules for Figma MCP handoff:
- Preserve folder co-location for component + CSS.
- Place shared static datasets in a dedicated data folder only if the data grows or is reused.
- Keep App as composition root and avoid deeply coupling sibling components.

---

## 2) Design Spacing Rules from Figma: Inicio

Measured values from the Figma node for the Inicio screen (node-id 1:2):

### 2.1 Canvas and shell spacing

- Canvas width: 1920px
- Header height: 120px
- Outer horizontal margin: 70px
- Product card width: 399px
- Product card height: 493px
- Gap between product cards: 60px
- Vertical gap between rows: 41px
- Distance from header to first product row: 40px

### 2.2 Header spacing

- Search bar width: 950px
- Search bar height: 54px
- Search bar top offset: 28px
- Search bar left offset: 485px
- Login/Register button width: 193px
- Login/Register button height: 54px
- Login/Register top offset: 28px
- Logo size: 84 x 84 px
- Brand text baseline offset: top 32px

### 2.3 Product card internal spacing

- Product image size: 399 x 399 px
- Title top position: 569px
- Price top position: 594px
- Old price top position: 594px
- Star row top position: 619px
- Cart icon top position: 582px
- Distance between title and price: 25px
- Distance between price and star row: 25px
- Card radius: 5px

### 2.4 Recommended spacing system

Use the following spacing scale as the default when translating new Figma screens into this project:

- 8px = base unit
- 16px = micro spacing
- 24px = compact section separation
- 32px = standard UI rhythm
- 40px = section spacing
- 60px = card grid spacing
- 120px = header height

### 2.5 Implementation rule

When adapting Figma screens to this codebase, the design should honor these existing values before introducing new spacing tokens:

- Keep the 70px outer margins for desktop landing/layout compositions.
- Respect 399px product card width and 60px horizontal gap for the shop grid.
- Preserve 120px header height and 54px control height for top-bar buttons.
- Keep 5px border radius for product cards unless a new explicit requirement says otherwise.

These values are now the project baseline for Figma-generated Inicio and catalog-like landing layouts.

---

## 3) Figma MCP-Specific Implementation Rules

This repository already includes Figma MCP endpoint configuration in opencode.json.

Detected config:

    {
      "mcp": {
        "Figma": {
          "type": "remote",
          "url": "https://mcp.figma.com/mcp",
          "enabled": true
        }
      }
    }

Practical integration rules for generated code:

1. Reuse existing components first.
- Map Figma frame regions onto Header, Gallery, ProductCard, CartModal before creating new components.

2. Preserve style language.
- Keep dark blue palette, rounded controls, soft shadows, and compact typography proportions currently used.

3. Keep CSS ownership local.
- New component UI generated from Figma should produce a colocated CSS file imported in the component.

4. Keep responsive tiers consistent.
- Implement responsive variants at 1100/850/600 unless there is a strong product requirement to change.

5. Prefer module image imports.
- When Figma exports image assets, import from src/assets/images and reference variables in JSX.

6. Use SVG for production icons.
- Replace decorative emoji icons with SVG where design fidelity or accessibility is important.

7. Avoid introducing new style tooling without request.
- Do not introduce Tailwind/CSS Modules/CSS-in-JS in Figma-driven patches unless explicitly requested.

8. Accessibility baseline.
- Keep alt text for images and aria-label for icon-only buttons, matching current patterns.

---

## 3) Known Gaps and Suggested Normalization Targets

Observed gaps:
- No centralized token system.
- Mixed image reference strategy (module imports vs /src path strings).
- Hero component exists but is not currently rendered in App.

Normalization targets for future Figma-heavy workflows:

1. Introduce CSS variables in src/index.css for key palette, spacing, radii, and shadows.
2. Unify all image usage to module imports.
3. Define a single icon strategy (inline SVG components or sprite usage) and document naming.
4. Optionally add component docs (Storybook or markdown docs) for predictable design-to-code mapping.

---

## 4) Quick Path Reference

- App composition: src/App.jsx
- Global styles: src/index.css
- App shell styles: src/App.css
- Header: src/components/Header/Header.jsx and src/components/Header/Header.css
- Hero: src/components/Hero/Hero.jsx and src/components/Hero/Hero.css
- Gallery: src/components/Gallery/Gallery.jsx and src/components/Gallery/Gallery.css
- Product card: src/components/ProductCard/ProductCard.jsx and src/components/ProductCard/ProductCard.css
- Cart modal: src/components/CartModal/CartModal.jsx and src/components/CartModal/CartModal.css
- Local assets: src/assets and src/assets/images
- Public assets: public
- Figma MCP config: opencode.json
