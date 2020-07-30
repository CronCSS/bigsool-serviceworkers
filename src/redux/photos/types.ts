export interface Photo {
    url: string
    name: string
    ownerName: string
    description: string
}

export interface PhotoState {
    photos: Photo[]
}

export const UPDATE_PHOTOS = 'UPDATE_PHOTOS'

interface UpdatePhotosAction {
    type: typeof UPDATE_PHOTOS
    photos: Array<PhotoState>
}

export type NotificationActionTypes = UpdatePhotosAction
