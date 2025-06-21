# Debugging: Activities Not Storing in State

## Issue Description
Activities are not being stored in Redux state after fetching from the database.

## Root Cause Analysis

### Potential Issues Identified:

1. **Duplicate useEffect Hooks** ✅ FIXED
   - There were duplicate useEffect hooks in the home screen causing conflicting fetch operations
   - Fixed by removing the duplicate and consolidating fetch logic

2. **Authentication Timing Issues**
   - DAO methods call `supabase.auth.getUser()` which might fail if auth isn't fully initialized
   - Need to verify authentication state before making database calls

3. **Database Query Issues**
   - Supabase queries might be failing silently
   - Date range filtering for "today's activities" might be incorrect

4. **Redux State Management**
   - Actions might be dispatching but reducers not handling them correctly
   - State might be getting overwritten by subsequent actions

## Debugging Steps

### 1. Check Authentication Status
```typescript
// In your component or hook
const auth = useAppSelector((state) => state.auth);
console.log("Auth status:", {
  isAuthenticated: auth.isAuthenticated,
  user: auth.user,
  sessionValid: auth.sessionValid
});
```

### 2. Monitor Redux Actions
Look for these console logs:
- `🔄 Activities: fetchTodayActivities pending`
- `✅ Activities: fetchTodayActivities fulfilled with X activities`
- `❌ Activities: fetchTodayActivities rejected: error`

### 3. Check DAO Layer
Look for these console logs:
- `🔍 DAO: getTodayActivities called with petId: X`
- `🔍 DAO: Auth check - user: X error: X`
- `✅ DAO: Successfully fetched X today's activities`

### 4. Verify Database Structure
Check if the `pet_activities` table has data:
```sql
SELECT * FROM pet_activities WHERE user_id = 'your-user-id' ORDER BY activity_date DESC LIMIT 5;
```

### 5. Test Date Range Logic
The date range calculation for "today's activities" might be incorrect:
```typescript
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
console.log("Date range:", { startOfDay, endOfDay });
```

## Quick Fixes

### 1. Ensure Authentication Before Fetching
```typescript
useEffect(() => {
  if (!auth.isAuthenticated || !auth.user) {
    console.log("Skipping activities fetch - not authenticated");
    return;
  }
  
  // Fetch activities only when authenticated
  dispatch(fetchTodayActivities({}));
}, [auth.isAuthenticated, auth.user, dispatch]);
```

### 2. Add Error Boundaries
```typescript
// Wrap activity-related components in error boundaries
<ErrorBoundary fallback={<Text>Activities loading failed</Text>}>
  <PetActivityCard ... />
</ErrorBoundary>
```

### 3. Implement Retry Logic
```typescript
const handleRetry = useCallback(async () => {
  try {
    const result = await dispatch(fetchTodayActivities({})).unwrap();
    console.log("Retry successful:", result);
  } catch (error) {
    console.error("Retry failed:", error);
  }
}, [dispatch]);
```

## Testing Scenarios

### 1. Fresh App Start
- Clear app data/cache
- Launch app and log in
- Check if activities are fetched

### 2. Navigation Test
- Navigate away from home screen
- Navigate back
- Check if activities are re-fetched

### 3. Pet Selection Test
- Select different pets
- Check if activities are filtered correctly

### 4. Manual Trigger Test
- Use pull-to-refresh
- Check if activities are fetched

## Common Errors and Solutions

### Error: "No user found"
**Cause**: Authentication not completed before DAO call
**Solution**: Add authentication checks in useEffect dependencies

### Error: "Invalid date range"
**Cause**: Date calculation issues with timezones
**Solution**: Use UTC dates or fix timezone handling

### Error: "Supabase query failed"
**Cause**: Database permission or RLS issues
**Solution**: Check Row Level Security policies

### Error: "Redux state not updating"
**Cause**: Reducer not handling action properly
**Solution**: Check reducer logic and action types

## Debug Component Usage

Add the `ActivitiesDebugger` component to any screen:

```typescript
import { ActivitiesDebugger } from "@/components/ActivitiesDebugger";

// In your component render
<ActivitiesDebugger />
```

This component shows:
- Current authentication status
- Activities count in state
- Loading/error states
- Test buttons for manual fetching

## Supabase Database Check

### 1. Verify Table Structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pet_activities';
```

### 2. Check Row Level Security
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'pet_activities';
```

### 3. Test Query Manually
```sql
-- Replace with actual user ID
SELECT *
FROM pet_activities
WHERE user_id = 'your-user-id'
AND activity_date >= CURRENT_DATE
AND activity_date < CURRENT_DATE + INTERVAL '1 day'
ORDER BY activity_date DESC;
```

## Performance Monitoring

### 1. Track Fetch Duration
```typescript
const startTime = Date.now();
dispatch(fetchTodayActivities({}))
  .then(() => {
    const duration = Date.now() - startTime;
    console.log(`Fetch completed in ${duration}ms`);
  });
```

### 2. Monitor Memory Usage
- Check for memory leaks in Redux state
- Ensure activities array doesn't grow indefinitely

### 3. Network Requests
- Use Network tab in browser dev tools
- Check for failed HTTP requests to Supabase

## Resolution Steps

Once debugging is complete:

1. **Remove Debug Component**
   ```typescript
   // Remove from home screen
   // <ActivitiesDebugger />
   ```

2. **Clean Up Console Logs**
   - Remove debug logs from production builds
   - Keep error logs for monitoring

3. **Add Error Handling**
   - Implement proper error states
   - Add retry mechanisms
   - Show user-friendly error messages

4. **Test Thoroughly**
   - Test all navigation scenarios
   - Test with different user accounts
   - Test with different pet configurations

## Next Steps

If activities are still not storing:

1. Check Supabase project settings
2. Verify API keys and permissions
3. Test with a minimal reproduction case
4. Check for race conditions in async operations
5. Consider implementing offline-first approach with local storage

## Monitoring and Alerts

Consider implementing:
- Error tracking (Sentry, Bugsnag)
- Performance monitoring
- User experience metrics
- Database query performance logs 