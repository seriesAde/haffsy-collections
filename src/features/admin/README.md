# Admin dashboard

Dashboard overview pages and admin navigation belong here. Add an AdminLayout in src/layouts when implemented.
Inventory screens belong in the inventory feature, rather than inside dashboard components.

Pending: owner/staff roles and authentication provider. No admin routes are currently exposed.
Before connecting real data, enforce admin authorization on the server for every privileged operation.
A client-side route guard only controls navigation; it does not secure the API.
