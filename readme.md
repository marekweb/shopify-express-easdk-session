# Shopify Express EASDK Session middleware

A small Express middleware module for Shopify EASDK sessions.

```js
const shopifyExpressEasdkSession = require('shopify-express-easdk-session');

app.use(shopifyExpressEasdkSession({shopifyClientSecret: 'your_client_secret'}));
```

The middleware will:

- detect a HMAC-signed set of query parameters from Shopify
- set a signed cookie to remember the session

Requirements

- `cookie-parser` middleware (attached before this middleware) with a secret key. This is required because this middleware uses signed cookies.