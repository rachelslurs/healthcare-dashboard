# Frontend Memory Leak Assessment

## Summary
This document outlines potential memory leaks found in the frontend application, along with their severity and likelihood of causing problems.

---

## 🔴 HIGH SEVERITY - Likely to Cause Problems

### 1. Async State Updates After Unmount in `patient-detail.tsx`
**Location:** `/workspace/frontend/src/features/patients/patient-detail.tsx:40-64`

**Issue:**
The `useEffect` hook performs an async fetch operation but doesn't check if the component is still mounted before calling `setPatient`, `setError`, or `setIsLoading`. If a user navigates away quickly, the component may try to update state after unmounting.

```typescript
useEffect(() => {
  const fetchPatient = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPatient(patientId);
      setPatient(data); // ⚠️ May execute after unmount
    } catch (err) {
      setError(...); // ⚠️ May execute after unmount
    } finally {
      setIsLoading(false); // ⚠️ May execute after unmount
    }
  };
  fetchPatient();
}, [patientId]);
```

**Likelihood:** **HIGH** - This is a common pattern that will cause React warnings and potential memory leaks, especially with fast navigation or slow network requests.

**Impact:** React will log warnings about setting state on unmounted components. In development, this is noisy; in production, it can lead to memory leaks if state updates hold references to large objects.

---

### 2. Async State Updates After Unmount in `patient-form.tsx`
**Location:** `/workspace/frontend/src/features/patients/patient-form.tsx:114-203`

**Issue:**
Similar to `patient-detail.tsx`, the `useEffect` hook fetches patient data asynchronously without checking if the component is still mounted before updating state.

```typescript
useEffect(() => {
  if (isEdit && patientId && !patient) {
    const fetchPatientData = async () => {
      setIsLoading(true);
      try {
        const data = await getPatient(patientId);
        reset({...}); // ⚠️ May execute after unmount
        setCurrentPhotoUrl(data.photoUrl); // ⚠️ May execute after unmount
      } catch (err) {
        toast({...}); // ⚠️ May execute after unmount
      } finally {
        setIsLoading(false); // ⚠️ May execute after unmount
      }
    };
    fetchPatientData();
  }
}, [isEdit, patientId, patient, reset]);
```

**Likelihood:** **HIGH** - Same issue as above. Users navigating quickly between edit pages will trigger this.

**Impact:** React warnings, potential memory leaks, and unnecessary state updates.

---

### 3. FileReader Not Cleaned Up in `patient-form.tsx`
**Location:** `/workspace/frontend/src/features/patients/patient-form.tsx:271-275`

**Issue:**
A `FileReader` is created but never aborted if the component unmounts before `onloadend` fires. The reader holds a reference to the file data.

```typescript
const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // ... validation ...
  
  const reader = new FileReader()
  reader.onloadend = () => {
    setPhotoPreview(reader.result as string) // ⚠️ May execute after unmount
  }
  reader.readAsDataURL(file) // ⚠️ No cleanup if component unmounts
}, [])
```

**Likelihood:** **MEDIUM-HIGH** - If users upload photos and quickly navigate away, the FileReader callback may execute after unmount, and the file data won't be garbage collected until the reader is done.

**Impact:** Memory held by FileReader and file data until callback completes, even after component unmounts.

---

## 🟡 MEDIUM SEVERITY - May Cause Problems

### 4. Toast Timeout Cleanup Edge Case in `toast.ts`
**Location:** `/workspace/frontend/src/lib/toast.ts:132-174`

**Issue:**
When a toast is created, a timeout is stored in a Map. If the component using the toast unmounts before the timeout fires, the timeout will still execute and try to dispatch. While the timeout is cleared in `DISMISS_TOAST` and `REMOVE_TOAST`, there's a potential race condition if the toast is auto-dismissed after component unmount.

