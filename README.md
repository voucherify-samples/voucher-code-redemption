 # Redeem promo codes with Voucherify


This sample shows you how to integrate with Voucherify [voucher redemption endpoint](https://docs.voucherify.io/reference/redeem-voucher).

Validating and accepting promo codes in your checkout from scratch might be tricky — calculating discounted prices, error message handling, and localization are just a few things to think about when building a simple promo code redemption flow.

This is where [Voucherify promotion engine](https://docs.voucherify.io/docs) kicks in. Together with our [Promo UI Kit](https://www.figma.com/community/file/1100356622702326488) you can quickly build the best promotion experience for your customers.

## Demo

[Live demo](https://voucherify-code-redemption.herokuapp.com/)

![](https://github.com/voucherify-samples/voucher-code-redemption/blob/main/voucherify-demo.gif)

The demo is running with a [Sandbox project](https://docs.voucherify.io/docs/testing). Sandbox comes with several test vouchers you can apply in the checkout, e.g.:

``BLCKFRDY`` ``HAPPY-ORDERxq7`` ``HAPPY-ORDERyra`` ``HAPPY-ORDER11T``

The promo code box accepts Amount and Percentage [discount types](https://docs.voucherify.io/docs/vouchers-1#discount-coupons), more coming soon. 

This sample calls two endpoints:
[Validate voucher code](https://docs.voucherify.io/reference/validate-voucher) — checks the code against [validation rules](https://docs.voucherify.io/docs/validation-rules) and returns calculated discounts
[Redeem voucher code](https://docs.voucherify.io/reference/redeem-voucher) — runs validation and then marks the voucher as used



## How to run Voucherify samples locally?

This sample is built with Node.js and our [JS SDK](https://github.com/voucherifyio/voucherify-js-sdk) on the server side and HTML + Vanilla JavaScript on the front (with React version coming soon).

Follow the steps below to run locally.

1. Clone repository.

```
git clone https://github.com/voucherify-samples/voucher-code-redemption.git
```
2. Create your [Voucherify account](http://app.voucherify.io/#/signup) (free tier, no credit card required).

3. Go to the Sandbox project’s settings and get your Application ID and Secret Key, see [Authentication](https://docs.voucherify.io/docs/authentication).

4. Rename .env.example to .env and paste your API keys:
```
VOUCHERIFY_APP_ID=<replace-with-your-application-id>
VOUCHERIFY_SECRET_KEY=<replace-with-your-secret-key>
```
5. Install dependencies.
```
npm install
```
6. Start the Node server by entering the command in the terminal.
```
npm run start
```
7. Go to [http://localhost:3000](http://localhost:3000/) in your browser.


## Get support

If you found a bug or want to suggest a new sample, please file an issue.

If you have questions, comments, or need help with code, we’re here to help:
* on [Slack](https://www.voucherify.io/community)
* by [email](https://www.voucherify.io/contact-support)

For more tutorials and full API reference, visit our [Developer Hub](https://docs.voucherify.io).

## Authors
[@patricioo1](https://github.com/patricioo1)