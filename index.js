'use strict';

const get = require('lodash').get;
const shopifyVerifyParams = require('shopify-verify-params');

/**
 * Returns a configured middleware function.
 * @return {Function} Express middleware function
 */
module.exports = function shopifyExpressEasdkSession(options) {
  options = options || {};

  const cookiePropertyNameOnRequest = options.cookieObjectName || 'signedCookies';
  const cookieName = options.cookieName || 'shopifySession';
  const authenticatedShopPropertyNameOnRequest = options.authenticatedShopProperty || 'authenticatedShopName';
  const clientSecret = options.shopifyClientSecret;

  if (!clientSecret) {
    throw new Error('shopifyExpressEasdkSession: Missing param (shopifyClientSecret)');
  }

  return function(req, res, next) {
    let signedShop;
    const params = req.query;
    if (shopifyVerifyParams(clientSecret, params) && params.shop) {
      signedShop = params.shop;
    } else {
      signedShop = get(req, [cookiePropertyNameOnRequest, cookieName]);
    }

    if (signedShop) {
      res.cookie(cookieName, signedShop, {signed: true});
      req[authenticatedShopPropertyNameOnRequest] = signedShop;
    } else {
      // We don't expect that a previous middleware has set an authenticated shop value.
      // But just in case, we nullify it for security.
      delete req[authenticatedShopPropertyNameOnRequest];
    }

    next();
  };
};
