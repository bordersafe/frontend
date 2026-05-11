# Copilot Instructions (Frontend)

## Design System Alignment
- Use the palette and typography from [app/globals.css](../app/globals.css): Sora for UI text and Instrument Serif for display.
- Favor warm paper surfaces, deep green action blocks, and soft atmospheric gradients.
- Keep card radii between 24px and 36px for primary panels; avoid sharp corners.
- Use layered background utilities (for marketing/landing sections): `section-bridge`, `section-aurora`, `section-mist`, `section-emerald`.
- Motion should be calm: `reveal-up` for entry and `float-slow` for chips/badges only.

## Copy And Tone
- User-facing copy must be plain language. Avoid technical terms like "API", "webhook", "idempotent", "OCR", "JSON", "Gemini", or "Squad".
- Prefer replacements such as "payment confirmation", "duplicate-safe", "automated checks", "delivery proof", and "review".
- Headlines should be short and confident; body copy should be one or two sentences.

## UI Composition
- Use stacked cards with strong hierarchy and ample breathing room.
- Keep primary CTAs grouped and visually distinct with the `--action` color.
- Ensure text contrast meets WCAG AA and touch targets are at least 44px tall.
