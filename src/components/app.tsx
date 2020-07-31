/// <reference path="app.d.ts" />

import React, { useContext, useState, useReducer, useRef, MouseEvent } from 'react';
import './app.css';
import ProgressBar from './progressBar';
import Notifications from './notifications';
import { useDispatch } from 'react-redux'
import { addNotification, queueNotification } from '../redux/notifications/actions';
import { NotificationTypes } from '../redux/notifications/types';

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

const makeCancelable = function(promise:Promise<any>):CancelablePromise {
  let hasCanceled_:boolean = false;

  const wrappedPromise:Promise<any> = new Promise((resolve, reject) => {
    promise.then((val) =>
      hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
    );
    promise.catch((error) =>
      hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });
  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

enum CacheStateEnum {
    none,
    started,
    progress,
    cached,
    finished,
    error
}

const App = ({ children }: Props) => {
    const [ offline, setOffline ] = useState<boolean>( !navigator.onLine );
    const [ photos, setPhotos ] = useState<Array<PhotoType>>([]);
    const [ cacheState, dispatch ] = useReducer(reducer, { busy: false, state: CacheStateEnum.none } );
    const [ timestamp, setTimestamp ] = useState<number>( new Date().getTime() );

    let cancelablePromises = useRef<Array<CancelablePromise>>([]);
    let reduxDispatch = useDispatch();

    React.useEffect(() => {
        window.addEventListener('offline', () => { setOffline(true); });
        window.addEventListener('online', () => { setOffline(false); });

        fetch('https://api.flickr.com/services/rest?api_key=f78662aec2a67e97cce984b14d2a58e6&method=flickr.photos.getPopular&user_id=113291043@N05&format=json&nojsoncallback=1&extras=owner_name,description', { method: 'GET', cache: "no-store" } ).then(
            response => {
                if( response.ok ) {
                    caches.open('app-cache').then(function(cache) {
                        cache.add( 'https://api.flickr.com/services/rest?api_key=f78662aec2a67e97cce984b14d2a58e6&method=flickr.photos.getPopular&user_id=113291043@N05&format=json&nojsoncallback=1&extras=owner_name,description');
                    });
                    return response.json();
                }
                else {
                    switch( response.status ){
                        case 401:
                        case 400:
                            break;
                    }
                }
            }
        ).then((response) =>{
            setPhotos( response.photos.photo.slice(0, 16).map((e:any,k) => {
                return { url: `https://farm${e.farm}.staticflickr.com/${e.server}/${e.id}_${e.secret}_z.jpg`, name: e.title, ownerName: e.ownername, description: e.description._content };
            }));
        }).catch( () => { });

        return () => { /* handle dismount */ }
    }, []);

    React.useEffect(()=>{
        if( offline ){
            queueNotification( reduxDispatch, 'Your browser is offline.', NotificationTypes.temporary );
        }
        else {
            queueNotification( reduxDispatch, 'Your browser is online.', NotificationTypes.temporary );
        }
    },[offline]);

    function reducer(state: CacheStateType, action: CacheAction): CacheStateType {
        switch (action.type) {
            case 'start':
                return { busy: true, state: CacheStateEnum.none, progress: { cached: 0, total: photos.length } };
            case 'progress':
                return { busy: true, state: CacheStateEnum.progress, progress: { cached: state.progress?++state.progress.cached:0, total: state.progress?state.progress.total:0 } };
            case 'cached':
                return { busy: true, state: CacheStateEnum.cached, progress: state.progress };
            case 'finished':
                return { busy: false, state: CacheStateEnum.finished, progress: state.progress };
            case 'error':
                return { busy: true, state: CacheStateEnum.error, progress: state.progress };
            case 'canceled':
                return { busy: false, state: CacheStateEnum.none, progress: state.progress  };
        }
    }

    function wipeCache():Promise<boolean> {
        return caches.delete('flickr-cache');
    }

    function handleClick():void {
        cancelablePromises.current = [];
        caches.open('flickr-cache').then(function(cache) {
            photos.forEach( (e:any) => {
                let cp = makeCancelable( cache.add( e.url ) );
                cp.promise.then( () => { dispatch( { type: 'progress' } ); } );
                // cp.promise.catch( (error:TypeError) => { console.log( error )} );
                cancelablePromises.current.push( cp );
            } );

            Promise.all( cancelablePromises.current.map( ( p:CancelablePromise ) => { return p.promise } ) )
            .then( () => { dispatch( { type: 'cached' } ); } )
            .catch( () => { dispatch( { type: 'error' } ); } );
        } );
        dispatch( { type: 'start' } );
    }

    function handleCancelClick( event:MouseEvent ):void {
        cancelablePromises.current.forEach( ( p:CancelablePromise, k:number ) => { p.cancel(); } );
        dispatch( { type: 'canceled' } );
    }

    function handleCloseClick(){
        dispatch( { type: 'finished' } );
    }

    function handleWipeClick( event:MouseEvent ):void {
        // queueNotification( reduxDispatch, 'Clearing cache...', NotificationTypes.temporary );

        caches.has('flickr-cache').then( ( hasCache:boolean ) => {
            if( hasCache ) {
                wipeCache().then( () => {
                    queueNotification( reduxDispatch, 'Cache cleared!', NotificationTypes.temporary );
                }).catch( ()=> {
                    queueNotification( reduxDispatch, 'Cache could not be cleared.', NotificationTypes.temporary );
                });
            }
            else queueNotification( reduxDispatch, 'Cache is empty and could not be wiped.', NotificationTypes.temporary );
        }).catch(()=>{

        });
    }

    return <AppContext.Provider value={{ offline, setOffline }}>
        { ( cacheState.busy ) &&
            <>
            <div className="ModalBackground"></div>
            <div className="Modal">
                { (cacheState.state === CacheStateEnum.cached ) &&
                    <>
                    <div className="Content">
                    <ProgressBar progress={ 100 } />
                        Caching complete!<br/>Application will now work offline.
                        </div>
                    <div className="Actions" onClick={ handleCloseClick }><button type="button">Close</button></div>
                    </>
                }
                { (cacheState.state === CacheStateEnum.error ) &&
                    <>
                    <div className="Content">
                    <ProgressBar progress={ 0 } />
                        An error happened during cache!<br/>Please check your internet connectivity.
                        </div>
                    <div className="Actions" onClick={ handleCloseClick }><button type="button">Close</button></div>
                    </>
                }
                { ( ( cacheState.state === CacheStateEnum.none ) || ( cacheState.state === CacheStateEnum.started ) ) &&
                    <>
                    <div className="Content">
                        <ProgressBar progress={ 0 } />
                        Caching data, please wait...
                    </div>
                    <div className="Actions" onClick={ handleCloseClick }><button type="button">Close</button></div>
                    </>
                }
                { (cacheState.state === CacheStateEnum.progress ) &&
                    <>
                    <div className="Content">
                        <ProgressBar progress={ cacheState.progress?((cacheState.progress.cached/cacheState.progress.total)*100):undefined } />
                        Caching data, please wait... ( { cacheState.progress!.cached } / { cacheState.progress!.total } )
                    </div>
                    <div className="Actions" onClick={ handleCancelClick }><button type="button">Cancel</button></div>
                    </>
                }
            </div>
            </>
        }
        <div className="App">
            <div className="Header">
                <div className="Title">Application</div>
                <div className="State">
                    <div className="Icon">
                        { !offline && <>wifi</> }
                        { offline && <>wifi_off</> }
                    </div>
                </div>
            </div>
            <div className="BottomNav">
                <button type="button" className="Floating" onClick={ handleClick }><div className="Icon">cached</div><span>Cache data</span></button>
                <button type="button" className="Floating NoText" onClick={ handleWipeClick }><div className="Icon">delete_forever</div></button>
            </div>
            <Notifications />
            { (photos.length > 0) &&
                <div className="Photos">
                { photos.map( (e:any,k:number) =>
                    <div className="Photo" key={ k }>
                        <div className="Card">
                            <div className="Inner" style={{backgroundImage: `url(${ e.url }?cache-deny=${ timestamp })`}}></div>
                            <div className="Text">
                                <div className="Title">{ e.name }</div>
                                <div className="Owner">by { e.ownerName }</div>
                                <div className="Description">{ e.description }</div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            }
        </div>
    </AppContext.Provider>
}

export default App;
