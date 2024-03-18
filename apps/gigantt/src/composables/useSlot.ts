import {
  Comment,
  Slot,
  Text,
  VNode,
  useSlots
} from 'vue'

export const useSlot = () => {
  const slots = useSlots()

  const hasSlotContent = (slot: Slot|undefined, slotProps = {}): boolean => {
    if (!slot) return false

    return slot(slotProps).some((vnode: VNode) => {
      if (vnode.type === Comment) return false

      if (Array.isArray(vnode.children) && !vnode.children.length) return false

      return (
        vnode.type !== Text
      || (typeof vnode.children === 'string' && vnode.children.trim() !== '')
      )
    })
  }

  const isSlotExist = (slotName: string): boolean => {
    return !!hasSlotContent(slots[slotName])
  }

  return {
    hasSlotContent,
    isSlotExist
  }
}