# Digitech

## Current State

- Full-stack Stripe-integrated e-commerce app for Digitech.
- Backend: Motoko with product storage (seeded with 3 plans), order management, Stripe checkout, admin-only configuration.
- Frontend: Products page (browse + Buy Now), Orders page, Admin page (orders table + Stripe config form), Success page.
- Admin page is only visible in the navbar if the user already has admin role -- no way to navigate to it without knowing the URL.
- No product management in the admin: admins cannot add, edit, or delete products from the UI.
- Backend has no addProduct/updateProduct/deleteProduct endpoints.

## Requested Changes (Diff)

### Add
- Backend: `addProduct`, `updateProduct`, `deleteProduct` admin-only endpoints.
- Admin page: "Product Management" section to list all products with an upload/add form (name, description, price, currency) and delete per row.
- Admin page: Always show an "Admin" link/button in the navbar or a dedicated entry point so admins can navigate to the page easily after signing in.
- Products page: Products come from backend (seeded data already exists); admin-uploaded products appear immediately.

### Modify
- Admin page: Add a new "Product Management" tab/section alongside the existing orders table and Stripe config.
- Navbar: Show Admin link immediately when `isAdmin` resolves true (already done); no change needed there.
- ProductsPage: Continue to show sample products when backend returns empty, but prefer live data.

### Remove
- Nothing removed.

## Implementation Plan

1. Update Motoko backend to add `addProduct(product)`, `updateProduct(product)`, `deleteProduct(productId)` functions gated to admin role.
2. Regenerate backend.d.ts bindings.
3. Add `useAddProduct`, `useUpdateProduct`, `useDeleteProduct` mutations to `useQueries.ts`.
4. In `AdminPage.tsx`, add a "Products" section:
   - Table listing all current products with name, price, and a delete button per row.
   - "Add Product" form with fields: name, description, price (dollars), currency selector.
   - Submit creates a new product via `addProduct`.
5. Ensure Stripe config section and orders table remain intact.
6. Checkout flow: no changes needed -- already functional once Stripe key is entered.
