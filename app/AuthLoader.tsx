'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../store/slices/authSlice';
import axios from 'axios';

export function AuthLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('AuthLoader - Stored token:', storedToken);
      if (storedToken) {
        dispatch(setToken(storedToken));
        document.cookie = `token=${storedToken}; path=/; max-age=86400; samesite=strict; secure`;
        try {
          const response = await axios.get('/api/user', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          console.log('AuthLoader - User data response:', response.data);
          if (response.data.user) {
            dispatch(setUser(response.data.user));
            console.log('AuthLoader - User data set in Redux store');
          }
        } catch (error) {
          console.error('AuthLoader - Failed to fetch user data:', error);
          localStorage.removeItem('token');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          dispatch(setToken(null));
        }
      } else {
        console.log('AuthLoader - No token found in localStorage');
      }
    };

    loadAuth();
  }, [dispatch]);

  return null;
}
