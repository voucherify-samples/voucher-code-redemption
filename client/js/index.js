import * as components from "./components.js";

const { products: productsFromSesision, voucherProperties: voucherPropertiesFromSession } = components.getCartAndVoucherFromSessionStorage();

export const products = productsFromSesision.length ? productsFromSesision : components.defaultCartProducts;

export const voucherProperties = voucherPropertiesFromSession.code ? voucherPropertiesFromSession : {
    amount: "",
    code: "",
    campaign: ""
};


const cartPreview = new components.CartPreview();
const orderSummary = new components.OrderSummary();

cartPreview.onIncrement(index => {
    products[index].quantity++;
    cartPreview.render(products);
    orderSummary.update(products, voucherProperties);
});

cartPreview.onDecrement(index => {
    products[index].quantity--;
    cartPreview.render(products);
    orderSummary.update(products, voucherProperties);
});

cartPreview.render(products);
orderSummary.update(products, voucherProperties);

orderSummary.onVoucherCodeSubmit(async code => {
    if (!code) {
        throw new Error("Please enter voucher code");
    }
    if (products.reduce((a, b) => a + b.quantity, 0) < 0) {
        throw new Error("No items in basket");
    }
    try {
        const response = await fetch("/validate-voucher", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ voucherCode: code }),
        });

        if (response.status !== 200) {
            throw new Error(responseData.message);
        }

        const responseData = await response.json();

        if (responseData.status !== "success") {
            throw new Error("We could not validate coupon");
        }
        voucherProperties.amount = responseData.amount;
        voucherProperties.code = responseData.code;
        voucherProperties.campaign = responseData.campaign;

        orderSummary.update(products, voucherProperties);
    } catch (e) {
        orderSummary.displayErrorMessage(e.message);
    }
});

orderSummary.onSubmitButton(() => {
    if (!voucherProperties.code) {
        return orderSummary.displayErrorMessage("Please, try to add voucher code first");
    }
    components.saveCartAndVoucherInSessionStorage(products, voucherProperties);
    window.location.href = "/checkout.html";
});

