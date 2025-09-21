import { Meta } from '@storybook/blocks';

<Meta title="Design System" />

# Design System Documentation

## Overview

This design system provides a comprehensive set of guidelines, components, and patterns for building consistent, accessible, and beautiful user interfaces. It serves as the single source of truth for the visual and interaction design of our applications.

## 🎨 Design Principles

### 1. **User-Centered Design**
- Always prioritize user needs and goals
- Make interfaces intuitive and easy to use
- Reduce cognitive load through clear visual hierarchy

### 2. **Consistency**
- Use established patterns consistently across the application
- Maintain visual and behavioral consistency
- Follow the same design language throughout

### 3. **Accessibility First**
- Design for all users, including those with disabilities
- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigation and screen reader compatibility

### 4. **Performance**
- Optimize for fast loading and smooth interactions
- Use efficient design patterns
- Minimize visual complexity where possible

### 5. **Scalability**
- Design systems that work across different screen sizes
- Create flexible components that can adapt to various contexts
- Plan for future growth and new requirements

## 🎨 Color System

### Primary Palette

Our primary colors are based on a red-based color scheme that conveys energy and reliability.

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Primary** | `#dc2626` | `rgb(220, 38, 38)` | Main brand color, primary buttons, links |
| **Primary Hover** | `#b91c1c` | `rgb(185, 28, 28)` | Hover states for primary elements |
| **Primary Light** | `#fef2f2` | `rgb(254, 242, 242)` | Backgrounds, subtle accents |

### Secondary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Secondary** | `#4b5563` | `rgb(75, 85, 99)` | Secondary buttons, muted text |
| **Secondary Hover** | `#374151` | `rgb(55, 65, 81)` | Hover states for secondary elements |

### Semantic Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Success** | `#10b981` | `rgb(16, 185, 129)` | Success states, positive feedback |
| **Warning** | `#f59e0b` | `rgb(245, 158, 11)` | Warning states, attention needed |
| **Error** | `#ef4444` | `rgb(239, 68, 68)` | Error states, destructive actions |
| **Info** | `#3b82f6` | `rgb(59, 130, 246)` | Information, neutral states |

### Neutral Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **White** | `#ffffff` | `rgb(255, 255, 255)` | Primary backgrounds |
| **Gray 50** | `#f9fafb` | `rgb(249, 250, 251)` | Light backgrounds |
| **Gray 100** | `#f3f4f6` | `rgb(243, 244, 246)` | Borders, subtle backgrounds |
| **Gray 200** | `#e5e7eb` | `rgb(229, 231, 235)` | Disabled states, dividers |
| **Gray 300** | `#d1d5db` | `rgb(209, 213, 219)` | Secondary text, borders |
| **Gray 400** | `#9ca3af` | `rgb(156, 163, 175)` | Placeholder text, muted elements |
| **Gray 500** | `#6b7280` | `rgb(107, 114, 128)` | Body text, secondary content |
| **Gray 600** | `#4b5563` | `rgb(75, 85, 99)` | Headings, important text |
| **Gray 700** | `#374151` | `rgb(55, 65, 81)` | Strong emphasis, primary text |
| **Gray 800** | `#1f2937` | `rgb(31, 41, 55)` | High contrast text |
| **Gray 900** | `#111827` | `rgb(17, 24, 39)` | Maximum contrast text |

## 📝 Typography

### Font Families

```css
/* Primary Font */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

/* Monospace Font */
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
```

### Font Sizes

| Size | CSS | Usage |
|------|-----|-------|
| **xs** | `0.75rem` (12px) | Small labels, captions |
| **sm** | `0.875rem` (14px) | Secondary text, small buttons |
| **base** | `1rem` (16px) | Body text, default size |
| **lg** | `1.125rem` (18px) | Large text, subheadings |
| **xl** | `1.25rem` (20px) | Headings, important text |
| **2xl** | `1.5rem` (24px) | Page titles, major headings |
| **3xl** | `1.875rem` (30px) | Hero text, large headings |
| **4xl** | `2.25rem` (36px) | Display text, very large headings |

### Font Weights

| Weight | CSS | Usage |
|--------|-----|-------|
| **Light** | `300` | Secondary text, captions |
| **Normal** | `400` | Body text, regular content |
| **Medium** | `500` | Subheadings, emphasis |
| **Semibold** | `600` | Headings, important text |
| **Bold** | `700` | Strong emphasis, primary headings |

### Line Heights

| Height | CSS | Usage |
|--------|-----|-------|
| **Tight** | `1.25` | Headings, compact text |
| **Snug** | `1.375` | Subheadings, body text |
| **Normal** | `1.5` | Body text, regular content |
| **Relaxed** | `1.625` | Long-form content, readability |
| **Loose** | `2` | Large text, display content |

## 📐 Spacing System

Our spacing system is based on a 4px grid, providing consistent and harmonious spacing throughout the interface.

