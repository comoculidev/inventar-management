# Current Task: Task 7.2

## Task 7.2: Implement Rooms API Endpoints (Read)

**Status**: IN PROGRESS

**Description**: Create backend endpoints to retrieve rooms filtered by organization and search term.

**Goal**: Enable fetching all rooms with proper filtering and pagination support.

**Expected Result**: 
GET /api/rooms endpoint accepting organization_id query parameter and search parameter for filtering room names.

**Dependencies**: Task 3.4

**Started**: 2024

---

## Implementation Notes

Need to implement:
1. Update RoomsController.getAll to support query parameters:
   - organizationId: Filter by organization
   - buildingId: Filter by building
   - search: Search by room name or description
   - page: Pagination page number
   - limit: Items per page
2. Update Room model to support filtered queries with pagination
3. Return pagination metadata in response
