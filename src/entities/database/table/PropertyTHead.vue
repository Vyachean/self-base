<script setup lang="ts">
import { computed } from 'vue';
import type {
  AnyProperty,
  PropertiesMap,
  PropertyId,
} from '../../../shared/lib/databaseDocument';
import PropertyTH from './PropertyTH.vue';
import type { Entries } from 'type-fest';

const props = defineProps<{
  properties: PropertiesMap;
  showActionsColumn?: boolean;
}>();

const propertyList = computed(() => {
  const filteredEntries: [PropertyId, AnyProperty][] = [];

  for (const [key, value] of <Entries<typeof props.properties>>(
    Object.entries(props.properties)
  )) {
    if (value !== undefined) {
      filteredEntries.push([key, value]);
    }
  }

  return filteredEntries;
});
</script>

<template>
  <thead>
    <tr>
      <th v-if="showActionsColumn" />

      <PropertyTH
        v-for="[id, property] in propertyList"
        :key="id"
        :name="property.name"
      />
    </tr>
  </thead>
</template>
