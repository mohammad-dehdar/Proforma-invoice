import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // بارگذاری اولیه
  useEffect(() => {
    // بررسی دسترسی به localStorage (برای SSR)
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error(`خطا در خواندن ${key} از localStorage:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // ذخیره مقدار
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // اجازه ارسال تابع
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // ارسال event سفارشی برای sync بین تب‌ها
        window.dispatchEvent(new CustomEvent('local-storage', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`خطا در نوشتن ${key} به localStorage:`, error);
    }
  }, [key, storedValue]);

  // حذف مقدار
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`خطا در حذف ${key} از localStorage:`, error);
    }
  }, [key, initialValue]);

  // Sync بین تب‌های مختلف
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('خطا در parse کردن مقدار جدید:', error);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomEvent as EventListener);
    };
  }, [key]);

  return [storedValue, setValue, removeValue, isLoading];
}