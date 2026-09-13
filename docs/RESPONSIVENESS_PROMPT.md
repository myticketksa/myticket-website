# Responsive Design Implementation — Existing Figma-Based Website

## ROLE

You are a senior frontend engineer and responsive UI/UX specialist.

You are working on an **existing production-ready website that was implemented from a Figma design**.

The current implementation accurately represents the designer's intended design at its existing target screen size, but the designer did not provide responsive designs for other viewport sizes.

Your task is to **add complete, production-quality responsive behavior to the existing implementation without breaking, redesigning, or unnecessarily modifying the current design.**

---

# 1. PRIMARY OBJECTIVE

Make the existing website fully responsive across:

* Large desktop
* Standard desktop
* Laptop
* Tablet landscape
* Tablet portrait
* Mobile landscape
* Mobile portrait

The responsive implementation must follow established professional responsive-design principles.

### CRITICAL RULE

> The current design at its existing supported/reference viewport must remain visually and structurally unchanged.

The existing screen is the **design source of truth**.

Responsive behavior should be added around the existing design rather than redesigning the existing screen.

---

# 2. BEFORE CHANGING ANY CODE

DO NOT immediately start editing files.

First inspect the entire project.

Analyze:

* Framework
* Routing
* Application structure
* Component architecture
* Styling architecture
* CSS/Tailwind configuration
* Existing breakpoints
* Theme/design tokens
* Typography
* Spacing system
* Layout system
* Reusable components
* Containers
* Navigation
* Headers
* Footers
* Forms
* Cards
* Tables
* Modals
* Dropdowns
* Sidebars
* Images
* Icons
* Buttons
* Lists
* Grids
* Flex layouts
* Fixed/absolute positioned elements
* Existing responsive rules
* Existing media queries
* Existing overflow behavior

Identify components that are already responsive and components that are not.

Do not duplicate responsive logic unnecessarily.

---

# 3. ESTABLISH THE CURRENT DESIGN BASELINE

Determine the current/reference viewport from the existing implementation.

Use the existing Figma-derived implementation as the baseline.

Before making modifications:

1. Identify the current desktop/reference viewport.
2. Understand the current container width.
3. Identify maximum content widths.
4. Identify typography sizes.
5. Identify spacing values.
6. Identify grid structures.
7. Identify component dimensions.
8. Identify navigation behavior.
9. Identify image aspect ratios.
10. Identify important alignment relationships.

Treat these values as the baseline.

### DO NOT:

* Arbitrarily change desktop spacing.
* Arbitrarily change typography.
* Change colors.
* Change fonts.
* Change component styling.
* Change visual hierarchy.
* Change existing dimensions.
* Replace components with different designs.
* Redesign the UI.
* Introduce a new visual style.

Unless required for responsive behavior.

---

# 4. RESPONSIVE DESIGN PRINCIPLES

Implement responsiveness using established responsive design principles.

The UI must adapt naturally rather than simply shrinking everything.

Use:

### Fluid Layout

Prefer:

* Flexible widths
* max-width containers
* min/max constraints
* flexbox
* CSS grid
* relative sizing
* responsive spacing

Avoid unnecessary fixed widths.

---

### Responsive Containers

Content should remain inside sensible horizontal boundaries.

Use patterns such as:

```css
width: 100%;
max-width: ...;
margin-inline: auto;
padding-inline: ...;
```

Do not allow content to touch the viewport edges on mobile unless the existing design intentionally requires it.

---

### Responsive Typography

Typography should remain readable across screen sizes.

Do not blindly scale every font.

Only adjust:

* heading sizes
* display text
* large labels
* text that would cause wrapping problems

when necessary.

Body text should remain comfortably readable.

Preserve:

* font family
* font weight
* line height
* visual hierarchy

from the existing design.

---

# 5. BREAKPOINT STRATEGY

Do not create excessive breakpoints.

Prefer a small, intentional breakpoint system.

Use the project's existing breakpoint system if one already exists.

If none exists, use a sensible responsive strategy approximately equivalent to:

```text
Mobile:       < 640px
Tablet:       640px – 1023px
Desktop:      1024px – 1279px
Large Desktop: ≥ 1280px
```

These are guidelines, not mandatory values.

Choose breakpoints based on where the UI actually needs to change.

### IMPORTANT

Do NOT add breakpoints simply because a device category exists.

A breakpoint should exist because the layout needs to change.

---

# 6. MOBILE-FIRST RESPONSIVE BEHAVIOR

Where practical, implement responsive behavior using a mobile-first approach.

