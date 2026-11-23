<template>
  <div data-test="dataPointTypeDetails">
    <div v-if="isPending" data-test="dataPointSkeleton">
      <Skeleton width="60%" height="2rem" class="mb-3" />
      <Skeleton height="5rem" />
    </div>
    <Message v-else-if="isError" severity="error">
      <div class="flex align-items-center gap-3">
        <span>Could not load the data point type.</span>
        <PrimeButton label="Retry" icon="pi pi-refresh" size="small" @click="refetch()" />
      </div>
    </Message>
    <div v-else-if="data" class="overflow-wrap-anywhere">
      <h2 class="mt-0 mb-2">{{ data.name }}</h2>
      <div class="flex align-items-center gap-2 mb-3">
        <code data-test="dataPointTypeId" class="overflow-wrap-anywhere">{{ data.dataPointType.id }}</code>
        <PrimeButton
          icon="pi pi-copy"
          text
          rounded
          size="small"
          aria-label="Copy data point type ID"
          data-test="copyId"
          @click="copyId"
        />
        <small v-if="copied" class="text-color-secondary">Copied</small>
      </div>
      <div class="flex flex-wrap gap-2 mb-3">
        <Tag severity="info" :value="`Base type: ${data.dataPointBaseType.id}`" />
        <Tag v-if="aliasExport" severity="secondary" :value="`Alias: ${aliasExport}`" />
        <Tag v-for="constraint in data.constraints ?? []" :key="constraint" severity="warn" :value="constraint" />
      </div>
      <p class="mt-0">{{ data.businessDefinition }}</p>
      <div v-if="data.calculationRules.length > 0" class="mb-3">
        <h4 class="mb-2">Calculation rules</h4>
        <ul class="m-0 pl-4">
          <li v-for="(rule, index) in data.calculationRules" :key="index">
            {{ rule.calculationMethod }} of
            <template v-for="(input, inputIndex) in rule.inputs" :key="input">
              <a
                v-if="pathByTypeId?.get(input)"
                href="#"
                data-test="calculationInputLink"
                @click.prevent="emit('selectPath', pathByTypeId.get(input) ?? '')"
                >{{ input }}</a
              >
              <span v-else>{{ input }}</span><span v-if="inputIndex < rule.inputs.length - 1">, </span>
            </template>
          </li>
        </ul>
      </div>
      <div v-if="data.usedBy.length > 0" class="mb-3">
        <h4 class="mb-2">Used by frameworks</h4>
        <div class="flex flex-wrap gap-2">
          <router-link v-for="framework in data.usedBy" :key="framework.id" :to="`/frameworks/${framework.id}`">
            <Tag :value="framework.id" icon="pi pi-book" />
          </router-link>
        </div>
      </div>
      <DataPointBaseTypeDetails :dataPointBaseTypeId="data.dataPointBaseType.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Message from 'primevue/message';
import PrimeButton from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import DataPointBaseTypeDetails from '@/components/resources/specification/DataPointBaseTypeDetails.vue';
import { useGetDataPointTypeSpecificationByIdQuery } from '@/api-queries/specification-service/data-point-type/useGetDataPointTypeSpecificationByIdQuery';

const props = defineProps<{
  dataPointTypeId: string;
  aliasExport?: string | null;
  pathByTypeId?: Map<string, string>;
}>();
const emit = defineEmits<{ selectPath: [path: string] }>();

const { data, isPending, isError, refetch } = useGetDataPointTypeSpecificationByIdQuery({
  dataPointTypeId: () => props.dataPointTypeId,
});

const copied = ref(false);

/**
 * Copies the data point type id to the clipboard and shows a short confirmation.
 */
function copyId(): void {
  navigator.clipboard
    .writeText(props.dataPointTypeId)
    .then(() => {
      copied.value = true;
      setTimeout(() => (copied.value = false), 1500);
    })
    .catch((error) => console.error(error));
}
</script>
