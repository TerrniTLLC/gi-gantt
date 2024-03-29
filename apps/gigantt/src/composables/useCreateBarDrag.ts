import type { GanttBarObject, GanttChartConfig } from 'types/gantt'
import { useDayjsHelper, useTimePositionMapping } from 'composables/index'

import { config as _config } from 'provider/index'
import { ref } from 'vue'

export const useCreateBarDrag = (
  bar: GanttBarObject,
  onDrag: (e: MouseEvent, bar: GanttBarObject) => void = () => null,
  onEndDrag: (e: MouseEvent, bar: GanttBarObject) => void = () => null,
  config: GanttChartConfig = _config()
) => {
  const { barStart, barEnd, pushOnOverlap } = config

  const isDragging = ref(false)
  let cursorOffsetX = 0
  let dragCallBack: (e: MouseEvent) => void

  const { mapPositionToTime } = useTimePositionMapping(config)
  const { toDayjs } = useDayjsHelper(config)

  const initDrag = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.config.id)
    if (!barElement) {
      return
    }

    cursorOffsetX = e.clientX - (barElement.getBoundingClientRect().left || 0)
    const mousedownType = (e.target as Element).className
    switch (mousedownType) {
    case 'g-gantt-bar-handle-left':
      document.body.style.cursor = 'ew-resize'
      dragCallBack = dragByLeftHandle
      break
    case 'g-gantt-bar-handle-right':
      document.body.style.cursor = 'ew-resize'
      dragCallBack = dragByRightHandle
      break
    default:
      dragCallBack = drag
    }
    isDragging.value = true
    window.addEventListener('mousemove', dragCallBack)
    window.addEventListener('mouseup', endDrag)
  }

  const getBarElements = () => {
    const barElement = document.getElementById(bar.config.id)
    const barContainer = barElement?.closest('.g-gantt-row-bars-container')?.getBoundingClientRect()
    return { barElement, barContainer }
  }

  const drag = (e: MouseEvent) => {
    const { barElement, barContainer } = getBarElements()
    if (!barElement || !barContainer) {
      return
    }

    const barWidth = barElement.getBoundingClientRect().width
    const xStart = e.clientX - barContainer.left - cursorOffsetX
    const xEnd = xStart + barWidth
    if (isOutOfRange(xStart, xEnd)) {
      return
    }
    bar[barStart.value] = mapPositionToTime(xStart)
    bar[barEnd.value] = mapPositionToTime(xEnd)
    onDrag(e, bar)
  }

  const dragByLeftHandle = (e: MouseEvent) => {
    const { barElement, barContainer } = getBarElements()
    if (!barElement || !barContainer) {
      return
    }

    const xStart = e.clientX - barContainer.left
    const newBarStart = mapPositionToTime(xStart)
    if (toDayjs(newBarStart).isSameOrAfter(toDayjs(bar, 'end'))) {
      return
    }
    bar[barStart.value] = newBarStart
    onDrag(e, bar)
  }

  const dragByRightHandle = (e: MouseEvent) => {
    const { barElement, barContainer } = getBarElements()
    if (!barElement || !barContainer) {
      return
    }

    const xEnd = e.clientX - barContainer.left
    const newBarEnd = mapPositionToTime(xEnd)
    if (toDayjs(newBarEnd).isSameOrBefore(toDayjs(bar, 'start'))) {
      return
    }
    bar[barEnd.value] = newBarEnd
    onDrag(e, bar)
  }

  const isOutOfRange = (xStart?: number, xEnd?: number) => {
    if (!pushOnOverlap.value) {
      return false
    }
    const dragLimitLeft = bar.config.dragLimitLeft
    const dragLimitRight = bar.config.dragLimitRight

    return (
      (xStart && dragLimitLeft != null && xStart < dragLimitLeft) ||
            (xEnd && dragLimitRight != null && xEnd > dragLimitRight)
    )
  }

  const endDrag = (e: MouseEvent) => {
    isDragging.value = false
    document.body.style.cursor = ''
    window.removeEventListener('mousemove', dragCallBack)
    window.removeEventListener('mouseup', endDrag)
    onEndDrag(e, bar)
  }

  return {
    isDragging,
    initDrag
  }
}
