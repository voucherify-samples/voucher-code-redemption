const subtotal = document.getElementById("subtotal");
const grandTotalSpan = document.getElementById("grand-total");
const allDiscountsSpan = document.getElementById("all-discounts");
export const voucherValue = document.getElementById("voucher-code");
export const summaryCardItems = document.getElementById("cart-summary");
export const checkoutButton = document.getElementById("checkout-button");
export const promotionHolder = document.getElementById("promotion-holder");
export const redeemVoucherButton = document.querySelector(".nav-buttons button");
export const validateVoucherButton = document.getElementById("check-voucher-code");
export const voucherForm = document.querySelector(".voucher-input-and-button-holder form");

let promotions = 0;
let grandTotal = 0;

export const voucherProperties = {
    discount: "",
    subtotal: "",
    voucher : "",
    campaign: ""
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

export const renderSummaryCardItems = summaryCardItems => {
    summaryCardItems.innerHTML = `<h2>Item summary (4)</h2> ${items
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

export const handleIncrement = (incrementButtons, quantityInputs) => {
    incrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            items[index].quantity++;
            quantityInputs[index].value++;
            updateOrderSummary();
        });
    });
};

export const handleDecrement = (decrementButtons, quantityInputs) => {
    decrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (items[index].quantity === 0) { return; }
            items[index].quantity--;
            quantityInputs[index].value--;
            updateOrderSummary();
        });
    });
};

export const sumProductPrices = () => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((partialSum, a) => partialSum + a, 0)
        .toFixed(2);
};

export const updateOrderSummary = result => {
    if (result) {
        promotions = result.amount ? result.amount / 100 : 0;
        voucherProperties.voucher = result?.code;
        promotionHolder.innerHTML = `<h5>${result.code}<span>${promotions.toFixed(2)}$ OFF</span></h5>
                <span>-$${promotions.toFixed(2)}</span>`;
    }
    const summedUpPrices = sumProductPrices();
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    allDiscountsSpan.innerHTML = promotions ? `-$${promotions.toFixed(2)}` : "n/a";
    const subtotalValue = sumProductPrices();
    voucherProperties.discount = promotions;
    voucherProperties.subtotal = subtotalValue;
    voucherProperties.campaign = result?.campaign;
    voucherValue.value = "";
};

!validateVoucherButton && window.addEventListener("load", () => {
    const summedProducts = document.querySelector(".summed-products");
    const couponValueSpan = document.querySelector(".coupon");
    const discountValueSpan = document.querySelector(".discount-value span");
    const subtotalValueSpan = document.querySelector(".subtotal span");
    const allDiscountsValueSpan = document.querySelector(".all-discounts span");
    const shippingValueSpan = document.querySelector(".shipping span");

    const updateProductsFromStorage = () => {
        const products = JSON.parse(sessionStorage.getItem("products") || "[]");
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

    const updateValuesFromStorage = () => {
        const values = JSON.parse(sessionStorage.getItem("values") || "[]");
        discountValueSpan.innerHTML = `-$${values.discount}`;
        allDiscountsValueSpan.innerHTML = `${values.discount === 0 ? "Free shipping" : (`-$${values.discount}`)}`;
        subtotalValueSpan.innerHTML = `$${values.subtotal}`;
        couponValueSpan.innerHTML = `<span class="coupon-value">${values.campaign ? values.campaign : values.voucher}</span>`;
        const grandTotalValueSpan = document.querySelector(".grand-total span");
        shippingValueSpan.innerHTML = `${values.discount === 0 ? values.discount : shippingValueSpan.innerHTML}`;
        grandTotalValueSpan.innerHTML = `$${(+shippingValueSpan.innerHTML + +values.subtotal - values.discount).toFixed(2)}`;
        shippingValueSpan.innerHTML = "$" + shippingValueSpan.innerHTML;
    };

    document.getElementById("ephone").value = "voucherify@sample.io";
    document.getElementById("fullname").value = "Jack Smith";
    document.getElementById("company").value = "Voucherify";
    document.getElementById("adress").value = "Magic Street 10";
    document.getElementById("postal").value = "11-130";
    document.getElementById("city").value = "Warsaw";

    updateProductsFromStorage();
    updateValuesFromStorage();
});