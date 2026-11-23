import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">Attenzione:</span> solo per test,
      nessun addebito reale.
    </Badge>
  )
}

export default PaymentTest
