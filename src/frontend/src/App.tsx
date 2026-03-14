import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import StripeSetupModal from "./components/StripeSetupModal";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import TransactionsPage from "./pages/TransactionsPage";

// ── Routes ─────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" theme="dark" />
      <ProfileSetupModal />
      <StripeSetupModal />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/catalog",
  component: CatalogPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/product/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/payment-success",
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/payment-failure",
  component: PaymentFailurePage,
});

const sellerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/seller",
  component: SellerDashboardPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/orders",
  component: OrdersPage,
});

const blogRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/blog",
  component: BlogPage,
});

const blogPostRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/blog/$id",
  component: BlogPostPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    catalogRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
    sellerRoute,
    ordersRoute,
    blogRoute,
    blogPostRoute,
    profileRoute,
    transactionsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
