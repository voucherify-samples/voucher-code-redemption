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

const checkCredentials = async () => {
    try {
        await client.vouchers.list();
    } catch (error) {
        if (error.code === 401) {
            const msg = "Your API credentials are incorrect, please check your applicationId and secretKey or visit `https://docs.voucherify.io/docs/authentication` to complete your app configuration.";
            throw new Error(msg);
        }
        throw new Error(error);
    }
};
checkCredentials();

app.post("/get-default-items", (req, res) => {
    return res.status(200).send(defaultItems);
});

const validateRequestedCart = requestedCart => {
    if (!requestedCart || !requestedCart.length) {
        throw new Error("Requested cart should be an array of cart items");
    }

    return requestedCart.map(requestedItem => {
        const item = defaultItems.find(item => requestedItem?.id && item.id === requestedItem.id);
        if (!item) {
            return false;
        }
        return { ...item, quantity: requestedItem.quantity || 0 };
    }).filter(item => !!item && item.quantity);
};

const mapCartItemToVoucherifyItem = item => ({
    sku_id  : item.productName,
    price   : item.price,
    quantity: item.quantity
});

const calculateCartTotalAmount = items => items.reduce((sum, item) => sum + (item.price * item.quantity) * 100, 0).toFixed(2);

app.post("/validate-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.code;
    const products = req.body.items;
    const items = validateRequestedCart(products);

    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required"
        });
    }

    const { valid, code, discount, campaign, order } = await client.validations.validateVoucher(voucherCode, {
        order: {
            amount: calculateCartTotalAmount(items),
            items : items.map(mapCartItemToVoucherifyItem) } });

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
    const email = req.body.email;
    const items = validateRequestedCart(products);

    if (!voucherCode) {
        return res.status(400).send({
            message: "Voucher code is required"
        });
    }
    const { result, voucher: { discount, campaign, code } } = await client.redemptions.redeem(voucherCode, {
        order: {
            items : items.map(mapCartItemToVoucherifyItem),
            amount: calculateCartTotalAmount(items) }, customer: { name, email } });
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

const port = 3000;

app.listen(port, () => {
    console.log(`Hot beans app listening on port ${port}`);
});

const defaultItems = [
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