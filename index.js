const get = require('lodash.get');
const shopifyVerifyParams = require('shopify-verify-params');

/**
 * Returns a configured middleware function.
 * @return {Function} Express middleware function
 */
module.exports = function shopifyExpressEasdkSession(options = {}) {
  const {
    cookiePropertyNameOnRequest = 'signedCookies',
    cookieName = 'shopify-app-session',
    authenticatedShopPropertyNameOnRequest = 'authenticatedShopName',
    shopifyClientSecret
  } = options;

  if (!shopifyClientSecret) {
    throw new Error('shopifyExpressEasdkSession: Missing param (clientSecret)');
  }

  return function(req, res, next) {
    let signedShop;
    const params = req.query;
    if (shopifyVerifyParams(shopifyClientSecret, params) && params.shop) {
      signedShop = params.shop;
    } else {
      signedShop = get(req, [cookiePropertyNameOnRequest, cookieName]);
    }

    if (signedShop) {
      res.cookie(cookieName, signedShop, { signed: true });
      req[authenticatedShopPropertyNameOnRequest] = signedShop;
    } else {
      // Make sure nothing can set the authenticated shop name
      delete req[authenticatedShopPropertyNameOnRequest];
    }

    next();
  };
};
