
// This file now re-exports all admin hooks from their respective files
// to maintain backward compatibility with existing imports

// Re-export brewery admin hooks
export { 
  useBreweries,
  useUpdateBreweryVerification,
  useCreateBrewery,
  useUpdateBrewery,
  useDeleteBrewery
} from './useAdminBreweries';

// Re-export user admin hooks
export {
  useUsers,
  useUpdateUserType
} from './useAdminUsers';

// Re-export brewery claim hooks
export {
  useBreweryClaims,
  useBreweryClaimUpdate
} from './useAdminBreweryClaims';

// Re-export admin stats hook
export {
  useAdminStats
} from './useAdminStats';

// Re-export types
export type {
  BreweryData,
  UserData,
  BreweryClaim,
  AdminStats
} from '@/types/admin';
