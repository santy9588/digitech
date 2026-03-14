/**
 * DigiTech Backend Service
 * Currently uses in-memory mock state.
 * Structured to swap real ICP canister calls when backend is ready.
 */

export type ProductCategory =
  | "Subscription"
  | "Software"
  | "Analytics"
  | "Storage"
  | "API"
  | "Marketing";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  features: string[];
  popular?: boolean;
}

export type OrderStatus = "pending" | "paid" | "failed";

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  userId?: string;
}

// ── In-memory state ──────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    name: "DigiTech Pro Plan",
    description:
      "Full-featured professional subscription with priority support, advanced analytics, and unlimited API calls. Perfect for growing businesses.",
    price: 29.99,
    category: "Subscription",
    imageUrl: "/assets/generated/product-pro-plan.dim_400x300.jpg",
    features: [
      "Unlimited API calls",
      "Priority support 24/7",
      "Advanced analytics dashboard",
      "Custom integrations",
      "Team collaboration tools",
    ],
    popular: true,
  },
  {
    id: "prod_002",
    name: "Website Builder Kit",
    description:
      "Professional drag-and-drop website builder with 200+ templates, SEO tools, and e-commerce capabilities. Launch your site today.",
    price: 49.99,
    category: "Software",
    imageUrl: "/assets/generated/product-website-builder.dim_400x300.jpg",
    features: [
      "200+ premium templates",
      "Drag-and-drop editor",
      "Built-in SEO tools",
      "E-commerce support",
      "Custom domain support",
    ],
  },
  {
    id: "prod_003",
    name: "SEO Analytics Pack",
    description:
      "Comprehensive SEO analytics suite with keyword tracking, competitor analysis, backlink monitoring, and automated reporting.",
    price: 19.99,
    category: "Analytics",
    imageUrl: "/assets/generated/product-seo-analytics.dim_400x300.jpg",
    features: [
      "Keyword rank tracking",
      "Competitor analysis",
      "Backlink monitoring",
      "Automated weekly reports",
      "Google Search Console integration",
    ],
  },
  {
    id: "prod_004",
    name: "Cloud Storage 100GB",
    description:
      "Secure encrypted cloud storage with 100GB capacity, automatic sync across devices, file versioning, and team sharing.",
    price: 9.99,
    category: "Storage",
    imageUrl: "/assets/generated/product-cloud-storage.dim_400x300.jpg",
    features: [
      "100GB encrypted storage",
      "Cross-device sync",
      "File versioning (30 days)",
      "Team sharing & permissions",
      "REST API access",
    ],
  },
  {
    id: "prod_005",
    name: "Developer API Access",
    description:
      "Full-access developer API with 500K monthly requests, webhooks, sandbox environment, and dedicated technical support.",
    price: 79.99,
    category: "API",
    imageUrl: "/assets/generated/product-api-access.dim_400x300.jpg",
    features: [
      "500K monthly API calls",
      "Webhook support",
      "Sandbox environment",
      "Dedicated tech support",
      "OpenAPI documentation",
    ],
    popular: true,
  },
  {
    id: "prod_006",
    name: "Email Marketing Suite",
    description:
      "Powerful email marketing platform with automation workflows, A/B testing, advanced segmentation, and detailed analytics.",
    price: 34.99,
    category: "Marketing",
    imageUrl: "/assets/generated/product-email-marketing.dim_400x300.jpg",
    features: [
      "Drag-and-drop email builder",
      "Marketing automation",
      "A/B testing",
      "Advanced segmentation",
      "Detailed open/click analytics",
    ],
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_abc123",
    productId: "prod_001",
    productName: "DigiTech Pro Plan",
    amount: 29.99,
    status: "paid",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "demo-user",
  },
  {
    id: "ord_def456",
    productId: "prod_003",
    productName: "SEO Analytics Pack",
    amount: 19.99,
    status: "paid",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "demo-user",
  },
  {
    id: "ord_ghi789",
    productId: "prod_004",
    productName: "Cloud Storage 100GB",
    amount: 9.99,
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    userId: "demo-user",
  },
];

let products: Product[] = [...INITIAL_PRODUCTS];
let orders: Order[] = [...INITIAL_ORDERS];

// ── Utility ──────────────────────────────────────────────────────────────────

function simulateDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  await simulateDelay(300);
  return [...products];
}

export async function getProduct(id: string): Promise<Product | null> {
  await simulateDelay(200);
  return products.find((p) => p.id === id) ?? null;
}

export async function addProduct(
  data: Omit<Product, "id">,
): Promise<Product> {
  await simulateDelay(400);
  const newProduct: Product = { ...data, id: generateId("prod") };
  products = [newProduct, ...products];
  return newProduct;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>,
): Promise<Product | null> {
  await simulateDelay(400);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = { ...products[idx], ...data };
  products = products.map((p) => (p.id === id ? updated : p));
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await simulateDelay(300);
  const prevLen = products.length;
  products = products.filter((p) => p.id !== id);
  return products.length < prevLen;
}

export async function seedProducts(): Promise<void> {
  await simulateDelay(100);
  products = [...INITIAL_PRODUCTS];
}

// ── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export async function createCheckoutSession(
  productId: string,
  successUrl: string,
  _cancelUrl: string,
): Promise<CheckoutSession> {
  await simulateDelay(600);
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error(`Product not found: ${productId}`);

  // Create a mock order
  const orderId = generateId("ord");
  const newOrder: Order = {
    id: orderId,
    productId: product.id,
    productName: product.name,
    amount: product.price,
    status: "pending",
    createdAt: new Date().toISOString(),
    userId: "current-user",
  };
  orders = [newOrder, ...orders];

  // In mock mode, redirect to success page
  const url = `${successUrl}?order=${orderId}`;
  return { url, sessionId: `cs_mock_${orderId}` };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getMyOrders(): Promise<Order[]> {
  await simulateDelay(300);
  return [...orders].filter((o) => o.userId === "demo-user" || o.userId === "current-user");
}

export async function getAllOrders(): Promise<Order[]> {
  await simulateDelay(300);
  return [...orders];
}

export async function markOrderPaid(id: string): Promise<Order | null> {
  await simulateDelay(400);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated: Order = { ...orders[idx], status: "paid" };
  orders = orders.map((o) => (o.id === id ? updated : o));
  return updated;
}
