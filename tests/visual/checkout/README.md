# Checkout visual baselines (Figma Pages 22–38)

Source frames: `material/figma-checkout/` (logical canvas **1440px**).

## Capture checklist

| Route | Figma | Notes |
|---|---|---|
| `/cart` | 22–23 | Pricing modal open/closed; pallet sidebar |
| `/cart/address` | 26–27, 29–32 | Address book, map, SA/intl forms |
| `/warehouses/bt-warehouse-01-riyadh` | 28 | Pickup detail |
| `/cart/shipping` | 33 | Local shipping + AI panel |
| `/cart/payment` | 34, 36–37 | Card / COD / wire (no Apple Pay) |

## How to capture

1. Start local Odoo, Redis, API (`:3001`), web (`:3000`).
2. Set viewport width to **1440**.
3. Optional: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for live map; otherwise stub map UI is used.
4. Promo codes for totals: `WELCOME10`, `SAVE50`.
5. Save PNGs into this folder named `p22-cart.png`, `p26-address.png`, etc.

Excluded by plan: Apple Pay (35), B2B verification docs (24–25).
