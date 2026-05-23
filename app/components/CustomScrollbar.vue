<script setup lang="ts">
// ============================================================================
// Component Definition
// ============================================================================
// This component acts as a clean wrapper to apply the global custom scrollbar
// class to any overflowed lists, sidebars, or generic content areas.
// It relies on the .custom-scrollbar utility defined in main.css
</script>

<template>
  <div class="overflow-auto scrollbar">
    <slot />
  </div>
</template>
