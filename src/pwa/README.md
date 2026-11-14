# PWA de l'ecosysteme

Les fichiers `runtime.js`, `PwaExperience.jsx`, `pwa.css` et les tests `.mjs`
sont communs aux sept applications. Seul `config.js` varie par application.
Conserver ces fichiers communs identiques lors des prochaines modifications.

- Une seule inscription du service worker, en production uniquement.
- Installation native quand le navigateur la propose ; aide Safari/iOS ou
  instructions manuelles sinon. Une fenetre standalone n'est pas une preuve
  permettant de detecter les installations dans d'autres contextes.
- Invitation automatique apres 5 secondes, y compris sur la connexion et
  l'inscription. La navigation entre pages ne remet pas ce delai a zero.
  Le bouton natif est affiche uniquement apres `beforeinstallprompt`.
  Sur Android et iOS, si cet evenement n'est pas disponible, le pop-up donne
  les instructions du navigateur, sans simuler un bouton d'installation.
  « Plus tard » differe l'invitation de 7 jours. L'aide reste accessible depuis
  les parametres ou le profil.
- Une invitation acceptee ne reapparait pas dans la meme page pendant que
  Chrome termine l'installation. Aucune invitation en mode standalone.
  Dans un onglet ordinaire, le navigateur ne permet pas de garantir qu'une
  application n'est pas deja installee : l'aide Android peut donc etre
  proposee meme si une installation existe dans un autre contexte.
- Verification au chargement par l'inscription native, au retour au premier
  plan, au retour en ligne et chaque heure si l'app est visible. Les
  verifications automatiques sont espacees d'au moins 5 minutes.
- Une nouvelle version reste en attente. Seul « Mettre a jour », puis la
  confirmation demandant de sauvegarder les saisies, autorise le rechargement
  de cette fenetre. Les autres fenetres ne se rechargent pas automatiquement.
- Aucune suppression de session, de donnees personnelles ou de caches pour
  forcer une mise a jour. Les fonctions hors ligne restent limitees aux
  contenus que chaque application met deja en cache.
- Le numero affiche est l'horodatage UTC du build charge, pas une version du
  backend. `npm run dev` n'installe pas de nouveau service worker.

## Validation locale

```sh
node --experimental-vm-modules --test src/pwa/runtime.test.mjs
npm run build
node --test src/pwa/manifest.test.mjs
npm run preview -- --host 127.0.0.1
```

Pour tester une mise a jour reelle, charger un build A via preview sur une
origine locale dediee, attendre son service worker, puis produire un build B
sans fermer la page A. Revenir au premier plan ou lancer une verification
depuis les parametres. Verifier que la page et ses saisies restent intactes
jusqu'au clic et a la confirmation. Tester egalement avec deux fenetres :
seule celle qui confirme doit se recharger.

Les anciennes versions publiees utilisaient `autoUpdate`. Leur code deja
charge ne peut pas etre modifie retroactivement : lors du premier deploiement
de cette migration, il peut etre necessaire de fermer **toutes** les fenetres
et onglets de l'application puis de la rouvrir pour adopter le nouveau cycle.

Les icones sont de vrais PNG aux dimensions declarees dans le manifeste,
issus des logos PNG ou SVG existants. Une extension `.png` sur un fichier SVG
ne suffit pas. Les variantes maskable dediees ajoutent une marge de securite
autour du logo. Le manifeste genere par Vite est la seule source distribuee.

## AppSwitcher et applications installees

Les liens restent des URL HTTPS canoniques avec `target="_blank"` et
`rel="noopener noreferrer"` : ils ne remplacent pas la page courante.
L'identite du manifeste (`id: "/"`) conserve l'identite implicite precedente
sur chaque domaine. `launch_handler: navigate-existing` reutilise une fenetre
de destination lorsque le navigateur prend en charge ce mecanisme.

Un site web ne peut pas imposer universellement l'ouverture d'une autre PWA
installee. La capture des liens depend du navigateur, du systeme et des
preferences de l'utilisateur. Ce manifeste ne suffit pas a la forcer.
Valider la capture sur de vrais appareils Android/desktop/iOS apres
deploiement ; un test dans le navigateur local ne la garantit pas.

Reference :
https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/launch_handler
