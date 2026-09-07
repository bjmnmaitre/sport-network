# Sport Network - Platform Architecture & Vision

## Vision à 5 ans
La plateforme Sport Network vise à devenir un graphe social authentique de la pratique sportive européenne, où chaque activité sportive peut devenir :
- une progression personnelle
- une interaction sociale
- une découverte
- une conversation
- un défi
- une rencontre
- une session collective
- une opportunité d'apprentissage
- une relation avec un professionnel
- une opportunité commerciale ou communautaire

L'utilisateur doit ouvrir l'application non seulement pour enregistrer son parcours, mais parce qu'il s'y passe quelque chose pour lui.

## Principes fondamentaux

1. **L'activité sportive est le cœur du produit**
2. **La progression personnelle doit être valorisée autant que la comparaison sociale**
3. **Le social doit être authentique et progressivement construit**
4. **La rencontre entre sportifs constitue une opportunité stratégique majeure, mais elle doit être introduite progressivement**
5. **La confidentialité et la sécurité doivent être conçues dès le départ**
6. **L'architecture doit être multisport dès le départ, même si l'expérience utilisateur initiale ne couvre que quelques sports**
7. **L'IA doit d'abord fonctionner en arrière-plan puis devenir progressivement visible**
8. **La plateforme doit pouvoir évoluer d'une communauté locale française vers une plateforme européenne**
9. **Les professionnels, marques, vendeurs et autres acteurs sportifs doivent pouvoir être intégrés ultérieurement sans dégrader l'expérience des sportifs**
10. **Le produit doit être inclusif** : un débutant ne doit jamais avoir l'impression d'être inutile, un compétiteur doit pouvoir bénéficier de classements avancés.

## Sports initiaux
- running
- cycling
- fitness
- natation
- trail/randonnée (à venir rapidement)
- sports collectifs (football, basketball, volleyball, etc.) à intégrer ensuite

## Architecture requise
- **MULTISPORT NATIVE** : distinguer le modèle générique d'activité, les caractéristiques communes, les données spécifiques à chaque sport et les signaux sportifs propres à chaque discipline.
- Nécessaire de séparer clairement :
  - `ActivityPlan` : intention (ex: "Je veux courir 5 km samedi à 6h30")
  - `Activity` : activité réellement effectuée
  - La liaison entre ActivityPlan et Activity est optionnelle, pas automatique.

## Stratégie de lancement
- Commencer localement à La Rochelle (territoire expérimental initial)
- Prévoir un lancement progressif : communauté fermée / early users avant ouverture publique
- Concevoir pour une densité locale forte avant une expansion nationale puis européenne

## Structure du projet
- `backend/` : API serveur, logique métier, base de données
- `frontend/` : Application utilisateur (web/mobile)
- `docs/` : Documentation technique et produit
- `infra/` : Infrastructure as Code, déploiement, monitoring
- `scripts/` : Scripts d'utilité, déploiement, migration