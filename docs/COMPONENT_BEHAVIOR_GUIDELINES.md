# Component Behavior Guidelines

## Purpose

Defines how UI components should behave across Smart Society.

This file ensures:
- UI consistency
- predictable interactions
- elderly-friendly usability
- clean frontend architecture

This is NOT only about visuals.

This is about:
```txt
how components feel and behave
```

---

# Core Philosophy

Components should feel:

```txt
Simple
Predictable
Comfortable
Clear
```

Users should NEVER need to:
- guess interactions
- search for actions
- learn complicated UI behavior

---

# Global Component Rules

# Components Must Prioritize

```txt
Clarity > Creativity
```

Avoid:
- clever UI tricks
- hidden interactions
- experimental patterns

---

# Interaction Philosophy

Users should instantly understand:
- what is clickable
- what is important
- what happens next

---

# Button Guidelines

# Buttons Must Be Obvious

Buttons should:
- clearly describe actions
- remain touch-friendly
- stay visually consistent

---

# Good Button Labels

```txt
Approve Visitor
Pay Maintenance
Raise Complaint
```

---

# Bad Button Labels

```txt
Submit
Proceed
Continue
```

without context.

---

# Primary Button Rules

Use primary buttons ONLY for:
- main action
- highest-priority task

Avoid:
- multiple competing primary buttons

---

# Danger Actions

Dangerous actions should:
- require confirmation
- remain visually distinct

Examples:
- delete resident
- reject permanently
- remove records

---

# Card Guidelines

# Cards Should Be Scannable

Cards must:
- prioritize important information first
- avoid visual clutter
- support quick reading

---

# Good Card Structure

```txt
Distinct Logo / Icon
Title
Important Info
Secondary Metadata
Clear Call-to-Action (CTA) Demarcation
```

---

# Avoid

- oversized cards
- excessive metadata
- too many actions inside one card

---

# Modal Guidelines

# Use Modals Carefully

Modals should handle:
- confirmations
- quick actions
- lightweight workflows

Avoid:
- giant forms
- deep workflows
- multi-step complexity

---

# Mobile Modal Rule

On mobile prefer:
```txt
bottom sheets
full-screen flows
```

instead of tiny desktop-style modals.

---

# Form Guidelines

# Forms Must Feel Easy

Users should feel:
```txt
guided
```

NOT:
```txt
tested
```

---

# Form Rules

Avoid:
- huge forms
- too many required fields
- technical wording

Prefer:
- grouped sections
- progressive disclosure
- smart defaults

---

# Validation UX

Errors should:
- appear near fields
- explain clearly
- guide correction

---

# Bad Error Example

```txt
Invalid value
```

---

# Better Example

```txt
Please enter a valid phone number
```

---

# Input Guidelines

Inputs should:
- remain large enough for touch
- have clear labels
- support autofill where useful

---

# Table Guidelines

# Tables Must Stay Readable

Large desktop tables should become:
```txt
mobile-friendly stacked layouts
```

on smaller devices.

---

# Avoid

- tiny dense tables
- excessive columns
- horizontal scrolling chaos

---

# Navigation Guidelines

# Navigation Must Stay Predictable

Users should always know:
- where they are
- how to go back
- what section they opened

Use clear "Destination Tabs" instead of complex swiping or multiple nested tabs.

---

# Avoid

- deeply nested navigation
- hidden actions
- confusing menu systems

---

# Loading State Guidelines

# Every Async Component Needs

- loading state
- empty state
- error state

---

# Loading UX

Prefer:
- skeleton loaders
- subtle progress indicators

Avoid:
```txt
blank UI
```

---

# Empty State Guidelines

Empty states should:
- reassure users
- explain clearly
- guide next action

---

# Example

```txt
No complaints yet.

Tap below to create one.
```

---

# Error State Guidelines

Errors should:
- remain calm
- avoid technical jargon
- suggest recovery

---

# Bad Example

```txt
Unhandled server exception
```

---

# Better Example

```txt
Unable to load complaints right now.
Please try again.
```

---

# Notification Guidelines

Notifications should:
- feel important
- remain minimal
- avoid interruption overload

---

# Accessibility Guidelines

# Mandatory Accessibility Rules

Components must support:
- keyboard navigation
- readable contrast
- large touch areas
- proper focus states

---

# Elderly-Friendly Rules

## Important

Avoid:
- tiny buttons
- low contrast
- complex gestures
- hidden interactions

---

# Performance Guidelines

Components should:
- render efficiently
- avoid unnecessary rerenders
- feel responsive on weak devices

---

# Animation Guidelines

Animations should:
- support clarity
- feel subtle
- avoid distraction

Avoid:
- flashy effects
- excessive motion
- slow transitions

---

# Mobile Component Rules

# Mobile Is Priority

Components should:
- work comfortably with one hand
- remain touch-friendly
- avoid dense layouts

---

# AI-Agent Component Rules

## Frontend/UI Agents MUST NEVER

### Create Fancy But Confusing UI

Usability first.

---

### Hide Important Actions

Primary actions must stay obvious.

---

### Use Tiny Interactive Areas

Touch comfort is mandatory.

---

### Create Overloaded Components

Components should remain focused.

---

### Overuse Modals

Prefer clean flows.

---

# Recommended UX Feeling

Components should feel:

```txt
Calm
Friendly
Reliable
Predictable
```

Users should feel:
- comfortable
- guided
- confident

---

# Final Component Philosophy

Good components do NOT impress users by:
```txt
being visually flashy
```

Good components succeed when users:
```txt
complete tasks effortlessly without confusion
```