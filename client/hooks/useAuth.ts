import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/lib/query-client';

const USER_KEY = '@campusvibe_user';

type User = {
  id: string;
  deviceId: string;
  createdAt: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateDeviceId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const authenticate = useCallback(async () => {
    try {
      let storedUser = null;
      
      if (Platform.OS === 'web') {
        const stored = localStorage.getItem(USER_KEY);
        storedUser = stored ? JSON.parse(stored) : null;
      } else {
        const stored = await AsyncStorage.getItem(USER_KEY);
        storedUser = stored ? JSON.parse(stored) : null;
      }

      if (storedUser) {
        setUser(storedUser);
        setIsLoading(false);
        return storedUser;
      }

      const deviceId = generateDeviceId();
      const res = await apiRequest('POST', '/api/auth', { deviceId });
      const data = await res.json();

      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      setUser(data.user);
      setIsLoading(false);
      return data.user;
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return { user, isLoading, authenticate };
}
