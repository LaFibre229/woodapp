import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const STATUS: Record<string, string> = {
    not_fulfilled: "In preparazione",
    partially_fulfilled: "Parzialmente evaso",
    fulfilled: "Pronto",
    partially_shipped: "Parzialmente spedito",
    shipped: "Spedito",
    partially_delivered: "Parzialmente consegnato",
    delivered: "Consegnato",
    canceled: "Annullato",
    not_paid: "Non pagato",
    awaiting: "In attesa",
    authorized: "Autorizzato",
    partially_authorized: "Parzialmente autorizzato",
    captured: "Pagato",
    partially_captured: "Acconto pagato",
    partially_refunded: "Parzialmente rimborsato",
    refunded: "Rimborsato",
    requires_action: "Azione richiesta",
  }
  const formatStatus = (str: string) => STATUS[str] ?? str.split("_").join(" ")

  return (
    <div>
      <Text>
        Abbiamo inviato la conferma dell&apos;ordine a{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Data dell&apos;ordine:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Numero ordine: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Stato ordine:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Stato pagamento:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
