import { Photo, PhotoState, PhotoActionTypes, UPDATE_PHOTOS } from './types'

const initialState: PhotoState = {
    photos: []
}

export function photoReducer( state:PhotoState = initialState, action: PhotoActionTypes ): PhotoState {
    switch (action.type) {
        case UPDATE_PHOTOS:
            return {
                photos: action.photos
            }
        default:
            return state
    }
}
