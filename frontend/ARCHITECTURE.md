# Frontend Architecture

This frontend follows a layered architecture with explicit folders under `src`.

## Layers and Responsibilities

- `src/presentation`: routes, pages, components, styles. It renders UI and delegates behavior.
- `src/application`: use-case orchestration (hooks/services), navigation flows, bootstrap effects.
- `src/state`: Zustand stores and selectors. It is the single source of client state.
- `src/domain`: domain entities and schema-level domain abstractions.
- `src/infrastructure`: technical adapters (HTTP client, notification adapter, infrastructure error mapping).
- `src/shared`: pure cross-layer utilities with no framework/runtime side effects.

## Dependency Direction

Allowed dependencies must follow this direction:

1. `presentation -> application`
2. `application -> state | domain | infrastructure | shared`
3. `state -> shared`
4. `infrastructure -> domain | shared`
5. `domain -> shared`

Disallowed examples:

- `presentation -> state` direct store access
- `presentation -> infrastructure` direct adapter usage
- `domain -> application/presentation/infrastructure`

## Import Aliases

Configured aliases:

- `@presentation/*`
- `@application/*`
- `@state/*`
- `@domain/*`
- `@infrastructure/*`
- `@shared/*`

Use aliases in new code to keep imports stable during refactors.

## Testing Conventions

- Keep tests close to the unit under test in `__tests__` directories.
- Use naming `*.test.js` or `*.test.jsx`.
- Presentation tests should mock application hooks, not stores or infrastructure adapters directly.
- Application tests can mock state stores and infrastructure adapters.

## Mapping Rules

Backend payload mapping belongs to `src/application/services/sessionHelpers`.

- Keep all snake_case -> frontend model transformations in mappers.
- Services should consume mapped data, not remap payload fields inline.
