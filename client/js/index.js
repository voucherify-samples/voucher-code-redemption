import * as s from "./services.js";

s.summaryCardItems && s.renderSummaryCardItems(s.summaryCardItems);

const quantityInputs = document.querySelectorAll(".increment-input");
const incrementButtons = document.querySelectorAll(".increment");
const decrementButtons = document.querySelectorAll(".decrement");

s.handleIncrement(incrementButtons, quantityInputs);
s.handleDecrement(decrementButtons, quantityInputs);

const fetchValidateVoucher = async voucherCode => {
    const response = await fetch("/validate-voucher", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherCode }),
    });
    const data = await response.json();

    if (response.status !== 200) {
        throw Error(data.message);
    }
    return { amount: data.amount, campaign: data.campaign, code: data.code, status: data.status };
};

const fetchRedeemVoucher = async voucherCode => {
    const response = await fetch("/redeem-voucher", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherCode }),
    });

    const data = await response.json();
    if (response.status !== 200) {
        throw Error(data.message);
    }
    return { amount: data.amount, campaign: data.campaign, code: data.code, status: data.status };
};

s.checkoutButton && s.checkoutButton.addEventListener("click", e => {
    if (!s.voucherProperties.voucher || !s.promotionHolder.childNodes.length) {
        e.preventDefault();
        s.promotionHolder.innerHTML = "<h5 id=\"error-message\">Please validate voucher code</h5>";
    } else {
        setTimeout(() => {
            productsToSessionStorage();
            window.location.href = "/checkout.html";
        }, 1000);
    }
});

const productsToSessionStorage = () => {
    window.sessionStorage.setItem("products", JSON.stringify(s.items));
    window.sessionStorage.setItem("values", JSON.stringify(s.voucherProperties));
};

const validateVoucher = () => {
    const voucherCode = s.voucherValue.value.trim();

    if (s.items.reduce((a, b) => a + b.quantity, 0) === 0) {
        s.promotionHolder.innerHTML = "<h5 id=\"error-message\">No items in basket</h5>";
        return false;
    }
    if (!voucherCode) {
        s.promotionHolder.innerHTML = "<h5 id=\"error-message\">Please enter voucher code</h5>";
        return false;
    }
    fetchValidateVoucher(voucherCode).then(
        result => {
            if (result.status === "success") {
                s.updateOrderSummary(result);
            }
        }
    ).catch(error => {
        s.promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
    });
};

s.voucherValue && s.voucherValue.addEventListener("input", () => {
    if (!s.voucherValue.value) {
        s.updateOrderSummary();
    }
});

s.validateVoucherButton && (s.validateVoucherButton.addEventListener("click", validateVoucher) || s.voucherValue.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        s.voucherForm.addEventListener("submit", e => {
            e.preventDefault();
        });
        validateVoucher();
    }
}));

s.redeemVoucherButton && s.redeemVoucherButton.addEventListener("click", e => {
    e.preventDefault();
    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
    const voucherCode = values.voucher;
    fetchRedeemVoucher(voucherCode)
        .then(result => {
            if (result.status === "success") {
                s.redeemVoucherButton.innerHTML = "Order completed";
                sessionStorage.clear();
            }
        })
        .catch(error => {
            s.redeemVoucherButton.innerHTML = `${error.message}`;
        });
});