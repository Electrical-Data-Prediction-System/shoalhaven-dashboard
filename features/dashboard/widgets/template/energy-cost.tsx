import { IoWalletSharp } from "react-icons/io5"
import { StatCard } from "./stat-card"

export default function EnergyCost() {
  return (
    <StatCard
      value="$2,473 KWH"
      icon={IoWalletSharp}
      trendValue="-3.48%"
      trendPositive
    />

  )
}
