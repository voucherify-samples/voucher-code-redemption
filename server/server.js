require('dotenv').config();
const { VoucherifyServerSide } = require('@voucherify/sdk');
const path = require('path');
const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const client = VoucherifyServerSide({
  applicationId: `${process.env.VOUCHERIFY_APP_ID}`,
  secretKey: `${process.env.VOUCHERIFY_SECRET_KEY}`,
  // apiUrl: 'https://<region>.api.voucherify.io'
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('../client'));

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  console.log('Requested homepage')
  res.sendFile(path.join(__dirname, '../client/index.html'));
});


app.post("/validate-voucher", (req, res) => {
  const voucherCode = req.body.voucherCode;
  if (!voucherCode) {
    return res.send({
      message: "Voucher code is required",
    });
  }

  client.validations.validateVoucher(voucherCode)
    .then(response => {
      if (response.valid) {
        res.status(200).send({
          status: "success",
          message: "Voucher granted",
          amount: response.discount.amount_off,
          campaign: response.campaign ? response.campaign : null
        })
      } else {
        res.status(404).send({
          status: "error",
          message: "Voucher incorrect"
        })
      }
    })
    .catch((error) => {
      res.status(400).send({
        status: "error",
        message: "Voucher not found"
      })
    })
});

app.post("/redeem-voucher", (req, res) => {
  const voucherCode = req.body.voucherCode;
  if (!voucherCode) {
    return res.send({
      message: "Voucher code is required",
    });
  }
  client.redemptions.redeem(voucherCode)
    .then(response => {
      if (response.result) {
        res.status(200).send({
          status: "success",
          message: "Voucher granted",
          amount: response.voucher.discount.amount_off,
          campaign: response.voucher.campaign ? response.voucher.campaign : null
        })
      } else {
        res.status(400).send({
          status: "error",
          message: "Voucher not found"
        });
      }
    })
    .catch((error) => {
      res.status(404).send({
        status: "error",
        message: "Voucher incorrect"
      });
    })
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Hot beans app listening on port 3000`);
});
