# Security Specification: Persona Prompt Bot

## 1. Data Invariants
1. A session in `/users/{userId}/sessions/{sessionId}` must only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
2. The `userId` inside session document data must strictly match `request.auth.uid` and path variable `{userId}`.
3. The `originalOwnerId` or `userId` and `createdAt` must be immutable upon update.
4. Timestamps (`createdAt`, `updatedAt`) must strictly match `request.time`.
5. Profile in `/users/{userId}/profile/info` must only be accessible by the owner user (`request.auth.uid == userId`).
6. Unauthenticated requests must be denied across all paths.
7. Any document ID must be valid (`isValidId`).

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. Unauthenticated read/write to `/users/user123/sessions/session1`. -> PERMISSION_DENIED
2. Authenticated user A reading `/users/userB/sessions/session1`. -> PERMISSION_DENIED
3. Authenticated user A creating a session with `userId: "userB"` under `/users/userA/sessions/session1`. -> PERMISSION_DENIED
4. Attempting to create a session under `/users/userA/sessions/session1` with unverified email when required. -> PERMISSION_DENIED
5. Attempting to update `userId` or `createdAt` to a different timestamp or owner. -> PERMISSION_DENIED
6. Injecting arbitrary shadow fields outside allowed schema keys. -> PERMISSION_DENIED
7. Providing a non-enum persona like `"HACKER"` or invalid tone. -> PERMISSION_DENIED
8. Submitting client-generated timestamp instead of `request.time`. -> PERMISSION_DENIED
9. Exceeding field length bounds (e.g. title > 128 chars). -> PERMISSION_DENIED
10. Malicious document ID injection (> 128 chars or path traversal characters). -> PERMISSION_DENIED
11. Querying sessions across all users without scoping `where('userId', '==', auth.uid)`. -> PERMISSION_DENIED
12. Attempting to delete another user's session or profile document. -> PERMISSION_DENIED
