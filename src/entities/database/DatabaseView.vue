<script setup lang="ts">
import type {
  AnyProperty,
  DataBaseStateLatest,
  Item,
  PropertyId,
} from '../../shared/lib/databaseDocument';
import type { ItemId } from '../../shared/lib/databaseDocument/item';
import DatabaseTable from './table/DatabaseTable.vue';

defineProps<{
  databaseState: DataBaseStateLatest;
}>();

const slots = defineSlots<{
  value(props: {
    property: AnyProperty | undefined;
    propertyId: PropertyId;
    value: unknown;
  }): unknown;
  itemActions(props: { item: Item; itemId: ItemId }): unknown;
}>();
</script>

<template>
  <section class="is-flex is-overflow-auto">
    <DatabaseTable :database-state class="is-flex-grow-1">
      <template #value="{ property, propertyId, value }">
        <slot name="value" :property :property-id :value />
      </template>

      <template v-if="!!slots.itemActions" #itemActions="scope">
        <slot name="itemActions" v-bind="scope" />
      </template>
    </DatabaseTable>
  </section>
</template>
