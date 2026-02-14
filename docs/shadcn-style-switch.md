# Switching shadcn Styles

This project includes a helper script:

```bash
npm run shadcn:style -- <style-name>
```

Example:

```bash
npm run shadcn:style -- radix-nova
```

## What the script does

1. Updates `components.json` -> `"style": "<style-name>"`.
2. Regenerates all components in `src/components/ui` with `--overwrite`.

## Recommended workflow

1. Commit your current UI state.
2. Run:
   ```bash
   npm run shadcn:style -- radix-nova
   ```
3. Run checks:
   ```bash
   npm run lint
   npm run test:run
   npm run build
   ```
4. Review UI diffs and adjust only project-specific custom wrappers if needed.

## Notes

- Some components may not exist in every style registry. The script prints failures if any component cannot be regenerated.
- You can switch to any supported style by passing a different name.

