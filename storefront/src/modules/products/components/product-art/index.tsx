import { clx } from "@medusajs/ui"

export type ProductKind = "wood" | "pellet" | "stove" | "other"

/** Guesses what a product is from its handle, title or category handles. */
export const productKind = (
  ...hints: (string | null | undefined)[]
): ProductKind => {
  const text = hints.filter(Boolean).join(" ").toLowerCase()
  if (/stuf|camin|stove/.test(text)) return "stove"
  if (/pellet/.test(text)) return "pellet"
  if (/legn|faggio|quercia|ciocch|wood/.test(text)) return "wood"
  return "other"
}

const BACKGROUNDS: Record<ProductKind, string> = {
  wood: "#EDE0CD",
  pellet: "#E6ECDD",
  stove: "#F3E3D6",
  other: "#F7F0E6",
}

/** A log end seen from the front, with growth rings. */
const LogEnd = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#6B4E38" />
    <circle cx={cx} cy={cy} r={r * 0.86} fill="#E9C99B" />
    <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke="#C9A06E" strokeWidth={2} />
    <circle cx={cx} cy={cy} r={r * 0.38} fill="none" stroke="#C9A06E" strokeWidth={2} />
    <circle cx={cx} cy={cy} r={r * 0.12} fill="#B38552" />
  </g>
)

const Wood = () => {
  const logs: [number, number][] = []
  const r = 34
  for (let row = 0; row < 4; row++) {
    const count = 4 - row
    for (let i = 0; i < count; i++) {
      logs.push([200 - (count - 1) * r + i * r * 2, 400 - row * r * 1.72])
    }
  }
  return (
    <>
      <ellipse cx="200" cy="438" rx="160" ry="14" fill="#22170F" opacity="0.12" />
      {logs.map(([x, y], i) => (
        <LogEnd key={i} cx={x} cy={y} r={r} />
      ))}
    </>
  )
}

const Pellet = () => {
  const dots: [number, number, number][] = [
    [96, 420, 20], [120, 430, -10], [292, 425, 35], [318, 414, 5], [270, 436, -25],
    [140, 440, 60], [250, 444, 15], [80, 438, -40], [332, 436, 70], [110, 412, 25],
  ]
  return (
    <>
      <ellipse cx="200" cy="442" rx="150" ry="12" fill="#22170F" opacity="0.1" />
      <path
        d="M118 150c0-14 10-22 22-22h120c12 0 22 8 22 22l14 262c1 16-10 28-26 28H130c-16 0-27-12-26-28l14-262Z"
        fill="#FDFAF5"
      />
      <path d="M140 128h120l-6-18H146l-6 18Z" fill="#DCC7AA" />
      <rect x="134" y="212" width="132" height="120" rx="10" fill="#5B7A48" />
      <path
        d="M200 238c6 10 26 20 26 42a26 26 0 0 1-52 0c0-10 6-17 11-22 1 7 4 11 8 12-2-13 3-24 7-32Z"
        fill="#E6ECDD"
      />
      <rect x="150" y="350" width="100" height="8" rx="4" fill="#DCC7AA" />
      <rect x="166" y="368" width="68" height="8" rx="4" fill="#EDE0CD" />
      {dots.map(([x, y, rot], i) => (
        <rect
          key={i}
          x={x - 9}
          y={y - 4}
          width="18"
          height="8"
          rx="4"
          fill="#B38552"
          transform={`rotate(${rot} ${x} ${y})`}
        />
      ))}
    </>
  )
}

const Stove = () => (
  <>
    <ellipse cx="200" cy="446" rx="130" ry="12" fill="#22170F" opacity="0.14" />
    <rect x="186" y="40" width="28" height="80" rx="4" fill="#35241A" />
    <rect x="110" y="112" width="180" height="300" rx="22" fill="#35241A" />
    <rect x="124" y="126" width="152" height="20" rx="8" fill="#4E3726" />
    <rect x="134" y="166" width="132" height="150" rx="14" fill="#22170F" />
    <rect x="144" y="176" width="112" height="130" rx="10" fill="#4E1F0F" />
    <path
      d="M200 196c8 16 36 30 36 62a36 36 0 0 1-72 0c0-16 9-26 16-33 1 10 5 16 10 18-3-18 4-34 10-47Z"
      fill="#E2763F"
    />
    <path
      d="M200 238c4 8 17 15 17 30a17 17 0 0 1-34 0c0-8 5-13 8-16 1 5 3 8 5 9-1-9 2-16 4-23Z"
      fill="#FADFCF"
    />
    <rect x="150" y="290" width="100" height="10" rx="5" fill="#86351A" />
    <rect x="134" y="334" width="132" height="12" rx="6" fill="#4E3726" />
    <rect x="134" y="356" width="132" height="12" rx="6" fill="#4E3726" />
    <rect x="128" y="412" width="22" height="26" rx="4" fill="#22170F" />
    <rect x="250" y="412" width="22" height="26" rx="4" fill="#22170F" />
  </>
)

const Other = () => (
  <path
    d="M200 150c14 30 70 56 70 116a70 70 0 0 1-140 0c0-34 18-52 32-66 2 20 10 32 22 36-6-40 6-66 16-86Z"
    fill="#E2763F"
  />
)

/**
 * Illustrated stand-in for product photos, so the catalogue looks finished
 * before real photos are uploaded in the admin.
 */
const ProductArt = ({
  kind,
  className,
}: {
  kind: ProductKind
  className?: string
}) => (
  <svg
    viewBox="0 0 400 500"
    preserveAspectRatio="xMidYMid slice"
    className={clx("absolute inset-0 h-full w-full", className)}
    role="img"
    aria-label="Immagine illustrativa"
  >
    <rect width="400" height="500" fill={BACKGROUNDS[kind]} />
    <circle cx="330" cy="70" r="120" fill="#FFFFFF" opacity="0.35" />
    {kind === "wood" && <Wood />}
    {kind === "pellet" && <Pellet />}
    {kind === "stove" && <Stove />}
    {kind === "other" && <Other />}
  </svg>
)

export default ProductArt
