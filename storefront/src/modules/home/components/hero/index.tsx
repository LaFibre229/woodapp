import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Placeholder look until the branding layer (name, logo, colours, photos)
const Hero = () => {
  return (
    <div className="min-h-[60vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="content-container flex flex-col justify-center items-center text-center py-24 gap-6">
        <Heading level="h1" className="text-4xl leading-tight text-ui-fg-base font-normal max-w-2xl">
          Legna da ardere, pellet e stufe consegnati a casa tua
        </Heading>
        <Text className="text-lg text-ui-fg-subtle max-w-xl">
          Dal sacco al camion completo, in tutta Italia. Prezzi riservati per pizzerie,
          panifici, hotel e rivenditori.
        </Text>
        <div className="flex flex-wrap gap-3 justify-center">
          <LocalizedClientLink href="/categories/pellet">
            <Button size="large">Scopri il pellet</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/categories/legna-da-ardere">
            <Button size="large" variant="secondary">
              Legna da ardere
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/preventivo">
            <Button size="large" variant="transparent">
              Preventivo camion
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
