# Enhanced Authentication System

## Overview

The Pet Tracker App uses an enhanced authentication system built on top of Supabase Auth with automatic token management, session validation, and secure storage practices. This system provides:

- **Automatic token refresh** - Tokens are refreshed automatically before expiration
- **Session validation** - Regular checks to ensure tokens are still valid
- **Secure storage** - Uses AsyncStorage with encryption for sensitive data
- **Real-time auth state** - Listens to auth state changes across the app
- **Offline-first approach** - Works even when network is unavailable

## Architecture

### Core Components

1. **`lib/supabase.ts`** - Enhanced Supabase client with token management utilities
2. **`store/authSlice.ts`** - Redux slice for authentication state management
3. **`hooks/useAuth.ts`** - React hook providing authentication functionality
4. **App-level auth listener** - Real-time authentication state synchronization

### Key Features

#### 1. Automatic Token Management

```typescript
// Session validation with automatic refresh
const { user, session } = await validateAndRefreshSession();

// Check if session needs refresh (within 5 minutes of expiry)
if (isCloseToExpiry) {
  session = await refreshSession();
}
```

#### 2. Secure Storage Strategy

**What we store:**
- ✅ User profile data (id, email, name)
- ✅ Session tokens (handled by Supabase)

**What we DON'T store:**
- ❌ Plain text passwords
- ❌ Sensitive user data
- ❌ API keys or secrets

#### 3. Session Validation

- **On app start** - Validates existing session before proceeding
- **Periodic checks** - Every 5 minutes while app is active
- **On app resume** - Validates session when app comes to foreground
- **Before API calls** - Ensures valid session before making requests

## Usage

### Using the `useAuth` Hook

The `useAuth` hook provides a clean interface for all authentication operations:

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    login, 
    logout, 
    validateSession 
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Login successful - user will be automatically updated
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.email}!</Text>
      ) : (
        <Button onPress={handleLogin} title="Login" />
      )}
    </View>
  );
}
```

### Manual Session Validation

```typescript
// Check if current session is valid
const isValid = await validateSession();

if (!isValid) {
  // Redirect to login
  router.push('/auth');
}
```

### Authentication Flow

1. **App Launch**
   ```typescript
   // App initialization
   const { user, session } = await validateAndRefreshSession();
   
   if (user && session) {
     // User is authenticated, proceed to main app
     dispatch(setUser(userData));
   } else {
     // Redirect to login
     router.push('/auth');
   }
   ```

2. **Login Process**
   ```typescript
   // User login
   const response = await signIn(email, password);
   
   if (response.data) {
     // Store user data
     await AsyncStorage.setItem('user', JSON.stringify(userData));
     
     // Update Redux state
     dispatch(setUser(userData));
   }
   ```

3. **Auto-refresh Tokens**
   ```typescript
   // Automatic token refresh (handled by Supabase)
   supabase.auth.onAuthStateChange((event, session) => {
     if (event === 'TOKEN_REFRESHED') {
       console.log('Token refreshed successfully');
     }
   });
   ```

## Security Best Practices

### 1. Never Store Passwords

**❌ Bad Practice:**
```typescript
// DON'T DO THIS
await AsyncStorage.setItem('password', userPassword);
```

**✅ Good Practice:**
```typescript
// Use Supabase's secure token management
const { user, session } = await validateAndRefreshSession();
```

### 2. Regular Session Validation

```typescript
// Validate session periodically
useEffect(() => {
  const interval = setInterval(async () => {
    await validateSession();
  }, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(interval);
}, []);
```

### 3. Handle Network Errors Gracefully

```typescript
const handleAuthError = (error: unknown): string => {
  if (error.message.includes('Network request failed')) {
    return 'Please check your internet connection';
  }
  // Handle other specific errors...
  return 'Authentication failed';
};
```

### 4. Clear Data on Logout

```typescript
export const logout = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear stored user data
    await AsyncStorage.removeItem('user');
    
    // Clear Redux state
    dispatch(setUser(null));
  } catch (error) {
    // Handle logout errors
  }
};
```

## Error Handling

### Common Authentication Errors

1. **Network Errors**
   - Connection timeout
   - No internet connection
   - Server unavailable

2. **Authentication Errors**
   - Invalid credentials
   - Expired session
   - User not found

3. **Validation Errors**
   - Malformed email
   - Weak password
   - Account not verified

### Error Handling Strategy

```typescript
const handleAuthError = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('Network request failed')) {
    return 'Unable to connect. Please check your internet connection.';
  }
  
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  }
  
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link.';
  }
  
  return errorMessage || 'An unexpected error occurred.';
};
```

## Advanced Features

### 1. Offline Mode Support

The authentication system works offline by:
- Storing user data locally
- Validating stored sessions when network is available
- Providing graceful degradation when APIs are unavailable

### 2. Real-time Auth State

```typescript
// Listen to auth state changes
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          // Handle sign in
          break;
        case 'SIGNED_OUT':
          // Handle sign out
          break;
        case 'TOKEN_REFRESHED':
          // Handle token refresh
          break;
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### 3. Session Persistence

