<template>
  <Panel header="Base type" toggleable collapsed data-test="dataPointBaseTypeDetails">
    <div v-if="isPending">
      <Skeleton width="50%" class="mb-2" />
      <Skeleton height="4rem" />
    </div>
    <Message v-else-if="isError" severity="error">
      <div class="flex align-items-center gap-3">
        <span>Could not load the base type.</span>
        <PrimeButton label="Retry" icon="pi pi-refresh" size="small" @click="refetch()" />
      </div>
    </Message>
    <div v-else-if="data">
      <h4 class="mt-0 mb-2">{{ data.name }}</h4>
      <p class="mt-0">{{ data.businessDefinition }}</p>
      <p><span class="font-semibold">Validated by:</span> {{ data.validatedBy }}</p>
      <p class="mb-1 font-semibold">Example</p>
      <pre class="surface-ground border-round p-3 m-0 overflow-auto">{{ JSON.stringify(data.example, null, 2) }}</pre>
      <p v-if="data.usedBy.length > 0" class="mb-0 text-color-secondary">
        Used by {{ data.usedBy.length }} data point types.
      </p>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import PrimeButton from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import { useGetDataPointBaseTypeSpecificationByIdQuery } from '@/api-queries/specification-service/data-point-base-type/useGetDataPointBaseTypeSpecificationByIdQuery';

const props = defineProps<{ dataPointBaseTypeId: string }>();

const { data, isPending, isError, refetch } = useGetDataPointBaseTypeSpecificationByIdQuery({
  dataPointBaseTypeId: () => props.dataPointBaseTypeId,
});
</script>
