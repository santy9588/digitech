# DigiTech

## Current State
DigiTech is a digital product marketplace with Stripe-based payments supporting Credit/Debit Card, Google Pay, Apple Pay, and PayPal. The CheckoutPage has a gateway selector with 4 options. ProfilePage has a Payment Configuration section with toggle switches. TransactionsPage shows orders with gateway badges.

## Requested Changes (Diff)

### Add
- PhonePe gateway option
- Google Pay (already present, keep)
- Amazon Pay gateway option
- Paytm gateway option
- PayPal (already present, keep)
- UPI (generic) gateway option
- QR Code payment option (show a mock QR code on selection)
- Credit Card (already present via Stripe)
- Debit Card (already present via Stripe)
- International Card section label
- Net Banking option
- BHIM UPI option
- Visa/Mastercard/RuPay/Amex labels under card section

### Modify
- CheckoutPage: expand gateway grid from 4 to full list organized into sections (Cards, UPI & Wallets, Buy Now Pay Later, International)
- ProfilePage: Payment Configuration toggles to include all new gateways
- TransactionsPage: gateway badges updated to cover all new methods
- Gateway selector UI: grouped layout with section headers

### Remove
- Nothing removed

## Implementation Plan
1. Update CheckoutPage to show a comprehensive, grouped payment gateway selector with sections: Cards (Credit, Debit, International), UPI & Wallets (PhonePe, Google Pay, Paytm, Amazon Pay, BHIM UPI, Generic UPI), QR Code (shows inline QR), Other (PayPal, Net Banking)
2. Add QR code display panel when QR Code is selected
3. Update ProfilePage Payment Configuration to list and toggle all new gateways
4. Update TransactionsPage badge color mapping for all new gateway types
