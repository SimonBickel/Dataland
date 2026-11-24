<template>
  <router-link
    v-if="hasDocumentation"
    :to="documentationUrl"
    class="inline-flex align-items-center ml-2 info-link"
    data-test="dataPointDocumentationLink"
    aria-label="Open framework documentation of this data point"
    v-tooltip.top="{ value: explanation }"
    @click.stop
  >
    <em class="material-icons" aria-hidden="true">info</em>
  </router-link>
  <em
    v-else
    class="material-icons inline-flex align-items-center ml-2 cursor-help"
    aria-hidden="true"
    v-tooltip.top="{ value: explanation }"
    >info</em
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tooltip from 'primevue/tooltip';
import { useListFrameworkSpecificationsQuery } from '@/api-queries/specification-service/framework/useListFrameworkSpecificationsQuery';

const props = defineProps<{
  frameworkId?: string;
  dataPointTypeId?: string;
  explanation: string;
}>();

const vTooltip = Tooltip;
const { data: frameworkSpecifications } = useListFrameworkSpecificationsQuery();

const hasDocumentation = computed(
  () =>
    !!props.frameworkId &&
    !!props.dataPointTypeId &&
    (frameworkSpecifications.value ?? []).some((specification) => specification.framework.id === props.frameworkId)
);
const documentationUrl = computed(
  () =>
    `/frameworks/${encodeURIComponent(props.frameworkId ?? '')}?dataPointTypeId=${encodeURIComponent(props.dataPointTypeId ?? '')}`
);
</script>

<style scoped>
.info-link {
  color: inherit;
  cursor: pointer;
}
</style>
