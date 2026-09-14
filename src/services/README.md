# Shared services

`api.js` sends cookie-authenticated requests, exposes server validation errors, handles multipart uploads, and loads paginated lists. No session token is stored in browser storage.

Run `npm run dev:backend` and `npm run dev` in separate terminals. Vite serves port 5173 and proxies `/api` to `http://localhost:4000`; the backend's `CLIENT_ORIGIN` must be `http://localhost:5173`. Restart Vite after changing its configuration. For another deployment, set public `VITE_API_URL` and configure the backend's allowed origin accordingly. Production hosting must proxy `/api` or provide that URL.

Login at `/login`. Signup creates a Customer. To create the initial Admin, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run `npm --prefix backend run admin:create`; remove the bootstrap values afterward. Existing accounts can log in directly.

The inventory and business providers now load backend records. The business context retains its old DemoContext name for compatibility, but does not seed demo data. Payments require explicit Admin/Manager verification. Document deletion, password reset, and notification delivery lack backend endpoints and are unavailable. Invoice status is not yet synchronized with verified order payments, so financial reports describe invoice status only. Staff cannot load the customer/user directory under the current backend permissions; use an Admin account for testing document creation and user management.

Test the client with `node --test src/services/api.test.js`. The cart is stored in session storage to survive signing in; wishlist is local UI state.

Checkout is public: guests enter a name, phone, optional email, and a delivery address for delivery orders. A confirmation displays the invoice reference and amount. Admins see guest contact details on the order and handle payments; guest self-service tracking/payment uploads are not exposed. Signed-in orders remain linked to the authenticated account. Guest orders are not automatically claimed by matching an email address.
Never put secrets in VITE_ environment variables: these are public browser configuration.
