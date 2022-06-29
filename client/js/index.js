import * as components from "./components.js";

const { products, voucherProperties } = components.getCartAndVoucherFromSessionStorage();

const renderCartPreview = components.getCartPreviewRender({
    onIncrement: async (index, render) => {
        products[index].quantity++;
        if (voucherProperties.code) {
            try {
                await validateAndUpdateVoucherProperties(voucherProperties.code, products);
            } catch (error) {
                components.displayErrorMessage(error.message);
            }
        }
        render(products);
        renderOrderSummary(products, voucherProperties);
    },
    onDecrement: async (index, render) => {
        if (products[index].quantity <= 0) { return; }
        products[index].quantity--;
        if (voucherProperties.code) {
            try {
                await validateAndUpdateVoucherProperties(voucherProperties.code, products);
            } catch (error) {
                components.displayErrorMessage(error.message);
            }
        }
        render(products);
        renderOrderSummary(products, voucherProperties);
    },
});
renderCartPreview(products);

const renderOrderSummary = components.getOrderSummaryRender({
    onVoucherCodeSubmit: async (voucherValue, render) => {
        try {
            await validateAndUpdateVoucherProperties(voucherValue, products);
            render(products, voucherProperties);
        } catch (error) {
            components.displayErrorMessage(error.message);
        }
    }
});
renderOrderSummary(products, voucherProperties);

const validateAndUpdateVoucherProperties = async (code, products) => {
    if (!code) {
        throw new Error("Please enter voucher code");
    }
    if (components.items.reduce((a, b) => a + b.quantity, 0) <= 0) {
        throw new Error("No items in basket");
    }
    const { items, amount } = components.filterAndReduceItemsWithAmount(products);
    const response = await fetch("/validate-voucher", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
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

components.checkoutButton.addEventListener("click", e => {
    const promotionHolder = document.getElementById("promotion-holder");
    if (!promotionHolder.childNodes.length || !voucherProperties.code || products.reduce((a, b) => a + b.quantity, 0) <= 0) {
        e.preventDefault();
        promotionHolder.innerHTML = "<h5 id=\"error-message\">Please validate voucher code or add items to basket</h5>";
        return false;
    }
    components.saveCartAndVoucherInSessioStorage(products, voucherProperties);
    window.location.href = "/checkout.html";
});