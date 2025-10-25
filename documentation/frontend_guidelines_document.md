# Frontend Guideline Document for SIMAS

Welcome to the frontend guideline for SIMAS (Sistem Informasi Manajemen Absensi & Penggajian). This document outlines how the frontend is built, styled, organized, and tested. It’s written in everyday language so anyone can follow along.

## 1. Frontend Architecture

### Overview
- We use **Next.js** (React framework) to build pages and handle server-side rendering (SSR) or static generation as needed.
- **TypeScript** provides type safety and catches errors early.
- **Shadcn UI** and **Radix UI** supply a set of ready-to-use, accessible components. Radix is unstyled; Shadcn adds styling on top.
- **Tailwind CSS** is our utility-first CSS framework for rapid, consistent styling.
- **MDX** lets us mix Markdown with React components (often for in-app documentation or help screens).
- **next-themes** powers dark/light mode switching.

### How It Supports Our Goals
- **Scalability:** Breaking UI into pages, layouts, and reusable components lets us add features without confusion.
- **Maintainability:** TypeScript, consistent folder structure, and shared components mean fewer bugs and easier onboarding.
- **Performance:** Next.js features (like SSR, static generation, and image optimization) plus code splitting keep load times fast.

## 2. Design Principles

1. **Usability**: Interfaces are simple, with clear labels and obvious actions (buttons, forms, menus). We follow familiar patterns (sidebars, modals) so users find what they need quickly.
2. **Accessibility**: All components meet WCAG guidelines. We use semantic HTML, focus indicators, and aria-attributes (already baked into Radix UI components).
3. **Responsiveness**: Layouts adapt from mobile to desktop. Tailwind’s responsive utilities (e.g., `sm:`, `md:`, `lg:`) ensure content scales gracefully.
4. **Consistency**: Shared UI components and a single source of truth for colors and typography keep the look and feel uniform across all pages.

### Applying the Principles
- Form fields include labels, helper text, and real-time feedback (via React Hook Form + Zod).  
- Navigation (sidebar, top bar) remains visible or collapsible on small screens.  
- We test keyboard navigation and screen-reader announcements during development.

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS**: We use utility classes for spacing, colors, typography, and layout instead of writing custom CSS.  
- **No BEM/SMACSS**, since Tailwind covers component boundaries with its class names.  
- **Pre-processor**: None—Tailwind’s built-in directives handle everything.

### Theming
- **next-themes** toggles between light and dark mode.  
- Theme values (colors, background, borders) are defined in `tailwind.config.js` under `theme.extend.colors`.

### Visual Style
- Style: **Modern, flat design** with slight emphasis on depth via subtle shadows and rounded corners.  
- Occasional **glassmorphism** overlays (semi-transparent panels) for modals or dashboards.

### Color Palette
- Primary: Indigo 600 (#4F46E5)  
- Secondary: Emerald 500 (#10B981)  
- Accent: Amber 500 (#F59E0B)  
- Neutral Light: Gray 100 (#F3F4F6)  
- Neutral Dark: Gray 800 (#1F2937)  
- Error: Red 500 (#EF4444)  
- Success: Green 500 (#22C55E)

### Typography
- **Font family**: Inter (sans-serif) for clarity and readability.  
- **Sizing**: Tailwind defaults (e.g., `text-sm`, `text-base`, `text-lg`) map to our scale.  
- **Line height**: Comfortable reading (e.g., `leading-relaxed`).

## 4. Component Structure

### Organization
- `app/` (Next.js App Router) groups pages and layouts:  
  • `(auth)/` for login, signup, password reset  
  • `(dashboard)/` for main admin screens  
  • top-level layouts in `layout.tsx`
- `components/` holds reusable UI pieces, grouped by feature or type (e.g., `ui/`, `employee/`, `payroll/`).
- `hooks/` contains custom React hooks (e.g., `useEmployees`, `useAttendance`).
- `lib/` for helpers and API client setup.
- `types/` for shared TypeScript definitions.

### Reusability and Maintainability
- Each component resides in its own folder with its TSX, styles (if any), and tests.  
- Props are typed; components only accept what they need.  
- We favor small, focused components (e.g., `StatusBadge`, `StatCard`) that can be composed.

## 5. State Management

### Approach
- **Local state**: React’s `useState` for simple toggles or form fields.  
- **Global state**: React Context and custom hooks for auth status and shared data (e.g., `AuthContext`, `EmployeeContext`).
- **Data fetching state**: Custom hooks wrap fetch logic and handle loading/error (e.g., `usePayrollApprovals`).

### Why This Works
- Context + hooks keep things lightweight—no heavy state libraries unless needed.  
- If the app grows, we could introduce Zustand or Jotai for more complex state patterns.

## 6. Routing and Navigation

### Routing
- Next.js App Router (`app/`): folder names define routes automatically.  
- Route groups (`(auth)`, `(dashboard)`) let us apply shared layouts and middleware (via `middleware.ts`).

### Navigation Structure
- **Sidebar**: Links to Attendance, Employees, Leave, Payroll, Schedules, Analytics.  
- **Top bar**: User menu, notifications, theme toggle.  
- **Protected routes**: Components wrapped in a `ProtectedRoute` check auth state before rendering.  
- **Dynamic routes**: E.g., `/dashboard/employees/[id]` for editing or viewing a specific employee.

## 7. Performance Optimization

1. **Code Splitting**: Next.js automatically splits code by route. We also lazily load heavy components with `dynamic()`.
2. **Image Optimization**: Use `next/image` for responsive, optimized images.
3. **Caching**: SWR or built-in fetch caching for repeat data requests.
4. **Minification**: Tailwind purges unused CSS in production for small stylesheet size.
5. **Server-Side Rendering**: Pages that need SEO or initial data use SSR or static generation to speed first paint.

These steps reduce load times and keep the UI snappy.

## 8. Testing and Quality Assurance

### Unit Tests
- **Jest** + **React Testing Library** for components and hooks.  
- Focus on UI behavior, prop handling, and custom hook logic.

### Integration Tests
- Combine multiple components or simulate user flows (e.g., filling out and submitting a leave request form).

### End-to-End Tests
- **Cypress** for critical flows: login, clock-in/clock-out, payroll approval, profile completion wizard.

### Code Quality Tools
- **ESLint** (with TypeScript rules) for linting.
- **Prettier** for consistent formatting.
- **editorconfig** enforces basic style across editors.

### Continuous Integration
- Automated test runs on every pull request (GitHub Actions or similar).
- Lint and type checks block merges if errors are found.

## 9. Conclusion and Overall Frontend Summary

This frontend setup for SIMAS brings together Next.js, TypeScript, Tailwind CSS, and a suite of UI libraries to deliver a fast, maintainable, and accessible user interface. We:

- Leverage a **component-based architecture** for reuse and clarity.
- Follow core **design principles**: usability, accessibility, and responsiveness.
- Use **utility-first styling** with Tailwind and support dark/light themes.
- Manage state with **React hooks** and Context, with the option to grow into state libraries if needed.
- Optimize performance through SSR/SSG, code splitting, and image optimization.
- Ensure quality via **unit, integration, and end-to-end tests**, backed by CI.

By following these guidelines, new developers and contributors can quickly understand how the frontend of SIMAS is structured, styled, and maintained, ensuring consistency and high quality as the project grows.