import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import ProductArt, { ProductKind } from "../product-art"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  /** Picks the illustration shown when the product has no photo */
  kind?: ProductKind
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  kind = "other",
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-0 bg-cream-100 shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-200",
        className,
        {
          "aspect-[4/5]": isFeatured || (size !== "square" && size !== "small"),
          "aspect-[1/1]": size === "square" || (size === "small" && !isFeatured),
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      {initialImage ? (
        <Image
          src={initialImage}
          alt="Foto del prodotto"
          className="absolute inset-0 object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          draggable={false}
          quality={60}
          sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          fill
        />
      ) : (
        <ProductArt
          kind={kind}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
    </Container>
  )
}

export default Thumbnail
