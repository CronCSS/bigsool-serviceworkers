# bigsool-serviceworkers
Application réalisée avec Typescript, Webpack et React/Redux

## Installation

```bash
npm install # installe les dépendances
```

## Commandes

```bash
npm run start # démarre le serveur de développement sur http://localhost:8087/
npm run build # génère un bundle de production dans /public
```

## Fonctionnement

Lors de l'enregistrement du service worker, le **shell** de l'application et ses dépendances sont mises en cache. ( React/ReactDOM, police icone, image *fallback*, index.html )
Le service worker intercepte ensuite les requêtes provenant de l'application pour permettre un mode offline.

Afin d'uniformiser le comportement du **memory-cache** des navigateurs modernes, les images sont téléchargées avec un paramètre *cache-deny* (timestamp). ( ce cache est solicité **avant** les services workers dans la majorité des cas et entraine un affichage des images hors ligne, même si elles ne sont pas stockées via l'API Cache )

L'utilisation du paramètre **cache: no-cache** n'a pas le même effet sur tous les navigateurs et n'est donc pas une solution viable pour ce test applicatif.

Lors de la mise en cache manuelle ( bouton **Cache data** ) les images sont stockées sans le paramètre *cache-deny*.
Si le service worker ne parvient pas a télécharger une image ( navigateur hors ligne ), le paramètre *cache-deny* est supprimé des URL avant l'opération *cache.match*
