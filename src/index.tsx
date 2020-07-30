import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import { Provider, shallowEqual, useSelector, useDispatch } from 'react-redux'
import { createStore } from 'redux'
import { notificationReducer } from './redux/notifications/reducer'

const store = createStore( notificationReducer );

ReactDOM.render(
    <Provider store={ store }>
        <App />
    </Provider>,
    document.getElementById('app')
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js', { scope: '/' }).then(function(reg) {
    console.log('Registration succeeded. Scope is ' + reg.scope);
  }).catch(function(error) {
    console.log('Registration failed with ' + error);
  });
};
