import { Photo, UPDATE_PHOTOS, PhotoActionTypes } from './types'

export function updatePhotos( photos:Array<Photo> ): PhotoActionTypes {
    return {
        type: UPDATE_PHOTOS,
        photos: photos
    }
}