### Base Unit
- **1 unit = 4px**
- All spacing values are multiples of this base unit

### Spacing Scale

| Size | CSS | Pixels | Usage |
|------|-----|--------|-------|
| **0** | `0` | 0px | No spacing |
| **1** | `0.25rem` | 4px | Small gaps, tight spacing |
| **2** | `0.5rem` | 8px | Icon spacing, small padding |
| **3** | `0.75rem` | 12px | Button padding, form elements |
| **4** | `1rem` | 16px | Standard spacing, component gaps |
| **5** | `1.25rem` | 20px | Section spacing, larger gaps |
| **6** | `1.5rem` | 24px | Card padding, content sections |
| **8** | `2rem` | 32px | Large sections, major spacing |
| **10** | `2.5rem` | 40px | Page sections, large components |
| **12** | `3rem` | 48px | Hero sections, major layout |
| **16** | `4rem` | 64px | Page headers, large containers |
| **20** | `5rem` | 80px | Major page sections |
| **24** | `6rem` | 96px | Full-width sections |

## 🎯 Component Guidelines

### Button Usage

#### When to Use
- **Primary**: Main call-to-action, form submissions
- **Secondary**: Secondary actions, alternative options
- **Outline**: Less prominent actions, form resets
- **Ghost**: Minimal emphasis, toolbar actions
- **Danger**: Destructive actions, deletions
- **Success**: Positive actions, confirmations

#### Best Practices
- Use descriptive button text
- Provide clear visual hierarchy
- Ensure adequate touch targets (minimum 44px)
- Use consistent button placement
- Provide feedback for user actions

### Form Elements

#### Input Fields
- Always provide labels
- Show validation states clearly
- Use appropriate input types
- Provide helpful placeholder text
- Show character limits when relevant

#### Select Dropdowns
- Use clear option labels
- Group related options
- Provide search for long lists
- Show current selection clearly

### Layout Components

#### Cards
- Use for grouping related content
- Provide clear visual boundaries
- Include appropriate padding
- Use consistent corner radius

#### Modals
- Focus management is crucial
- Provide clear exit options
- Use appropriate sizes
- Ensure mobile responsiveness

## ♿ Accessibility Guidelines

### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Test with color blindness simulators

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Follow logical tab order
- Support keyboard shortcuts where appropriate

### Screen Readers
- Use semantic HTML elements
- Provide meaningful ARIA labels
- Announce dynamic content changes
- Use proper heading hierarchy

### Motion and Animation
- Respect user's motion preferences
- Provide alternatives for animated content
- Ensure animations don't interfere with functionality
- Use appropriate animation durations

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Size | Description |
|------------|------|-------------|
| **sm** | 640px | Mobile landscape |
| **md** | 768px | Tablet portrait |
| **lg** | 1024px | Tablet landscape |
| **xl** | 1280px | Desktop |
| **2xl** | 1536px | Large desktop |

### Responsive Patterns

#### Mobile First
- Start with mobile design
- Progressively enhance for larger screens
- Use flexible grid systems
- Optimize touch interactions

#### Flexible Layouts
- Use relative units (rem, em, %)
- Implement flexible grid systems
- Design for various aspect ratios
- Test on multiple devices

## 🚀 Performance Guidelines

### Loading Performance
- Optimize images and assets
- Use efficient loading strategies
- Minimize render-blocking resources
- Implement lazy loading where appropriate

### Runtime Performance
- Minimize DOM manipulations
- Use efficient CSS selectors
- Optimize JavaScript execution
- Monitor and optimize bundle sizes

### User Experience
- Provide loading states
- Use skeleton screens for better perceived performance
- Implement progressive enhancement
- Optimize for Core Web Vitals

## 📋 Implementation Checklist

### New Components
- [ ] Follow established design patterns
- [ ] Include comprehensive documentation
- [ ] Provide multiple variants
- [ ] Ensure accessibility compliance
- [ ] Add responsive behavior
- [ ] Include loading and error states
- [ ] Write unit tests
- [ ] Add Storybook stories

### Design Reviews
- [ ] Color contrast compliance
- [ ] Typography hierarchy
- [ ] Spacing consistency
- [ ] Component alignment
- [ ] Mobile responsiveness
- [ ] Accessibility features
- [ ] Performance impact

## 📚 Resources

### Design Tools
- [Figma Design System](link-to-figma)
- [Storybook Component Library](link-to-storybook)
- [Accessibility Guidelines](link-to-guidelines)

### Development Resources
- [Component Documentation](link-to-docs)
- [Design Tokens](link-to-tokens)
- [Brand Guidelines](link-to-brand)

### Testing Resources
- [Accessibility Testing Guide](link-to-testing)
- [Performance Benchmarks](link-to-benchmarks)
- [Browser Support Matrix](link-to-support)

---

*This design system is a living document. Please contribute improvements and updates as the system evolves.*