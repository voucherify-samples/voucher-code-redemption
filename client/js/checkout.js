import * as components from "./components.js";

const { products, voucherProperties } = components.getCartAndVoucherFromSessionStorage();

const productList = new components.ProductList();
const orderCard = new components.OrderCard();
productList.update(products);
orderCard.update(products, voucherProperties);



document.querySelector(".nav-buttons button").addEventListener("click", async event => {
    event.preventDefault();
    try {

        const response = await fetch("/redeem-voucher", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ voucherCode: voucherProperties.code }),
        });

        const responseData = await response.json();

        if (response.status !== 200) {
            throw Error(responseData.message);
        }

        if (responseData.status !== "success") {
            throw new Error("Could not redeem the Voucher");
        }
        document.querySelector(".nav-buttons button").innerHTML = "Order completed";
        sessionStorage.clear();
    } catch (err) {
        document.querySelector(".nav-buttons button").innerHTML = err.message;
    }
});