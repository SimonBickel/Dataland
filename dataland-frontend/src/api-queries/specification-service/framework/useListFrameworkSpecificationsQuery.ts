import { computed } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import { useApiClient } from '@/utils/useApiClient';
import { frameworkSpecificationKeys } from '@/api-queries/specification-service/framework/frameworkSpecificationKeys';
import { type SimpleFrameworkSpecification } from '@clients/specificationservice';

/**
 * Query hook that lists all framework specifications known to the specification service.
 * @param options Additional TanStack Query options (queryKey and queryFn cannot be overridden).
 * @returns The query result containing the list of simple framework specifications.
 */
export function useListFrameworkSpecificationsQuery(
  options: Omit<UseQueryOptions<Array<SimpleFrameworkSpecification>, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<Array<SimpleFrameworkSpecification>, Error> {
  const apiClientProvider = useApiClient();
  return useQuery<Array<SimpleFrameworkSpecification>, Error>({
    queryKey: computed(() => frameworkSpecificationKeys.list()),
    queryFn: async () => {
      const response = await apiClientProvider.apiClients.specificationController.listFrameworkSpecifications();
      return response.data;
    },
    ...options,
  });
}
