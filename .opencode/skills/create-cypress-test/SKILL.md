---
name: create-cypress-test
description: Find existing Cypress coverage for a frontend feature, add missing component or E2E tests in dataland-frontend, and run them
compatibility: opencode
---

## What I do

- Check which Cypress component and E2E tests already cover a feature in `dataland-frontend`.
- Add only the missing tests, following the repo's existing patterns.
- Run the tests and report what was already covered, what was added, and what passed.

## When to use me

Use this when the user wants Cypress tests for a page, component, tab, or user journey in `dataland-frontend`. Do not use it for `dataland-website` or `dataland-sharedElements`.

## Workflow

1. **Inventory existing tests**
   - Search `dataland-frontend/tests/component` and `dataland-frontend/tests/e2e/specs` for the feature.
   - Do not rely on keyword search alone. Also run `git log --stat` on the commits that introduced the feature, since tests are often named after a different concept (for example a spec file that covers several components).
   - Read the matching test files and compare their assertions with the `data-test` attributes in the component.
2. **Baseline run**
   - Run existing component tests for the feature: `npx cypress run --component --spec "<glob>"` from `dataland-frontend/`.
   - Delegate this to the `command-summarizer` subagent and ask for pass/fail counts per spec and error messages.
3. **Decide the gaps**
   - Do not duplicate behaviour that is already asserted, including indirect coverage of child components.
   - Report the gaps to the user before writing tests if they are large or ambiguous.
4. **Write component tests**
   - Location: `tests/component/components/<area>/<Name>.cy.ts`.
   - Mount with `getMountingFunction` from `@ct/testUtils/Mount.ts` and use `minimalKeycloakMock` from `@ct/testUtils/Keycloak.ts`.
   - Pass a router (`createRouter` with `createMemoryHistory` and `routes` from `@/router`) when the component navigates.
   - Stub backend calls with `cy.intercept`. Select elements via `data-test` attributes.
5. **Write E2E tests**
   - Location: `tests/e2e/specs/<area>/`. Prefer extending an existing spec of the area.
   - A new spec must be required from the area's `index.ts`, and a new area from `tests/e2e/specs/index.ts`.
   - Wrap specs in `describeIf` with `executionEnvironments` like neighbouring specs.
   - Log in with `cy.ensureLoggedInAs<Role>()` and open pages with `cy.visitAndCheckAppMount`.
   - Stub backend responses with `cy.intercept` so the test does not depend on database content.
6. **Verify**
   - From `dataland-frontend/`:
     - `npm run checkcypresscompilation`
     - `npx prettier --check <changed files>`
     - `npx eslint <changed files>`
   - Run new component tests with `npx cypress run --component --spec "<file>"`.
   - For E2E: check that `https://local-dev.dataland.com` is reachable (`curl -sk -m 5 -o /dev/null -w "%{http_code}"`) and that the `KEYCLOAK_*_PASSWORD` variables are set. If so, run the spec directly with `CYPRESS_RUN_PREPOPULATION=false npx cypress run --spec <spec>`. If not, say that the E2E test was only compiled and linted.
   - Delegate long Cypress runs to the `command-summarizer` subagent.

## Rules

- Do not introduce new `@ts-nocheck` directives.
- Do not use generated API clients in tests or components. Backend access goes through TanStack Query hooks in `src/api-queries/` (see `dataland-frontend/src/api-queries/AGENTS.md`).
- Prefer scoped runs (`--spec`) over the whole suite.
- Do not run `tests/e2e/specs/index.ts` locally unless asked, because it triggers prepopulation.
- If a component lacks a `data-test` attribute needed for a stable selector, add it to the component and mention it.

## Output style

- Say what was already covered, with file paths.
- List added or changed test files.
- List each check that was run and its result. State clearly what was not run and why.
