interface RessourceType {
    url: string
    local: boolean
}

interface CancelablePromise {
    promise: Promise<unknown>
    cancel: any
}

interface CacheStateProgressType {
    cached: number
    total: number
}

interface CacheStateType {
    offline: boolean
    busy: boolean
    progress?: CacheStateProgressType
}

interface AppContextType {
  offline: boolean
  setOffline: (value: boolean) => void
}

interface PhotoType {
    url: string
    name: string
    ownerName: string
    description: string
}

type CacheAction = | { type: 'start' } | { type: 'progress' } | { type: 'finished' } | { type: 'canceled' } | { type: 'online' };

interface Props {
  children?: React.ReactNode
}
