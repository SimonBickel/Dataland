<template>
  <TheContent class="relative">
    <div class="text-left mx-auto w-full content-container">
      <Breadcrumb :home="homeItem" :model="breadcrumbItems" class="p-0 mb-3" data-test="frameworkBreadcrumb" />
      <div v-if="isPending" data-test="frameworkSkeleton">
        <Skeleton width="40%" height="2.5rem" class="mb-3" />
        <Skeleton height="20rem" />
      </div>
      <Message v-else-if="isError" severity="error" data-test="frameworkError">
        <div class="flex align-items-center gap-3">
          <span>Could not load the framework.</span>
          <PrimeButton label="Retry" icon="pi pi-refresh" size="small" data-test="retryFramework" @click="refetch()" />
        </div>
      </Message>
      <Message v-else-if="parseError" severity="error">{{ parseError }}</Message>
      <div v-else-if="data">
        <h1 data-test="frameworkName" class="mb-2">{{ data.name }}</h1>
        <div class="flex gap-2 mb-3">
          <Tag severity="secondary" :value="data.framework.id" />
          <Tag
            severity="secondary"
            :value="`${dataPointCount} ${dataPointCount === 1 ? 'data point' : 'data points'}`"
          />
        </div>
        <p class="mt-0 mb-4">{{ data.businessDefinition }}</p>
        <FrameworkSearchBox
          class="mb-4"
          :specifications="[data]"
          placeholder="Search data points of this framework by name, path, ID or alias"
          @select-data-point="(entry) => selectPath(entry.path)"
        />
        <div class="grid">
          <div class="col-12 lg:col-5">
            <Card>
              <template #content>
                <Tree
                  v-model:expandedKeys="expandedKeys"
                  :value="nodes"
                  :selectionKeys="selectionKeys"
                  selectionMode="single"
                  class="framework-tree p-0 overflow-auto"
                  data-test="frameworkTree"
                  @node-select="onNodeSelect"
                >
                  <template #default="{ node }">
                    <span class="flex align-items-center gap-2">
                      <i :class="node.leaf ? 'pi pi-file' : 'pi pi-folder'" aria-hidden="true" />
                      <span class="overflow-wrap-anywhere">{{ node.label }}</span>
                      <small v-if="!node.leaf" class="text-color-secondary">({{ node.children?.length }})</small>
                    </span>
                  </template>
                </Tree>
              </template>
            </Card>
          </div>
          <div class="col-12 lg:col-7">
            <div class="sticky details-sticky">
              <Card>
                <template #content>
                  <DataPointTypeDetails
                    v-if="selectedLeaf"
                    :dataPointTypeId="selectedLeaf.dataPointTypeId"
                    :aliasExport="selectedLeaf.aliasExport"
                    :pathByTypeId="pathByTypeId"
                    @select-path="selectPath"
                  />
                  <div v-else class="text-center text-color-secondary py-5" data-test="noDataPointSelected">
                    <i class="pi pi-sitemap text-4xl mb-3" aria-hidden="true" />
                    <p class="m-0">Select a data point in the tree to see its documentation.</p>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TheContent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import Card from 'primevue/card';
import Message from 'primevue/message';
import PrimeButton from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import Tree from 'primevue/tree';
import type { MenuItem } from 'primevue/menuitem';
import type { TreeNode } from 'primevue/treenode';
import TheContent from '@/components/generics/TheContent.vue';
import DataPointTypeDetails from '@/components/resources/specification/DataPointTypeDetails.vue';
import FrameworkSearchBox from '@/components/resources/specification/FrameworkSearchBox.vue';
import { buildDataPointIndex } from '@/components/resources/specification/FrameworkSearchIndex';
import { parseFrameworkSchema, type DataPointLeafData } from '@/components/resources/specification/FrameworkSchemaTree';
import { useGetFrameworkSpecificationByIdQuery } from '@/api-queries/specification-service/framework/useGetFrameworkSpecificationByIdQuery';

