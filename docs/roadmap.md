# docs/roadmap.md


DO NOT USE ANY COMMENTS ON ANY OTHER FILE!!!

### AI Development Workflow

This project is intended to be developed using AI agents.

To ensure consistent progress between different AI models, sessions, and providers, maintain an AI knowledge base inside the project.

Create the following directory:

docs/
└── ai_context/

The `docs/ai_context/` directory must always be kept up to date during development.

After completing every task (or whenever a significant architectural or implementation change is made), update the AI context documentation so another AI model or a new conversation can continue without re-analyzing the entire codebase.

The AI context should describe the current implementation status rather than duplicate the source code.

Recommended files include (but are not limited to):

- architecture.md
- backend.md
- frontend.md
- database.md
- api.md
- authentication.md
- progress.md
- completed_tasks.md
- current_task.md
- decisions.md
- known_issues.md

Whenever a new AI session starts, the AI should first read the documentation inside `docs/ai_context/` before analyzing the source code.

The AI should keep these files synchronized with the actual implementation throughout the entire project.

# Inventory Management System - Project Roadmap

## Executive Summary

This document outlines a comprehensive development roadmap for building an inventory management system from scratch using HTML, CSS, JavaScript (Frontend), Node.js (Backend), PostgreSQL (Database), and pgAdmin (Database Management). The system is designed for university inventory tracking with a hierarchical structure: Organization → Building → Room.

---

## Phase 1: Project Foundation & Setup

### Task 1.1: Initialize Node.js Project Structure
- **Description**: Set up the foundational Node.js project structure, initialize npm/yarn, install core dependencies (Express, pg, cookie-parser), and configure package.json with all essential packages.
- **Goal**: Create a working Node.js environment with proper project configuration files.
- **Expected Result**: A `package.json` file with Express, body-parser, cookie-parser, bcryptjs, uuid installed; `.gitignore` configured; basic folder structure established.
- **Dependencies**: None

### Task 1.2: Configure Project Directory Architecture
- **Description**: Establish a modular folder structure separating frontend (public, views), backend (routes, controllers, middleware, models), database migrations, and configuration folders.
- **Goal**: Create an organized project layout that follows best practices for maintainability.
- **Expected Result**: Directory structure with `/public`, `/views`, `/routes`, `/controllers`, `/models`, `/middleware`, `/config`, `/migrations`, `/utils` folders created.
- **Dependencies**: Task 1.1

### Task 1.3: Set Up PostgreSQL Database Connection Module
- **Description**: Configure database connection string in config folder, create connection pool settings with error handling, and establish secure database access module.
- **Goal**: Establish a working connection between Node.js backend and PostgreSQL database.
- **Expected Result**: A functional `db.js` or `database.js` connection module that exports configured PostgreSQL client with proper pool management.
- **Dependencies**: Task 1.2

### Task 1.4: Install and Configure pgAdmin
- **Description**: Set up pgAdmin for database management, visualization, and administration tasks, configure it to connect to the project's PostgreSQL database.
- **Goal**: Provide a GUI tool for managing the PostgreSQL database during development and production.
- **Expected Result**: pgAdmin installed on system with connection credentials configured in pgAdmin settings pointing to the project database.
- **Dependencies**: None

### Task 1.5: Create Basic HTML/CSS/JS Template Structure
- **Description**: Build reusable HTML templates, CSS stylesheets, and JavaScript files for consistent UI across the application with Azerbaijani language support ready.
- **Goal**: Establish a common design foundation with responsive layout and localization prepared.
- **Expected Result**: Base `index.html` template in `/views`, base.css stylesheet, main.js file structure in `/public`, RTL/left-aligned text direction configured for Azerbaijani.
- **Dependencies**: Task 1.2

### Task 1.6: Configure Development Server Environment
- **Description**: Set up development server with hot-reloading (nodemon), error page handlers, and static file serving configuration in package.json scripts.
- **Goal**: Enable efficient local development workflow with automatic page refreshes and proper error handling.
- **Expected Result**: Working `start` or `dev` script in package.json that serves the application on localhost with auto-reload functionality.
- **Dependencies**: Task 1.5

---

## Phase 2: Database Design & Schema Creation

### Task 2.1: Create Organizations Table Schema
- **Description**: Design and create the table structure for storing organization information (id, name, description, created_at).
- **Goal**: Establish the top-level container entity in the inventory hierarchy.
- **Expected Result**: organizations table with appropriate fields, primary key (uuid), created_at timestamp, and constraints created via pgAdmin SQL script.
- **Dependencies**: Task 1.3

