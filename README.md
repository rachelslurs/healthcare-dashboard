# Healthcare Dashboard

## Table of Contents

- [Quick Start](#quick-start)
  - [Launch Application](#launch-application)
  - [Environment Variables](#environment-variables)
  - [Seed Data](#seed-data)
- [Architecture Decisions](#architecture-decisions)
  - [UX/Performance Patterns](#uxperformance-patterns)
  - [Performance Optimizations](#performance-optimizations)
  - [Route Structure](#route-structure)
  - [API Client Architecture](#api-client-architecture)
  - [Error Handling Strategy](#error-handling-strategy)
  - [Known Issues/To Dos](#known-issuesto-dos)
  - [Component Architecture](#component-architecture)
  - [Form Validation & Management](#form-validation--management)
  - [State Management](#state-management)
    - [Sorting & Pagination State](#sorting--pagination-state)
    - [Toast Notification System](#toast-notification-system)
    - [Form State](#form-state)
  - [Library Choices & Rationale](#library-choices--rationale)
  - [Backend Architecture](#backend-architecture)
- [Test Plan](#test-plan)
  - [Developer Experience & Architecture](#1-developer-experience--architecture)
  - [Navigation & Routing](#2-navigation--routing)
  - [Patient List & Performance](#3-patient-list--performance)
  - [Forms: Create & Edit](#4-forms-create--edit)
  - [Patient Detail Page](#5-patient-detail-page)
  - [Global State & Activity](#6-global-state--activity)
  - [Error Handling](#7-error-handling)
  - [Responsive Design](#8-responsive-design)

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
- **Component Extraction**: Large components extracted into separate files for code splitting and maintainability
- **Stable References**: Column definitions and render functions memoized in list components to prevent table re-renders on every state change
- **Debounced Search Input**: Search queries debounced with 300ms delay to reduce API calls while typing (URL updates immediately for shareable/bookmarkable links, but API requests only fire after user stops typing)
- **Pagination for Large Datasets**: Server-side pagination (10 items per page) prevents rendering performance issues with large datasets. For infinite scrolling, consider using [TanStack Virtual](https://tanstack.com/virtual) for virtualization of large lists

### Route Structure
- **File-Based Routing**: TanStack Router with file-based route generation
- **Layout Nesting**: Base layout ([`_base.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/_base.tsx)) wraps all routes with MainLayout (Header + Sidebar)
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

**API Error Handling** ([`lib/api-utils.ts`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/lib/api-utils.ts)):
- **`handleApiError()`**: Centralized error handler for all API responses
  - Extracts error details from response body, handles 404s with custom messages
  - Used consistently across all API functions
- **`transformPaginatedResponse()`**: Normalizes backend paginated responses (handles both camelCase and snake_case formats)

**Component Error Handling** ([`lib/error-utils.ts`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/lib/error-utils.ts)):
- **`getErrorMessage()`**: Safely extracts error messages from `Error` instances or unknown types with fallback messages
- Replaces repetitive `err instanceof Error ? err.message : 'default'` patterns

**Error Display:**
- **QueryErrorDisplay** ([`components/errors/query-error-display.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/components/errors/query-error-display.tsx)): User-friendly error component for TanStack Query errors with retry functionality
- **LoadingSpinner** ([`components/feedback/loading-spinner.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/components/feedback/loading-spinner.tsx)): Reusable loading state component
- Toast notifications for action errors (create, update, delete)
- Inline form validation errors via React Hook Form's `ErrorMessage` component

**Benefits:** DRY principles, consistent error messages, centralized error handling logic, and improved maintainability.

### Known Issues/To Dos
- **Medication Management**: The patient form currently does not include UI for managing current medications.
- **Documents Section**: Document upload and management UI has not been implemented for the patient form or patient detail page. The backend supports document uploads via `/api/patients/{patient_id}/upload-document`, but the frontend UI is pending.
- **Photo Upload Display**: Photo upload endpoint returns 200 (success) but the photo path is not returned as part of the patient endpoint response, so uploaded photos cannot be displayed. 

### Component Architecture
- **Separation of Concerns**:
  - `features/` - Feature-specific components organized by domain (e.g., [`features/patients/`](https://github.com/rachelslurs/healthcare-dashboard/tree/main/frontend/src/features/patients), [`features/activities/`](https://github.com/rachelslurs/healthcare-dashboard/tree/main/frontend/src/features/activities))
    - Flat structure: components directly in feature folder (e.g., [`features/patients/patients-list.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/features/patients/patients-list.tsx))
    - Shared form components reused across routes (e.g., [`patient-form.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/features/patients/patient-form.tsx) used by both new and edit routes)
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

<details>
<summary><strong>Sorting & Pagination State</strong> - React State vs URL State Decision</summary>

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
  - [`useSortedData`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/hooks/useSortedData.ts) hook reads from and updates URL via TanStack Router's `navigate`
  - TanStack Query cache keys include URL params for proper invalidation
  - 5-minute cache staleness with background refetching

**Activities List (React State):**
- Uses **React local state** (`useState`) for pagination and sorting
- Implementation for tables without search functionality
- No need for URL sync when sharing/bookmarking isn't required
- Page state managed with `useState`, sorting handled by `useSortedData` hook with local state fallback

**When to Use Each Approach:**

**Use URL State when:**
- Table has search/filter functionality
- Users need to share filtered views
- Deep linking to specific states is valuable
- Browser back/forward navigation is desired
- State should persist on page refresh

**Use React State when:**
- Tables without search
- No sharing/bookmarking requirements
- Temporary UI state that shouldn't be persisted
- Interactions are prioritized over URL sync

**Current Implementation:**
- **Patients List**: URL state via TanStack Router with Zod validation
- **Activities List**: React local state with `useState` for pagination, `useSortedData` hook for sorting (with local state fallback)
- Both use **TanStack Query** for data fetching with automatic caching
- Query keys include all state dependencies for proper cache invalidation

</details>

<details>
<summary><strong>Toast Notification System</strong> - Global State Pattern for User Feedback</summary>

The application uses a custom toast notification system that works outside React's normal state flow, allowing toasts to be triggered from anywhere (components, hooks, mutations, utilities).

**Architecture:**
- **Global State Management**: In-memory state stored outside React components
- **Listener Pattern**: Components subscribe to state changes via listeners array
- **Reducer Pattern**: Four action types: `ADD_TOAST`, `UPDATE_TOAST`, `DISMISS_TOAST`, `REMOVE_TOAST`
- **No React Context**: Uses a global listener pattern instead of Context API for simplicity

**Core Components:**

1. **State Management** ([`lib/toast.ts`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/lib/toast.ts)):
   - Reducer function for managing toast state
   - In-memory state and listener array
   - Dispatch function that updates state and notifies all listeners
   - Standalone `toast()` function for creating toasts from anywhere
   - `dismissToast()` function for programmatic dismissal

2. **useToast Hook** ([`hooks/use-toast.ts`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/hooks/use-toast.ts)):
   - Subscribes to global state on mount
   - Unsubscribes on unmount
   - Returns current toast array and helper functions
   - Uses `useState` initialized with current memory state
   - Uses `useEffect` to add/remove component's state setter from listeners array

3. **Toast Component** ([`components/ui/toast.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/components/ui/toast.tsx)):
   - Presentation component for individual toast
   - Supports title, description, variant (default/destructive), and custom actions
   - Handles open/close state and animations

4. **Toaster Component** ([`components/feedback/toaster.tsx`](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/components/feedback/toaster.tsx)):
   - Renders all active toasts
   - Uses `useToast` hook to get current toast array
   - Maps over toasts and renders them with proper positioning
   - Integrated once at app root level

**Toast Configuration:**
- **Maximum Toasts**: Limited to 1 toast at a time (configurable via `TOAST_LIMIT`)
- **Auto-dismiss**: Default duration of 5 seconds (configurable via `TOAST_DURATION`)
- **Removal Delay**: 100ms delay before actual removal from state (configurable via `TOAST_REMOVAL_DELAY`)
- **Variants**: `default` (success/info) and `destructive` (errors)

<details>
<summary><strong>Usage Patterns</strong></summary>

```typescript
// Import the standalone toast function
import { toast } from '@/lib/toast' // See: lib/toast.ts

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
</details>

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

</details>

#### Form State

**React Hook Form State Management:**

Forms use React Hook Form for state management, providing re-render control and type-safe form handling.

**State Architecture:**
- **Form State**: Managed by React Hook Form via `useForm()` hook
  - Type-safe with TypeScript generics (`useForm<PatientFormData>`)
  - Integrated with Zod validation via `zodResolver`
  - Validation mode: `onBlur` (validates after user leaves field)
- **Nested Form State**: Nested objects (address, emergencyContact, medicalInfo, insurance) supported
- **Selective Watching**: Uses `useWatch()` to subscribe only to specific fields, reducing unnecessary re-renders
  - Example: `useWatch({ control, name: 'emergencyContact' })` only re-renders when emergency contact changes
- **Programmatic Updates**: `setValue()` used for dynamic field updates (e.g., adding/removing allergies, conditions)
  - Includes `shouldValidate: true` to trigger validation after updates

**Local Component State:**
- UI-specific state managed with `useState`:
  - Photo file and preview (`photoFile`, `photoPreview`)
  - Input fields for dynamic lists (`allergyInput`, `conditionInput`)
  - Loading states (`isLoading`)
  - Current photo URL for edit mode (`currentPhotoUrl`)

**Form Initialization:**
- **Create Mode**: Form initialized with `defaultFormValues` (empty form)
- **Edit Mode**: Form populated via `reset()` after fetching patient data
  - Data transformation: Dates converted from ISO to YYYY-MM-DD format for date inputs
  - Optional fields handled: `undefined` values converted appropriately
  - Nested objects defaulted if missing (address, emergencyContact)

**Form Submission:**
- Type-safe submission handler with `SubmitHandler<PatientFormData>`
- Data transformation before submission:
  - Empty nested objects converted to `undefined` if all fields are empty
  - Conditional validation: Emergency contact required fields validated only if any field is filled
- Error handling: Uses `getErrorMessage()` utility for consistent error messages
- Success handling: Invalidates TanStack Query cache and navigates to detail page

**Implementation Details:**
- **Re-render Control**: Selective watching and memoization reduce re-renders
- **Type Safety**: TypeScript support with Zod schema validation
- **Validation**: Real-time validation on blur with error messages
- **Reusability**: Single form component used for both create and edit modes

**Example Pattern:**
```typescript
// Form setup
const form = useForm<PatientFormData>({
  resolver: zodResolver(patientFormSchema),
  defaultValues: defaultFormValues,
  mode: 'onBlur',
})

// Selective watching (only re-renders when this field changes)
const emergencyContact = useWatch({ control, name: 'emergencyContact' })

// Programmatic update with validation
setValue('medicalInfo.allergies', [...allergies, newAllergy], {
  shouldValidate: true,
})
```

<details>
<summary><strong>Library Choices & Rationale</strong></summary>

#### Routing
- **TanStack Router**: 
  - Type-safe routing with full TypeScript support
  - Manual route configuration for explicit control
  - Feature-based organization: route files import from `features/` directory
  - Built-in data loading and SSR support
  - Path aliases (`@/`) for imports

#### Server State Management
- **TanStack Query**:
  - Automatic caching and request deduplication
  - Background refetching and stale-while-revalidate pattern
  - Optimistic updates support
  - Built-in loading and error states
  - Query invalidation and refetching based on query keys
  - Used for all server data fetching (patients list, search, sorting, pagination)
  - Query keys include all dependencies (page, sortBy, sortOrder, search) ensuring proper cache management
  - 5-minute default stale time

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
  - JavaScript date utility library
  - Immutable date operations
  - Tree-shakeable functions for bundle size
  - Formatting and manipulation utilities

#### Testing
- Testing framework to be determined (Jest, Vitest, or Playwright recommended)

</details>

<details>
<summary><strong>Backend Architecture</strong></summary>

**API Design:**
- RESTful API with FastAPI
- OpenAPI/Swagger documentation at `/docs`
- SQLite database (default), PostgreSQL supported via `DATABASE_URL`

**Environment Variables:**
- `SEED_PATIENT_COUNT`: Sample patients to generate (default: 0)
- `DATABASE_URL`: Database connection string (default: `sqlite:///./healthcare.db`)
- `UPLOAD_DIR`: File upload directory (default: `./uploads`)

**Database Management:**
- Migrations run automatically on startup
- Manual migration: `docker-compose exec backend python -m app.migrations` or `./backend/run_migration.sh`

**Reset/Delete Database:**
To regenerate sample data or start fresh:
- **Local development**: Delete `backend/healthcare.db`
- **Docker**: Run `docker-compose down -v` (removes volumes: database + uploads)
  - Or manually delete: `docker volume rm healthcare-dash_backend-data`
- **Note**: Sample data only generates when the database is empty. After deleting, restart the backend to regenerate sample data (if `SEED_PATIENT_COUNT > 0`)

**Project Structure:**
```
backend/
├── app/
│   ├── [main.py](https://github.com/rachelslurs/healthcare-dashboard/blob/main/backend/app/main.py)          # FastAPI application and endpoints
│   ├── [database.py](https://github.com/rachelslurs/healthcare-dashboard/blob/main/backend/app/database.py)      # Database configuration and session management
│   ├── [models.py](https://github.com/rachelslurs/healthcare-dashboard/blob/main/backend/app/models.py)        # SQLAlchemy models
│   └── [schemas.py](https://github.com/rachelslurs/healthcare-dashboard/blob/main/backend/app/schemas.py)       # Pydantic schemas for validation
├── requirements.txt
├── Dockerfile
└── README.md
```

</details>

#### Project Structure
```
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
│   │   ├── [__root.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/__root.tsx)    # Root layout
│   │   ├── [_base.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/_base.tsx)    # Base layout wrapper
│   │   ├── _base/
│   │   │   ├── [index.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/_base/index.tsx)
│   │   │   └── [$.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/_base/$.tsx)
│   │   └── patients/
│   │       ├── [index.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/patients/index.tsx)
│   │       ├── [new.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/patients/new.tsx)
│   │       └── $patientId/
│   │           ├── [layout.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/patients/$patientId/layout.tsx)
│   │           ├── [index.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/patients/$patientId/index.tsx)
│   │           └── [edit.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/routes/patients/$patientId/edit.tsx)
│   ├── [router.tsx](https://github.com/rachelslurs/healthcare-dashboard/blob/main/frontend/src/router.tsx)       # Manual route tree configuration
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
- [ ] Run `docker-compose exec frontend npm run lint` → **Zero** linting errors (ESLint).
- [ ] Run type check: `docker-compose exec frontend npx tsc --noEmit` → **Zero** TypeScript errors.
- [ ] Run `docker-compose exec frontend npm run build` → Build completes without warnings.
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
