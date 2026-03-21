# Write Quest Design System (Draft v0.1)

## Purpose
This document defines the first version of shared visual and interaction rules for the Write Quest landing page.

## Foundations
### Colors
- `bg.base`: `#f4f0ec`
- `text.primary`: `#53280d`
- `text.warm`: `#a4510f`
- `accent.primary`: `#f7931e`
- `accent.primaryGlow`: `#ffd910`
- `accent.primaryBorder`: `#ff3d2f`
- `surface.wood`: use `wood-nav.jpg`

### Typography
- Font family: `Arima`
- Hero subtitle: `36px`, semibold
- Section heading: `34px`
- Large CTA statement: `52px`
- Body paragraph: `25px`

### Radii
- Large card: `18px`
- Gallery card: `16px`
- Pill button: `40px`

## Components
### Primary Button (`Ui` with `property1="button"`)
- Background: `#f7931e`
- Bottom border: `4px solid #ff3d2f`
- Text color: `#ffd910`
- Text shadow: `0 3px 0 #3f2a11`
- Shape: large rounded pill
- Hover: slight lift + brightness increase

### Play Button (`Ui` with `property1="play-1"`)
- Size: `130px x 136px`
- Shape: oval pill
- Border: `4px solid #f04a24`
- Fill: `#ffb100`
- Bottom depth shadow: `0 4px 0 #ed1c24`
- Icon: red play triangle

### Draggable Decor (`DraggableElement`)
- Cursor: `grab` / `grabbing`
- Hover/drag outline: `3px solid #f7931e`
- Hover scale: `1.1`
- Positioning: absolute

### Before/After Reveal (`BeforeAfterSlider`)
- Base image always visible
- On hover: full after image reveal
- Pointer-following glare layer for realism

### Gallery Hover State
- Card hover applies saturation and brightness lift
- Animated water-glare sweep overlay (`mix-blend-mode: screen`)

## Layout Rules
- Desktop baseline width: `1440px`
- Full-width sections:
  - Hero
  - Wood message bars
  - Final scenic banner
  - Footer
- Centered content container:
  - Max width `1440px`
  - Default horizontal padding: `48px`

## Asset Rules
- Source of truth: `WQ/src/Assets`
- Do not add remote image dependencies for core sections.
- Preserve original aspect ratios from source files.

## QA Checklist (Design System)
1. Buttons use shared `Ui` variants only.
2. Any new CTA uses primary color tokens above.
3. Any decorative icon that can move must use `DraggableElement`.
4. New gallery cards include hover glare behavior.
5. New sections follow full-width vs centered-content pattern.

## Next Additions
1. Add spacing tokens (`space.2`, `space.4`, etc.) to reduce hardcoded pixel values.
2. Convert recurring heading/body styles into reusable typography classes/components.
3. Add light/dark contrast checks for CTA text and overlays.
4. Extract wood-strip and image-card primitives.
