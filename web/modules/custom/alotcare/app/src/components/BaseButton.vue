<template>
  <button
    type="button"
    class="btn"
    :class="['btn-' + type, size ? 'btn-' + size : '']"
    @click="click(loader)"
  >
    <span
      v-if="showLoader"
      class="icon glyphicon glyphicon-refresh glyphicon-spin"
      aria-hidden="true"
    ></span>
    <span
      v-else-if="icon"
      class="icon glyphicon"
      :class="'glyphicon-' + icon"
      aria-hidden="true"
    ></span>
    {{ label }}
  </button>
</template>

<script setup>
import { defineProps, ref, watch } from "vue";
import { useAvailabilityStore } from "../stores/availability";
const store = useAvailabilityStore();

const showLoader = ref(false);

const click = (loader) => {
  if (loader) {
    showLoader.value = true;
  }
};

watch(
  () => store.loading,
  (newValue) => {
    if (newValue == false) {
      showLoader.value = false;
    }
  }
);

defineProps({
  label: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: "default",
  },
  icon: {
    type: String,
    default: null,
  },
  size: {
    type: String,
    default: null,
  },
  loader: {
    type: Boolean,
    default: false,
  },
});
</script>
