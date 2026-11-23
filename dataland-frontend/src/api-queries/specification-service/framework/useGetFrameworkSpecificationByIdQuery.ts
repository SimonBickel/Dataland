import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import { useApiClient } from '@/utils/useApiClient';
import { frameworkSpecificationKeys } from '@/api-queries/specification-service/framework/frameworkSpecificationKeys';
import { type FrameworkSpecification } from '@clients/specificationservice';

/**
 * Query hook that loads the specification of a single framework.
 * @param params Object containing the (reactive) id of the framework.
 * @param options Additional TanStack Query options (queryKey and queryFn cannot be overridden).
 * @returns The query result containing the framework specification.
 */
export function useGetFrameworkSpecificationByIdQuery(
  params: { frameworkId: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<FrameworkSpecification, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<FrameworkSpecification, Error> {
  const apiClientProvider = useApiClient();
  return useQuery<FrameworkSpecification, Error>({
    queryKey: computed(() => frameworkSpecificationKeys.byId(toValue(params.frameworkId))),
    queryFn: async () => {
      const frameworkId = toValue(params.frameworkId);
      if (!frameworkId) throw new Error('frameworkId is undefined');
      const response =
        await apiClientProvider.apiClients.specificationController.getFrameworkSpecification(frameworkId);
      return response.data;
    },
    enabled: computed(() => !!toValue(params.frameworkId)),
    ...options,
  });
}
