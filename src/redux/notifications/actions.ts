import { Notification, NotificationTypes, ADD_NOTIFICATION, REMOVE_NOTIFICATION, UPDATE_NOTIFICATION, NotificationActionTypes } from './types'

export function addNotification( notification:Notification ): NotificationActionTypes {
    return {
        type: ADD_NOTIFICATION,
        notification: notification
    }
}

export function removeNotification( notificationId: number ): NotificationActionTypes {
  return {
    type: REMOVE_NOTIFICATION,
    notificationId: notificationId
  }
}

// gestion basique d'une file de notifications!

let currentNotificationId = 0;
let timeoutId:any;

export function queueNotification( dispatch:any, message:string, type:NotificationTypes, duration: number = 2000 ):Notification {
    const id = currentNotificationId++

    let notification:Notification = {
        id: id,
        message: message,
        timestamp: Date.now(),
        type: type,
    };

    dispatch( addNotification( notification ) )

    if( type === NotificationTypes.temporary ) {
        notification.duration = duration;

        timeoutId = setTimeout(() => {
            dispatch( removeNotification( id ) )
        }, notification.duration )
    }

    return notification;
}

export function updateNotification( id: number, message:string, type: NotificationTypes ){

}
