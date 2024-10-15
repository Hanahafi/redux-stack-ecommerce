import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';

export function useAuthToken() {
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
}
