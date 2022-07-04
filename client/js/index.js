import {
    getCartAndVoucherFromSessionStorage,
    getCartPreviewRender,
    checkoutButton,
    displayErrorMessage,
    filterAndReduceProducts,
    getOrderSummaryRender,
    saveCartAndVoucherInSessioStorage
} from "./lib.js";

let products = [];
let voucherProperties = [];

getCartAndVoucherFromSessionStorage().then(data => {
    products = data.products;
    voucherProperties = data.voucherProperties;
    renderCartPreview(products);
    renderOrderSummary(products, voucherProperties);
});

const onIncrement = async (index, render) => {
    products[index].quantity++;
    if (voucherProperties.code) {
        try {
            await validateAndUpdateVoucherProperties(voucherProperties.code, products);
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }
    render(products);
    renderOrderSummary(products, voucherProperties);
};
const onDecrement = async (index, render) => {
    if (products[index].quantity <= 0) { return; }
    products[index].quantity--;
    if (voucherProperties.code) {
        try {
            await validateAndUpdateVoucherProperties(voucherProperties.code, products);
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }
    render(products);
    renderOrderSummary(products, voucherProperties);
};
const renderCartPreview = getCartPreviewRender({ onIncrement, onDecrement });

const onVoucherCodeSubmit = async (voucherValue, render) => {
    try {
        await validateAndUpdateVoucherProperties(voucherValue, products);
        render(products, voucherProperties);
    } catch (error) {
        displayErrorMessage(error.message, voucherValue);
    }
};
const renderOrderSummary = getOrderSummaryRender({ onVoucherCodeSubmit });

const validateAndUpdateVoucherProperties = async (code, products) => {
    if (!code) {
        throw new Error("Please enter voucher code");
    }
    if (products.reduce((a, b) => a + b.quantity, 0) <= 0) {
        throw new Error("No items in basket");
    }
    const { items } = filterAndReduceProducts(products);
    const response = await fetch("/validate-voucher", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, items }),
    });
    const data = await response.json();
    if (response.status !== 200) {
        throw new Error(data.message);
    }
    if (data.status !== "success") {
        throw new Error("We could not validate coupon");
    }

    const isFreeShipping = data.type === "UNIT" && data?.product?.name === "Shipping";

    if (!([ "AMOUNT", "PERCENT" ].includes(data.type) || isFreeShipping)) {
        throw new Error("Implemented discounts: AMOUNT, PERCENT and FREE SHIPPING (on variation of UNIT type discount)");
    }

    voucherProperties.isFreeShippingDiscount = isFreeShipping;
    voucherProperties.amount = isFreeShipping ? 0 : data.amount;
    voucherProperties.code = data.code;

    return data;
};

checkoutButton.addEventListener("click", e => {
    if (!voucherProperties.code || products.reduce((a, b) => a + b.quantity, 0) <= 0) {
        e.preventDefault();
        alert("Please validate voucher code or add items to basket");
        return false;
    }
    saveCartAndVoucherInSessioStorage(products, voucherProperties);
    window.location.href = "/checkout.html";
});