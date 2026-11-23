<template>
  <router-link
    :to="`/frameworks/${frameworkId}`"
    class="block h-full no-underline text-color framework-card"
    :data-test="`frameworkCard-${frameworkId}`"
  >
    <Card class="h-full">
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span class="overflow-wrap-anywhere">{{ name }}</span>
          <i class="pi pi-arrow-right text-color-secondary" aria-hidden="true" />
        </div>
      </template>
      <template #subtitle>{{ frameworkId }}</template>
      <template #content>
        <p class="line-clamp m-0">{{ businessDefinition }}</p>
      </template>
      <template #footer>
        <Tag
          v-if="dataPointCount !== undefined"
          severity="secondary"
          :value="`${dataPointCount} ${dataPointCount === 1 ? 'data point' : 'data points'}`"
        />
      </template>
    </Card>
  </router-link>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Tag from 'primevue/tag';

defineProps<{ frameworkId: string; name: string; businessDefinition?: string; dataPointCount?: number }>();
</script>

<style scoped>
.framework-card:hover :deep(.p-card),
.framework-card:focus-visible :deep(.p-card) {
  box-shadow: var(--p-overlay-popover-shadow, 0 4px 14px rgb(0 0 0 / 15%));
}
.framework-card:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
