import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import { Provider, shallowEqual, useSelector, useDispatch } from 'react-redux'
import { createStore } from 'redux'
import { notificationReducer } from './redux/notifications/reducer'
import './fonts.css'

const store = createStore( notificationReducer );

ReactDOM.render(
    <Provider store={ store }>
        <App />
    </Provider>,
    document.getElementById('app')
);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js', { scope: '/' } ).then( ( registration:ServiceWorkerRegistration ) => {
        console.log( `Service Worker registered. Scope : ${ registration.scope }` );
    }).catch(function(error) {
        console.log( `Service Worker registration failed with ${ error }` );
    });
};
