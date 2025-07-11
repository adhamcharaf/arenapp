/*
  Custom global type declarations for JSX elements.
  This prevents "JSX element implicitly has type 'any'" linter noise in
  plain TS files that render JSX without importing React types explicitly.
*/

import type React from 'react'

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface IntrinsicElements {
      // Accept any tag with any props in order to minimise friction.
      // Specific component libraries provide stricter typing via their own declarations.
      [elemName: string]: any
    }
  }
}

export {}