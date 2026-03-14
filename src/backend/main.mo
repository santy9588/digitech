import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Stripe "./stripe/stripe";
import OutCall "./http-outcalls/outcall";
import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";

actor DigiTech {

  // ─── Types ────────────────────────────────────────────────────────────────
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceInCents : Nat;
    currency : Text;
    category : Text;
    isActive : Bool;
  };

  public type OrderStatus = { #pending; #paid; #failed; #cancelled };

  public type Order = {
    id : Text;
    userId : Text;
    productId : Text;
    amount : Nat;
    currency : Text;
    status : OrderStatus;
    stripeSessionId : Text;
  };

  // ─── State ────────────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let products = Map.empty<Text, Product>();
  let orders   = Map.empty<Text, Order>();
  var nextProductId : Nat = 7;
  var nextOrderId   : Nat = 1;
  var seeded : Bool = false;

  // ─── Stripe configuration ─────────────────────────────────────────────────
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?cfg) { cfg };
    }
  };

  // ─── HTTP transform (required by Stripe outcalls) ─────────────────────────
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input)
  };

  // ─── Seed ─────────────────────────────────────────────────────────────────
  public shared func seedProducts() : async () {
    if (seeded) return;
    seeded := true;
    let samples : [Product] = [
      { id = "p1"; name = "DigiTech Pro Plan";     description = "Full access to DigiTech professional tools and services for one month.";    priceInCents = 2999; currency = "usd"; category = "Subscription"; isActive = true },
      { id = "p2"; name = "Website Builder Kit";   description = "Premium website builder kit with 50+ templates and hosting for 1 year.";   priceInCents = 4999; currency = "usd"; category = "Software";      isActive = true },
      { id = "p3"; name = "SEO Analytics Pack";    description = "Advanced SEO analytics and reporting suite with unlimited keywords.";      priceInCents = 1999; currency = "usd"; category = "Analytics";     isActive = true },
      { id = "p4"; name = "Cloud Storage 100GB";   description = "100 GB of secure encrypted cloud storage with versioning and sharing.";    priceInCents =  999; currency = "usd"; category = "Storage";       isActive = true },
      { id = "p5"; name = "Developer API Access";  description = "Full API access for developers — 1M calls/month, priority support.";      priceInCents = 7999; currency = "usd"; category = "API";           isActive = true },
      { id = "p6"; name = "Email Marketing Suite"; description = "Send up to 50,000 emails/month with automation workflows and A/B testing."; priceInCents = 3499; currency = "usd"; category = "Marketing";    isActive = true },
    ];
    for (p in samples.vals()) {
      products.add(p.id, p);
    };
  };

  // ─── Products ─────────────────────────────────────────────────────────────
  public query func getProducts() : async [Product] {
    let result = List.empty<Product>();
    for ((_, p) in products.entries()) {
      if (p.isActive) result.add(p);
    };
    result.toArray()
  };

  public query func getProduct(id : Text) : async ?Product {
    products.get(id)
  };

  public shared ({ caller }) func addProduct(
    name : Text, description : Text, priceInCents : Nat, currency : Text, category : Text
  ) : async Product {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = "p" # nextProductId.toText();
    nextProductId += 1;
    let p : Product = { id; name; description; priceInCents; currency; category; isActive = true };
    products.add(id, p);
    p
  };

  public shared ({ caller }) func updateProduct(
    id : Text, name : Text, description : Text, priceInCents : Nat, currency : Text, category : Text, isActive : Bool
  ) : async ?Product {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) null;
      case (?_) {
        let updated : Product = { id; name; description; priceInCents; currency; category; isActive };
        products.add(id, updated);
        ?updated
      };
    }
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(id)) {
      case (null) false;
      case (?p) {
        let soft : Product = { id = p.id; name = p.name; description = p.description; priceInCents = p.priceInCents; currency = p.currency; category = p.category; isActive = false };
        products.add(id, soft);
        true
      };
    }
  };

  // ─── Orders ───────────────────────────────────────────────────────────────
  public query ({ caller }) func getMyOrders() : async [Order] {
    let uid = caller.toText();
    let result = List.empty<Order>();
    for ((_, o) in orders.entries()) {
      if (o.userId == uid) result.add(o);
    };
    result.toArray()
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    let result = List.empty<Order>();
    for ((_, o) in orders.entries()) {
      result.add(o);
    };
    result.toArray()
  };

  public query func getOrder(orderId : Text) : async ?Order {
    orders.get(orderId)
  };

  // ─── Stripe Checkout ──────────────────────────────────────────────────────
  public shared ({ caller }) func createCheckoutSession(
    productId : Text, successUrl : Text, cancelUrl : Text
  ) : async Text {
    switch (products.get(productId)) {
      case (null) Runtime.trap("Product not found");
      case (?product) {
        if (not product.isActive) Runtime.trap("Product unavailable");
        let orderId = "o" # nextOrderId.toText();
        nextOrderId += 1;
        let cfg = getStripeConfig();
        let items : [Stripe.ShoppingItem] = [{
          currency = product.currency;
          productName = product.name;
          productDescription = product.description;
          priceInCents = product.priceInCents;
          quantity = 1;
        }];
        let sessionUrl = await Stripe.createCheckoutSession(
          cfg, caller, items,
          successUrl # "?order=" # orderId,
          cancelUrl,
          transform
        );
        let o : Order = {
          id              = orderId;
          userId          = caller.toText();
          productId       = productId;
          amount          = product.priceInCents;
          currency        = product.currency;
          status          = #pending;
          stripeSessionId = "";
        };
        orders.add(orderId, o);
        sessionUrl
      };
    }
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform)
  };

  public shared func markOrderPaid(orderId : Text) : async Bool {
    switch (orders.get(orderId)) {
      case (null) false;
      case (?o) {
        let updated : Order = { id = o.id; userId = o.userId; productId = o.productId; amount = o.amount; currency = o.currency; status = #paid; stripeSessionId = o.stripeSessionId };
        orders.add(orderId, updated);
        true
      };
    }
  };

  public shared func markOrderFailed(orderId : Text) : async Bool {
    switch (orders.get(orderId)) {
      case (null) false;
      case (?o) {
        let updated : Order = { id = o.id; userId = o.userId; productId = o.productId; amount = o.amount; currency = o.currency; status = #failed; stripeSessionId = o.stripeSessionId };
        orders.add(orderId, updated);
        true
      };
    }
  };

  // ─── User profile (required by authorization component) ───────────────────
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller)
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    userProfiles.add(caller, profile)
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user)
  };
};
