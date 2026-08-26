'use client';
import { useApi } from './useApi';
import { getAccounts } from '@/lib/api';
import { POLL_INTERVAL_ACCOUNTS } from '@/lib/constants';

/**
 * Hook that polls account balances.
 */
export function useAccounts() {
  return useApi(getAccounts, POLL_INTERVAL_ACCOUNTS);
}
