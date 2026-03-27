'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  setCredentials,
  initializeAuth,
} from '@/stores/slices/authSlice';
import { useGetProfileQuery } from '@/lib/api/endpoints/authApi';

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  // Fetch fresh profile data when authenticated
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Initialize auth from localStorage on mount (for F5 refresh)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedAuth = localStorage.getItem('puzkit3d_auth_user');
    if (savedAuth && !currentUser) {
      try {
        const user = JSON.parse(savedAuth);
        dispatch(initializeAuth({ user }));
      } catch (e) {
        console.warn('Failed to restore auth from localStorage');
      }
    }
  }, [dispatch, currentUser]);

  // Sync profile data to Redux when it arrives (e.g., after token refresh)
  useEffect(() => {
    if (profileData && isAuthenticated) {
      // Only update if profile data is newer or missing fields in Redux
      if (profileData.firstName || profileData.lastName) {
        dispatch(
          setCredentials({
            user: profileData,
          })
        );
        // Also update localStorage for next F5
        localStorage.setItem('puzkit3d_auth_user', JSON.stringify(profileData));
      }
    }
  }, [profileData, isAuthenticated, dispatch]);

  return <>{children}</>;
}
