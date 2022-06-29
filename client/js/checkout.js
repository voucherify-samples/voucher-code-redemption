import {
    renderProductsFromStorage,
    getCartAndVoucherFromSessionStorage,
    renderVoucherPropertiesFromStorage,
    filterAndReduceItemsWithAmount,
    redeemVoucherButton
} from "./lib.js";

const { products, voucherProperties } = getCartAndVoucherFromSessionStorage();

renderProductsFromStorage(products);
renderVoucherPropertiesFromStorage(voucherProperties, products);

const fetchRedeemVoucher = async (code, products) => {
    try {
        const { amount } = filterAndReduceItemsWithAmount(products);
        const response = await fetch("/redeem-voucher", {
            method: "POST",
            headers: {
                "Accept": "application/json",
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
        redeemVoucherButton.innerHTML = `${data.message}`;
        return data;
    } catch (error) {
        redeemVoucherButton.innerHTML = `${error.message}`;
    }
};

redeemVoucherButton.addEventListener("click", e => {
    e.preventDefault();
    const voucherCode = voucherProperties.code;
    fetchRedeemVoucher(voucherCode, products);
    window.sessionStorage.clear();
});