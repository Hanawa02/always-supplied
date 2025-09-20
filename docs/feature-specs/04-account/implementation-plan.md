# Implementation Plan: Cloud Storage and Information Sharing

## Overview

This feature adds cloud storage, user authentication, and building sharing capabilities using Supabase as the backend service.

## Technical Stack

- **Backend**: Supabase (Database, Auth, Real-time)
- **Authentication**: Supabase Auth with Google OAuth
- **Real-time Sync**: Supabase Real-time subscriptions
- **Conflict Resolution**: Latest timestamp wins

## Database Schema

### New Tables

1. **users** (extends Supabase auth.users)
   - Additional user profile fields

2. **cloud_buildings**
   - Synced version of supplied buildings in the cloud
   - owner_id, created_at, updated_at, etc.

3. **cloud_supply_items**
   - Synced version of supply items in the cloud
   - building_id reference, created_at, updated_at, etc.

4. **cloud_buying_items**
   - Synced version of buying items in the cloud
   - building_id reference, created_at, updated_at, etc.

5. **building_members**
   - building_id, user_id, role (owner/member), share_code, joined_at

6. **building_shares**
   - share_code, building_id, created_by, expires_at, max_uses, used_count

## Implementation Steps

### Phase 1: Setup and Configuration

- [ ] **Step 1.1**: Setup Supabase configuration and environment variables
- [ ] **Step 1.2**: Install Supabase client dependencies
- [ ] **Step 1.3**: Create Supabase migration files for database schema
- [ ] **Step 1.4**: Setup Supabase client configuration and types

### Phase 2: Authentication System

- [ ] **Step 2.1**: Create authentication composables and services
- [ ] **Step 2.2**: Implement login page (/auth/login)
- [ ] **Step 2.3**: Implement registration page (/auth/register)
- [ ] **Step 2.4**: Add Google OAuth integration
- [ ] **Step 2.5**: Add authentication state management and route guards

### Phase 3: Account Management

- [ ] **Step 3.1**: Create account page (/account) with profile management
- [ ] **Step 3.2**: Implement logout functionality
- [ ] **Step 3.3**: Add account deletion and data export options

### Phase 4: Cloud Sync Infrastructure

- [ ] **Step 4.1**: Create cloud storage services (buildings, supply items, buying items)
- [ ] **Step 4.2**: Implement data migration from local to cloud storage
- [ ] **Step 4.3**: Add conflict resolution and merge logic
- [ ] **Step 4.4**: Create offline queue system for pending changes

### Phase 5: Real-time Synchronization

- [ ] **Step 5.1**: Setup Supabase real-time subscriptions
- [ ] **Step 5.2**: Implement real-time sync for buildings
- [ ] **Step 5.3**: Implement real-time sync for supply and buying items
- [ ] **Step 5.4**: Add sync status indicators and global toast notifications

### Phase 6: Building Sharing System

- [ ] **Step 6.1**: Create share code generation and validation system
- [ ] **Step 6.2**: Implement building sharing interface in /buildings/manage
- [ ] **Step 6.3**: Add member management (add/remove members, transfer ownership)
- [ ] **Step 6.4**: Create join building via share code functionality

### Phase 7: UI/UX Enhancements

- [ ] **Step 7.1**: Update navigation to include auth and account links
- [ ] **Step 7.2**: Add cloud/offline indicators to building cards
- [ ] **Step 7.3**: Create loading states for sync operations
- [ ] **Step 7.4**: Add user avatars and profile indicators

### Phase 8: Permission System

- [ ] **Step 8.1**: Implement role-based permissions (owner vs member)
- [ ] **Step 8.2**: Update building deletion/editing to respect permissions
- [ ] **Step 8.3**: Add permission indicators in UI

### Phase 9: Offline Support

- [ ] **Step 9.1**: Enhance offline detection and handling
- [ ] **Step 9.2**: Implement change queue for offline operations
- [ ] **Step 9.3**: Add automatic sync when coming back online
- [ ] **Step 9.4**: Handle edge cases (user switches accounts offline, etc.)

### Phase 10: Testing and Documentation

- [ ] **Step 10.1**: Add unit tests for all new services and composables
- [ ] **Step 10.2**: Create E2E tests for authentication flows
- [ ] **Step 10.3**: Add E2E tests for sharing and collaboration features
- [ ] **Step 10.4**: Create E2E tests for offline/online scenarios
- [ ] **Step 10.5**: Update documentation and setup instructions

## New Routes

- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/account` - Account settings and profile management
- `/buildings/manage/:id` - Building management, sharing, and member management

## New Components

- `AuthForm.vue` - Reusable auth form component
- `GoogleLoginButton.vue` - Google OAuth login button
- `AccountProfile.vue` - User profile display and editing
- `BuildingShareDialog.vue` - Share building modal
- `MemberManagement.vue` - Manage building members
- `SyncStatusIndicator.vue` - Global sync status display
- `OfflineIndicator.vue` - Offline status indicator
- `ShareCodeInput.vue` - Join building via code input

## New Composables

- `use_auth()` - Authentication state and methods
- `useCloudSync()` - Cloud synchronization management
- `useBuildingSharing()` - Building sharing functionality
- `useOfflineQueue()` - Offline change queue management
- `useSyncStatus()` - Sync status tracking

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Migration Strategy

1. **Automatic Detection**: Check if user has local data when logging in
2. **Conflict Check**: Compare local and cloud data timestamps
3. **Merge UI**: Show merge dialog only if conflicts exist
4. **Background Sync**: Migrate non-conflicting data automatically
5. **Fallback**: Use latest timestamp if no user input on conflicts

## Sync Status States

- **Synced** ✅ - All data is synchronized
- **Syncing** 🔄 - Currently synchronizing changes
- **Offline** 📵 - No internet connection, changes queued
- **Error** ❌ - Sync error occurred, manual intervention needed
- **Conflicts** ⚠️ - Merge conflicts require user resolution

## Success Criteria

- Users can create accounts and login with Google
- Local data is preserved and migrated to cloud
- Real-time sync works across multiple devices/users
- Sharing buildings via codes works seamlessly
- App functions fully offline with sync when online
- All operations respect user permissions (owner/member)
- E2E tests cover all major user flows
