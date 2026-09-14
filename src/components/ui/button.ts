import { cva, type VariantProps } from 'class-variance-authority';

/**
 * The site is plain Astro; this module only supplies the shared button class
 * recipe.
 *
 * `buttonVariants()` concatenates, it does not tailwind-merge. Passing a
 * `className` that fights a variant's own colour leaves both classes on the
 * element and the variant usually wins, so add a variant rather than
 * overriding one from a call site.
 *
 * `inverse` is for the grounds that are dark in both themes (the hero
 * gradient, the footer, the announcement bar): it uses the footer token pair,
 * which stays light-on-dark whichever theme is active.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border font-sans font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        primary:
          'border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover',
        secondary:
          'border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground',
        ghost:
          'border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-primary',
        inverse:
          'border-footer-foreground bg-footer-foreground text-footer hover:border-accent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 gap-1.5 px-4 text-sm has-[>svg]:px-3.5',
        md: 'h-11 px-6 text-[0.9375rem] has-[>svg]:px-5',
        lg: 'h-13 px-8 text-base has-[>svg]:px-7',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export { buttonVariants, type VariantProps };
