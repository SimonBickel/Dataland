<template>
  <TheContent class="relative">
    <div class="text-left mx-auto w-full content-container">
      <h1 data-test="frameworksHeadline" class="mb-2">Framework documentation</h1>
      <p class="mt-0 mb-4 text-color-secondary">
        Explore the frameworks, data points and data point types available on Dataland.
      </p>
      <FrameworkSearchBox
        class="mb-5"
        :frameworks="frameworkList"
        :specifications="specifications"
        :isLoading="isPending || isLoadingSpecifications"
        @select-framework="openFramework"
        @select-data-point="openDataPoint"
      />
      <div v-if="isPending" class="grid" data-test="frameworkSkeletons">
        <div v-for="n in 3" :key="n" class="col-12 md:col-6 lg:col-4"><Skeleton height="10rem" /></div>
      </div>
      <Message v-else-if="isError" severity="error" data-test="frameworksError">
        <div class="flex align-items-center gap-3">
          <span>Could not load the frameworks.</span>
          <PrimeButton label="Retry" icon="pi pi-refresh" size="small" data-test="retryFrameworks" @click="refetch()" />
        </div>
      </Message>
      <Message v-else-if="frameworkList.length === 0" severity="info" data-test="noFrameworks">
        No frameworks are available yet.
      </Message>
      <div v-else class="grid" data-test="frameworkCards">
        <div v-for="framework in frameworkList" :key="framework.id" class="col-12 md:col-6 lg:col-4">
          <FrameworkCard
            :frameworkId="framework.id"
            :name="framework.name"
            :businessDefinition="detailsById.get(framework.id)?.businessDefinition"
            :dataPointCount="countsById.get(framework.id)"
          />
        </div>
      </div>
    </div>
  </TheContent>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Message from 'primevue/message';
import PrimeButton from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import TheContent from '@/components/generics/TheContent.vue';
import FrameworkCard from '@/components/resources/specification/FrameworkCard.vue';
import FrameworkSearchBox from '@/components/resources/specification/FrameworkSearchBox.vue';
import {
  buildDataPointIndex,
  type DataPointSearchEntry,
} from '@/components/resources/specification/FrameworkSearchIndex';
import { useListFrameworkSpecificationsQuery } from '@/api-queries/specification-service/framework/useListFrameworkSpecificationsQuery';
import { useAllFrameworkSpecifications } from '@/composables/useAllFrameworkSpecifications';

const router = useRouter();
const { data, isPending, isError, refetch } = useListFrameworkSpecificationsQuery();
const frameworkList = computed(() => (data.value ?? []).map((item) => ({ id: item.framework.id, name: item.name })));
const { specifications, isPending: isLoadingSpecifications } = useAllFrameworkSpecifications(() =>
  frameworkList.value.map((framework) => framework.id)
);
const detailsById = computed(() => new Map(specifications.value.map((spec) => [spec.framework.id, spec])));
const countsById = computed(() => {
  const counts = new Map<string, number>();
  buildDataPointIndex(specifications.value).forEach((entry) =>
    counts.set(entry.frameworkId, (counts.get(entry.frameworkId) ?? 0) + 1)
  );
  return counts;
});

/**
 * Navigates to the documentation page of a framework.
 * @param frameworkId the id of the framework
 */
function openFramework(frameworkId: string): void {
  router.push(`/frameworks/${frameworkId}`).catch((error) => console.error(error));
}

/**
 * Navigates to a data point inside the documentation page of its framework.
 * @param entry the selected search hit
 */
function openDataPoint(entry: DataPointSearchEntry): void {
  router
    .push({ path: `/frameworks/${entry.frameworkId}`, query: { dataPoint: entry.path } })
    .catch((error) => console.error(error));
}
</script>

<style scoped>
.content-container {
  max-width: 72rem;
}
</style>
