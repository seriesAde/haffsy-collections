# Shared services

Place the shared API client and backend integrations here once the backend is selected.
Feature-specific operations belong in src/features/<feature>/services/ and use that client.

No backend, API URL, token storage, or auth provider has been assumed.
The current auth forms validate locally and explicitly report that account services are disconnected.
Never put secrets in VITE_ environment variables: these are public browser configuration.
