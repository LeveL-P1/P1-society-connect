# Mobile First Guidelines

## Purpose

Defines the mobile-first UX strategy for Smart Society.

The platform should primarily feel:
```txt
designed for mobile users
```

Desktop is secondary.

This file guides frontend/UI AI agents to create:
- touch-friendly UI
- elderly-friendly UX
- simple navigation
- lightweight interfaces

---

# Core Philosophy

Most users will use:
- Android phones
- mid/low-end devices
- mobile internet

The app should feel:
```txt
fast
simple
comfortable
```

NOT:
```txt
desktop dashboards squeezed into mobile
```

---

# Primary UX Goal

Users should complete important tasks:
- quickly
- with minimal taps
- without confusion

---

# Mobile Navigation Rules

# Preferred Navigation

Use:
```txt
Bottom Navigation
```

for primary resident flows.

---

# Recommended Main Tabs

```txt
Home
Visitors
Complaints
Notices
Profile
```

Keep:
- icons simple
- labels clear

Avoid:
- too many tabs
- nested navigation

---

# Important Rule

Users should reach major actions within:
```txt
1–2 taps maximum
```

---

# Touch Interaction Rules

# Minimum Touch Size

Buttons and touch areas should remain:
```txt
44px minimum
```

for accessibility and elderly users.

---

# Spacing Rules

Avoid:
- tightly packed buttons
- crowded cards
- tiny clickable areas

The UI should feel:
```txt
comfortable to tap
```

---

# One-Handed Usage Philosophy

Important actions should stay:
- reachable by thumb
- near bottom interaction zones

Avoid placing critical actions only at:
```txt
top-right corners
```

---

# Mobile Layout Philosophy

# Prefer Vertical Flow

Good:
```txt
stacked layouts
single-column screens
```

Avoid:
```txt
complex grids
tiny cards
multi-column mobile layouts
```

---

# Card Rules

Cards should:
- remain readable
- have enough spacing
- prioritize important information first

---

# Example

Good visitor card:

```txt
Visitor Name
Purpose
Time
Approve Button
Reject Button
```

Simple.

---

# Dashboard Rules

# Mobile Dashboard Must Stay Minimal

Show ONLY:
- important actions
- pending tasks
- critical updates

Avoid:
- too many analytics
- too many widgets
- complex charts

---

# Recommended Resident Dashboard

```txt
Pending Maintenance
Visitor Requests
Latest Notices
Raise Complaint
```

That is enough.

---

# Typography Rules

Text should:
- remain readable
- avoid tiny font sizes
- support older users

---

# Recommended Mobile Sizes

| Element | Suggested |
|---|---|
| Main Heading | text-xl |
| Card Title | text-base/lg |
| Body Text | text-sm/base |
| Metadata | text-xs/sm |

---

# Form UX Rules

# Forms Must Feel Lightweight

Avoid:
- huge forms
- too many fields at once

Prefer:
- grouped sections
- step-by-step flow
- smart defaults

---

# Keyboard UX

Forms should:
- avoid keyboard overlap
- keep submit actions accessible
- scroll properly on small screens

---

# Modal Rules

Avoid large modals on mobile.

Prefer:
```txt
bottom sheets
full-screen flows
```

when workflows are complex.

---

# Loading UX Rules

Mobile users should ALWAYS see:
- loading feedback
- progress indicators
- skeleton states

Avoid:
```txt
blank screens
```

---

# Performance Rules

# Mobile Performance Is Critical

Avoid:
- heavy animations
- giant renders
- large bundles
- unnecessary rerenders

---

# Optimize For

- weak phones
- slow internet
- battery efficiency

---

# Animation Rules

Animations should:
- feel subtle
- improve clarity

Avoid:
- flashy motion
- excessive transitions
- long animations

---

# Scroll Behavior

Avoid:
- nested scrolling chaos
- horizontal scrolling

Prefer:
```txt
simple vertical scrolling
```

---

# Table Rules

Large desktop tables should transform into:
```txt
stacked mobile cards
```

on phones.

Avoid:
```txt
tiny unreadable tables
```

---

# Notification UX

Important notifications should:
- remain actionable
- avoid clutter

Examples:
- visitor waiting
- payment due
- complaint update

---

# Empty State Rules

Mobile empty states should:
- explain clearly
- guide action

Example:

```txt
No complaints yet.

Tap below to create one.
```

---

# Error UX Rules

Errors should:
- remain simple
- avoid technical language

---

# Example

Bad:
```txt
Request failed with status 500
```

Better:
```txt
Unable to load notices right now.
Please try again.
```

---

# Accessibility Rules

Mobile UI must support:
- large touch targets
- readable contrast
- simple navigation
- easy scanning

---

# Elderly-Friendly Rules

# Mandatory

## Larger Interactive Areas

Avoid tiny controls.

---

## Clear Language

Avoid:
```txt
technical wording
```

Prefer:
```txt
human-friendly actions
```

---

## Reduced Cognitive Load

Users should NOT need:
- tutorials
- long instructions
- technical understanding

---

# AI-Agent Mobile Rules

## Frontend/UI Agents MUST NEVER

### Create Desktop-Heavy Layouts

Mobile-first is mandatory.

---

### Add Too Many Actions Per Screen

Focus only on primary actions.

---

### Use Tiny Text

Readability first.

---

### Create Dense Interfaces

The UI should breathe.

---

### Overuse Modals

Prefer clean page flows on mobile.

---

# Final Mobile UX Philosophy

The app should feel like:

```txt
A simple society assistant in your pocket
```

Users should:
- instantly understand screens
- complete tasks quickly
- never feel overwhelmed

---

# Final Principle

If an elderly resident can comfortably:
- approve visitors
- pay maintenance
- read notices
- raise complaints

using one hand on a phone,

then the UX direction is correct.