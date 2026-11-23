import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import { useApiClient } from '@/utils/useApiClient';
import { dataPointBaseTypeSpecificationKeys } from '@/api-queries/specification-service/data-point-base-type/dataPointBaseTypeSpecificationKeys';
import { type DataPointBaseTypeSpecification } from '@clients/specificationservice';

/**
 * Query hook that loads the specification of a single data point base type.
 * @param params Object containing the (reactive) id of the data point base type.
 * @param options Additional TanStack Query options (queryKey and queryFn cannot be overridden).
 * @returns The query result containing the data point base type specification.
 */
export function useGetDataPointBaseTypeSpecificationByIdQuery(
  params: { dataPointBaseTypeId: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<DataPointBaseTypeSpecification, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<DataPointBaseTypeSpecification, Error> {
  const apiClientProvider = useApiClient();
  return useQuery<DataPointBaseTypeSpecification, Error>({
    queryKey: computed(() => dataPointBaseTypeSpecificationKeys.byId(toValue(params.dataPointBaseTypeId))),
    queryFn: async () => {
      const dataPointBaseTypeId = toValue(params.dataPointBaseTypeId);
      if (!dataPointBaseTypeId) throw new Error('dataPointBaseTypeId is undefined');
      const response =
        await apiClientProvider.apiClients.specificationController.getDataPointBaseType(dataPointBaseTypeId);
      return response.data;
    },
    enabled: computed(() => !!toValue(params.dataPointBaseTypeId)),
    ...options,
  });
}
