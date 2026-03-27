'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';
import { useGetProfileQuery } from '@/lib/api/endpoints/authApi';

/**
 * Hook that ensures user profile data stays synced with Redux state.
 * This is particularly important after token refresh, which may invalidate
 * the User tag and require a fresh profile fetch.
 */
export function useAuthSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Fetch profile data when authenticated
  // The query will be skipped if not authenticated
  const { data: profileData, refetch } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
    // Don't refetch on mount/arg change - let RTK Query handle caching
    refetchOnMountOrArgChange: false,
  });

  // When profile data arrives, optionally sync with Redux if needed
  // (This is optional - getProfile query handles its own caching via RTK Query)
  useEffect(() => {
    // The profile data is automatically cached by RTK Query
    // and will be used by components that call useGetProfileQuery()
  }, [profileData]);

  return { profileData, refetch };
}
