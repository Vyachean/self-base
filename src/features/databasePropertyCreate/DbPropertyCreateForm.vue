<script setup lang="ts">
import { ref } from 'vue';
import {
  ALL_TYPE_PROPERTIES,
  type PropertyType,
} from '../../shared/lib/databaseDocument/property/property';
import type { PropertyId } from '../../shared/lib/databaseDocument';
import type { CFRDocument } from '../../shared/lib/cfrDocument';
import { createDatabaseDocument } from '../../shared/lib/databaseDocument/createDatabaseDocument';

const stateName = ref<string>();

const stateType = ref<PropertyType>();

const emit = defineEmits<{
  created: [propertyId: PropertyId];
  canceled: [];
}>();

const props = defineProps<{
  cfrDocument: CFRDocument;
}>();

const onSubmit = () => {
  if (stateName.value?.length && stateType.value) {
    const { addProperty } = createDatabaseDocument(props.cfrDocument);

    const propertyId = addProperty({
      name: stateName.value,
      type: stateType.value,
    });

    emit('created', propertyId);
  }
};

const onClickCancel = () => {
  stateName.value = undefined;
  stateType.value = undefined;
  emit('canceled');
};

const propertyTypeList = Object.values(ALL_TYPE_PROPERTIES);
</script>

<template>
  <form
    class="block-spacing is-flex is-flex-direction-column"
    @submit.prevent="onSubmit"
  >
    <div class="field">
      <label class="label">Property name</label>

      <div class="control">
        <input
          v-model="stateName"
          class="input"
          type="text"
          placeholder="name"
        />
      </div>
    </div>

    <div class="field">
      <label class="label">Property type</label>

      <div class="select">
        <select v-model="stateType">
          <option disabled />

          <option v-for="propertyType in propertyTypeList" :key="propertyType">
            {{ propertyType }}
          </option>
        </select>
      </div>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <button class="button" type="submit">Create</button>
      </div>

      <div class="control">
        <button class="button" type="button" @click="onClickCancel">
          Cancel
        </button>
      </div>
    </div>
  </form>
</template>
