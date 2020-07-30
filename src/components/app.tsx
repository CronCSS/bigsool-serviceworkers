/// <reference path="app.d.ts" />

import React, { useContext, useState, useReducer, useRef, MouseEvent } from 'react';
import './app.css';
import ProgressBar from './progressBar';
import Notifications from './notifications';
import { useDispatch } from 'react-redux'
import { addNotification, queueNotification } from '../redux/notifications/actions';
import { NotificationTypes } from '../redux/notifications/types';


export const AppContext = React.createContext<AppContextType | undefined>(undefined);

const makeCancelable = function(promise):CancelablePromise {
  let hasCanceled_:boolean = false;

  const wrappedPromise:Promise<boolean> = new Promise((resolve, reject) => {
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

const staticRessources:Array<RessourceType> = [
    { local: true, url: 'bundle.js' },
    { local: true, url: '' },
    { local: false, url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap' },
    { local: false, url: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
    { local: false, url :'https://unpkg.com/react@16.13.1/umd/react.development.js' },
    { local: false, url :'https://unpkg.com/react-dom@16.13.1/umd/react-dom.development.js' }
];

const App = ({ children }: Props) => {
    const [ offline, setOffline ] = useState<boolean>( !navigator.onLine );
    const [ photos, setPhotos ] = useState<Array<PhotoType>>([]);
    const [ cacheState, dispatch ] = useReducer(reducer, { offline: false, busy: false });

    let cancelablePromises = useRef<Array<CancelablePromise>>([]);
    let reduxDispatch = useDispatch();

    // hook called on initial mount - get pictures!
    React.useEffect(() => {
        window.addEventListener('offline', (event) => { setOffline(true); });
        window.addEventListener('online', (event) => { setOffline(false); });

        fetch('https://api.flickr.com/services/rest?api_key=f78662aec2a67e97cce984b14d2a58e6&method=flickr.photos.getPopular&user_id=113291043@N05&format=json&nojsoncallback=1&extras=owner_name,description', { method: 'GET' } ).then(
            response => {
                if( response.ok ) return response.json()
                else {
                    switch( response.status ){
                        case 401:
                        case 400:
                            break;
                    }
                }
            }
        ).then((response) =>{
            setPhotos( response.photos.photo.slice(0, 10).map((e,k) => {
                return { url: `https://farm${e.farm}.staticflickr.com/${e.server}/${e.id}_${e.secret}_z.jpg`, name: e.title, ownerName: e.ownername, description: e.description._content };
            }));
        });

        return () => { /* handle dismount */ }
    }, []);

    function reducer(state: CacheStateType, action: CacheAction): CacheStateType {
        switch (action.type) {
            case 'start':
                let promises:Array<Promise<void>> = [];

                caches.open('flickr-cache').then(function(cache) {
                    photos.forEach( (e:any,k:number) => {
                        let cp = makeCancelable( cache.add( e.url ) );
                        cp.promise.then( () => { dispatch( { type: 'progress' } ); }, () => { /* handle error/cancel */ } )
                        cancelablePromises.current.push( cp );
                    } );

                    staticRessources.forEach( (e:any,k:number) => {
                        let cp = makeCancelable( cache.add( e.url ) );
                        cp.promise.then( () => { dispatch( { type: 'progress' } ); }, () => { /* handle error/cancel */ } )
                        cancelablePromises.current.push( cp );
                    } );
                    Promise.all( cancelablePromises.current.map( ( p:CancelablePromise ) => { return p.promise } ) ).then( () => { dispatch( { type: 'finished' } ); }, () => { /* handle error/cancel */ } );
                } );
                return { offline: false, busy: true, progress: { cached: 0, total: photos.length + staticRessources.length } };
            case 'progress':
                return { offline: false, busy: true, progress: { cached: state.progress?++state.progress.cached:0, total: state.progress?state.progress.total:0 } };
            case 'finished':
                return { offline: true, busy: false, progress: state.progress };
            case 'online':
            case 'canceled':
                return { offline: false, busy: false, progress: state.progress  };
        }
    }

    function wipeCache():Promise<boolean> {
        return caches.delete('flickr-cache');
    }

    function handleClick( event:MouseEvent ):void {
        if( !cacheState.offline ) dispatch( { type: 'start' } );
        else dispatch( { type: 'online' } );
    }

    function handleCancelClick( event:MouseEvent ):void {
        cancelablePromises.current.forEach( ( p:CancelablePromise, k:number ) => { p.cancel(); } );
        //
        // wipeCache().then( ()=>{
        //     dispatch( { type: 'canceled' } );
        // } );
    }

    function handleWipeClick( event:MouseEvent ):void {
        queueNotification( reduxDispatch, 'Clearing cache...', NotificationTypes.temporary );

        caches.has('flickr-cache').then( function( hasCache:boolean ) {
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
                <div className="Content">
                    <ProgressBar progress={ cacheState.progress?((cacheState.progress.cached/cacheState.progress.total)*100):undefined } />
                    Caching data, please wait... ( { cacheState.progress!.cached } / { cacheState.progress!.total } )
                </div>
                <div className="Actions" onClick={ handleCancelClick }><button type="button">Cancel</button></div>
            </div>
            </>
        }
        <div className="App">
            <div className="Header">
                <div className="Title">Application</div>
                <div className="State">
                    <div className="Icon">
                        { !offline && <>cloud_queue</> }
                        { offline && <>cloud_off</> }
                    </div>
                </div>
            </div>

            <div className="BottomNav">
                <button type="button" className="Floating" onClick={ handleClick }>{ cacheState.offline && <><div className="Icon">wifi</div><span>Switch to Online Mode</span></> }{ !cacheState.offline && <><div className="Icon">wifi_off</div><span>Switch to Offline Mode</span></> }</button>
                <button type="button" className="Floating NoText" onClick={ handleWipeClick }><div className="Icon">delete_forever</div></button>
            </div>
            <Notifications />
            { (photos.length > 0) &&
                <div className="Photos">
                { photos.map( (e:any,k:number) =>
                    <div className="Photo" key={ k }>
                        <div className="Inner" style={{backgroundImage: `url(${e.url})`}}></div>
                        <div className="Text">
                            <div className="Title">{ e.name }</div>
                            <div className="Owner">by { e.ownerName }</div>
                            <div className="Description">{ e.description }</div>
                        </div>
                    </div>
                )}
                </div>
            }
        </div>
    </AppContext.Provider>
}

export default App;
