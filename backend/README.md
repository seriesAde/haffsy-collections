# Haf_siyy Collection API

Express + Mongoose backend for MongoDB Atlas. The existing frontend still runs in demo mode; it is not yet switched to these endpoints.

## Code organization

The backend follows the coding conventions in `D:/project/ims`: named controller handlers wrapped in `utilities/asyncHandler.js`, default-exported routers with explicit route declarations, and default-exported Mongoose models with named schemas. Controllers import models directly. `protect` authenticates the session and `authorize` checks roles; handlers throw `ApiError` for expected failures.

`server.js` composes Express, while `index.js` connects the database and starts listening. Request-specific configuration is available through `req.app.locals.config`, keeping separately created app instances isolated. Development uses nodemon. Existing response envelopes (`data`, `user`, and `error`), database fields, and endpoint paths are preserved by the style refactor.

## Local setup

Controllers and routes are organized per resource: category, product, stock, settings, user, quotation, invoice, order, payment, auth, and uploads. This mirrors the resource-based folders in the reference project.

From `backend/`, run `nodemon` (if available on your PATH) or `npm run dev`. `nodemon.json` loads this backend's `.env` and starts `index.js`. From the project root, use `npm run dev:backend`.

Use Node.js 24+. From the project root:

1. Copy backend/.env.example to backend/.env.
2. In Atlas, create a database user and permit your development machine's IP in Network Access.
3. Put the Atlas connection string in MONGODB_URI, including the haf_siyy database name. URL-encode special characters in the database password.
4. Generate JWT_SECRET using the command in .env.example. Keep .env private; it is gitignored.
5. Run npm run dev:backend. Frontend runs separately with npm run dev.
6. Check http://localhost:4000/api/health. Startup waits for the database and indexes before listening.

To bootstrap an administrator, temporarily set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env, then run npm --prefix backend run admin:create. Remove those values afterward. It never promotes an existing account silently.

Atlas credentials have not been configured by the coding agent. Database-backed integration tests must run against a separate test database before deployment.

## API conventions

Base path: /api. JSON responses use { data } for resources and { user } for auth. IDs are MongoDB ObjectIds, not frontend demo IDs. Categories are referenced by ID; public products populate category and image metadata. Images use /api/uploads/:id URLs.

Browser requests must include credentials. All writes require an Origin header exactly matching CLIENT_ORIGIN. For local scripts, include Origin: http://localhost:5173. Sessions use an HTTP-only, SameSite=Lax cookie; production requires HTTPS. Host frontend and API on the same site in production. Logout clears the browser cookie; copied JWTs remain valid until expiry (8 hours). There is no refresh-token or password-reset service yet.

Pages use ?page=1&limit=24 (maximum 100). Product filters: q, category, min, max, inStock=true, sort=low|high|name. Product/category lists are public; inventory writes require staff. Costs and suppliers are excluded from public product reads.

## Endpoints

Admin document flow: create a quotation (registered customer or guest name/phone), convert it to an invoice, then explicitly `POST /invoices/:id/move-to-order`. Creating an admin invoice or converting a quotation no longer creates an order automatically. The move retains the invoice and creates one linked order; repeated moves return the existing order. Storefront checkout still creates its order immediately. Existing orders remain linked and their invoices are hidden from the frontend Invoices list.

Sales Reports lists paid orders and links to `/admin/sales-reports/:orderId` for invoice lines/PDF, payment proofs, totals including delivery, and fulfillment history.

- POST /auth/register, /auth/login, /auth/logout; GET/PATCH /auth/me
- GET/POST /categories; PATCH/DELETE /categories/:id
- GET/POST /products; GET/PATCH/DELETE /products/:id (delete archives)
- GET /stock-movements; POST /stock-adjustments
- GET /settings; PATCH /settings (Admin)
- GET /users (Admin/Manager); POST/PATCH/DELETE /users (Admin; delete deactivates)
- POST /uploads/product or /uploads/payment, multipart field file; GET /uploads/:id
- GET/POST /quotations and /invoices; GET/PATCH /quotations/:id and /invoices/:id
- POST /quotations/:id/convert
- POST /checkout (guest or signed-in): { items: [{ product, quantity }], method: Delivery|Pickup, location, contact: { name, phone, email? } }. Guests must provide contact details. The server prices items, decrements stock in a transaction, and returns an invoice reference in `receipt`. Guest orders store contact details without creating or linking a User account. Contact email is not proof of account ownership.
- GET /orders and /orders/:id; PATCH /orders/:id for fulfillment (staff)
- POST /orders/:id/stage: { stage }; sequential stages only, staff or assigned rider
- POST /orders/:id/payments: { method: Cash|Transfer, amount, evidence? }
- POST /payments/:id/review: { status: Verified|Rejected } (Admin/Manager)

Authenticated customers can only read their own documents/orders. Riders only read assigned orders. Payment status is derived from verified amounts, invoice total and confirmed delivery fee; uploading evidence never verifies a payment.

## Transactions and limitations

Admins can upload a receipt and record a received cash/transfer payment in Orders & Payments. Their submissions are immediately Verified and attributed to the admin. Other submissions remain Pending until reviewed. Order list/detail payment status is calculated from verified payments and the invoice plus delivery fee; a delivery fee must be confirmed before showing Paid. This does not change the invoice's separate status field.

Atlas transactions protect category deletion/product reassignment, stock adjustments, checkout, and quotation conversion. Product names/prices are captured on documents. Checkout always uses server prices and decrements stock atomically. Admin-created invoices do not decrement stock automatically; use stock adjustments until the admin fulfillment stock workflow is finalized. Currency values are not converted.

Uploads are limited to 10 MB and checked by file signature. New media is stored in Cloudinary, with metadata in MongoDB. Product images are public through the API; receipts use authenticated Cloudinary assets and the API checks ownership/staff access before proxying their bytes. Existing MongoDB file contents remain readable.

Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env, then restart nodemon. No upload preset is required. Missing credentials return a clear 503 on new uploads without preventing server startup. For PDF receipts, enable PDF delivery in your Cloudinary product environment if it is restricted. Credentials must never be placed in VITE_ variables. Cloudinary cannot be tested live until credentials are configured.

Cloudinary REST reference: https://cloudinary.com/documentation/image_upload_api_reference

No live email, gateway, refund/cancellation workflow, password reset, 2FA, or PDF server renderer is implemented. Delivery stages update from authorized API actions; courier callbacks can call this layer later. Checkout does not yet implement idempotency keys: do not automatically retry it after an ambiguous network failure. Payment verification is a manual Admin/Manager action.

## Verification

npm --prefix backend test runs isolated HTTP auth/origin guards, currency calculations, upload-type checks, and stage-transition tests without Atlas. It does not validate live MongoDB transactions. npm run lint checks backend and frontend sources.

## Folder convention

Matches the user's D:/project/ims reference:

~~~text
backend/
  index.js                 Startup and shutdown
  server.js                Express application composition
  config/                  Environment and database connection
  Controllers/             Named request handlers
  Routes/                  Routes and middleware wiring
  middlewares/             Auth, uploads and error handling
  models/                  One *.model.js per entity
  services/                Shared business logic
  utilities/               Validation and error helpers
  scripts/                 Administrator bootstrap
  tests/                   API tests
~~~

Controller factories keep configuration isolated for tests. Route modules bind named controller methods; document handlers share a factory for invoice/quotation behavior.
