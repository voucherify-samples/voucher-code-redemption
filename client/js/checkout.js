import * as components from "./components.js";

const { products, voucherProperties } = components.getCartAndVoucherFromSessionStorage();
components.renderProductsFromStorage(products);
components.renderVoucherPropertiesFromStorage(voucherProperties, products);

const fetchRedeemVoucher = async (code, products) => {
    try {
        const { amount } = components.filterAndReduceItemsWithAmount(products);
        const response = await fetch("/redeem-voucher", {
            method : "POST",
            headers: {
                "Accept"      : "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code, amount }),
        });

        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message);
        }
        if (data.status !== "success") {
            throw new Error("Redeem voucher is not possible");
        }
        components.redeemVoucherButton.innerHTML = `${data.message}`;
        window.sessionStorage.clear();
        return data;
    } catch (error) {
        components.redeemVoucherButton.innerHTML = `${error.message}`;
    }
};

components.redeemVoucherButton.addEventListener("click", e => {
    e.preventDefault();
    const voucherCode = voucherProperties.code;
    fetchRedeemVoucher(voucherCode, products);
});