# Project conventions

- The backend lives in backend/, never server/.
- Follow the user's reference project D:/project/ims for backend organization: config/, Controllers/, Routes/, middlewares/, models/, services/, utilities/, scripts/, with root index.js and server.js. Preserve folder capitalization.
- Use *.controller.js, *.route.js, *.model.js, and *.middleware.js names. Keep routing separate from request handlers and use one model file per entity. Put shared business logic in services and helpers in utilities.
- index.js starts the application and database; server.js composes Express without listening, so it is testable.
- Prioritize Tailwind for the React frontend and keep components grouped by feature.
- Ask before installing new dependencies, following the user's explicit preference.
- Never read or copy secrets from the reference project's .env.
- Use nodemon for backend development restarts, rather than Node --watch.
- Follow the reference's coding style, not only its folder structure: use ES modules and directly named controller exports such as export const createCategory = asyncHandler(async (req, res) => { ... }). Prefer explicit handlers over controller factories or generated CRUD handlers.
- Default-export each Mongoose model and Express router. Define schemas with readable, multi-line field options and timestamps; import models directly from their model files.
- Keep route declarations explicit, with authentication and authorization middleware (protect/authorize style) followed by the named controller handler.
- Use a shared asyncHandler utility and ApiError for controller failures. The reference response convention is { success, message?, data? }; preserve existing API contracts unless a coordinated change is requested.
- Prefer readable statements, descriptive operation names, and explicit validation/not-found checks. Match nearby formatting; the reference varies in quote and semicolon usage.
- Adopt reference style without copying security weaknesses or changing authentication, permissions, validation, or business behavior merely for stylistic consistency.
- Use one controller and router per resource (category, product, user, invoice, etc.), following the reference; do not regroup them into inventory/admin/commerce controller factories or aggregate files.
- Keep model fields and schema options explicit in each model, including type objects for individual fields, a named schema, and a default model export.
- Plain nodemon from backend/ must work; keep environment-loading execution configured in backend/nodemon.json.
