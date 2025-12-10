# Healthcare Dashboard

## Quick Start

## Launch Application

### Seed Data

The database is automatically seeded with 20 sample patients on first run. Can be overridden using env variable SEED_PATIENT_COUNT.


## Architecture Decisions

### UX/Performance Patterns

### Route Structure

### API Client Architecture

### Error Handling Strategy

### Known Issues

### Component Architecture

### Form Validation & Management

### State Management

#### Form State

### Library Choices & Rationale

#### Routing

#### UI Components

#### Styling

#### Build Tool

#### Testing

### Backend Architecture

#### API Design
- RESTful API with FastAPI
- Automatic API documentation via OpenAPI/Swagger
- SQLite database

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
- [ ] **Debounce Test:** Type "Johnson" rapidly → Network request only fires after typing stops (not on every keystroke).
- [ ] Filter by "Active" → Only active patients shown.
- [ ] Sort by "Last Visit" → Correctly orders dates (Newest vs Oldest).
- [ ] Clear Search → Restores full 1000+ list instantly.


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