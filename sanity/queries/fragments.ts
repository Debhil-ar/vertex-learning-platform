// Reused GROQ projections. Interpolated into the queries in this folder.

export const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  },
  alt
`

export const instructorSummaryFragment = /* groq */ `
  _id,
  name,
  "slug": slug.current,
  photo { ${imageFragment} }
`

export const categorySummaryFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current
`

// Plain-text projection of a Portable Text field, for text-matching a field
// that GROQ's match operator cannot search directly. Generic + a literal
// return type (rather than a plain `string` param) so a query that
// interpolates this keeps its exact string-literal type — required for
// TypeGen's `sanityFetch<QueryString>` lookup to resolve the result type
// instead of widening to `{}`.
export function plainTextFragment<Field extends string>(
  field: Field,
): `"${Field}PlainText": pt::text(${Field})` {
  return `"${field}PlainText": pt::text(${field})`
}