### Task 2.2: Create Buildings Table Schema
- **Description**: Design and create the table structure for storing building information (id, name, description, organization_id FK) linked to organizations.
- **Goal**: Establish the second level of the inventory hierarchy under organizations.
- **Expected Result**: buildings table with foreign key relationship to organizations, primary keys, cascading delete constraints created in PostgreSQL.
- **Dependencies**: Task 2.1

### Task 2.3: Create Rooms Table Schema
- **Description**: Design and create the table structure for storing room information (id, name, description, capacity, building_id FK) linked to buildings.
- **Goal**: Establish the third level of the inventory hierarchy (the most granular level).
- **Expected Result**: rooms table with foreign key relationship to buildings, primary keys, cascading delete constraints created in PostgreSQL.
- **Dependencies**: Task 2.2

### Task 2.4: Create Inventory Items Table Schema
- **Description**: Design and create the table structure for storing inventory item information (id, inventory_number, location, status, responsible_person, category, room_id FK).
- **Goal**: Enable tracking of individual inventory items at the room level with all required fields.
- **Expected Result**: inventory_items table with all required fields (location, status, inventory_number, responsible_person, category), foreign key to rooms, appropriate constraints and indexes created.
- **Dependencies**: Task 2.3

### Task 2.5: Create Users Table Schema
- **Description**: Design and create the table structure for storing user information (id, username, password_hash, role, created_at).
- **Goal**: Enable authentication and role-based access control (Admin/User roles).
- **Expected Result**: users table with username field (unique), password_hash field, role field (enum: admin/user), created_at timestamp created.
- **Dependencies**: Task 1.3

### Task 2.6: Create History/Logs Table Schema
- **Description**: Design and create the table structure for tracking all system changes with timestamps and details.
- **Goal**: Enable audit trail functionality showing every change made in the system.
- **Expected Result**: history_logs table storing Organization, Building, Room (via foreign keys), Responsible Person, action_type, old_values, new_values, timestamp fields created.
- **Dependencies**: Task 1.3

### Task 2.7: Create Database Indexes and Optimizations
- **Description**: Add appropriate indexes to frequently queried columns for performance optimization (organizations name, buildings organization_id, rooms building_id, inventory_items room_id, status, category).
- **Goal**: Ensure fast search, filter, and query operations on large datasets.
- **Expected Result**: Indexes created on foreign keys, search fields (organization name, item status, category), and frequently filtered columns in PostgreSQL.
- **Dependencies**: Task 2.6

---

## Phase 3: Backend API Development - Core Functions

### Task 3.1: Create Express Server Entry Point
- **Description**: Set up the main Express server file (app.js/server.js) with middleware configuration (CORS, body-parser, cookie-parser).
- **Goal**: Establish a functional HTTP server that can handle requests and responses.
- **Expected Result**: Working server.js file with all required middleware configured (express.json(), express.urlencoded(), cookie-parser).
- **Dependencies**: Task 1.6

### Task 3.2: Create Organizations API Endpoints (CRUD)
- **Description**: Implement RESTful endpoints for organization management (GET, POST, PUT, DELETE) with proper validation and error handling.
- **Goal**: Allow backend operations on organizations via HTTP requests.
- **Expected Result**: GET /api/organizations, POST /api/organizations, PUT /api/organizations/:id, DELETE /api/organizations/:id routes working with proper JSON responses.
- **Dependencies**: Task 3.1

### Task 3.3: Create Buildings API Endpoints (CRUD)
- **Description**: Implement RESTful endpoints for building management with organization relationship handling and foreign key validation.
- **Goal**: Allow backend operations on buildings, including linking to organizations.
- **Expected Result**: Full CRUD endpoints for buildings that respect foreign key constraints with organizations (POST validates organization_id).
- **Dependencies**: Task 3.1

### Task 3.4: Create Rooms API Endpoints (CRUD)
- **Description**: Implement RESTful endpoints for room management with building relationship handling and foreign key validation.
- **Goal**: Allow backend operations on rooms, including linking to buildings.
- **Expected Result**: Full CRUD endpoints for rooms that respect foreign key constraints with buildings (POST validates building_id).
- **Dependencies**: Task 3.1

### Task 3.5: Create Inventory Items API Endpoints (CRUD)
- **Description**: Implement RESTful endpoints for inventory item management including room relationship and all required fields.
- **Goal**: Allow backend operations on inventory items at the room level with complete data handling.
- **Expected Result**: Full CRUD endpoints for inventory_items with all required fields (location, status, inventory_number, responsible_person, category) and foreign key to rooms.
- **Dependencies**: Task 3.1

