<template>
  <div class="g-grid-container">
    <div
      v-for="{ label, value, width } in timeaxisUnits.lowerUnits"
      :key="label"
      class="g-grid-line"
      :style="{
        width,
        background: highlightedUnits?.includes(Number(value)) ? colors.hoverHighlight : undefined
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { config } from 'provider/index'
import { useTimeaxisUnits } from 'composables/index'

defineProps<{
  highlightedUnits?: number[]
}>()

const { colors } = config()
const { timeaxisUnits } = useTimeaxisUnits()
</script>

  <style>
  .g-grid-container {
	position: absolute;
	top: 0;
	left: 0%;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: space-between;
  }

  .g-grid-line {
	width: 1px;
	height: 100%;
	border-left: 1px solid #eaeaea;
  }
  </style>