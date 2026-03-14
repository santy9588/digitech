import Stripe "stripe/stripe";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Product Type
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceInCents : Nat;
    currency : Text;
  };

  // Order Type
  public type Order = {
    id : Nat;
    userId : Principal;
    productId : Text;
    amount : Nat;
    currency : Text;
    status : Text;
    stripePaymentIntentId : ?Text;
    createdAt : Time.Time;
  };

  // Storage
  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Nat, Order>();

  // Stripe Configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Seed Products
  let productList = List.empty<Product>();
  let basicPlan : Product = {
    id = "basic";
    name = "Basic Plan";
    description = "Access to basic features";
    priceInCents = 9900;
    currency = "usd";
  };
  let proPlan : Product = {
    id = "pro";
    name = "Pro Plan";
    description = "Access to all features";
    priceInCents = 29900;
    currency = "usd";
  };
  let enterprisePlan : Product = {
    id = "enterprise";
    name = "Enterprise Plan";
    description = "Custom solutions";
    priceInCents = 99900;
    currency = "usd";
  };
  productList.add(basicPlan);
  productList.add(proPlan);
  productList.add(enterprisePlan);

  for (product in productList.values()) {
    products.add(product.id, product);
  };

  // Get Products - Public Query
  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  // Create Order
  public shared ({ caller }) func createOrder(productId : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let orderId = orders.size() + 1;
    let order : Order = {
      id = orderId;
      userId = caller;
      productId;
      amount = product.priceInCents;
      currency = product.currency;
      status = "pending";
      stripePaymentIntentId = null;
      createdAt = Time.now();
    };

    orders.add(orderId, order);
    orderId;
  };

  // Confirm Order
  public shared ({ caller }) func confirmOrder(orderId : Nat, paymentIntentId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can confirm orders");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    // Verify ownership: only the order owner can confirm their order
    if (order.userId != caller) {
      Runtime.trap("Unauthorized: Can only confirm your own orders");
    };

    let updatedOrder = { order with status = "succeeded"; stripePaymentIntentId = ?paymentIntentId };
    orders.add(orderId, updatedOrder);
  };

  // Get User Orders
  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let filtered = orders.values().toArray().filter(
      func(order) { order.userId == caller }
    );
    filtered;
  };

  // Get All Orders (Admin)
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Stripe Integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view session status");
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
