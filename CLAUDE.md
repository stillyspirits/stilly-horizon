# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify Horizon theme (v2.1.4), a modern, web-native Shopify theme built with performance and progressive enhancement principles. The theme uses Liquid for server-side rendering and includes custom JavaScript components built on Web Components.

## Development Commands

### Theme Development
```bash
# Start local development server
shopify theme dev

# Run theme validation and linting
shopify theme check

# Push theme to Shopify store
shopify theme push

# Pull theme from Shopify store
shopify theme pull
```

## Architecture

### Core Technologies
- **Liquid**: Server-side templating language for Shopify themes
- **Web Components**: Custom elements using ES6+ JavaScript with component-based architecture
- **CSS**: Native CSS with Shopify theme variables
- **No Build Process**: Theme uses vanilla JavaScript modules with `@theme/` import aliases

### Directory Structure
- `assets/` - Static files (CSS, JS, images) served by Shopify CDN
- `blocks/` - Reusable block components for sections
- `config/` - Theme settings configuration
- `layout/` - Main theme wrapper templates
- `locales/` - Translation files
- `sections/` - Page sections with schema definitions
- `snippets/` - Reusable Liquid components
- `templates/` - Page templates (including JSON templates)

### JavaScript Architecture

The theme uses a modern component-based architecture with:

1. **Base Component Class** (`assets/component.js`):
   - Extends `DeclarativeShadowElement`
   - Manages refs to child elements with `data-ref` attributes
   - Handles declarative event listeners

2. **Import Aliases**:
   - `@theme/component` - Base component class
   - `@theme/critical` - Critical functionality
   - `@theme/utilities` - Utility functions

3. **Component Pattern**:
   ```javascript
   import { Component } from '@theme/component';

   class MyComponent extends Component {
     requiredRefs = ['elementName'];

     connectedCallback() {
       super.connectedCallback();
       // Component initialization
     }
   }
   customElements.define('my-component', MyComponent);
   ```

### Liquid Patterns

- Use `render` instead of `include` for snippets
- Access theme settings via `settings.setting_name`
- Section settings via `section.settings.setting_name`
- Block settings via `block.settings.setting_name`

### Custom Components

#### Age Verification Modal
- **Files**:
  - `snippets/age-verification-modal.liquid`
  - `assets/age-verification-modal.js`
  - `assets/age-verification.css`
- **Purpose**: Implements age gate with cookie-based verification
- **Pattern**: Extends `DialogComponent` for modal functionality

## Key Shopify Objects

- `shop` - Store information
- `cart` - Current cart state
- `product` - Product data
- `collection` - Collection data
- `customer` - Customer information
- `settings` - Theme customizer settings
- `request` - Current page context

## Important Notes

1. **No Package Manager**: This theme doesn't use npm/yarn. JavaScript is vanilla ES6+ with module imports.

2. **Theme Check**: Always run `shopify theme check` after editing a group of files and before committing changes.

3. **Performance First**: Follow progressive enhancement principles - functionality should work without JavaScript where possible.

4. **Accessibility**: Theme includes extensive accessibility patterns in `.cursor/rules/` directory for various components.

5. **Web Standards**: The theme leverages modern web platform features rather than polyfills.

6. **Component Refs**: Use `data-ref="name"` attributes to reference DOM elements in components, accessed via `this.refs.name`.

7. **Dialog/Modal Pattern**: Extends native `<dialog>` element with custom `DialogComponent` base class.

## Testing Approach

- Use Shopify CLI's development server for local testing
- Verify changes work with and without JavaScript enabled
- Test responsive behavior across breakpoints
- Validate with `shopify theme check`

## Common Liquid Filters

- `asset_url` - Generate CDN URLs for assets
- `image_url` - Generate responsive image URLs
- `money` - Format prices
- `t` - Translate strings
- `json` - Convert to JSON for JavaScript consumption
