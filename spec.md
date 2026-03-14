# DigiTech

## Current State
DigiTech is a digital product marketplace. It has:
- Stripe-based checkout (createCheckoutSession, getStripeSessionStatus, setStripeConfiguration)
- Product catalog, cart, orders, blog, seller dashboard, buyer orders
- Authorization (admin/user/guest roles) and blob storage
- CheckoutPage using Stripe redirect-based checkout
- PaymentSuccessPage and PaymentFailurePage
- ProfilePage with Stripe configuration UI for admins

## Requested Changes (Diff)

### Add
- **Multi-gateway checkout selector** on CheckoutPage: user can choose between Stripe (card/Apple Pay/Google Pay via Stripe Payment Request API), PayPal, and a "Pay Later / Invoice" option
- **PayPal checkout flow**: redirect to PayPal-hosted checkout via Stripe's PayPal integration (since Stripe supports PayPal as a payment method in checkout sessions) -- shown as a dedicated PayPal button
- **Google Pay / Apple Pay** buttons rendered via Stripe Payment Request Button (Stripe.js) on the checkout page
- **Transaction history page** (`/transactions`) listing all orders with payment method label, status badge, amount, and date
- **Payment method badge** on orders: each order shows which payment gateway was used (Stripe Card, Google Pay, Apple Pay, PayPal)
- **Backend**: Add `paymentMethod` field to Order type (e.g. "stripe", "paypal", "googlepay", "applepay", "card")
- **Backend**: Add `createPayPalCheckoutSession` function that creates a Stripe Checkout session with PayPal payment method
- **Backend**: Update `createOrder` to accept `paymentMethod` parameter
- **Admin**: Payment gateway configuration panel on ProfilePage -- configure which gateways are enabled (Stripe card, PayPal, Google Pay, Apple Pay)
- **Gateway settings stored** in backend: `enabledGateways` list and `paypalClientId` (optional)
- **TransactionsPage**: Full transaction log, filterable by payment method and status

### Modify
- **CheckoutPage**: Replace single Stripe button with a multi-gateway payment selector panel showing available gateway options as distinct buttons
- **OrdersPage**: Show payment method badge alongside each order
- **ProfilePage (admin)**: Extend Stripe config section to include gateway toggles
- **Order type**: Add `paymentMethod` field

### Remove
- Nothing removed; all existing Stripe flows preserved

## Implementation Plan
1. Update backend `Order` type to include `paymentMethod: Text` field
2. Add `createPayPalCheckoutSession` backend function (Stripe checkout with PayPal method)
3. Add `getEnabledGateways` and `setEnabledGateways` backend functions
4. Update `createOrder` to accept `paymentMethod` parameter
5. Regenerate backend.d.ts
6. Build new CheckoutPage with multi-gateway selector (Stripe Card, Google Pay/Apple Pay via Stripe, PayPal)
7. Build TransactionsPage (`/transactions`) with filtering and status badges
8. Update OrdersPage to show payment method badges
9. Add route for `/transactions` in App.tsx
10. Update ProfilePage admin section with gateway enable/disable toggles
