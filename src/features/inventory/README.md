# Inventory management

Own product maintenance, stock screens, stock validation, and inventory-specific API calls here.
Add pages/, components/, and services/ as real features are implemented.

Pending: variants (size/color), stock movements, suppliers, sales, low-stock thresholds, and locations.
Use one authoritative backend for inventory shared by the storefront and admin dashboard.
Stock adjustments and sales must be validated and applied atomically by that backend.
Do not store authoritative inventory or credentials in localStorage.
