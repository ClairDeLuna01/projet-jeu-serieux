# SUPER VIDEO GAME COMPANY CEO SIMULATOR DELUXE: ADVANCED EDITION
### Un jeu pour notre projet de cours de jeu sérieux
### Par: Arthur Chateauneuf, Valentin Noyé, Luna Bossu
## Sommaire
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Game Design Document](#game-design-document)
4. [Comment jouer](#comment-jouer)
5. [Crédits](#crédits)

## Introduction
Super Video Game Company CEO Simulator Deluxe: Advanced Edition est un jeu de simulation de gestion d'entreprise. Vous incarnez le PDG d'une entreprise de jeux vidéo et devez prendre des décisions pour la faire prospérer. Le jeu critique le monde du travail et la culture d'entreprise, particulièrement dans l'industrie du jeu vidéo. Pour réussir vous devrez gérer vos employés (s'assurer qu'ils crunchent bien), prendre des décisions financières (comme investir dans des lootboxes) et gérer votre réputation (en faisant des déclarations publiques controversées).

## Installation
Le jeu est disponible en ligne sur [mon site web](https://clairdeluna.pythonanywhere.com/jeu-serieux).
Si vous souhaitez l'installer localement, vous pouvez cloner ce dépôt et exécuter `yarn`, suivi de `yarn start` pour lancer un serveur de développement ou `yarn build` pour compiler un fichier main.js qui marchera avec index.html. Pour ce faire il faut évidemment avoir [Node.js](https://nodejs.org/en/) installé.

## Game Design Document
Notre GDD est disponible en ligne: [GDD](https://docs.google.com/document/d/1aXlrnzjD2YZFMAvCfQEzBobJiXjt3Kz4udyKSdOWKBQ/edit?usp=sharing)

## Comment jouer
Dans le jeu vous avez 3 ressources a gérer:
- Les employés
- Les actionnaires
- La perception publique

Il faut maintenir ces ressources (représentés sous forme d'icones en haut de l'écran, plus ou moins remplies) vers le millieu. Si elles tombes a 0 ou si elles sont maximisées, vous risquez un game over! 
Vous avez aussi une quatrième ressource, votre "parachute doré", il s'agit de votre score. Le but du jeu est d'avoir le meilleur score possible a la fin de la partie.
Lorsque vos ressources atteignent le bas ou le haut de la jauge, ce n'est pas le game over instantané, vous aurez une seule chance de les remonter en jouant a un mini-jeu. Si vous échouez, c'est le game over!

Le jeu est basé sur des événements aléatoires qui se produisent dans votre entreprise. Vous devrez prendre des décisions pour gérer ces événements.
Vous pouvez choisir entre 2 options a chaque événement, chaque option affectant vos ressources différemment.
Vous pouvez voir l'impact de vos choix sur vos ressources grace a des petits points qui apparaissent au dessus des icones de ressources. Cependant ces points n'indiquent pas si la ressource va augmenter ou diminuer ni de combien, a vous de deviner en fonction du choix!
Pour choisir une option, il faut faire glisser la carte vers le coté qui correspond a l'option choisie. Pour voir les options il faut commencer a faire glisser sans relacher.

Le jeu comporte aussi des mini-jeux qui vous permettent de remonter vos ressources si elles sont trop basses ou trop hautes. 
Les deux mini-jeux sont:
- Un mini-jeu de lettre ou il faut compléter une lettre d'excuse a trou en choisissant les mots corrects
- Un mini-jeu de dactylo ou il faut taper un texte qui correspond a un discours, en restant au dessus d'une certaine vitesse pour réussir

## Crédits
### Programmation
- Luna Bossu
### Histoire et design des événements
- Arthur Chateauneuf
- Valentin Noyé
- Luna Bossu
### Design graphique
- Arthur Chateauneuf
- Luna Bossu
### Game Design
- Arthur Chateauneuf
- Valentin Noyé
- Luna Bossu
### GDD
- Valentin Noyé
### Musique
- [Horthy Kristóf - Midnight](https://soundcloud.com/krist-f-horthy/midnightlo-fi-hip-hop-beatfree-creative-commons-license-free-download)
- [ANtarcticbreeze- After Sunset](https://soundcloud.com/musicformedia-1/antarcticbreeze-after-sunset-lofi-creative-commons-music)
- [HIPEG - Waiting The Sun](https://soundcloud.com/creativecommonshub/hipeg-waiting-the-sun)
- [RomanSenykMusic - Dreamy LoFi](https://soundcloud.com/romansenykmusic/dreamy-lofi)
### SFX
- [Zapsplat](https://www.zapsplat.com/)
