# Haf_siyy Collection

React + Vite frontend for a small-business website and a future admin inventory management system (IMS).

## Development

- Install existing dependencies: npm.cmd install
- Start: npm.cmd run dev
- Production build: npm.cmd run build
- Lint: npm.cmd run lint

No additional dependencies were needed for the project restructure.

## Structure

~~~text
src/
  App.jsx                 Application composition only
  main.jsx                React entry point and global CSS
  app/
    AppProviders.jsx      Router and shared providers
    AppRoutes.jsx         Central route definitions
  components/             Components shared across site areas
  layouts/                Page shells, currently AuthLayout
  features/
    auth/
      components/         Auth-specific controls
      pages/              Sign-up, login and reset view
    theme/                Theme context, provider, hook and toggle
    storefront/           Public website boundary (scope pending)
    admin/                Admin dashboard boundary (scope pending)
    inventory/            IMS boundary (scope pending)
  services/               Shared backend integration boundary
  lib/                    Small general utilities, including cn()
  index.css               Tailwind import, theme tokens and global resets
  assets/                 Static bundled assets
~~~

## Current behavior

Routes: /signup, /login, /forgot-password. Other paths currently redirect to /signup, preserving the existing entry flow until the storefront is designed.
Auth route changes remount the form so passwords and notices do not carry across pages.
Theme initialization in index.html applies the saved/system preference before React renders. ThemeProvider manages changes and persistence.
Forms validate locally; registration, login, remember-me sessions, and password reset emails are not connected to a backend.

## Conventions

Keep App.jsx small. Add routes in app/AppRoutes.jsx and shared providers in app/AppProviders.jsx.
Group code by business feature. Keep feature-only components and service calls alongside that feature; promote components to src/components only when shared.
Use layouts for the public site, authentication, and admin navigation. Keep page-specific styling scoped so it does not affect other layouts.
Add folders when they contain real code, rather than generating empty hooks/components/services folders for every feature.

## Next decisions

Confirm product types, ordering/checkout flow, customer versus staff accounts, inventory capabilities, roles, and backend choice before implementing storefront/admin screens.
The reserved feature folders document their responsibilities; they are not completed dashboard or inventory features.
Real admin actions require server-side authorization, and stock changes require backend consistency checks.

## Deployment

Configure the host to serve index.html for application routes such as /login (SPA fallback). Never rewrite actual API or static asset requests to HTML.

## Styling

Prioritize Tailwind utilities in components, including responsive and interaction variants. Use semantic tokens such as bg-surface, text-foreground, and border-outline; they follow the selected theme. Use cn() for conditional classes. Keep src/index.css for Tailwind setup, theme tokens, and base styles. Add custom CSS only when utilities cannot clearly express the requirement.

## Admin demo pages

Visit /admin/products/new, /admin/stock-movements, and /admin/quotations. The admin shell supports mobile navigation and the shared theme. Product creation adds opening stock movements; quotation actions support create, view, edit, text download, and confirmed deletion. All changes are in memory; refreshing resets demo data. Quotation data resets when leaving the quotation feature. USD amounts follow the supplied reference; business currency is still to be confirmed. Unimplemented sidebar sections are non-interactive. These are public demo routes, not a secured production admin.

## Extended admin screens

New routes: /admin/quotations/new, /admin/invoices, /admin/invoices/new, /admin/sales-reports, /admin/customers, /admin/integrations, /admin/settings, /admin/users.

Customer, user, quotation, invoice and settings state is shared for the lifetime of the admin workspace. Refreshing or leaving the admin area resets it. Documents support line items and rounded tax totals. New documents use the saved currency and tax; existing records keep their original currency. Creating invoices does not decrement inventory or process payments.

Customer and user dialogs support add/edit/delete, duplicate email validation, and search. Demo passwords are discarded. Security, notifications, sending invoices, and integration buttons explain the missing service connection; none perform external actions. Reports show an explicitly labeled historical demo snapshot, with paid workspace invoices in Recent Sales.

Calculation checks: node --test tests/documents.test.js. Build and lint: npm.cmd run build and npm.cmd run lint.

## Dashboard

/admin opens the dashboard; /admin/dashboard redirects there. Summary cards derive counts from shared demo state, and monthly revenue sums paid invoices in the current month and selected currency (no currency conversion). Recent activity combines document dates and stock movement timestamps. Low-stock alerts and View All use the same reorder threshold as the products list. Inventory starts with an explicit sample stock snapshot; movement data represents only partial history. Screenshot growth percentages are omitted because no comparative dataset exists.
