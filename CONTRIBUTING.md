# Contributing

Thanks for helping with `@wiltshirescouts/theme`, the shared theme for sites under `wiltshirescouts.org.uk`. This guide covers how to set up, how to name branches and commits, and what a pull request needs before it can be merged.

## Before you start

- For anything bigger than a small fix, open an issue first so we can agree the approach.
- Security problems: do not open a public issue. See [SECURITY.md](SECURITY.md).
- Every change must keep the design rules: British English, sentence case, no emoji, Lucide icons only, WCAG 2.2 AA, never colour alone, 44px targets, `prefers-reduced-motion` respected, and correct in both light and dark mode.

## Set up

You need Node 24 (the version CI uses).

```sh
npm install
npx playwright install chromium   # once, for the end-to-end tests
npm run dev                         # playground at http://localhost:5199
```

Add `?mode=light`, `?mode=dark` or `?mode=auto` to any playground route to check each colour mode. If you add a component, add it to a playground route so it can be seen and tested.

## Branches

Branch from `main`. Use a short, flat, kebab-case name with no slashes:

- Good: `list-padding`, `magic-link-expiry`, `datatable-sort-select`
- Not: `fix/list-padding`, `feature/MagicLink`

## Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). CI checks every commit in a pull request, and the pull request title, and fails if one does not follow the format.

```
<type>(<optional scope>)<optional !>: <description>

<optional body>

<optional footer(s)>
```

Types:

| Type | Use for |
|---|---|
| `feat` | A new component, prop, export or helper |
| `fix` | A bug fix |
| `docs` | README, CHANGELOG or other documentation only |
| `style` | Formatting only, no change in behaviour (not CSS changes; those are `feat` or `fix`) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A performance improvement |
| `test` | Adding or fixing tests |
| `build` | Dependencies, `package.json`, build or bundler config |
| `ci` | GitHub Actions and other CI config |
| `chore` | Anything else that does not touch `src` (releases, housekeeping) |
| `revert` | Reverting an earlier commit |

Rules:

- The description is lower case, in the imperative ("add", not "added" or "adds"), with no full stop at the end.
- The whole first line is 100 characters or fewer.
- Scopes are optional. Useful ones: `ui`, `forms`, `table`, `layout`, `theme`, `server`, `auth`, `brevo`, `playground`, `deps`.
- A breaking change gets a `!` after the type or scope, and a `BREAKING CHANGE:` footer saying what sites must change.

Examples:

```
feat(forms): add layout prop to RadioCards
fix(ui): keep list bullets inside cards and callouts
docs: explain the ws-theme cookie domain
feat(server)!: require allowedOrigins in requireSameOrigin

BREAKING CHANGE: sites must now pass allowedOrigins explicitly.
```

Do not add `Co-authored-by` trailers or other attribution lines for tools or AI assistants.

## Checks

Run these before you push. CI runs the same ones on every pull request:

```sh
npm run typecheck
npm run lint          # Biome; `npx biome check --write .` fixes formatting
npm test              # Vitest unit tests
npm run test:e2e      # Playwright + axe, light and dark
```

Add or update tests with your change: unit tests in `test/`, browser and accessibility tests in `e2e/`.

## Pull requests

- Keep each pull request to one change. Small is easier to review.
- Give it a conventional commit title, for example `feat(table): add sticky header option`.
- Fill in the template: what changed, why, how you tested it, and screenshots in light and dark mode for anything visual.
- Add a line to the top of `CHANGELOG.md` for anything a site would notice. Write it for the people who maintain the sites: what changed and whether they need to do anything.
- Do not bump `version` in `package.json` unless you are making a release.

## Releases

Maintainers only. Versions follow [Semantic Versioning](https://semver.org). While the package is below 1.0.0, a breaking change bumps the minor version (0.5.x to 0.6.0) and anything else bumps the patch version.

1. Bump `version` in `package.json` and `package-lock.json`, and date the new `CHANGELOG.md` heading.
2. Commit as `chore(release): 0.6.0` and merge.
3. Tag `main`: `git tag v0.6.0 && git push --tags`. Dependabot then opens update pull requests in each site.

## Licence

By contributing, you agree that your contributions are licensed under the [MIT licence](LICENSE). The Scouts logos and the Nunito Sans fonts are not covered by it; do not add other brand assets or fonts without checking their licence first.
