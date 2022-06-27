import * as components from "./components.js";

const { products: productsFromStorage, voucherProperties: voucherPropertiesFromStorage } = components.getCartAndVoucherFromSessionStorage();

export const products = productsFromStorage.length ? productsFromStorage : components.items;
export const voucherProperties = voucherPropertiesFromStorage.code ? voucherPropertiesFromStorage : {
    amount  : "",
    code    : "",
    campaign: ""
};

const handleIncrementClick = index => {
    products[index].quantity++;
    components.updateOrderSummary(products);
    components.updateSummaryCardItems(products);
    components.handleIncrement(handleIncrementClick);
};

components.updateSummaryCardItems(products);
components.handleIncrement(handleIncrementClick);


components.handleDecrement(products);
components.updateOrderSummary(products, voucherProperties);

const fetchValidateVoucher = async code => {
    if (!code) {
        throw new Error("Please enter voucher code");
    }
    if (components.items.reduce((a, b) => a + b.quantity, 0) <= 0) {
        throw new Error("No items in basket");
    }
    try {
        const response = await fetch("/validate-voucher", {
            method : "POST",
            headers: {
                "Accept"      : "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
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

        components.updateOrderSummary(products, data);
        return data;
    } catch (error) {
        components.displayErrorMessage(error);
    }
};

components.checkoutButton.addEventListener("click", e => {
    if (!components.promotionHolder.childNodes.length || !voucherProperties.code) {
        e.preventDefault();
        components.promotionHolder.innerHTML = "<h5 id=\"error-message\">Please validate voucher code</h5>";
        return;
    }
    components.saveCartAndVoucherInSessioStorage(products, voucherProperties);
    window.location.href = "/checkout.html";

});

components.validateForm.addEventListener("submit", event => {
    event.preventDefault();
    const code = components.voucherCodeValue.value;
    fetchValidateVoucher(code);
});