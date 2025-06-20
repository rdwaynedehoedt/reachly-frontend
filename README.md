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

## Tailwind CSS Setup

This project is pre-configured with [Tailwind CSS](https://tailwindcss.com/):

- **Installation:** Tailwind CSS and its PostCSS plugin are installed as dev dependencies.
- **Configuration:**
  - Tailwind is referenced in `postcss.config.mjs` via the `@tailwindcss/postcss` plugin.
  - Tailwind's base styles are imported in `src/app/globals.css` using `@import "tailwindcss";`.
- **Note:** The Tailwind config file (`tailwind.config.js` or `tailwind.config.ts`) is currently missing. If you need to customize Tailwind (themes, plugins, etc.), create it with:

```bash
npx tailwindcss init --ts
```

For more details, see the [Tailwind CSS documentation](https://tailwindcss.com/docs/configuration).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
