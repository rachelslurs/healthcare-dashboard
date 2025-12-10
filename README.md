# Healthcare Dashboard

## Quick Start

## Launch Application

### Option 1: Docker Compose (Recommended)

The easiest way to run the entire application:

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

#### Environment Variables

**Frontend:**
- `VITE_API_URL`: Backend API URL (default: `http://localhost:8000`)

**Backend:**
- `SEED_PATIENT_COUNT`: Number of sample patients to generate (default: 0, set to 20 for development)
- `DATABASE_URL`: Database connection string (default: `sqlite:///./healthcare.db`)
- `UPLOAD_DIR`: Directory for file uploads (default: `./uploads`)

### Seed Data

The database is automatically seeded with 20 sample patients on first run. Can be overridden using env variable SEED_PATIENT_COUNT.


## Architecture Decisions

### UX/Performance Patterns
- **Server-Side Rendering (SSR)**: Using TanStack Start for improved initial load performance and SEO
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Custom Typography**: Brand fonts (Neue Montreal for body, Rhetorik Serif for headings) loaded with `font-display: swap` for performance

### Performance Optimizations
- **React Component Memoization**: Sub-components wrapped with `React.memo` to prevent unnecessary re-renders (e.g., `PaginationControls`, `TableHeaderRow`, `LoadingOverlay`, `TableSkeleton`)
- **Callback Memoization**: Event handlers memoized with `useCallback` to maintain stable references and prevent child re-renders
- **Value Memoization**: Computed values memoized with `useMemo` (e.g., pagination page numbers, photo URLs, column definitions)
- **Optimized Form Rendering**: Using `useWatch` from React Hook Form instead of `watch()` to subscribe only to specific fields, reducing re-renders
- **Component Extraction**: Large components extracted into separate files for better code splitting and maintainability
- **Stable References**: Column definitions and render functions memoized in list components to prevent table re-renders on every state change
- **Debounced Search Input**: Search queries debounced with 300ms delay to reduce API calls while typing (URL updates immediately for shareable/bookmarkable links, but API requests only fire after user stops typing)
- **Pagination for Large Datasets**: Server-side pagination (10 items per page) prevents rendering performance issues with large datasets. For infinite scrolling, consider using [TanStack Virtual](https://tanstack.com/virtual) for efficient virtualization of large lists

### Route Structure
- **File-Based Routing**: TanStack Router with file-based route generation
- **Layout Nesting**: Base layout (`_base.tsx`) wraps all routes with MainLayout (Header + Sidebar)
- **Route Organization**:
  - `/` - Dashboard/Activity feed
  - `/patients` - Patient list
  - `/patients/:id` - Patient detail view
  - `/patients/:id/edit` - Patient edit form
- **404 Handling**: Automatic 404 pages for unmatched routes

### API Client Architecture
- **Environment-Based Configuration**: API URL configured via `VITE_API_URL` environment variable
- **RESTful Communication**: Standard HTTP methods (GET, POST, PUT, DELETE) to FastAPI backend
- **Base URL**: `http://localhost:8000/api`
- **Health Checks**: Backend health endpoint (`/api/health`) for service monitoring

### Error Handling Strategy

**API Error Handling (`lib/api-utils.ts`):**
- **`handleApiError()`**: Centralized error handler for all API responses
  - Extracts error details from response body, handles 404s with custom messages
  - Used consistently across all API functions
- **`transformPaginatedResponse()`**: Normalizes backend paginated responses (handles both camelCase and snake_case formats)

**Component Error Handling (`lib/error-utils.ts`):**
- **`getErrorMessage()`**: Safely extracts error messages from `Error` instances or unknown types with fallback messages
- Replaces repetitive `err instanceof Error ? err.message : 'default'` patterns

**Error Display:**
- **QueryErrorDisplay**: User-friendly error component for TanStack Query errors with retry functionality
- **LoadingSpinner**: Reusable loading state component
- Toast notifications for action errors (create, update, delete)
- Inline form validation errors via React Hook Form's `ErrorMessage` component

**Benefits:** DRY principles, consistent error messages, centralized error handling logic, and improved maintainability.

### Known Issues/To Dos
- **Medication Management**: The patient form currently does not include UI for managing current medications.
- **Documents Section**: Document upload and management UI has not been implemented for the patient form or patient detail page. The backend supports document uploads via `/api/patients/{patient_id}/upload-document`, but the frontend UI is pending.
- **Photo Upload Display**: Photo upload endpoint returns 200 (success) but the photo path is not returned as part of the patient endpoint response, so uploaded photos cannot be displayed. 

### Component Architecture
- **Separation of Concerns**:
  - `features/` - Feature-specific components organized by domain (e.g., `features/patients/`, `features/activity/`)
    - Flat structure: components directly in feature folder (e.g., `features/patients/patients-list.tsx`)
    - Shared form components reused across routes (e.g., `patient-form.tsx` used by both new and edit routes)
  - `components/ui/` - Reusable, unstyled UI primitives using [Catalyst](https://tailwindcss.com/plus/ui-kit)
  - `components/layout/` - Layout-specific components (Header, Sidebar, MainLayout)
  - `components/feedback/` - User feedback components (Toast notifications)
  - `routes/` - Thin route files that import and wire up feature components

### Form Validation & Management
- **React Hook Form**: Form state management and validation library
- **Zod**: TypeScript-first schema validation for form validation
- **Headless UI Forms**: Using `Fieldset`, `Label`, and `ErrorMessage` components
- **Client-Side Validation**: Real-time validation with error display
- **Dirty State Tracking**: Browser-based unsaved changes warnings
- **File Upload Support**: Image upload with preview and validation (image types only)

### State Management
- **React State**: Local component state for UI interactions
- **Server State**: TanStack Query for server data caching and synchronization
- **URL State**: TanStack Router for route-based state (navigation, route params)

#### Sorting & Pagination State
**Decision: React State (Local State) vs URL State**

We use a **hybrid approach** based on the complexity and use case of each data table:

**Patients List (URL State):**
- Uses **TanStack Router URL state** for pagination, sorting, and search
- Search params: `page`, `search`, `sortBy`, `sortOrder`
- Benefits:
  - **Shareable URLs**: Users can share specific search results (e.g., `/patients?search=Smith&page=2&sortBy=lastName`)
  - **Browser Navigation**: Back/forward buttons work through pagination and search history
  - **Bookmarkable States**: Users can bookmark filtered/sorted views
  - **Refresh Persistence**: Page state persists on refresh
- Implementation:
  - Route search params validated with Zod schema
  - `useSortedData` hook reads from and updates URL via TanStack Router's `navigate`
  - TanStack Query cache keys include URL params for proper invalidation
  - 5-minute cache staleness with background refetching

**Activities List (React State):**
- Uses **React local state** for pagination and sorting
- Simpler implementation for tables without search functionality
- No need for URL sync when sharing/bookmarking isn't required

**When to Use Each Approach:**

**Use URL State when:**
- Table has search/filter functionality
- Users need to share filtered views
- Deep linking to specific states is valuable
- Browser back/forward navigation is desired
- State should persist on page refresh

**Use React State when:**
- Simple tables without search
- No sharing/bookmarking requirements
- Temporary UI state that shouldn't be persisted
- Faster interactions are prioritized over URL sync

**Current Implementation:**
- **Patients List**: URL state via TanStack Router with Zod validation
- **Activities List**: React local state with `useState`
- Both use **TanStack Query** for data fetching with automatic caching
- Query keys include all state dependencies for proper cache invalidation

#### Toast Notification System
**Global State Pattern for User Feedback**

The application uses a custom toast notification system that works outside React's normal state flow, allowing toasts to be triggered from anywhere (components, hooks, mutations, utilities).

**Architecture:**
- **Global State Management**: In-memory state stored outside React components
- **Listener Pattern**: Components subscribe to state changes via listeners array
- **Reducer Pattern**: Four action types: `ADD_TOAST`, `UPDATE_TOAST`, `DISMISS_TOAST`, `REMOVE_TOAST`
- **No React Context**: Uses a global listener pattern instead of Context API for simplicity

**Core Components:**

1. **State Management** (`lib/toast.ts`):
   - Reducer function for managing toast state
   - In-memory state and listener array
   - Dispatch function that updates state and notifies all listeners
   - Standalone `toast()` function for creating toasts from anywhere
   - `dismissToast()` function for programmatic dismissal

2. **useToast Hook** (`hooks/use-toast.ts`):
   - Subscribes to global state on mount
   - Unsubscribes on unmount
   - Returns current toast array and helper functions
   - Uses `useState` initialized with current memory state
   - Uses `useEffect` to add/remove component's state setter from listeners array

3. **Toast Component** (`components/ui/toast.tsx`):
   - Presentation component for individual toast
   - Supports title, description, variant (default/destructive), and custom actions
   - Handles open/close state and animations

4. **Toaster Component** (`components/feedback/toaster.tsx`):
   - Renders all active toasts
   - Uses `useToast` hook to get current toast array
   - Maps over toasts and renders them with proper positioning
   - Integrated once at app root level

**Toast Configuration:**
- **Maximum Toasts**: Limited to 1 toast at a time (configurable via `TOAST_LIMIT`)
- **Auto-dismiss**: Default duration of 5 seconds (configurable via `TOAST_DURATION`)
- **Removal Delay**: 100ms delay before actual removal from state (configurable via `TOAST_REMOVAL_DELAY`)
- **Variants**: `default` (success/info) and `destructive` (errors)

**Usage Patterns:**

```typescript
// Import the standalone toast function
import { toast } from '@/lib/toast'

// Success toast (default variant)
toast({
  title: "Patient created",
  description: "The patient has been successfully added to the system."
})

// Error toast (destructive variant)
toast({
  title: "Error",
  description: "Failed to save patient data.",
  variant: "destructive"
})

// Toast with custom action
toast({
  title: "Patient updated",
  description: "Changes have been saved.",
  action: {
    altText: "View",
    onClick: () => navigate(`/patients/${id}`)
  }
})

// In React Query mutations
const mutation = useMutation({
  mutationFn: createPatient,
  onSuccess: () => {
    toast({ title: "Success", description: "Patient created successfully" })
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    })
  }
})

// Programmatic control
const toastInstance = toast({ title: "Processing..." })
// Later...
toastInstance.dismiss()
toastInstance.update({ title: "Complete!" })
```

**Toast Lifecycle:**
1. **Add**: Toast is created with `open: true` and added to state array
2. **Display**: Toaster component renders the toast
3. **Auto-dismiss**: After `TOAST_DURATION`, `onOpenChange` fires with `false`
4. **Dismiss**: Sets `open: false` and queues removal after `TOAST_REMOVAL_DELAY`
5. **Remove**: Toast is actually removed from state array after delay

**Key Features:**
- Can be called from anywhere (not just React components)
- Automatic cleanup of timeouts to prevent memory leaks
- New toasts replace old ones (newest first, limited by `TOAST_LIMIT`)
- State synchronization across all components using `useToast`
- SSR-safe (works with TanStack Start)
- State resets appropriately (e.g., page resets to 1 when sort or search changes)

#### Form State

### Library Choices & Rationale

#### Routing
- **TanStack Router**: 
  - Type-safe routing with full TypeScript support
  - Manual route configuration for explicit control
  - Feature-based organization: route files import from `features/` directory
  - Built-in data loading and SSR support
  - Path aliases (`@/`) for cleaner imports
  - Excellent developer experience

#### Server State Management
- **TanStack Query**:
  - Automatic caching and request deduplication
  - Background refetching and stale-while-revalidate pattern
  - Optimistic updates support
  - Built-in loading and error states
  - Query invalidation and refetching based on query keys
  - Used for all server data fetching (patients list, search, sorting, pagination)
  - Query keys include all dependencies (page, sortBy, sortOrder, search) ensuring proper cache management
  - 5-minute default stale time for optimal performance

#### UI Components
- **Headless UI**: 
  - Unstyled, accessible components
  - Full keyboard navigation and ARIA support
  - Composable and customizable
- **Heroicons**: 
  - Consistent icon system
  - Tree-shakeable SVG icons
  - Multiple sizes (16/solid, 20/solid)

#### Styling
- **Tailwind CSS**: 
  - Utility-first CSS framework
  - Custom theme via `@theme` directive
  - Brand colors and typography configured
  - Responsive design utilities
  - Dark mode support via CSS variables
- **Custom Fonts**: Neue Montreal (sans-serif) and Rhetorik Serif (serif) for brand identity

#### Build Tool
- **Vite**: 
  - Native ESM support
  - Plugin ecosystem (React, TypeScript, Tailwind)

#### Utilities
- **date-fns**: 
  - Modern JavaScript date utility library
  - Immutable date operations
  - Tree-shakeable functions for optimal bundle size
  - Comprehensive formatting and manipulation utilities

#### Testing
- Testing framework to be determined (Jest, Vitest, or Playwright recommended)

### Backend Architecture

#### API Design
- RESTful API with FastAPI
- Automatic API documentation via OpenAPI/Swagger at `/docs`
- SQLite database (default) with PostgreSQL support via `DATABASE_URL` env variable

#### Setup
- Python 3.11+ required
- Install dependencies: `pip install -r requirements.txt`
- Run server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Database file (`healthcare.db`) created automatically on first run

#### Environment Variables
- `SEED_PATIENT_COUNT`: Number of sample patients to generate on first startup (default: 0)
  - Set to `20` for development with sample data
  - Set to `1000+` for stress testing performance
  - Only generates if database is empty
- `DATABASE_URL`: Database connection string (default: `sqlite:///./healthcare.db`)
- `UPLOAD_DIR`: Directory for file uploads (default: `./uploads`)

#### Database Management

**Running Migrations:**
Migrations now run automatically on application startup. However, you can also run them manually:
- **Docker**: 
  ```bash
  docker-compose exec backend python -m app.migrations
  ```
  Or use the helper script:
  ```bash
  chmod +x backend/run_migration.sh
  ./backend/run_migration.sh
  ```
- **Local development**: 
  ```bash
  cd backend
  python -m app.migrations
  ```

**Note:** 
- Migrations run automatically on startup to ensure schema consistency
- For SQLite: If columns are NOT NULL, the migration will log a warning (SQLite doesn't support ALTER COLUMN). For development, you can delete the database file to recreate it with the correct schema.
- For PostgreSQL: The migration will automatically alter columns to be nullable if needed.

**Running Other Python Scripts in Docker:**
To run any Python script or command in the backend container:
```bash
# Run a Python module
docker-compose exec backend python -m app.module_name

# Run a Python script
docker-compose exec backend python path/to/script.py

# Open an interactive Python shell
docker-compose exec backend python

# Run a one-off command
docker-compose exec backend python -c "print('Hello from container')"
```

**Reset/Delete Database:**
To regenerate sample data or start fresh, delete the database file:
- **Local development**: Delete `backend/healthcare.db`
- **Docker**: Delete the database file in the `backend-data` volume or run:
  ```bash
  docker-compose down -v  # Removes volumes (database + uploads)
  ```
  Or manually delete: `docker volume rm healthcare-dash_backend-data`

**Note:** Sample data only generates when the database is empty. After deleting the database, restart the backend to regenerate sample data (if `SEED_PATIENT_COUNT > 0`).

#### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application and endpoints
│   ├── database.py      # Database configuration and session management
│   ├── models.py        # SQLAlchemy models
│   └── schemas.py       # Pydantic schemas for validation
├── requirements.txt
├── Dockerfile
└── README.md

frontend/
├── src/
│   ├── features/        # Feature-based components
│   │   ├── activity/
│   │   │   └── activity-page.tsx
│   │   └── patients/
│   │       ├── patients-list.tsx
│   │       ├── patient-detail.tsx
│   │       └── patient-form.tsx
│   ├── routes/          # Route configuration files (thin wrappers)
│   │   ├── __root.tsx    # Root layout
│   │   ├── _base.tsx    # Base layout wrapper
│   │   ├── _base/
│   │   │   ├── index.tsx
│   │   │   └── $.tsx
│   │   └── patients/
│   │       ├── index.tsx
│   │       ├── new.tsx
│   │       └── $patientId/
│   │           ├── layout.tsx
│   │           ├── index.tsx
│   │           └── edit.tsx
│   ├── router.tsx       # Manual route tree configuration
│   ├── components/      # Shared UI components
│   ├── types/           # TypeScript type definitions
│   └── assets/          # Static assets
├── package.json
├── tsconfig.json        # TypeScript config with @ alias
├── vite.config.ts       # Vite config with @ alias
└── README.md
```

#### Development Practices
- Type hints for all functions
- Pydantic schemas for request/response validation
- SQLAlchemy ORM for database operations
- Error handling with appropriate HTTP status codes

## Test Plan

### 1. Developer Experience & Architecture

#### ✅ Code Quality
- [ ] Run `npm run lint` → **Zero** linting errors (ESLint).
- [ ] Run type check (e.g., `tsc --noEmit`) → **Zero** TypeScript errors.
- [ ] Run `npm run build` → Build completes without warnings.
- [ ] Folder structure clearly separates `features`, `components`, and `hooks`.

#### ✅ Docker & Setup
- [ ] `docker-compose up` starts both Frontend (Vite) and Backend (FastAPI/Python).
- [ ] Frontend accessible at `http://localhost:5173`.
- [ ] Backend accessible at `http://localhost:8000`.
- [ ] `README.md` contains clear start instructions.

### 2. Navigation & Routing

#### ✅ Route Structure
- [ ] Navigate to `/` → Loads **Dashboard Home** (Welcome/Activity).
- [ ] Navigate to `/patients` → Loads **Patient List**.
- [ ] Navigate to `/patients/:id` → Loads **Patient Detail**.
- [ ] Navigate to `/random-url-xyz` → Loads **404 Page** with a link back home.
- [ ] Clicking Sidebar "Home" → Updates URL to `/` and highlights icon.
- [ ] Clicking Sidebar "Patients" → Updates URL to `/patients` and highlights icon.


### 3. Patient List & Performance

#### ✅ Performance & Scale
- [ ] **Scale Test:** Seed database/mock with **1,000+ patients**.
- [ ] List loads initially under <1 second (Virtualization or Pagination active).
- [ ] Rapid scroll to bottom → No UI freezing (60fps target).
- [ ] Pagination (if used): Click "Last Page" → Loads instantly.

#### ✅ Search & Filtering
- [ ] **Debounce Test:** Type "Johnson" rapidly → Network request only fires after typing stops (300ms debounce, not on every keystroke).
- [ ] **TanStack Query Caching:** Search for "Smith", navigate away, return → Results load instantly from cache (no network request).
- [ ] Filter by "Active" → Only active patients shown.
- [ ] Sort by "Last Visit" → Correctly orders dates (Newest vs Oldest). TanStack Query caches each sort combination separately.
- [ ] Clear Search → Restores full 1000+ list instantly from cache if previously viewed.


### 4. Forms: Create & Edit 

#### ✅ File Uploads 
- [ ] Click "Upload Photo" → System file picker opens.
- [ ] Only show on edit for faster implementation
- [ ] Select Image → **Preview** of image appears in the form.
- [ ] **Validation:** Try to upload a non-image (e.g., .pdf or .exe) → Shows error.
- [ ] Submit Form → Image persists on Patient Detail page.

#### ✅ Validation and Form Behavior
- [ ] **Validation:** Try to submit with empty "Name" → "Required" error appears.
- [ ] **Dirty State:** Fill half the form, click "Back" → Browser asks "Discard unsaved changes?"


### 5. Patient Detail Page

#### ✅ Data Display
- [ ] Name, DOB, Age (calculated correctly) are visible.
- [ ] Status Badge (Active/Inactive/Archived) has correct color coding.
- [ ] Medical History list renders correctly (or "None" if empty).
- [ ] Patient Photo renders (or distinct placeholder if null).

#### ✅ Actions
- [ ] "Edit" button → Navigates to `/patients/:id/edit` with data pre-filled.
- [ ] "Delete" button → Opens Confirmation Modal.
- [ ] Confirm Delete → Redirects to List, shows "Patient Deleted" toast.


### 6. Global State & Activity

#### ✅ Activity Feed
- [ ] **Create Action:** Create new patient "Jane Doe".
- [ ] **Verify Feed:** Go to Dashboard Home (`/`) → "Jane Doe created" appears in Recent Activity list.
- [ ] **Persistence:** Refresh page → Activity history remains

#### ✅ Global Notifications
- [ ] **Success:** Create/Edit success triggers a global toast notification.
- [ ] **Error:** Network failure triggers a global error toast.
- [ ] Navigate away while toast is showing → toast remains visible until timeout.


### 7. Error Handling

#### ✅ Network & System Errors
- [ ] **API Down:** Stop backend server → Frontend shows user-friendly "Service Unavailable" message (not a white screen).
- [ ] **Retry:** Click "Retry" on error screen → Attempts to refetch data.
- [ ] **Invalid ID:** Go to `/patients/999999` → Shows "Patient Not Found" UI.


### 8. Responsive Design

#### ✅ Mobile (375px) & Tablet
- [ ] **Hamburger Menu:** Sidebar collapses into a hamburger menu on mobile.
- [ ] **Table/Cards:** Patient list transforms from wide table to stacked cards or scrollable table on mobile.
- [ ] **Form Inputs:** No horizontal scrolling required to fill forms.
- [ ] **Touch Targets:** Buttons are large enough for touch (>44px).
