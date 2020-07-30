import {
    Notification,
    NotificationState,
    NotificationActionTypes,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION
} from './types'

const initialState: NotificationState = {
    notifications: []
}

export function notificationReducer( state = initialState, action: NotificationActionTypes ): NotificationState {
    switch (action.type) {
        case ADD_NOTIFICATION:
            return {
                notifications: [...state.notifications, action.notification ]
            }
        case REMOVE_NOTIFICATION:
            return {
                notifications: state.notifications.filter(
                    notification => notification.id !== action.notificationId
                )
            }
        default:
            return state
    }
}