const route = useRoute();
const router = useRouter();
const frameworkId = computed(() => String(route.params.frameworkId));
const { data, isPending, isError, refetch } = useGetFrameworkSpecificationByIdQuery({ frameworkId });

const expandedKeys = ref<Record<string, boolean>>({});

const parsed = computed<{ nodes: TreeNode[]; error?: string }>(() => {
  if (!data.value) return { nodes: [] };
  try {
    return { nodes: parseFrameworkSchema(data.value.schema) };
  } catch (error) {
    return { nodes: [], error: `The schema of this framework could not be read: ${(error as Error).message}` };
  }
});
const nodes = computed(() => parsed.value.nodes);
const parseError = computed(() => parsed.value.error);
const dataPoints = computed(() => (data.value ? buildDataPointIndex([data.value]) : []));
const dataPointCount = computed(() => dataPoints.value.length);
const pathByTypeId = computed(() => new Map(dataPoints.value.map((entry) => [entry.dataPointTypeId, entry.path])));

const selectedPath = computed(() => {
  const value = route.query.dataPoint;
  if (typeof value === 'string') return value;
  const typeId = route.query.dataPointTypeId;
  return typeof typeId === 'string' ? pathByTypeId.value.get(typeId) : undefined;
});
const selectedEntry = computed(() => dataPoints.value.find((entry) => entry.path === selectedPath.value));
const selectedLeaf = computed<DataPointLeafData | undefined>(() =>
  selectedEntry.value
    ? { dataPointTypeId: selectedEntry.value.dataPointTypeId, aliasExport: selectedEntry.value.aliasExport }
    : undefined
);
const selectionKeys = computed<Record<string, boolean>>(() =>
  selectedEntry.value ? { [selectedEntry.value.path]: true } : {}
);

const homeItem: MenuItem = {
  icon: 'pi pi-book',
  label: 'Frameworks',
  command: () => {
    router.push('/frameworks').catch((error) => console.error(error));
  },
};
const breadcrumbItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [{ label: data.value?.name ?? frameworkId.value }];
  if (selectedEntry.value) {
    items.push(...selectedEntry.value.path.split('.').map((part) => ({ label: part })));
  }
  return items;
});

watch(
  [selectedEntry],
  () => {
    if (!selectedEntry.value) return;
    const parts = selectedEntry.value.path.split('.');
    const keys: Record<string, boolean> = {};
    for (let i = 1; i < parts.length; i++) keys[parts.slice(0, i).join('.')] = true;
    expandedKeys.value = { ...expandedKeys.value, ...keys };
  },
  { immediate: true }
);

/**
 * Selects a data point by writing its tree path into the URL so that the selection can be shared.
 * @param path the dotted path of the data point in the framework schema
 */
function selectPath(path: string): void {
  router.push({ path: route.path, query: { dataPoint: path } }).catch((error) => console.error(error));
}

/**
 * Selects a leaf or toggles a group when a tree node is clicked.
 * @param node the clicked tree node
 */
function onNodeSelect(node: TreeNode): void {
  if (node.leaf && node.key) {
    selectPath(node.key);
  } else if (node.key) {
    expandedKeys.value = { ...expandedKeys.value, [node.key]: !expandedKeys.value[node.key] };
  }
}
</script>

<style scoped>
.content-container {
  max-width: 80rem;
}
.details-sticky {
  top: 1rem;
}
.framework-tree {
  max-height: 34rem;
}
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
.framework-tree :deep(.p-tree-node-content.p-tree-node-selected) {
  background: var(--p-primary-50);
  color: var(--p-text-color);
  box-shadow: inset 3px 0 0 var(--p-primary-color);
  font-weight: 600;
}
.framework-tree :deep(.p-tree-node-content.p-tree-node-selected .p-tree-node-icon),
.framework-tree :deep(.p-tree-node-content.p-tree-node-selected .p-tree-node-toggle-button) {
  color: var(--p-primary-color);
}
</style>
