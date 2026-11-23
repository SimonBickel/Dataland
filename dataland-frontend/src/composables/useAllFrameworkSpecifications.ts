import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue';
import { useGetFrameworkSpecificationsByIdsQueries } from '@/api-queries/specification-service/framework/useGetFrameworkSpecificationsByIdsQueries';
import { type FrameworkSpecification } from '@clients/specificationservice';

/**
 * Loads the specifications of several frameworks and aggregates the results.
 * @param frameworkIds the (reactive) ids of the frameworks to load
 * @returns the successfully loaded specifications and a flag that is true while any request is pending
 */
export function useAllFrameworkSpecifications(frameworkIds: MaybeRefOrGetter<Array<string>>): {
  specifications: ComputedRef<Array<FrameworkSpecification>>;
  isPending: ComputedRef<boolean>;
} {
  const queries = useGetFrameworkSpecificationsByIdsQueries({ frameworkIds: () => toValue(frameworkIds) });
  const specifications = computed(() =>
    queries.value.flatMap((query) => (query.data ? [query.data as FrameworkSpecification] : []))
  );
  const isPending = computed(() => queries.value.some((query) => query.isPending));
  return { specifications, isPending };
}
