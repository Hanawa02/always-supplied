# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Run type-check and production build in parallel
- `npm run preview` - Preview production build locally

### Testing

- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:unit -- --watch` - Run unit tests in watch mode
- `npm run test:unit -- path/to/file.spec.ts` - Run specific test file
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e -- --project=chromium` - Run e2e tests on specific browser
- `npm run test:e2e -- tests/example.spec.ts` - Run specific e2e test file
- `npm run test:e2e -- --debug` - Debug e2e tests

### Code Quality

- `npm run lint` - Lint and auto-fix with ESLint
- `npm run format` - Format code with Prettier (src/ directory only)
- `npm run type-check` - Type check with vue-tsc

## Architecture

### Technology Stack

- **Vue 3** (v3.5.18) with Composition API
- **TypeScript** (~5.8.0) for type safety
- **Vite** (v7.0.6) as build tool
- **Vue Router** (v4.5.1) for routing
- **Pinia** (v3.0.3) for state management
- **UnoCSS** (v66.5.0) with Wind4 preset and Attributify mode for styling
- **Vite PWA Plugin** for Progressive Web App support
- **Material Design Icons** via @iconify-json/mdi

### Project Structure

- `~/` alias resolves to `./src` directory
- Router configuration: `src/router/index.ts`
- State stores: `src/stores/` (using Pinia composition API)
- Testing: Unit tests with Vitest, E2E tests with Playwright
- PWA enabled with auto-update registration
- Always run 'npm run validate-code' after changing the code. You don't need to do it for every file changed, but at least once you finish all changes you need.
- Css classes should not be used as selectors for tests
- Whenever you do some task that involves generating code, follow the steps described in the file docs\task_flow.md

## Quality assurance

- run tests
- do type checks
- run lint and formatting command: `npm run validate-code`
- check if any translation is present on english, but missing in other language files