However:

### DO NOT rewrite the existing desktop implementation unnecessarily.

If rewriting a component would risk changing the current design, preserve the existing implementation and add targeted responsive rules.

The goal is:

```text
Existing design
      ↓
Preserve
      ↓
Add responsive behavior
      ↓
No desktop regression
```

Not:

```text
Existing design
      ↓
Rewrite everything
      ↓
Hope it looks the same
```

---

# 7. RESPONSIVE NAVIGATION

Analyze the navigation carefully.

On smaller screens, determine whether the current navigation should:

* collapse
* become a hamburger menu
* become a drawer
* wrap
* reduce spacing
* hide secondary navigation
* move actions
* reorganize navigation groups

The mobile navigation must remain:

* usable
* accessible
* visually consistent
* easy to understand

Do not simply allow desktop navigation to overflow horizontally.

---

# 8. RESPONSIVE GRID SYSTEMS

For cards, dashboards, products, features, or similar grid-based content:

Desktop may use:

```text
4 columns
```

Tablet may use:

```text
2–3 columns
```

Mobile may use:

```text
1 column
```

But do not blindly apply these numbers.

Determine the appropriate column count based on:

* component minimum width
* content density
* readability
* hierarchy
* available viewport width

Avoid extremely narrow cards.

---

# 9. FLEXIBLE COMPONENTS

Components should gracefully adapt.

For example:

Desktop:

```text
[Icon] [Content........................] [Action]
```

Mobile may become:

```text
[Icon] [Content.................]
       [Action..................]
```

or:

```text
[Icon]
[Content]
[Action]
```

depending on the existing hierarchy.

Do not force desktop layouts into mobile if doing so creates:

* overflow
* tiny text
* compressed controls
* broken alignment
* unreadable content
* inaccessible buttons

---

# 10. IMAGES

Images must remain responsive.

Prevent:

* distortion
* unexpected stretching
* overflow
* broken aspect ratios

Use appropriate:

* width
* height
* aspect-ratio
* object-fit

while preserving the intended visual appearance.

Do not replace existing images.

Do not change image assets unless absolutely necessary.

---

# 11. TABLES

Tables require special attention.

Do NOT simply shrink tables until the content becomes unreadable.

For small screens, choose the most appropriate strategy:

* horizontal scrolling
* responsive column prioritization
* stacked representation
* alternative mobile presentation

Preserve all important information.

If horizontal scrolling is necessary, make it intentional and usable.

---

# 12. FORMS

Forms must remain usable on mobile.

Check:

* input widths
* labels
* spacing
* validation messages
* button placement
* select controls
* date fields
* multi-column layouts

Desktop:

```text
[Field] [Field] [Field]
```

Mobile may become:

```text
[Field]

[Field]

[Field]
```

Do not create cramped form layouts.

---

# 13. BUTTONS AND INTERACTIVE ELEMENTS

Ensure interactive elements remain usable on touch devices.

Avoid:

* extremely small clickable areas
* overlapping controls
* buttons extending outside containers
* text clipping
* inaccessible icons

Preserve the existing visual style.

Do not redesign buttons.

Only adapt their:

* width
* layout
* wrapping
* positioning
* spacing

when necessary.

---

# 14. SPACING

Responsive spacing should scale naturally.

Example:

```text
Desktop:
large section spacing

Tablet:
moderate section spacing

Mobile:
compact section spacing
```

However, do NOT indiscriminately reduce all spacing.

Maintain the visual rhythm of the original design.

Important relationships between:

* headings
* paragraphs
* cards
* sections
* controls

must remain intact.

---

# 15. OVERFLOW

Eliminate unintended horizontal scrolling.

Check every page at narrow widths.

There must be no accidental:

```text
horizontal page overflow
```

caused by:

* fixed widths
* absolute positioning
* large images
* long text
* buttons
* grids
* navigation
* margins
* transforms
* CSS calculations

However, intentional horizontal scrolling components such as tables or carousels are acceptable when appropriate.

Do not globally apply:

```css
overflow-x: hidden;
```

as a shortcut.

Fix the actual layout problem instead.

---

# 16. ABSOLUTE / FIXED POSITIONING

Inspect all:

* absolute elements
* fixed elements
* sticky elements

Make sure they behave correctly at smaller widths.

Do not remove positioning simply because it causes problems.

Instead determine the intended responsive behavior.

Examples:

* floating actions may move
* badges may reposition
* overlays may resize
* sticky headers may change height
* decorative elements may hide or reposition

---