### Task 3.6: Create User Management API Endpoints
- **Description**: Implement RESTful endpoints for user management (POST for creation, GET list, PUT update, DELETE deactivate users).
- **Goal**: Enable admin to create and manage users in the system.
- **Expected Result**: POST /api/users, GET /api/users, PUT /api/users/:id, DELETE /api/users/:id routes working with role-based access controlled.
- **Dependencies**: Task 3.1

### Task 3.7: Create History Logging API Endpoints
- **Description**: Implement endpoints for recording and retrieving system change history with pagination support.
- **Goal**: Enable logging of all inventory and user changes with timestamps for export functionality.
- **Expected Result**: GET /api/history endpoint that returns paginated history logs with Organization, Building, Room, Responsible Person data.
- **Dependencies**: Task 3.1

### Task 3.8: Implement Authentication Middleware
- **Description**: Create middleware functions to protect routes and verify user authentication status from cookie/session.
- **Goal**: Ensure only authenticated users can access protected routes.
- **Expected Result**: verifyAuth middleware function that checks session/cookie validity and returns 401 for unauthenticated requests.
- **Dependencies**: Task 3.1

### Task 3.9: Implement Role-Based Access Control Middleware
- **Description**: Create middleware to check user roles and restrict access based on Admin vs User permissions for different route groups.
- **Goal**: Ensure users can only access features they are authorized for.
- **Expected Result**: verifyRole middleware function that checks if user has 'admin' role for admin routes or 'user' role for user routes, returns 403 for unauthorized access.
- **Dependencies**: Task 3.8

### Task 3.10: Create Dashboard Statistics API Endpoint
- **Description**: Implement endpoint that returns aggregated counts for organizations, buildings, rooms, inventory items, and users.
- **Goal**: Enable the dashboard to display real-time system statistics.
- **Expected Result**: GET /api/dashboard/stats endpoint returning JSON with totalOrganizations, totalBuildings, totalRooms, totalItems, totalUsers counts.
- **Dependencies**: Task 3.1

---

## Phase 4: Authentication System Implementation

### Task 4.1: Create Registration/Signup Endpoint
- **Description**: Implement endpoint for new user registration with password hashing using bcryptjs and input validation.
- **Goal**: Allow users to create accounts (admin can also create users via admin panel).
- **Expected Result**: POST /api/auth/register endpoint that creates users with hashed passwords in the database, validates username format.
- **Dependencies**: Task 3.1

### Task 4.2: Create Login Endpoint with Session Management
- **Description**: Implement login endpoint that validates credentials, hashes password comparison, and sets authentication cookies.
- **Goal**: Enable user authentication via username/password with secure cookie-based sessions.
- **Expected Result**: POST /api/auth/login endpoint that verifies credentials, creates session cookie with 7-day expiration, and returns token/redirect info.
- **Dependencies**: Task 4.1

### Task 4.3: Implement Session Cookie Configuration (7-Day Expiration)
- **Description**: Configure cookie settings for authentication cookies including expiry time (604800000 ms), secure flags, and domain/path restrictions.
- **Goal**: Ensure session cookies expire after 7 days as specified in requirements.
- **Expected Result**: Cookie configuration with maxAge set to 7 days (604800000 ms), HttpOnly and Secure flags appropriately configured for production.
- **Dependencies**: Task 4.2

### Task 4.4: Implement Role-Based Redirect Logic
- **Description**: Create logic that redirects users to appropriate dashboard based on their role after authentication completion.
- **Goal**: Ensure normal users redirect to user panel and admins redirect to admin panel after login.
- **Expected Result**: Login response includes redirect header (users → /user-panel, admins → /admin-dashboard) or client-side redirection based on role from response.
- **Dependencies**: Task 4.3

