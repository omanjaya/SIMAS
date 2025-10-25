# SMP Saraswati Attendance App - UI Design System

## Overview
This document outlines the standardized UI design system for the SMP Saraswati Attendance App. The system ensures consistent look, feel, and behavior across all pages in the application.

## Core Principles

### 1. No Box-in-Box Pattern
- Never use nested containers unnecessarily
- Apply styling directly to the outermost container
- Use single, well-styled containers instead of multiple nested divs

### 2. Gradient-Based Emphasis
- Use gradients for primary actions and emphasis
- Apply gradients consistently for visual hierarchy
- Ensure gradients meet accessibility contrast requirements

### 3. Full Dark Mode Support
- Every color must have a dark variant using `dark:` prefix
- Maintain visual consistency in both light and dark modes
- Test readability and contrast in all modes

### 4. Shadcn-UI Components
- Always use Shadcn-UI components when available
- Follow Shadcn patterns and variants
- Extend components only when necessary

## Color System

### Backgrounds
- Main background: `bg-white dark:bg-gray-900`
- Page background: `bg-gray-50 dark:bg-gray-800`
- Card background: `bg-white dark:bg-gray-800`
- Muted background: `bg-gray-50 dark:bg-gray-800/50`

### Text Colors
- Primary text: `text-gray-900 dark:text-white`
- Secondary text: `text-gray-700 dark:text-gray-300`
- Body text: `text-gray-600 dark:text-gray-400`
- Muted text: `text-gray-500 dark:text-gray-400`

### Border Colors
- Default border: `border-gray-200 dark:border-gray-700`
- Emphasized border: `border-gray-300 dark:border-gray-600`

### Status Colors
- Success: `bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400`
- Warning: `bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400`
- Danger: `bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400`
- Info: `bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`

### Gradient Colors
- Primary gradient: `bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600`
- Secondary gradient: `bg-gradient-to-r from-blue-600 to-indigo-600`
- Success gradient: `bg-gradient-to-r from-green-500 to-emerald-500`
- Warning gradient: `bg-gradient-to-r from-yellow-500 to-amber-500`
- Danger gradient: `bg-gradient-to-r from-red-500 to-rose-500`

## Typography System

### Font Family
- Primary font: `var(--font-satoshi)`

### Typography Scales
- `.text-heading-1`: 48px, bold
- `.text-heading-2`: 40px, bold
- `.text-heading-3`: 32px, bold
- `.text-heading-4`: 24px, bold
- `.text-heading-5`: 20px, bold
- `.text-heading-6`: 18px, bold
- `.text-body-lg`: 18px, regular
- `.text-body-md`: 16px, regular
- `.text-body-sm`: 14px, regular
- `.text-body-xs`: 12px, regular

## Spacing System
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px
- `gap-6`: 24px
- `gap-8`: 32px
- `p-2`: 8px padding
- `p-3`: 12px padding
- `p-4`: 16px padding
- `p-6`: 24px padding

## Component Patterns

### Cards
```jsx
<Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
  <CardHeader>
    <CardTitle className="text-gray-900 dark:text-white">Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Buttons
Primary with gradient:
```jsx
<Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-xl transition-all">
  Primary Action
</Button>
```

Standard variants:
- Default: `variant="default"` - for primary actions
- Secondary: `variant="secondary"` - for secondary actions
- Outline: `variant="outline"` - for less prominent actions
- Destructive: `variant="destructive"` - for destructive actions

### Navigation
Active navigation item:
```jsx
<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg font-medium text-sm transition-all">
  <Icon className="w-5 h-5" />
  <span>Active Item</span>
</div>
```

### Badges
```jsx
<Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 px-2.5 py-0.5 rounded-full">
  Badge Text
</Badge>
```

## Layout Patterns

### Dashboard Layout
```jsx
<div className="flex flex-col h-full">
  <Header />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-6">
      <!-- Page content -->
    </main>
  </div>
</div>
```

### Page Structure
```jsx
<div className="space-y-6 p-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
      <p className="text-muted-foreground">Page description</p>
    </div>
    <div className="flex gap-2">
      <!-- Actions -->
    </div>
  </div>

  <!-- Content -->
</div>
```

## Responsive Patterns
- Use `md:`, `lg:`, and `xl:` breakpoints for responsive layouts
- Mobile-first approach with progressive enhancement
- Cards should stack on mobile and grid on larger screens
- Tables become scrollable on small screens

## Dark Mode Implementation
- Every color utility must have a `dark:` variant
- Test all components in both light and dark modes
- Ensure sufficient contrast ratios in both modes
- Example:
```jsx
bg-white dark:bg-gray-800
text-gray-900 dark:text-white
border-gray-200 dark:border-gray-700
```

## Gradients for Emphasis
- Primary buttons: `bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600`
- Active navigation: `bg-gradient-to-r from-blue-600 to-indigo-600`
- Stats cards: Use subtle gradient backgrounds `bg-gradient-to-br from-primary/5 to-primary/10`
- Avatar fallbacks: `bg-gradient-to-br from-blue-500 to-indigo-500`

## Accessibility Guidelines
- All interactive elements must be keyboard accessible
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Proper focus indicators
- Semantic HTML structure
- ARIA attributes where appropriate
- Screen reader compatibility

## Component Variants

### Stats Cards
```jsx
<Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/50">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
    <CardTitle className="text-sm font-medium text-muted-foreground">Label</CardTitle>
    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-300 p-2 rounded-full">
      Icon
    </span>
  </CardHeader>
  <CardContent className="space-y-2 px-4 pb-4 pt-0">
    <p className="text-3xl font-bold">Value</p>
    <p className="text-xs text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

### Data Tables
- Use consistent table structure with proper headers
- Include hover states for rows
- Maintain column alignment
- Add loading states
- Include pagination controls

### Forms
- Use consistent spacing between form elements
- Maintain proper label and input relationships
- Include validation states
- Add loading states for form submissions
- Use proper error messaging

## Component Checklist
Before implementing any component, ensure:
- [ ] Uses Shadcn-UI components where available
- [ ] Follows No Box-in-Box pattern
- [ ] Has proper dark mode support with `dark:` variants
- [ ] Uses gradients for emphasis where appropriate
- [ ] Maintains consistent spacing
- [ ] Follows typography hierarchy
- [ ] Responsive on all device sizes
- [ ] Accessible with proper ARIA attributes
- [ ] Proper focus states for keyboard navigation
- [ ] Adequate color contrast in both modes