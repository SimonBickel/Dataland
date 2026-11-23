import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import { useApiClient } from '@/utils/useApiClient';
import { dataPointTypeSpecificationKeys } from '@/api-queries/specification-service/data-point-type/dataPointTypeSpecificationKeys';
import { type DataPointTypeSpecification } from '@clients/specificationservice';

/**
 * Query hook that loads the specification of a single data point type.
 * @param params Object containing the (reactive) id of the data point type.
 * @param options Additional TanStack Query options (queryKey and queryFn cannot be overridden).
 * @returns The query result containing the data point type specification.
 */
export function useGetDataPointTypeSpecificationByIdQuery(
  params: { dataPointTypeId: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<DataPointTypeSpecification, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<DataPointTypeSpecification, Error> {
  const apiClientProvider = useApiClient();
  return useQuery<DataPointTypeSpecification, Error>({
    queryKey: computed(() => dataPointTypeSpecificationKeys.byId(toValue(params.dataPointTypeId))),
    queryFn: async () => {
      const dataPointTypeId = toValue(params.dataPointTypeId);
      if (!dataPointTypeId) throw new Error('dataPointTypeId is undefined');
      const response =
        await apiClientProvider.apiClients.specificationController.getDataPointTypeSpecification(dataPointTypeId);
      return response.data;
    },
    enabled: computed(() => !!toValue(params.dataPointTypeId)),
    ...options,
  });
}
