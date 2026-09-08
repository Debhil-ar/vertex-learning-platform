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
// that GROQ's match operator cannot search directly.
export const plainTextFragment = (field: string) =>
  `"${field}PlainText": pt::text(${field})`