- Sessions persist across app restarts
- Automatic token refresh prevents re-login
- Secure storage using AsyncStorage with Supabase encryption

## Migration from Basic Auth

If upgrading from a basic authentication system:

1. **Update imports:**
   ```typescript
   // Old
   import { signIn, signOut } from '@/lib/supabase';
   
   // New
   import { useAuth } from '@/hooks/useAuth';
   ```

2. **Replace direct auth calls:**
   ```typescript
   // Old
   const response = await signIn(email, password);
   
   // New
   const { login } = useAuth();
   await login(email, password);
   ```

3. **Use session validation:**
   ```typescript
   // Add session validation to protected routes
   const { validateSession } = useAuth();
   
   useEffect(() => {
     const checkAuth = async () => {
       const isValid = await validateSession();
       if (!isValid) {
         router.push('/auth');
       }
     };
     
     checkAuth();
   }, []);
   ```

## Testing

### Unit Tests

```typescript
// Test authentication functions
describe('Authentication', () => {
  it('should validate session successfully', async () => {
    const result = await validateAndRefreshSession();
    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
  });
  
  it('should handle expired sessions', async () => {
    // Mock expired session
    const result = await validateAndRefreshSession();
    expect(result.session).toBeNull();
  });
});
```

### Integration Tests

```typescript
// Test auth flow
describe('Auth Flow', () => {
  it('should login and maintain session', async () => {
    const { login, user, isAuthenticated } = useAuth();
    
    await login('test@example.com', 'password');
    
    expect(isAuthenticated).toBe(true);
    expect(user).toBeDefined();
  });
});
```

## Performance Considerations

1. **Token Refresh Frequency**
   - Supabase handles automatic refresh
   - Manual validation every 5 minutes
   - On-demand validation for critical operations

2. **Storage Optimization**
   - Only store essential user data
   - Use efficient JSON serialization
   - Clear unused data regularly

3. **Network Optimization**
   - Batch authentication requests
   - Use background refresh
   - Handle offline scenarios gracefully

## Troubleshooting

### Common Issues

1. **Session Not Persisting**
   - Check AsyncStorage configuration
   - Verify Supabase client setup
   - Ensure auth listener is active

2. **Token Refresh Failures**
   - Check network connectivity
   - Verify Supabase project settings
   - Review error logs for specific issues

3. **Login Loops**
   - Check session validation logic
   - Verify routing configuration
   - Review auth state management

### Debug Checklist

- [ ] Supabase client properly configured
- [ ] AsyncStorage working correctly
- [ ] Auth state listener active
- [ ] Network connectivity available
- [ ] Error handling implemented
- [ ] Session validation working

## Future Enhancements

1. **Biometric Authentication**
   - Face ID / Touch ID support
   - Secure enclave storage

2. **Multi-factor Authentication**
   - SMS verification
   - Authenticator app support

3. **Social Login**
   - Google Sign-In
   - Apple Sign-In
   - Facebook Login

4. **Advanced Security**
   - Device fingerprinting
   - Suspicious activity detection
   - Account lockout policies 