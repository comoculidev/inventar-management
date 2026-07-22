# Current Task: Task 4.1

## Task 4.1: Create Registration/Signup Endpoint

**Status**: IN PROGRESS

**Description**: Implement endpoint for new user registration with password hashing using bcryptjs and input validation.

**Goal**: Allow users to create accounts (admin can also create users via admin panel).

**Expected Result**: 
POST /api/auth/register endpoint that creates users with hashed passwords in the database, validates username format.

**Dependencies**: Task 3.1

**Started**: 2024

---

## Implementation Notes

Need to create:
1. routes/auth.js - Authentication routes
2. controllers/authController.js - Authentication controller
3. POST /api/auth/register endpoint

The endpoint should:
- Validate username and password
- Hash password using bcryptjs
- Create user in database
- Return success response

Note: User model already exists with create method that handles password hashing.
