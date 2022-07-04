require("dotenv").config();
const { VoucherifyServerSide } = require("@voucherify/sdk");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const app = express();

const client = VoucherifyServerSide({
    applicationId: `${process.env.VOUCHERIFY_APP_ID}`,
    secretKey    : `${process.env.VOUCHERIFY_SECRET_KEY}`,
    // apiUrl: 'https://<region>.api.voucherify.io'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client")));

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", [ "*" ]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post("/get-default-items", (req, res) => {
    return res.status(200).send(defaultItems);
});

const filterAndCalculateProductsAmount = products => {
    const productsWithEqualIndex = defaultItems.filter(product => products.some(item => { return product.id === item.id; }));
    productsWithEqualIndex.forEach((item, index) => { item.quantity = products[index].quantity; });
    const items = productsWithEqualIndex.map(item => { return { sku_id: item.productName, price: item.price, quantity: item.quantity }; });
    const amount = productsWithEqualIndex.reduce((sum, product) => sum + (product.price * product.quantity) * 100, 0).toFixed(2);
    return { items, amount };
};

app.post("/validate-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.code;
    const products = req.body.items;
    const { items, amount } = filterAndCalculateProductsAmount(products);

    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required"
        });
    }

    if (!products.length) {
        return res.send({
            message: "Products are required"
        });
    }
    const { valid, code, discount, campaign, order } = await client.validations.validateVoucher(voucherCode, { order: { amount, items } }).then(res => {
        return res;
    });

    if (!valid) {
        return res.status(400).send({
            status : "error",
            message: "Voucher is not correct"
        });
    }
    return res.status(200).send({
        status : "success",
        message: "Voucher granted",
        type   : discount.type,
        product: discount.product,
        amount : order.total_discount_amount,
        campaign,
        code,
    });
}));

app.post("/redeem-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.code;
    const products = req.body.items;
    const name = req.body.name;
    const { items, amount } = filterAndCalculateProductsAmount(products);

    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required"
        });
    }
    const { result, voucher: { discount, campaign, code } } = await client.redemptions.redeem(voucherCode, { order: { items, amount }, customer: { name } });
    if (!result) {
        return res.status(400).send({
            status : "error",
            message: "Voucher redeem is not possible"
        });
    }
    return res.status(200).send({
        status : "success",
        message: "Voucher redeemed",
        amount : discount.amount_off,
        campaign,
        code
    });
}));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Hot beans app listening on port ${port}`);
});

let defaultItems = [
    {
        productName       : "Johan & Nystrom Caravan",
        productDescription: "20 oz bag",
        quantity          : 1,
        price             : "26.99",
        src               : "./images/johan2.jpeg",
        id                : 1
    },
    {
        productName       : "Illy Arabica",
        productDescription: "Bestseller 18 oz bag",
        quantity          : 1,
        price             : "21.02",
        src               : "./images/illy_arabica.jpeg",
        id                : 2
    },
    {
        productName       : "Hard Beans Etiopia",
        productDescription: "6 oz bag",
        quantity          : 1,
        price             : "3.88",
        src               : "./images/hardbean.jpeg",
        id                : 3
    },
    {
        productName       : "Johan & Nystrom Bourbon",
        productDescription: "20 oz bag",
        quantity          : 2,
        price             : "41.98",
        src               : "./images/johan2.jpeg",
        id                : 4
    },
];