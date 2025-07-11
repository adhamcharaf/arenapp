export const isPastTimeSlot = (slotTime: string | Date): boolean => {
  const now = new Date()
  const slotDate = new Date(slotTime)
  return slotDate.getTime() < now.getTime()
}

export const formatSlotTime = (time: string | Date): string => {
  return new Date(time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Abidjan',
  })
}