export const voucherCodeValue = document.getElementById("voucher-code");
export const checkoutButton = document.getElementById("checkout-button");
export const promotionHolder = document.getElementById("promotion-holder");
export const validateForm = document.getElementById("validate-form");
export const redeemVoucherButton = document.querySelector(".nav-buttons button");
const subtotal = document.getElementById("subtotal");
const grandTotalSpan = document.getElementById("grand-total");
const allDiscountsSpan = document.getElementById("all-discounts");
const summaryCartItems = document.getElementById("cart-summary");
const summedProducts = document.querySelector(".summed-products");
const vouchersWrapper = document.querySelector(".coupon");
const voucherDiscounts = document.querySelector(".discount-value span");
const subtotalValue = document.querySelector(".subtotal span");
const allDiscountsValue = document.querySelector(".all-discounts span");
const shippingValue = document.querySelector(".shipping span");
const grandTotalValue = document.querySelector(".grand-total span");

let promotions = 0;

export const updateSummaryCardItems = products => {
    summaryCartItems.innerHTML = `<h2>Item summary (4)</h2> ${products
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

export const handleIncrement = onIncrement => {
    document.querySelectorAll(".increment").forEach((button, index) => {
        button.addEventListener("click", () => {
            onIncrement(index);
            // document.querySelectorAll(".increment-input")[index].value++;
        });
    });
};

export const handleDecrement = products => {
    document.querySelectorAll(".decrement").forEach((button, index) => {
        button.addEventListener("click", () => {
            if (products[index].quantity <= 0) { return; }
            products[index].quantity--;
            document.querySelectorAll(".increment-input")[index].value--;
            updateOrderSummary(products);
        });
    });
};

export const displayErrorMessage = message => {
    promotionHolder.innerHTML = `<h5 id="error-message">${message}</h5>`;
};

export const updateOrderSummary = (items, voucherProperties) => {
    promotions = voucherProperties?.amount ? voucherProperties.amount / 100 : promotions;
    const summedUpPrices = sumProductPrices(items);
    const grandTotal = summedUpPrices - promotions;
    if (voucherProperties?.code) {
        promotionHolder.innerHTML = `<h5>${voucherProperties.code}<span>${promotions.toFixed(2)}$ OFF</span></h5>
        <span>$${promotions.toFixed(2)}</span>`;
    }
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotalSpan.innerHTML = `$${grandTotal <= 0 ? "0.00" : grandTotal.toFixed(2)}`;
    allDiscountsSpan.innerHTML = promotions ? `$${promotions.toFixed(2)}` : "$0.00";
    voucherCodeValue.value = "";
};

export const updateProductsFromStorage = products => {
    summedProducts.innerHTML = `${products.map((item, index) => {
        if (item.quantity === 0) {
            return;
        } else {
            return `<div class="each-product" key=${index}>
                <img src="${item.src}" />
                <div class="each-product-name">
                    <h6>${item.productName}</h6>
                    <p>Quantity ${item.quantity}</p>
                </div>
                <span>$${item.price}</span>
            </div>`;
        }
    }).join("")}`;
};

export const updateVoucherPropertiesFromStorage = (voucherProperties, products) => {
    const subtotal = sumProductPrices(products);
    voucherDiscounts.innerHTML = `$${voucherProperties.amount / 100 || 0}`;
    allDiscountsValue.innerHTML = voucherProperties.amount ? `$${voucherProperties.amount / 100}` : "Free shipping";
    subtotalValue.innerHTML = `$${subtotal}`;
    vouchersWrapper.innerHTML = `<span class="coupon-value">${voucherProperties.code}</span>`;
    shippingValue.innerHTML = `${!voucherProperties.amount ? 0 : shippingValue.innerHTML}`;
    grandTotalValue.innerHTML = `$${(+shippingValue.innerHTML + +subtotal).toFixed(2)}`;
    shippingValue.innerHTML = "$" + shippingValue.innerHTML;
};

export const sumProductPrices = items => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((partialSum, a) => partialSum + a, 0)
        .toFixed(2);
};

export const getCartAndVoucherFromSessionStorage = () => {
    const products = JSON.parse(sessionStorage.getItem("products") || "[]");
    const voucherProperties = JSON.parse(sessionStorage.getItem("voucherProperties") || "[]");
    return { products, voucherProperties };
};

export const saveCartAndVoucherInSessioStorage = (items, voucherProperties) => {
    window.sessionStorage.setItem("products", JSON.stringify(items));
    window.sessionStorage.setItem("voucherProperties", JSON.stringify(voucherProperties));
};

export const items = [
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