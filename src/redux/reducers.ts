import { combineReducers } from 'redux'
import { notificationReducer } from './notifications/reducer'
import { photoReducer } from './photos/reducer'

export const combinedReducers = combineReducers({
  notifications: notificationReducer,
  photos: photoReducer
})

export type CombinedState = ReturnType<typeof combinedReducers>
