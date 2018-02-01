# Shopify Express EASDK Session middleware

A small Express middleware for authenticating Shopify EASDK sessions. When a shop is authenticated, the shop's hostname is available at `req.authenticatedShopName`.

The module authenticates the user by reading the query string which is provided by the EASDK iframe and verifies its HMAC signature. The session is then stored in a signed cookie to make it available on subsequent requests. No database is necessary.

```js
const shopifyExpressEasdkSession = require('shopify-express-easdk-session');

app.use(shopifyExpressEasdkSession({shopifyClientSecret: 'your_client_secret'}));
```

The middleware will:

- detect a HMAC-signed set of query parameters from Shopify
- set a signed cookie to remember the session

This lets you access `req.authenticatedShopName` if a shop is authenticated. The value is a shop hostname, like `example.myshopify.com` if a shop is authenticated, otherwise it's null. A shop is authenticated if an HMAC-signed query string is present (the EASDK iframe sets this) or if a signed secure cookie is present. The cookie is set on a successful request authenticated by the query string.

## Usage

Attach the middleware to Express to check if a shop is authenticated.

You can protect a request handler from unauthenticated requests by checking for `req.authenticatedShopName` and redirecting if it's absent.

```js
app.use(shopifyExpressEasdkSession({shopifyClientSecret: 'your_client_secret'}));

app.get('/dashboard', (req, res, next) => {
  // If authenticatedShopName is null then no shop is authenticated
  if (!req.authenticatedShopName) {
    res.redirect('/');
    return
  }

  // Here, req.authenticatedShopName is the shop hostname
  res.send(`Hello, ${req.authenticatedShopName}`);
  // Hello, example.myshopify.com
});
```

## Requirements

- `cookie-parser` middleware (attached before this middleware) with a secret key. This is required because this middleware uses signed cookies. The secret key isn't related to the shopifyClientSecret option but you can use the same value.
