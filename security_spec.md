# Security Specification

## Data Invariants
- A payment notification must belong to a valid user.
- A prediction must have a unique slug.
- User roles are strictly 'user', 'vip', or 'admin'.
- PII (phone) in user profiles is only accessible to the owner and admins.

## The "Dirty Dozen" Payloads (Anti-Tests)
1. Update another user's role to 'admin'.
2. Read a VIP prediction as a standard user.
3. Delete a blog post as a non-admin.
4. Create a payment notification for another user ID.
5. Create a user with a self-assigned 'admin' role.
6. Overwrite the `createdAt` timestamp with a future date.
7. Inject a 1MB string into a prediction slug.
8. Read all user emails as a standard user.
9. Delete a bank account as a registered user (non-admin).
10. Update a terminal status 'approved' payment back to 'pending'.
11. Create a blog post with a non-string title.
12. Read a user's phone number as another user.