### Task 4.5: Implement Route Protection for Admin Panel
- **Description**: Protect all admin routes so normal users cannot access admin panel pages or APIs via middleware.
- **Goal**: Prevent unauthorized access to admin functionality by regular users.
- **Expected Result**: All /admin/* routes protected with role-based middleware that denies access (403) to non-admin users.
- **Dependencies**: Task 3.9

---

## Phase 5: Admin Dashboard Implementation

### Task 5.1: Create Admin Dashboard Page Structure
- **Description**: Build the HTML structure for the admin dashboard page with navigation sidebar, header, and statistics containers.
- **Goal**: Provide a visual interface for displaying inventory system overview metrics.
- **Expected Result**: A complete HTML page at /admin/dashboard with navigation menu, statistics cards container placeholder areas, compact modern UI design.
- **Dependencies**: Task 1.5

### Task 5.2: Implement Dashboard Statistics API Calls and Display
- **Description**: Create JavaScript/AJAX code to fetch dashboard stats from backend and display in statistics cards on the dashboard page.
- **Goal**: Show total organizations, buildings, rooms, items, and users in compact modern UI.
- **Expected Result**: Five statistics cards displayed on the admin dashboard (organizations count, buildings count, rooms count, items count, users count) with real-time data from API.
- **Dependencies**: Task 5.1

---

## Phase 6: Admin Inventory Management Implementation

### Task 6.1: Create Admin Inventory Page Structure
- **Description**: Build the HTML structure for the inventory management page with search bar, filter dropdowns, add item button, and data table.
- **Goal**: Provide a complete interface for viewing and managing all inventory items.
- **Expected Result**: A complete HTML page at /admin/inventory with search input field, three filter dropdowns (Organization, Building, Category), Add Item button, and empty data table structure.
- **Dependencies**: Task 1.5

### Task 6.2: Implement Inventory Search and Filter Functionality
- **Description**: Create JavaScript/AJAX code that applies search and filter criteria to display relevant items from the table.
- **Goal**: Enable searching by keyword and filtering by organization, building, and category.
- **Expected Result**: Search bar filters items by keyword across all fields; Organization filter shows only selected organization's items; Building filter narrows results further; Category filter shows only selected category items with dropdown values.
- **Dependencies**: Task 6.1

### Task 6.3: Create Inventory API with Filter Support
- **Description**: Modify inventory API endpoint to accept query parameters for search and filtering (search, organizationId, buildingId, categoryId).
- **Goal**: Enable backend to return filtered item data based on search/filter criteria from frontend.
- **Expected Result**: GET /api/inventory accepts ?search=keyword&organizationId=&buildingId=&category= query parameters and returns filtered results with proper JSON structure.
- **Dependencies**: Task 3.5

### Task 6.4: Build Inventory Table Display with All Required Columns
- **Description**: Create JavaScript code to display inventory items table with Location, Status, Inventory Number, Responsible Person, and Category columns.
- **Goal**: Show complete item information in a structured table format with proper formatting.
- **Expected Result**: Data table displaying all five required columns for each inventory item (Location, Status, Inventory Number, Responsible Person, Category) with proper status color coding if applicable.
- **Dependencies**: Task 6.2

### Task 6.5: Implement Add Item Functionality (Form-Based)
- **Description**: Create the Add Item form interface and AJAX handler to add new items through clicking the Add Item button and filling all required information.
- **Goal**: Enable admins to add new inventory items with complete data entry via form.
- **Expected Result**: Form appears when Add Item clicked with fields for Location, Status, Inventory Number, Responsible Person, Category; POST request sends data to backend upon form submission.
- **Dependencies**: Task 6.1

### Task 6.6: Implement Import Excel Functionality
- **Description**: Create Excel file upload interface and parser (using library like xlsx) to import bulk inventory items from uploaded files.
- **Goal**: Enable admins to import multiple items at once through Excel file containing list of items.
- **Expected Result**: File upload button for Excel (.xlsx) files; uploaded file parsed and data sent to backend for bulk insertion with proper error handling for invalid rows.
- **Dependencies**: Task 3.5

### Task 6.7: Implement Edit Item Functionality
- **Description**: Create the edit functionality that loads existing item data into form and allows modifications with real-time updates.
- **Goal**: Enable admins to edit existing inventory items with immediate changes reflected in system.
- **Expected Result**: Clicking an item or edit button opens form with pre-filled data; changes saved immediately via PUT request to backend without page reload.
- **Dependencies**: Task 6.4

### Task 6.8: Implement Remove Item Functionality
- **Description**: Create delete functionality that removes items from inventory with confirmation dialog before deletion.
- **Goal**: Enable admins to remove items from system safely.
- **Expected Result**: Delete button on each item row triggers confirmation dialog; upon confirmation, DELETE request sent to backend and item removed from display.
- **Dependencies**: Task 6.4

### Task 6.9: Implement Inventory API with Bulk Operations Support
- **Description**: Enhance inventory API endpoints to support bulk insert operations for Excel import functionality.
- **Goal**: Enable backend to handle multiple item insertions in single request for import feature.
- **Expected Result**: POST /api/inventory/bulk endpoint that accepts array of items and inserts all at once with proper validation and error reporting.
- **Dependencies**: Task 3.5

---

## Phase 7: Rooms Page Implementation (Admin)

### Task 7.1: Create Admin Rooms Page Structure
- **Description**: Build the HTML structure for the rooms page with navigation, search bar, and room list display.
- **Goal**: Provide interface where admin can see every room for every organization.
- **Expected Result**: A complete HTML page at /admin/rooms with search bar and empty room list container in compact modern UI.
- **Dependencies**: Task 1.5

### Task 7.2: Implement Rooms API Endpoints (Read)
- **Description**: Create backend endpoints to retrieve rooms filtered by organization and search term.
- **Goal**: Enable fetching all rooms with proper filtering and pagination support.
- **Expected Result**: GET /api/rooms endpoint accepting organization_id query parameter and search parameter for filtering room names.
- **Dependencies**: Task 3.4

### Task 7.3: Implement Rooms Page Display Logic
- **Description**: Create JavaScript code to display all rooms for each organization with proper hierarchy navigation links.
- **Goal**: Show every room for every organization with each room having its own URL (/organization/building/room).
- **Expected Result**: Rooms displayed grouped by organization; each room card/link shows name, building reference, and displays items inside when clicked.
- **Dependencies**: Task 7.1

### Task 7.4: Implement Room Detail Page Structure
- **Description**: Build HTML structure for individual room detail page that shows all items inside a specific room.
- **Goal**: Enable viewing items inside a specific room with their current status and location.
- **Expected Result**: Individual room page accessible via /organization/building/room/:id showing all inventory items in table format.
- **Dependencies**: Task 7.1

### Task 7.5: Implement Room Items Display API Calls
- **Description**: Create backend endpoint that returns items specifically for a given room ID.
- **Goal**: Enable fetching room-level inventory items efficiently.
- **Expected Result**: GET /api/rooms/:id/items endpoint returns all inventory_items where room_id matches the specified room.
- **Dependencies**: Task 3.5

### Task 7.6: Implement Real-Time Item Editing in Room View
- **Description**: Create edit functionality that allows editing items while viewing them inside a room with instant updates.
- **Goal**: Enable all changes to be real-time when editing items inside a room view.
- **Expected Result**: Edit button on each item opens inline or modal form; changes saved immediately and reflected in same view without page reload.
- **Dependencies**: Task 7.5

---

## Phase 8: History Page Implementation (Admin)

### Task 8.1: Create Admin History Page Structure
- **Description**: Build the HTML structure for the history page with date range filters, search functionality, and log entries display.
- **Goal**: Provide interface to view all changes made in the system with timestamps.
- **Expected Result**: A complete HTML page at /admin/history with date picker inputs (start/end), search bar, and empty history log container.
- **Dependencies**: Task 1.5

### Task 8.2: Implement History API Endpoints (Read and Filter)
- **Description**: Create backend endpoints to retrieve history logs with date range filtering and pagination.
- **Goal**: Enable fetching history entries with Organization, Building, Room, Responsible Person data for selected date range.
- **Expected Result**: GET /api/history endpoint accepting start_date and end_date query parameters for date range filtering with proper pagination support.
- **Dependencies**: Task 3.7

### Task 8.3: Implement History Log Display Logic
- **Description**: Create JavaScript code to display history entries with timestamp, Organization, Building, Room, Responsible Person, action type, and old/new values.
- **Goal**: Show every change made in the system together with its timestamp and context information.
- **Expected Result**: History table displaying all required fields for each log entry: Organization Name, Building Name, Room Name, Responsible Person, Action Type, Timestamp.
- **Dependencies**: Task 8.1

### Task 8.4: Implement History Export to Excel Functionality
- **Description**: Create functionality to export selected date range history data to Excel file format.
- **Goal**: Enable admins to export history records for any date range to Excel file.
- **Expected Result**: Export button that generates .xlsx file containing all filtered history logs with proper column headers and data formatting.
- **Dependencies**: Task 8.2

---

## Phase 9: User Panel Implementation (Normal Users)

### Task 9.1: Create User Panel Page Structure
- **Description**: Build the HTML structure for the user panel page accessible only to normal users with basic navigation and content areas.
- **Goal**: Provide a dedicated panel interface for regular users separate from admin functionality.
- **Expected Result**: A complete HTML page at /user-panel with appropriate restrictions (no access to admin routes) in compact modern UI.
- **Dependencies**: Task 1.5

### Task 9.2: Implement User Panel API Access Controls
- **Description**: Create backend endpoint that serves user-specific data or allows specific user functions without admin privileges.
- **Goal**: Restrict user panel APIs to only accessible by non-admin users.
- **Expected Result**: Protected /api/user/* routes that verify user role is not 'admin' and return appropriate data to normal users.
- **Dependencies**: Task 3.9

---

## Phase 10: Testing and Finalization

### Task 10.1: Implement Test User (Admin) Account Creation
- **Description**: Create initial admin user account with hardcoded credentials for system testing and first login verification.
- **Goal**: Enable development and testing access to both admin and user panels.
- **Expected Result**: One default admin user created in users table with role=admin for initial system access and testing.
- **Dependencies**: Task 3.5

### Task 10.2: Test Authentication Flow (Login/Redirect)
- **Description**: Verify that login endpoint properly creates cookies, sets expiration, and redirects users to correct panel based on their role.
- **Goal**: Ensure authentication system works correctly with proper redirects for different user roles.
- **Expected Result**: Admin user logs in and redirected to /admin-dashboard; normal user logs in and redirected to /user-panel.
- **Dependencies**: Task 4.4

### Task 10.3: Test Admin Inventory CRUD Operations
- **Description**: Verify all inventory management operations (add, edit, delete, import) work correctly through admin panel.
- **Goal**: Ensure inventory functionality is fully operational with all required features.
- **Expected Result**: Items can be added via form and Excel; existing items edited and deleted; search and filters work; all data persists in database.
- **Dependencies**: Task 6.8

### Task 10.4: Test Room Functionality
- **Description**: Verify rooms page displays all rooms with proper navigation, each room shows its items, and editing inside rooms works in real-time.
- **Goal**: Ensure room hierarchy and item management at room level functions correctly.
- **Expected Result**: Rooms accessible via /organization/building/room URLs; items display in rooms; real-time edits persist immediately.
- **Dependencies**: Task 7.6

### Task 10.5: Test History Logging
- **Description**: Verify that all CRUD operations generate history logs with proper Organization, Building, Room, and Responsible Person data.
- **Goal**: Ensure audit trail captures every change made in the system correctly.
- **Expected Result**: Every item add/edit/delete operation creates a corresponding entry in history_logs table; exports to Excel work for selected date ranges.
- **Dependencies**: Task 8.4

### Task 10.6: Test Route Protection and Role Access
- **Description**: Verify that normal users cannot access admin panel routes and admins have full access to all admin features.
- **Goal**: Ensure proper role-based access control prevents unauthorized access.
- **Dependencies**: Task 4.5

### Task 10.7: Verify Dashboard Statistics Display
- **Description**: Confirm that admin dashboard displays accurate counts for organizations, buildings, rooms, items, and users.
- **Goal**: Ensure dashboard statistics are accurate and display correctly in compact modern UI.
- **Expected Result**: Five statistics cards on admin dashboard show correct real-time counts from database.
- **Dependencies**: Task 5.3

### Task 10.8: Final Documentation and Readme Preparation
- **Description**: Create comprehensive project documentation including setup instructions, API documentation, and usage guide in Azerbaijani language.
- **Goal**: Provide complete documentation for developers and administrators of the system.
- **Expected Result**: README.md with installation instructions, API endpoints documented, role-based access explanation, and screenshots of UI components.
- **Dependencies**: All previous tasks

---

## Implementation Notes

### Technology Stack Summary
| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js with Express.js framework |
| Database | PostgreSQL 12+ with pgAdmin management tool |
| Authentication | Cookie-based sessions with bcrypt password hashing |
| UI Language | Azerbaijani |

### Key Features Recap
- **Hierarchical Structure**: Organization → Building → Room
- **Two User Roles**: Admin (full access) and User (restricted panel)
- **Inventory Management**: Add via form or Excel import, edit, delete with real-time updates
- **Search & Filter**: Multi-level filtering by organization, building, category
- **History Logging**: Complete audit trail of all changes with export capability
- **Authentication**: Cookie-based with 7-day expiration and role-based redirects
- **Dashboard**: Overview statistics for system metrics

### Important Requirements Met
- Every task represents one logical system or feature only
- Tasks arranged in correct development order (foundation → database → backend → frontend)
- No features invented beyond project description
- No features omitted from original specification
- Project organized and modular throughout

---

*Document Version: 1.0*
*Last Updated: $(date +%Y-%m-%d)*
*Status: Ready for Implementation*
