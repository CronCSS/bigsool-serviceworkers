// <reference no-default-lib="true"/>
/// <reference lib="es2015" />
/// <reference lib="webworker" />
/// <reference path="serviceworker.d.ts" />

// interface Window extends ServiceWorkerGlobalScope {}

interface RessourceType {
    url: string
    local: boolean
}

declare var serviceWorkerOption

const staticRessources:Array<RessourceType> = [
    { local: true, url: 'bundle.js' },
    { local: true, url: '/' },
    { local: true, url: 'assets/default_image.jpg' },
    { local: false, url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap' },
    { local: false, url: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
    { local: false, url: 'https://fonts.gstatic.com/s/opensans/v17/mem5YaGs126MiZpBA-UN7rgOUuhp.woff2' },
    { local: false, url: 'https://fonts.gstatic.com/s/opensans/v17/mem5YaGs126MiZpBA-UN_r8OUuhp.woff2' },
    { local: false, url: 'https://fonts.gstatic.com/s/materialicons/v54/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2' }
];

if( process.env.NODE_ENV === "development" ){
    staticRessources.push( { local: false, url :'https://unpkg.com/react@16/umd/react.development.js' } );
    staticRessources.push( { local: false, url :'https://unpkg.com/react-dom@16/umd/react-dom.development.js' } );
}

self.addEventListener('install', (event:any) => {
    event.waitUntil(
        caches.open( 'app-cache').then(function(cache:Cache) {
            return cache.addAll( staticRessources.map( (e:RessourceType) => { return e.url } ) )
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
	return self.clients.claim();
});

self.addEventListener('fetch', (event:any) => {
    let flickrRegexp: RegExp = /https:\/\/farm([0-9]+).staticflickr.com\/([0-9]+)\/([0-9]+)_([a-zA-Z0-9]+)_z.jpg/;

    event.respondWith( fetch( event.request ).catch( () => {
        // On intercepte les requêtes vers les CDN flickr pour gérer les demandes de l'application
        // La logique est toujours "Network first", avec un fallback vers une image par défaut lorsque ni le réseau, ni le cache n'est en mesure de fournir l'image demandées
        // La donnée 'event.request.destination' est utilisé pour différencier les "fetch" provenants du browser de ceux pronvenants d'une opération "cache.add"
        // On peut ainsi éviter de fournir des images en cache lors d'une demande de mise en cache a partir de l'application. En d'autres termes, on envoit une réponse vide/timeout (code 408) si le fetch initial échoue suite a un "cache.add".

        if( event.request.url.match(flickrRegexp) ) {
            if(event.request.destination==="image") {
                return caches.match( event.request ).then( (match:Response | undefined) => {
                    if(match===undefined) return caches.match( 'assets/default_image.jpg' );
                    else return match;
                }).catch(()=>{
                    return caches.match( 'assets/default_image.jpg' );
                });
            }
            else {
                return new Response("Synthetic Reponse", {"status" : 408, "headers" : {"Content-Type" : "text/plain"} } );
            }
        }

        return caches.match( event.request ).then( (match:Response | undefined) => {
            if(match===undefined) return new Response("Synthetic Reponse", {"status" : 408, "headers" : {"Content-Type" : "text/plain"} } );
            else return match;
        });
    }));
});

export {}
