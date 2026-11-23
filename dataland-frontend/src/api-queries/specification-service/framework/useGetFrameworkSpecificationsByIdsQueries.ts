import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { useQueries, type QueryObserverResult } from '@tanstack/vue-query';
import { useApiClient } from '@/utils/useApiClient';
import { frameworkSpecificationKeys } from '@/api-queries/specification-service/framework/frameworkSpecificationKeys';
import { type FrameworkSpecification } from '@clients/specificationservice';

/**
 * Query hook that runs the "get framework specification" request for several framework ids in parallel. It uses the
 * same query keys as useGetFrameworkSpecificationByIdQuery, so results are shared via the query cache.
 * @param params Object containing the (reactive) ids of the frameworks.
 * @returns The raw list of query results, one per framework id.
 */
export function useGetFrameworkSpecificationsByIdsQueries(params: {
  frameworkIds: MaybeRefOrGetter<Array<string>>;
}): Readonly<Ref<Array<QueryObserverResult<FrameworkSpecification, Error>>>> {
  const apiClientProvider = useApiClient();
  return useQueries({
    queries: computed(() =>
      toValue(params.frameworkIds).map((frameworkId) => ({
        queryKey: frameworkSpecificationKeys.byId(frameworkId),
        queryFn: async (): Promise<FrameworkSpecification> => {
          const response =
            await apiClientProvider.apiClients.specificationController.getFrameworkSpecification(frameworkId);
          return response.data;
        },
      }))
    ),
  });
}
