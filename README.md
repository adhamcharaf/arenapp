This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Paiements – Mode Test (Wave CI désactivé)

Depuis la PR _MockPayment_, l’application peut fonctionner **sans paiement réel** pour les phases de développement ou de démonstration. Le comportement est contrôlé par la variable d’environnement `NEXT_PUBLIC_PAYMENTS_ENABLED`.

### Activer / Désactiver les paiements

| Valeur | Effet |
|--------|-------|
| `true` (défaut en prod) | Flux Wave CI complet (paiements réels) |
| `false` (recommandé en dev) | _MockPayment_ : réservation confirmée automatiquement sans appel Wave CI |

Ajoutez la variable dans votre `.env` local ou utilisez `.env.example` :

```bash
# .env
NEXT_PUBLIC_PAYMENTS_ENABLED=false
```

### Que change le mode test ?

1. **UX** : Bannière orange “Mode Test – Paiements Désactivés” visible en haut du site.
2. **Parcours réservation** :
   - Le bouton indique « Réserver (mode test) ».
   - Après validation, un écran de chargement (_MockPayment_) s’affiche ~2,5 s puis la réservation est confirmée.
3. **API** : Les routes `/api/payments/wave/*` répondent `503` ou `200` et le code original Wave CI est encapsulé dans des commentaires `/* PAYMENT_DISABLED_START ... PAYMENT_DISABLED_END */`.
4. **Types / Hooks** :
   - `PaymentProvider` accepte désormais `'test'`.
   - `usePayments` court-circuite l’appel réseau lorsque les paiements sont inactifs.

### Rollback / Réactivation Wave CI

1. Définir `NEXT_PUBLIC_PAYMENTS_ENABLED=true` (ou simplement supprimer la variable – le défaut est `true`).
2. Retirer ou ignorer la bannière ; le code s’adapte automatiquement.
3. Optionnel : retirer les commentaires `// PAYMENT_DISABLED` si vous souhaitez nettoyer le code.

### Tests & qualité

- `npm run lint` et `npm run typecheck` doivent passer.
- Les suites Jest existantes couvrent toujours les hooks principaux ; lancez `npm test` pour vérifier les régressions.

> Aucune modification de schéma BD ni de webhook externe n’a été réalisée. Le retour en mode paiement réel est donc immédiat.
