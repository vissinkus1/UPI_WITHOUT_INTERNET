'use client';
import { useApi } from './useApi';
import { getMeshState } from '@/lib/api';
import { POLL_INTERVAL_MESH } from '@/lib/constants';

/**
 * Hook that polls the mesh state (devices + idempotency cache size).
 */
export function useMeshState() {
  return useApi(getMeshState, POLL_INTERVAL_MESH);
}
