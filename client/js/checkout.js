import * as components from "./components.js";

const { products, voucherProperties } = components.getCartAndVoucherFromSessionStorage();

components.updateProductsFromStorage(products);
components.updateVoucherPropertiesFromStorage(voucherProperties, products);

const fetchRedeemVoucher = async code => {
    try {
        const response = await fetch("/redeem-voucher", {
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
    fetchRedeemVoucher(voucherCode);
});