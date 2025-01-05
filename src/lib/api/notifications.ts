import { supabase } from '../supabase'
import type { Notification } from '../types'

export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error

  return data.map(notification => ({
    ...notification,
    created_at: new Date(notification.created_at)
  })) as Notification[]
}

export async function markNotificationAsRead(id: number) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteNotification(id: number) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}