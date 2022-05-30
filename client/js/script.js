const cartSummary = document.getElementById("cart-summary");
const checkoutButton = document.getElementById("checkout-button");
const promotionHolder = document.getElementById("promotion-holder");
const voucherValue = document.getElementById("voucher-code");
const buttonValidateCode = document.getElementById("check-voucher-code");
const subtotal = document.getElementById("subtotal");
const allDiscountsSpan = document.getElementById("all-discounts");
const grandTotalSpan = document.getElementById("grand-total");
const voucherForm = document.querySelector(".voucher-input-and-button-holder form");


let items = [
    {
        productName       : "Johan & Nystrom Caravan",
        productDescription: "20 oz bag",
        quantity          : 1,
        price             : "26.99",
        src               : "./images/johan2.jpeg",
    },
    {
        productName       : "Illy Arabica",
        productDescription: "Bestseller 18 oz bag",
        quantity          : 1,
        price             : "21.02",
        src               : "./images/illy_arabica.jpeg",
    },
    {
        productName       : "Hard Beans Etiopia",
        productDescription: "6 oz bag",
        quantity          : 1,
        price             : "3.88",
        src               : "./images/hardbean.jpeg",
    },
    {
        productName       : "Johan & Nystrom Bourbon",
        productDescription: "20 oz bag",
        quantity          : 2,
        price             : "41.98",
        src               : "./images/johan2.jpeg",
    },
];

let promotions = 0;
let grandTotal = 0;

const summaryInnerText = () => {
    cartSummary.innerHTML = `<h2>Item summary (4)</h2> ${items
        .map(
            (item, index) =>
                `<div class='item' key=${index}>
                      <img src='${item.src}' alt="product ${item.productName}"/>
                      <div class='name-and-description'>
                        <span>${item.productName}</span>
                        <span>${item.productDescription}</span>
                      </div>
                      <div class="form-and-button-holder">
                        <button class='decrement' id="decrementQuantity-${index}">-</button>
                        <form>
                        <input class='increment-input' type="number" value="${item.quantity}"/>
                        </form>
                        <button class='increment' id="incrementQuantity-${index}">+</button>
                      </div>
                      <span class="price">$${item.price}</span>
                      <button class="remove-button">Remove</button>
                     </div>`
        )
        .join("")}`;
};

cartSummary ? summaryInnerText() : "";

const quantityInputs = document.querySelectorAll(".increment-input");
const incrementButtons = document.querySelectorAll(".increment");
const decrementButtons = document.querySelectorAll(".decrement");

const incrementQuantity = () => {
    incrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            items[index].quantity = items[index].quantity + 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            voucherValue.value = "";
            sessionStorage.removeItem("values");
            sessionStorage.removeItem("products");
            grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
            allDiscountsSpan.innerHTML = "n/a";
            promotionHolder.innerHTML = "";
        });
    });
};
incrementQuantity();


const decrementQuantity = () => {
    decrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (items[index].quantity < 1) { return; }
            items[index].quantity = items[index].quantity - 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            voucherValue.value = "";
            sessionStorage.removeItem("values");
            sessionStorage.removeItem("products");
            grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
            allDiscountsSpan.innerHTML = "n/a";
            promotionHolder.innerHTML = "";
        });
    });
};
decrementQuantity();

const addProductPrices = items => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((partialSum, a) => partialSum + a, 0)
        .toFixed(2);
};

const summedValuesToCheckout = [
    {
        discount: "",
        subtotal: "",
        voucher : "",
        campaign: ""
    }
];

const summaryPrices = () => {
    const summedUpPrices = addProductPrices(items);
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
};

const validateCode = async voucherCode => {
    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
        promotionHolder.innerHTML = "<h5 id=\"error-message\">No items in basket</h5>";

        return false;
    }
    if (!voucherCode) {
        promotionHolder.innerHTML = "<h5 id=\"error-message\">Please enter voucher code</h5>";
        return false;
    }

    const response = await fetch("/validate-voucher", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherCode }),
    });
    const data = await response.json();

    if (response.status === 200) {
        return { amount: data.amount, campaign: data.campaign, code: data.code, status: data.status };
    }
    if (response.status === 404) {
        return Promise.reject(data);
    }
    if (response.status === 400) {
        return Promise.reject(data);
    }
};

const summedVouchersAfterValidate = result => {
    promotions = result.amount ? result.amount / 100 : 0;
    grandTotal = addProductPrices(items) - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
    promotionHolder.innerHTML = `<h5>${result.campaign ? result.campaign : ""
    }<span>${promotions.toFixed(2)}$ OFF</span></h5>
            <span>-$${promotions.toFixed(2)}</span>`;
    const subtotalValue = addProductPrices(items);
    summedValuesToCheckout[0].discount = promotions;
    summedValuesToCheckout[0].subtotal = subtotalValue;
    summedValuesToCheckout[0].voucher = voucherValue.value.trim();
    summedValuesToCheckout[0].campaign = result.campaign;
    sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
};

const freeShippingAfterValidate = result => {
    grandTotal = parseFloat(addProductPrices(items));
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    allDiscountsSpan.innerHTML = "Free shipping";
    promotionHolder.innerHTML = `<h5>${result.campaign ? result.campaign : "FREE SHIPPING"}</h5>
    <span>$0</span>`;
    const subtotalValue = addProductPrices(items);
    summedValuesToCheckout[0].discount = 0;
    summedValuesToCheckout[0].subtotal = subtotalValue;
    summedValuesToCheckout[0].voucher = voucherValue.value.trim();
    summedValuesToCheckout[0].campaign = result.campaign;
    sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
};

if (checkoutButton) {
    checkoutButton.addEventListener("click", e => {
        const voucherCode = voucherValue.value.trim();
        if (!voucherCode) {
            promotionHolder.innerHTML = "<h5 id=\"error-message\">Please enter voucher code</h5>";
            return false;
        }
        if (sessionStorage.length === 0) {
            e.preventDefault();
            promotionHolder.innerHTML = "<h5 id=\"error-message\">Please validate voucher code</h5>";
        } else {
            setTimeout(() => {
                window.location.href = "/checkout.html";
                voucherValue.value = "";
                grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
                allDiscountsSpan.innerHTML = "n/a";
                promotionHolder.innerHTML = "";
            }, 1000);
        }
    });
}

const productsToSessionStorage = () => {
    window.sessionStorage.setItem("products", JSON.stringify(items));
};

const validateVoucher = () => {
    const voucherCode = voucherValue.value.trim();
    validateCode(voucherCode).then(
        result => {
            if (result.amount) {
                summedVouchersAfterValidate(result);
                productsToSessionStorage();
            }
            if (result.code === "FREE SHIPPING") {
                freeShippingAfterValidate(result);
                productsToSessionStorage();
            }
        }
    ).catch(error => {
        promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
    });
};

if (voucherValue) {
    voucherValue.addEventListener("input", () => {
        if (voucherValue.value === "") {
            checkoutButton.innerHTML = "Checkout";
            grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
            allDiscountsSpan.innerHTML = "n/a";
            promotionHolder.innerHTML = "";
        }
    });
}

if (buttonValidateCode) {
    buttonValidateCode.addEventListener("click", validateVoucher) || voucherValue.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            voucherForm.addEventListener("submit", e => {
                e.preventDefault();
            });
            validateVoucher();
        }
    });
}

if (window.location.href === "http://localhost:3000/" || window.location.href === "http://localhost:3000/index.html") {
    window.addEventListener("load", () => {
        sessionStorage.removeItem("values");
        sessionStorage.removeItem("products");
    });
}