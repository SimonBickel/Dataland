<template>
  <AutoComplete
    v-model="query"
    :suggestions="groups"
    optionLabel="label"
    optionGroupLabel="label"
    optionGroupChildren="items"
    :disabled="isLoading"
    :placeholder="isLoading ? 'Loading search index...' : placeholder"
    :completeOnFocus="false"
    :minLength="1"
    fluid
    aria-label="Search the framework documentation"
    :inputProps="{ 'aria-label': 'Search the framework documentation' }"
    data-test="frameworkSearch"
    @complete="onComplete"
    @option-select="onSelect"
  >
    <template #option="{ option }">
      <div class="flex flex-column" :data-test="option.kind === 'framework' ? 'frameworkHit' : 'dataPointHit'">
        <template v-if="option.kind === 'framework'">
          <span class="font-semibold"><i class="pi pi-book mr-2" aria-hidden="true" />{{ option.frameworkName }}</span>
          <small class="text-color-secondary overflow-wrap-anywhere">{{ option.frameworkId }}</small>
        </template>
        <template v-else>
          <span class="font-semibold"><i class="pi pi-file mr-2" aria-hidden="true" />{{ option.label }}</span>
          <small class="text-color-secondary overflow-wrap-anywhere"
            >{{ option.path }} &middot; {{ option.frameworkName }}</small
          >
        </template>
      </div>
    </template>
    <template #empty>
      <span class="p-3" data-test="noSearchHits">No matches for "{{ query }}".</span>
    </template>
  </AutoComplete>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AutoComplete, {
  type AutoCompleteCompleteEvent,
  type AutoCompleteOptionSelectEvent,
} from 'primevue/autocomplete';
import {
  buildDataPointIndex,
  searchDocumentation,
  type DataPointSearchEntry,
  type FrameworkSearchEntry,
  type SearchGroup,
} from '@/components/resources/specification/FrameworkSearchIndex';
import type { FrameworkSpecification } from '@clients/specificationservice';

const props = withDefaults(
  defineProps<{
    frameworks?: Array<{ id: string; name: string }>;
    specifications: FrameworkSpecification[];
    isLoading?: boolean;
    placeholder?: string;
  }>(),
  {
    frameworks: () => [],
    isLoading: false,
    placeholder: 'Search frameworks and data points by name, path, ID or alias',
  }
);
const emit = defineEmits<{
  selectFramework: [frameworkId: string];
  selectDataPoint: [entry: DataPointSearchEntry];
}>();

const query = ref('');
const groups = ref<SearchGroup[]>([]);
const index = computed(() => buildDataPointIndex(props.specifications));

/**
 * Computes the suggestions for the current input.
 * @param event the PrimeVue complete event
 */
function onComplete(event: AutoCompleteCompleteEvent): void {
  groups.value = searchDocumentation(event.query, props.frameworks, index.value);
}

/**
 * Forwards the selected suggestion to the parent and clears the input.
 * @param event the PrimeVue select event
 */
function onSelect(event: AutoCompleteOptionSelectEvent): void {
  const option = event.value as FrameworkSearchEntry | DataPointSearchEntry;
  query.value = '';
  if (option.kind === 'framework') emit('selectFramework', option.frameworkId);
  else emit('selectDataPoint', option);
}
</script>