# 17. LONG TEXT

Test long:

* headings
* labels
* buttons
* usernames
* titles
* descriptions
* navigation items

Ensure text does not unexpectedly:

* overflow
* overlap
* clip
* push important controls outside the viewport

Use appropriate wrapping and truncation only where consistent with the design.

Do not hide important information simply to make the layout fit.

---

# 18. ACCESSIBILITY

Responsive implementation must preserve accessibility.

Verify:

* keyboard navigation
* focus states
* semantic HTML
* accessible labels
* button semantics
* navigation semantics
* sufficient touch target sizes
* readable text
* logical DOM order

Do not sacrifice accessibility for pixel-perfect appearance.

---

# 19. DESIGN CONSISTENCY

Responsive versions must feel like the SAME website.

Do not create:

> Desktop design + completely different mobile design

Instead create:

> One design system that adapts across viewport sizes.

Preserve:

* colors
* typography
* border radius
* shadows
* iconography
* component language
* visual hierarchy
* spacing philosophy
* brand identity

---

# 20. DO NOT MODIFY THE EXISTING DESIGN

Unless absolutely required for responsive behavior, DO NOT modify:

* colors
* fonts
* icons
* logos
* illustrations
* existing component appearance
* desktop dimensions
* desktop spacing
* desktop layout
* content
* copy
* business logic
* API behavior
* routing
* state management

Responsive work is primarily a **layout adaptation task**, not a redesign.

---

# 21. DESKTOP REGRESSION PROTECTION

This is one of the most important requirements.

After implementing responsiveness, verify the original/reference viewport.

The result must be visually equivalent to the existing implementation.

Compare:

* layout
* alignment
* spacing
* typography
* dimensions
* positioning
* colors
* component appearance

If a responsive change modifies the desktop appearance unintentionally, fix the responsive implementation.

### Desktop regression is NOT acceptable.

---

# 22. VIEWPORT TESTING

Test every important page at minimum across these viewport categories:

### Large Desktop

```text
1440px+
```

### Desktop

```text
1280px
```

### Laptop

```text
1024px
```

### Tablet

```text
768px
```

### Mobile

```text
430px
```

### Small Mobile

```text
375px
```

Also test intermediate widths where layouts are likely to transition.

Do not only test standard device widths.

---

# 23. RESPONSIVE TRANSITION QUALITY

Pay special attention to widths immediately before and after breakpoints.

For example:

```text
767px
768px
769px
```

and:

```text
1023px
1024px
1025px
```

The layout must not suddenly:

* overlap
* jump incorrectly
* lose content
* overflow
* create excessive whitespace
* produce broken alignment

Responsive transitions should be intentional and stable.

---

# 24. DO NOT OVERENGINEER

Do not introduce unnecessary:

* dependencies
* libraries
* frameworks
* component rewrites
* CSS systems
* JavaScript viewport detection

Prefer CSS-based responsive behavior.

Use JavaScript only when the interaction genuinely requires behavioral changes that CSS cannot provide.

---

# 25. PRESERVE PROJECT ARCHITECTURE

Follow the existing project's architecture.

Do not introduce a new architecture.

Respect:

* existing components
* naming conventions
* folder structure
* styling conventions
* utility classes
* design tokens
* TypeScript conventions
* linting
* formatting
* state management

Reuse existing components wherever possible.

If a shared component needs responsive behavior, implement it at the shared component level rather than duplicating fixes across pages.

---

# 26. AVOID MAGIC NUMBERS

Do not add random pixel values simply to make one viewport look correct.

Before adding a value, understand why it is needed.

Prefer existing:

* spacing tokens
* container widths
* breakpoints
* design variables
* Tailwind utilities
* CSS variables

When a new value is genuinely necessary, make it consistent with the existing design system.

---

# 27. RESPONSIVE COMPONENT PRIORITY

Prioritize responsive work in this order:

1. Page-level containers
2. Header/navigation
3. Main layout
4. Grid/flex systems
5. Typography
6. Forms
7. Cards
8. Tables
9. Images
10. Modals/dialogs
11. Footer
12. Decorative elements

Fix structural problems before cosmetic problems.

---

# 28. VISUAL QUALITY CHECK

After implementation, inspect each page as a designer would.

Ask:

### At desktop:

* Does it still look like the original?
* Did anything move unexpectedly?
* Did spacing change?
* Did typography change?
* Did component dimensions change?

### At tablet:

* Does the layout naturally reflow?
* Are columns appropriate?
* Is navigation usable?
* Is content readable?

### At mobile:

