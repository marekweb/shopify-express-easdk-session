'use strict';

const test = require('tape');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const shopifyExpressEasdkSession = require('.');

// Given
//    no query params
//    no cookie
//
// Assert
//    no authenticated shop
//    no cookie set
test(t => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  sinon.spy(res, 'cookie');

  const middleware = shopifyExpressEasdkSession({
    shopifyClientSecret: 'hush'
  });

  middleware(req, res, err => {
    t.notOk(err);

    t.equals(req.authenticatedShopName, undefined);
    t.notOk(res.cookie.called);

    t.end();
  });
});

// Given
//    a shop param but not signed correctly
//    no cookie
//
// Assert
//    no authenticated shop
//    no cookie set
test(t => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  req.query.shop = 'shiny-widgets.myshopify.com';

  sinon.spy(res, 'cookie');

  const middleware = shopifyExpressEasdkSession({
    shopifyClientSecret: 'hush'
  });

  middleware(req, res, err => {
    t.notOk(err);

    t.equals(req.authenticatedShopName, undefined);
    t.notOk(res.cookie.called);

    t.end();
  });
});

// Given
//    a shop param signed correctly
//    no cookie

// Assert
//    authenticated shop is set
//    cookie is set
test(t => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  req.query = {
    hmac: '4712bf92ffc2917d15a2f5a273e39f0116667419aa4b6ac0b3baaf26fa3c4d20',
    code: '0907a61c0c8d55e99db179b68161bc00',
    shop: 'some-shop.myshopify.com',
    timestamp: 1337178173
  };

  sinon.spy(res, 'cookie');

  const middleware = shopifyExpressEasdkSession({
    shopifyClientSecret: 'hush'
  });

  middleware(req, res, err => {
    t.notOk(err);

    t.equals(req.authenticatedShopName, 'some-shop.myshopify.com');
    t.ok(
      res.cookie.calledWith('shopify-app-session', 'some-shop.myshopify.com')
    );

    t.end();
  });
});

// Given
//    no param
//    a cookie is set
//
// Assert
//    authenticated shop is set
//    cookie is set
test(t => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  req.signedCookies = {
    'shopify-app-session': 'some-shop.myshopify.com'
  };

  sinon.spy(res, 'cookie');

  const middleware = shopifyExpressEasdkSession({
    shopifyClientSecret: 'hush'
  });

  middleware(req, res, err => {
    t.notOk(err);

    t.equals(req.authenticatedShopName, 'some-shop.myshopify.com');

    t.ok(
      res.cookie.calledWith('shopify-app-session', 'some-shop.myshopify.com')
    );

    t.end();
  });
});

// Given
//    a shop param signed correctly
//    a cookie set for a different shop
//
// Assert
//    authenticated shop is set to the param shop
//    cookie is set to the param shop
test(t => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  req.signedCookies = {
    'shopify-app-session': 'fancy-widgets.myshopify.com'
  };

  req.query = {
    hmac: '4712bf92ffc2917d15a2f5a273e39f0116667419aa4b6ac0b3baaf26fa3c4d20',
    code: '0907a61c0c8d55e99db179b68161bc00',
    shop: 'some-shop.myshopify.com',
    timestamp: 1337178173
  };

  sinon.spy(res, 'cookie');

  const middleware = shopifyExpressEasdkSession({
    shopifyClientSecret: 'hush'
  });

  middleware(req, res, err => {
    t.notOk(err);

    t.equals(req.authenticatedShopName, 'some-shop.myshopify.com');
    t.ok(
      res.cookie.calledWith('shopify-app-session', 'some-shop.myshopify.com')
    );

    t.end();
  });
});
