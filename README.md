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

## Préambule

L'application doit être mise en ligne sur un serveur sécurisé (HTTPS) ou depuis l'URL par défaut ( localhost )
L'interface est optimsiée *mobile-first* mais s'adapte aux plus grandes résolutions. ( mediaqueries très basiques )

## Fonctionnement du service worker

Lors de l'enregistrement du service worker, le **shell** de l'application et ses dépendances sont mises en cache. ( React/ReactDOM, police icone, image *fallback*, index.html )
Le service worker intercepte ensuite les requêtes provenant de l'application pour permettre un mode offline.

Afin d'uniformiser le comportement du **memory-cache** des navigateurs modernes, les images sont téléchargées avec un paramètre *cache-deny* (timestamp). ( ce cache est solicité **avant** les services workers dans la majorité des cas et entraine un affichage des images hors ligne, même si elles ne sont pas stockées via l'API Cache )

L'utilisation du paramètre **cache: no-cache** n'a pas le même effet sur tous les navigateurs et n'est donc pas une solution viable pour ce test applicatif.

Lors de la mise en cache manuelle ( bouton **Cache data** ) les images sont stockées sans le paramètre *cache-deny*.
Si le service worker ne parvient pas a télécharger une image ( navigateur hors ligne ), le paramètre *cache-deny* est supprimé des URL avant l'opération *cache.match*

Si l'image demandée n'est pas en cache, l'image *fallback* est renvoyée au navigateur.

## Fonctionnement de l'application

L'application télécharge une liste de 16 images depuis l'API Flickr et stocke immédiatement ces informations en cache pour que le service worker puisse les *servir* en mode hors ligne.
Ces images sont ensuite téléchargées par l'application.

En cliquant sur le bouton **Cache data**, toutes les images sont stockées en cache. Une interface minimaliste affiche la progression de la mise en cache.

Un système de notifications affiche également des informations relative a la connectivité et aux opérations effectuées.

Pour tester le comportement des images de remplacements / *fallback* on peut simplement re-visiter le site en mode hors ligne sans avoir mis en cache les images.
