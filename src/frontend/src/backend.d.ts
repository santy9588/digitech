import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ShoppingCart {
    products: Array<string>;
}
export interface Product {
    id: string;
    title: string;
    active: boolean;
    thumbnail: ExternalBlob;
    file: ExternalBlob;
    createdAt: Time;
    description: string;
    seller: Principal;
    category: string;
    priceCents: bigint;
}
export interface BlogPost {
    id: bigint;
    title: string;
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Order {
    id: bigint;
    status: Variant_pending_paid_failed;
    productIds: Array<string>;
    createdAt: Time;
    totalCents: bigint;
    stripePaymentId: string;
    buyer: Principal;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    role: UserRole;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_paid_failed {
    pending = "pending",
    paid = "paid",
    failed = "failed"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addToCart(productId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    canAccessFile(productId: string): Promise<boolean>;
    clearCart(): Promise<void>;
    createBlogPost(title: string, content: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(productIds: Array<string>, totalCents: bigint, stripePaymentId: string): Promise<void>;
    createStripePaymentIntent(totalCents: bigint, currency: string): Promise<string>;
    deleteProduct(productId: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getBlogPost(id: bigint): Promise<BlogPost>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<ShoppingCart>;
    getMyOrders(): Promise<Array<Order>>;
    getProduct(productId: string): Promise<Product>;
    getProductFile(productId: string): Promise<ExternalBlob>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsBySeller(seller: Principal): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listBlogPosts(): Promise<Array<BlogPost>>;
    markOrderPaid(orderId: bigint): Promise<void>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(keyword: string): Promise<Array<Product>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(product: Product): Promise<void>;
    updateProfile(name: string): Promise<void>;
}
