import {
    getCartAndVoucherFromSessionStorage,
    displayErrorMessage,
    getCartPreviewRender,
    getOrderSummaryRender,
    filterAndReduceItemsWithAmount,
    checkoutButton,
    saveCartAndVoucherInSessioStorage
} from "./lib.js";

const { products, voucherProperties } = getCartAndVoucherFromSessionStorage();


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

const onVoucherCodeSubmit = async (voucherValue, render) => {
    try {
        await validateAndUpdateVoucherProperties(voucherValue, products);
        render(products, voucherProperties);
    } catch (error) {
        displayErrorMessage(error.message);
    }
};

const renderCartPreview = getCartPreviewRender({ onIncrement, onDecrement });
renderCartPreview(products);

const renderOrderSummary = getOrderSummaryRender({ onVoucherCodeSubmit });
renderOrderSummary(products, voucherProperties);

const validateAndUpdateVoucherProperties = async (code, products) => {
    if (!code) {
        throw new Error("Please enter voucher code");
    }
    if (products.reduce((a, b) => a + b.quantity, 0) <= 0) {
        throw new Error("No items in basket");
    }
    const { items, amount } = filterAndReduceItemsWithAmount(products);
    const response = await fetch("/validate-voucher", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, items, amount }),
    });
    const data = await response.json();
    if (response.status !== 200) {
        throw new Error(data.message);
    }
    if (data.status !== "success") {
        throw new Error("We could not validate coupon");
    }
    voucherProperties.amount = data.amount;
    voucherProperties.code = data.code;
    return data;
};

checkoutButton.addEventListener("click", e => {
    if (!voucherProperties.code) {
        e.preventDefault();
        displayErrorMessage(error.message);
        return false;
    }
    saveCartAndVoucherInSessioStorage(products, voucherProperties);
    window.location.href = "/checkout.html";
});