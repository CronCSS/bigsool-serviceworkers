// <reference no-default-lib="true"/>
/// <reference lib="es2015" />
/// <reference lib="webworker" />
/// <reference path="serviceworker.d.ts" />

interface Window extends ServiceWorkerGlobalScope {}

self.addEventListener('install', (event:Event) => {
  console.log(event);
});

self.addEventListener('message', (event:MessageEvent) => {
   console.log(`The client sent me a message: ${event.data}`);
});

self.addEventListener('fetch', (event:any) => {
    event.respondWith(
         fetch(event.request).catch( () => {
             return caches.match(event.request);
         } )
    );
});

export {}