```typescript
export function toast(props: {...}) {
  const id = generateId()
  const toast: Toast = {...}
  
  dispatch({ type: 'ADD_TOAST', toast })
  
  // Auto-dismiss after duration
  const timeout = setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id }) // ⚠️ May execute after component unmounts
  }, TOAST_DURATION)
  
  timeouts.set(id, timeout)
  return {...}
}
```

**Likelihood:** **MEDIUM** - The toast system is global and persists across component mounts/unmounts, so this is less likely to cause issues. However, if many toasts are created rapidly and components unmount, there could be unnecessary dispatches.

**Impact:** Minor - unnecessary dispatches to listeners that may have unmounted, but the global state management handles this reasonably well.

---

### 5. usePaginatedData Hook - No Abort Controller
**Location:** `/workspace/frontend/src/hooks/usePaginatedData.ts:36-54`

**Issue:**
The `fetchData` function doesn't use an AbortController to cancel in-flight requests when dependencies change or the component unmounts. If a user changes page/sort quickly, multiple requests may be in flight simultaneously.

```typescript
const fetchData = useCallback(async () => {
  setIsLoading(true)
  setIsFetching(true)
  setError(null)
  
  try {
    const result = await fetchFnRef.current({ page, pageSize, sortBy, sortOrder })
    setData(result) // ⚠️ May execute after component unmounts or params change
  } catch (err) {
    setError(...) // ⚠️ May execute after component unmounts
  } finally {
    setIsLoading(false) // ⚠️ May execute after component unmounts
    setIsFetching(false)
  }
}, [page, pageSize, sortBy, sortOrder])
```

**Likelihood:** **MEDIUM** - This hook doesn't appear to be used in the codebase (patients-list uses TanStack Query instead), but if it were used, it would have the same issues as the other async operations.

**Impact:** Multiple concurrent requests, potential state updates after unmount, unnecessary network traffic.

---

## 🟢 LOW SEVERITY - Unlikely to Cause Problems

### 6. QueryClient Configuration - No Cache Size Limit
**Location:** `/workspace/frontend/src/routes/__root.tsx:11-18`

**Issue:**
TanStack Query's QueryClient doesn't have explicit cache size limits configured. While TanStack Query has reasonable defaults, very long sessions with many queries could theoretically accumulate cached data.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

**Likelihood:** **LOW** - TanStack Query has built-in garbage collection and cache management. This would only be an issue with extremely long sessions (hours) and many different query keys.

**Impact:** Minimal - TanStack Query handles cache eviction automatically.

---

## ✅ GOOD PRACTICES FOUND

1. **useDebounce hook** - Properly cleans up timeouts ✅
2. **useToast hook** - Properly unsubscribes on unmount ✅
3. **Toast system** - Generally well-designed with cleanup in reducer ✅
4. **TanStack Query usage** - Most components use TanStack Query which handles cleanup automatically ✅

---

## Recommendations

### Priority 1 (Fix Immediately)
1. Add cleanup checks to async operations in `patient-detail.tsx` and `patient-form.tsx`
2. Add AbortController support to FileReader in `patient-form.tsx`

### Priority 2 (Fix Soon)
3. Add AbortController support to `usePaginatedData` hook (if it's used)
4. Consider adding a mounted ref pattern for async state updates

### Priority 3 (Nice to Have)
5. Add explicit cache size limits to QueryClient configuration
6. Consider using a custom hook for async operations with automatic cleanup

---

## Example Fix Pattern

For async operations in useEffect:

```typescript
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    try {
      const data = await getPatient(patientId);
      if (isMounted) {
        setPatient(data);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch patient"));
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };
  
  fetchPatient();
  
  return () => {
    isMounted = false;
  };
}, [patientId]);
```

For FileReader:

```typescript
const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  let isMounted = true
  
  reader.onloadend = () => {
    if (isMounted) {
      setPhotoPreview(reader.result as string)
    }
  }
  
  reader.readAsDataURL(file)
  
  return () => {
    isMounted = false
    reader.abort() // Abort if component unmounts
  }
}, [])
```
