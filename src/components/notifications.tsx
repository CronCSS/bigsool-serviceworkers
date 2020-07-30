import React from 'react'
import { useSelector } from 'react-redux'
import { AppContext } from './app'
import { NotificationState, Notification } from '../redux/notifications/types'
import './notifications.css'

const Notifications = () => {
    const selectNotifications = (state: NotificationState ) => state.notifications
    const notifications = useSelector( selectNotifications );

    return <div className="Notifications">
    { notifications.map( (v:Notification, key:number) =>
        <div className="Notification" key={ v.id }>
            <div className="Message">{ v.message }</div>
            <div className="Action"></div>
        </div>
    ) }
    </div>
}

export default Notifications
