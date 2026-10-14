# Pile-Poil

Le jeu de rangement Pile-Poil, prêt pour GitHub Pages. Le jeu est à la racine : l'adresse du site ouvre directement le jeu.

C'est un site statique : pas de serveur, pas de base de données et pas de build à lancer.

## Contenu

| Chemin | Rôle |
|---|---|
| `index.html` | Le jeu complet |
| `ads.js` | Toute la pub (AdSense sur le web, AdMob dans l'app Android) |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installation sur l'écran d'accueil et jeu hors ligne |
| `privacy.html` | Politique de confidentialité, à compléter (`[...]`) |
| `presentation/` | Page de présentation du jeu (facultative), sur `…/presentation/` |
| `ads.txt` | Modèle. Le vrai fichier doit être à la racine du domaine principal |
| `.nojekyll` | Fait servir les fichiers tels quels par GitHub Pages |

## À compléter

- `privacy.html` : la date, ton nom et ton email.
- `presentation/index.html`, en bas : ton adresse de contact (si tu utilises cette page).

## Mise en ligne

1. Envoie tout le contenu de ce dossier à la racine d'un dépôt GitHub `pile-poil`.
2. **Settings → Pages** : branche `main`, dossier `/ (root)`.
3. Domaine perso : CNAME `pilepoil` → `TON-PSEUDO.github.io`, puis **Custom domain** et **Enforce HTTPS**.

**Mises à jour** : remplace `index.html`, puis change `VERSION` en haut de `sw.js` (`pilepoil-v2`, `pilepoil-v3`…).

Toutes les étapes, des pubs jusqu'au Play Store, sont dans le document « Pile-Poil · marche à suivre jusqu'au Play Store ». Les textes à copier dans la Play Console sont dans `FICHE-PLAY-STORE.md`.

## Crédits

Polices : Bagel Fat One et DM Sans (Google Fonts, licence OFL). Les dessins, la musique et les sons sont générés par le code.
