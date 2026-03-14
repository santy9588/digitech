import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  // Prefab components
  include MixinStorage();

  // User profiles and access control
  type UserRole = AccessControl.UserRole;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Digital product types
  public type Product = {
    id : Text;
    title : Text;
    description : Text;
    priceCents : Nat;
    category : Text;
    thumbnail : Storage.ExternalBlob;
    file : Storage.ExternalBlob;
    seller : Principal;
    createdAt : Time.Time;
    active : Bool;
  };

  public type BlogPost = {
    id : Nat;
    title : Text;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    role : UserRole;
  };

  public type ShoppingCart = {
    products : [Text];
  };

  public type Order = {
    id : Nat;
    buyer : Principal;
    productIds : [Text];
    totalCents : Nat;
    stripePaymentId : Text;
    status : {
      #pending;
      #paid;
      #failed;
    };
    createdAt : Time.Time;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  let products = Map.empty<Text, Product>();
  let shoppingCarts = Map.empty<Principal, ShoppingCart>();
  let orders = Map.empty<Nat, Order>();
  let blogPosts = Map.empty<Nat, BlogPost>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Stripe integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // User profile management - Required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let role = AccessControl.getUserRole(accessControlState, caller);
    let profile : UserProfile = {
      principal = caller;
      name = name;
      role = role;
    };
    userProfiles.add(caller, profile);
  };

  // Product management
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };
    // Verify the seller is the caller
    if (product.seller != caller) {
      Runtime.trap("Unauthorized: Cannot add product for another seller");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };
    switch (products.get(product.id)) {
      case (?existingProduct) {
        if (existingProduct.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only owner or admin can update this product");
        };
      };
      case (null) { Runtime.trap("Product does not exist") };
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };
    switch (products.get(productId)) {
      case (?product) {
        if (product.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only owner or admin can delete this product");
        };
      };
      case (null) { Runtime.trap("Product does not exist") };
    };
    products.remove(productId);
  };

  // Public query functions - no authorization needed for browsing active products
  public query ({ caller }) func getProduct(productId : Text) : async Product {
    switch (products.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product does not exist") };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query ({ caller }) func getProductsBySeller(seller : Principal) : async [Product] {
    products.values().toArray().filter(func(p) { p.seller == seller });
  };

  public query ({ caller }) func searchProducts(keyword : Text) : async [Product] {
    products.values().toArray().filter(func(p) {
      p.title.contains(#text keyword) or p.description.contains(#text keyword)
    });
  };

  // Shopping cart management - requires user authentication
  public shared ({ caller }) func addToCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    let cart = getCartInternal(caller);
    let cartProducts = List.fromArray(cart.products);
    cartProducts.add(productId);
    let newCart = { products = cartProducts.toArray() };
    shoppingCarts.add(caller, newCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };
    let cart = getCartInternal(caller);
    let filtered = cart.products.filter(func(p) { p != productId });
    let newCart = { products = filtered };
    shoppingCarts.add(caller, newCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    shoppingCarts.add(caller, { products = [] });
  };

  func getCartInternal(user : Principal) : ShoppingCart {
    switch (shoppingCarts.get(user)) {
      case (?cart) { cart };
      case (null) { { products = [] } };
    };
  };

  public query ({ caller }) func getCart() : async ShoppingCart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    getCartInternal(caller);
  };

  // Orders & payments - requires user authentication
  var nextOrderId = 0;

  public shared ({ caller }) func createOrder(productIds : [Text], totalCents : Nat, stripePaymentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let order : Order = {
      id = nextOrderId;
      buyer = caller;
      productIds;
      totalCents;
      stripePaymentId;
      status = #pending;
      createdAt = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
  };

  public shared ({ caller }) func markOrderPaid(orderId : Nat) : async () {
    // This should be called by webhook or admin only
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark orders as paid");
    };
    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          id = order.id;
          buyer = order.buyer;
          productIds = order.productIds;
          totalCents = order.totalCents;
          stripePaymentId = order.stripePaymentId;
          status = #paid;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
      case (null) { Runtime.trap("Order does not exist") };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().filter(func(o) { o.buyer == caller });
  };

  public shared ({ caller }) func createStripePaymentIntent(totalCents : Nat, currency : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment intents");
    };
    Runtime.trap("Not implemented");
  };

  // File access after purchase - requires user authentication and ownership verification
  public query ({ caller }) func canAccessFile(productId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    let hasOrder = orders.values().toArray().any(func(o) {
      o.buyer == caller and o.status == #paid and o.productIds.any(func(p) { p == productId });
    });
    hasOrder;
  };

  public query ({ caller }) func getProductFile(productId : Text) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };
    switch (products.get(productId)) {
      case (?product) {
        let hasOrder = orders.values().toArray().any(func(o) {
          o.buyer == caller and o.status == #paid and o.productIds.any(func(p) { p == productId });
        });
        if (not hasOrder) { Runtime.trap("Unauthorized: Must purchase product before downloading") };
        product.file;
      };
      case (null) { Runtime.trap("Product does not exist") };
    };
  };

  // Blog posts - admin only for creation, public for reading
  public shared ({ caller }) func createBlogPost(title : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create blog posts");
    };
    let post : BlogPost = {
      id = nextOrderId;
      title;
      content;
      author = caller;
      timestamp = Time.now();
    };
    blogPosts.add(nextOrderId, post);
    nextOrderId += 1;
  };

  // Public query - anyone can read blog posts
  public query ({ caller }) func getBlogPost(id : Nat) : async BlogPost {
    switch (blogPosts.get(id)) {
      case (?post) { post };
      case (null) { Runtime.trap("Blog post not found") };
    };
  };

  // Public query - anyone can list blog posts
  public query ({ caller }) func listBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  // Stripe integration methods
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfigurationInternal() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfigurationInternal(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfigurationInternal(), caller, items, successUrl, cancelUrl, transform);
  };

  // Custom error types
  public type Error = {
    #NotAuthenticated;
    #InvalidProductId;
    #InsufficientQuantity;
    #ProductNotFound;
    #ProductNotAvailable;
    #ProductUpdateFailed;
    #CartAlreadyEmpty;
    #PaymentNotFound;
    #PaymentFailed;
    #OrderNotFound;
    #OrderUpdateFailed;
    #UnauthorizedOrderAccess;
    #EmptyCart;
    #TransferFailed;
    #SellerNotFound;
    #BuyerLockFailed;
    #CommentNotFound;
    #ReviewNotFound;
    #BlogPostNotFound;
    #CommentLockFailed;
    #InsufficientBalance;
    #UnknownError;
    #PromoCodeExpired;
    #PromoCodeNotRecognized;
    #AuctionNotFound;
    #BidTooLow;
    #BidExpired;
    #AuctionExpired;
    #BidFailed;
    #EmailSendFailed;
    #InvoiceFailed;
    #UserRegistrationFailed;
  };
};
