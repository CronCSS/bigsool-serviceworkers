export enum NotificationTypes {
    static,
    temporary
}

export interface Notification {
    id: number
    message: string
    timestamp: number
    type: NotificationTypes
    duration?: number
    onCancel?: Function
}

export interface NotificationState {
    notifications: Notification[]
}

export const ADD_NOTIFICATION = 'ADD_NOTIFICATION'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'
export const UPDATE_NOTIFICATION = 'UPDATE_NOTIFICATION'

interface AddNotificationAction {
    type: typeof ADD_NOTIFICATION
    notification: Notification
}

interface RemoveNotificationAction {
    type: typeof REMOVE_NOTIFICATION
    notificationId: number
}

interface UpdateNotificationAction {
    type: typeof UPDATE_NOTIFICATION
}

export type NotificationActionTypes = AddNotificationAction | RemoveNotificationAction | UpdateNotificationAction
