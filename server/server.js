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

app.post("/validate-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.code;
    const products = req.body.items;
    const amount = req.body.amount;
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
    const { valid, code, discount, campaign } = await client.validations.validateVoucher(voucherCode, { order: { products }, amount });

    if (!valid) {
        return res.status(400).send({
            status : "error",
            message: "Voucher is not correct"
        });
    }
    return res.status(200).send({
        status : "success",
        message: "Voucher granted",
        amount : discount.amount_off,
        campaign,
        code
    });
}));

app.post("/redeem-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.code;
    const amount = req.body.amount;
    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required"
        });
    }
    const { result, voucher: { discount, campaign, code } } = await client.redemptions.redeem(voucherCode, { order: amount });
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