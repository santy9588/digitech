# DigiTech Payment Gateway Integration

## Current State
The DigiTech app is a fresh Caffeine project with a React frontend and a Motoko backend. Currently no payment gateway, product catalog, or checkout flow exists. The app uses the core-infrastructure, shadcn-ui, and build-template-react components.

## Requested Changes (Diff)

### Add
- Stripe payment gateway integration via the Caffeine `stripe` component
- Backend Motoko actor with:
  - Product/service catalog management (list, get product)
  - Order creation and tracking
  - Payment session initiation (create Stripe Checkout session)
  - Order status retrieval
- Frontend UI with:
  - Landing/home page with DigiTech branding
  - Products/services listing page
  - Individual product detail with "Buy Now" button
  - Stripe Checkout flow triggered on purchase
  - Order confirmation/success page
  - Payment history/orders page
  - Admin panel to manage products (add, edit, delete)

### Modify
- Main App routing to include all new pages

### Remove
- Nothing

## Implementation Plan
1. Select `stripe` and `authorization` Caffeine components
2. Generate Motoko backend with product catalog, order management, and Stripe payment session creation
3. Build React frontend:
   - App router with pages: Home, Products, ProductDetail, Checkout success, Orders, Admin
   - ProductCard component with Buy Now CTA
   - Stripe redirect-to-checkout integration using backend-provided session URL
   - Orders table showing payment history and statuses
   - Admin CRUD UI for managing products/services
4. Deploy
