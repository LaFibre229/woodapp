import { PROVINCES } from "@lib/util/italy"
import NativeSelect, { NativeSelectProps } from "@modules/common/components/native-select"

/** Italian province picker (stores the two-letter sigla, e.g. MI). */
export default function ProvinceSelect({ value, ...props }: NativeSelectProps) {
  const v = typeof value === "string" ? value.toUpperCase() : value
  return (
    <NativeSelect placeholder="Provincia" value={v ?? ""} {...props}>
      {PROVINCES.map(([code, name]) => (
        <option key={code} value={code}>
          {name} ({code})
        </option>
      ))}
    </NativeSelect>
  )
}
