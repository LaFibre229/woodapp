import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import ProductArt, { ProductKind } from "../product-art"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  /** Illustration used when the product has no photos yet */
  kind?: ProductKind
}

const ImageGallery = ({ images, kind = "other" }: ImageGalleryProps) => {
  const photos = images.filter((i) => !!i.url)

  if (!photos.length) {
    return (
      <div className="relative aspect-[4/5] small:aspect-[5/6] w-full overflow-hidden rounded-large shadow-elevation-card-rest">
        <ProductArt kind={kind} />
      </div>
    )
  }

  return (
    <div className="-mx-6 small:mx-0 flex small:flex-col gap-3 small:gap-4 overflow-x-auto small:overflow-visible snap-x snap-mandatory no-scrollbar px-6 small:px-0">
      {photos.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-[4/5] w-[88%] small:w-full shrink-0 snap-center overflow-hidden rounded-large bg-cream-100 shadow-elevation-card-rest"
          id={image.id}
        >
          <Image
            src={image.url}
            priority={index <= 1}
            className="absolute inset-0"
            alt={`Foto del prodotto ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 90vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  )
}

export default ImageGallery