* Is everything readable?
* Is anything overflowing?
* Are buttons usable?
* Are forms comfortable?
* Is hierarchy preserved?
* Is there unnecessary empty space?
* Is anything compressed?
* Are important actions easy to find?

---

# 29. IMPLEMENTATION PROCESS

Follow this workflow.

## Phase 1 — Audit

Inspect the complete codebase.

Identify all pages and major components.

Create an internal map of:

```text
Page
 ├── Layout
 ├── Header
 ├── Navigation
 ├── Main
 │    ├── Section
 │    ├── Grid
 │    ├── Cards
 │    └── Components
 └── Footer
```

Identify responsive problems.

---

## Phase 2 — Responsive Strategy

For every major component determine:

```text
Desktop behavior
Tablet behavior
Mobile behavior
```

Do not start coding until the layout strategy is understood.

---

## Phase 3 — Implementation

Implement responsive behavior using the project's existing styling system.

Prefer:

* CSS
* Tailwind responsive utilities
* CSS Grid
* Flexbox
* container constraints
* responsive spacing
* responsive typography

Avoid JavaScript-driven responsiveness unless necessary.

---

## Phase 4 — Regression Check

Verify the original/reference viewport.

Ensure there is no desktop regression.

---

## Phase 5 — Responsive Testing

Test:

```text
1440
1280
1024
768
430
375
```

plus important intermediate widths.

---

## Phase 6 — Refinement

Fix:

* overflow
* wrapping
* spacing
* alignment
* component sizing
* navigation
* typography
* touch usability

Do not redesign.

---

# 30. IMPORTANT "DO NOT" LIST

DO NOT:

* redesign the website
* change the visual identity
* change the desktop design
* replace components unnecessarily
* rewrite the entire application
* introduce unnecessary dependencies
* use JavaScript to detect viewport width unnecessarily
* hide important content just to fit mobile
* use `overflow-x: hidden` as a generic fix
* create dozens of breakpoints
* use arbitrary magic numbers
* shrink everything proportionally
* make text unreadably small
* make buttons tiny
* break accessibility
* change business logic
* change APIs
* change routing
* change application behavior unrelated to responsiveness
* modify the existing reference viewport unless absolutely necessary

---

# 31. IMPORTANT "DO" LIST

DO:

* preserve the current design
* treat the existing implementation as the source of truth
* add responsive behavior incrementally
* use established responsive design principles
* use CSS-first responsive behavior
* reuse existing components
* preserve design tokens
* preserve typography hierarchy
* preserve visual hierarchy
* preserve spacing relationships
* test real viewport sizes
* test intermediate widths
* fix root layout problems
* maintain accessibility
* verify desktop regression
* keep the implementation maintainable
* keep responsive logic close to the component it affects

---

# 32. FINAL ACCEPTANCE CRITERIA

The work is complete only when ALL of the following are true:

### Desktop

The existing/reference design remains visually unchanged.

### Tablet

The interface adapts naturally without:

* overlap
* clipping
* excessive compression
* broken grids
* broken navigation

### Mobile

The interface is:

* readable
* usable
* accessible
* visually consistent
* free of unintended horizontal overflow

### Code

The implementation:

* follows the existing architecture
* uses existing design tokens
* avoids unnecessary dependencies
* avoids unnecessary JavaScript
* avoids duplicated responsive logic
* remains maintainable

### Regression

Existing functionality continues to work.

No unrelated functionality is changed.

---

# 33. FINAL REPORT

When finished, provide a concise implementation report containing:

## Responsive Changes

List the major components/pages that were made responsive.

## Breakpoints

List the actual breakpoints used and why.

## Desktop Protection

Explain how you verified that the existing/reference design was preserved.

## Mobile Behavior

Summarize major mobile adaptations.

## Tablet Behavior

Summarize major tablet adaptations.

## Issues Found

List any existing layout problems discovered during the audit.

## Files Changed

List the files modified.

## Validation

Report the viewport sizes tested:

```text
1440px
1280px
1024px
768px
430px
375px
```

and any additional important widths.

---

# FINAL INSTRUCTION

Work carefully and incrementally.

**Do not treat this task as a redesign.**

The goal is:

> **"Make the existing Figma implementation responsive while preserving the existing design exactly at its current/reference viewport."**

When uncertain between changing the existing design and adapting the responsive layout, **preserve the existing design and choose the least invasive responsive solution.**

Do not make assumptions that result in visual redesign.

Inspect first.
Plan second.
Implement third.
Test fourth.
Refine last.
