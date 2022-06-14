require("dotenv").config();
const { VoucherifyServerSide } = require("@voucherify/sdk");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const morgan = require("morgan");

const app = express();

app.use(morgan("tiny"));

const client = VoucherifyServerSide({
    applicationId: `${process.env.VOUCHERIFY_APP_ID}`,
    secretKey: `${process.env.VOUCHERIFY_SECRET_KEY}`,
    // apiUrl: 'https://<region>.api.voucherify.io'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client")));

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post("/validate-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.voucherCode;
    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required",
        });
    }

    const { valid, code, discount, campaign } = await client.validations.validateVoucher(voucherCode);

    if (!valid) {
        res.status(404).send({
            status: "error",
            message: "Voucher incorrect"
        });
    }

    return res.status(200).send({
        status: "success",
        message: "Voucher granted",
        amount: discount.amount_off,
        campaign,
        code
    });
}));

app.post("/redeem-voucher", asyncHandler(async (req, res) => {
    const voucherCode = req.body.voucherCode;
    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required",
        });
    }
    const { result, voucher } = await client.redemptions.redeem(voucherCode);

    if (!result) {
        res.status(400).send({
            status: "error",
            message: "Voucher not found"
        });
    }

    res.status(200).send({
        status: "success",
        message: "Voucher granted",
        amount: voucher.discount.amount_off,
        campaign: voucher.campaign,
        code: voucher.campaign
    });
}));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Hot beans app listening on port ${port}`);
});
