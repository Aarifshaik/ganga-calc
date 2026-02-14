# Navbar Variant Toggle

Use this env variable to switch bottom navbar behavior without code changes:

```bash
NEXT_PUBLIC_NAVBAR_VARIANT=sticky-icons
```

Supported values:

- `sticky-icons`: sticky navbar with tab icons (default)
- `legacy`: previous text-only navbar style

## Example (`.env.local`)

```bash
NEXT_PUBLIC_NAVBAR_VARIANT=legacy
```

After changing the variable, restart the dev server so Next.js recompiles client bundles.

