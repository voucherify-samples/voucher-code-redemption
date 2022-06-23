// Cart componmets
export class CartPreview {
    constructor() {
        this.htmlElement = document.getElementById("cart-summary-list");
        this.listRowHtmlElement = document.getElementById("cart-summary-row-template");
    }

    onIncrement(incrementHandler) {
        this.incrementHandler = incrementHandler;
    }

    onDecrement(decrementHandler) {
        this.decrementHandler = decrementHandler;
    }

    render(cartItems) {
        this.htmlElement.replaceChildren(...cartItems
            .map(
                (item, index) => {
                    const row = this.listRowHtmlElement.cloneNode(true).content.children[0];
                    row.setAttribute("key", index);
                    row.querySelector("img").setAttribute("src", item.src);
                    row.querySelector("input").setAttribute("value", item.quantity);
                    row.querySelector(".name-and-description span:nth-child(1)").innerHTML = item.productName;
                    row.querySelector(".name-and-description span:nth-child(2)").innerHTML = item.productDescription;

                    row.querySelector(".increment").addEventListener("click", () => {
                        if (typeof this.incrementHandler === "function") {
                            this.incrementHandler(index);
                        }
                    });

                    row.querySelector(".decrement").addEventListener("click", () => {
                        if (typeof this.incrementHandler === "function") {
                            this.decrementHandler(index);
                        }
                    });
                    return row;
                }
            ));
    }
}

export class OrderSummary {
    constructor() {
        this.promotionHolder = document.getElementById("promotion-holder");
        this.subtotal = document.getElementById("subtotal");
        this.grandTotalSpan = document.getElementById("grand-total");
        this.allDiscountsSpan = document.getElementById("all-discounts");
        this.checkoutButton = document.getElementById("checkout-button");
        this.vocuherForm = document.getElementById("voucher-code-form");
        this.voucherValue = document.getElementById("voucher-code");

        this.vocuherForm.addEventListener("submit", event => {
            event.preventDefault();
            if (typeof this.voucherCodeSubmitHandler !== "function") {
                return;
            }
            this.voucherCodeSubmitHandler(this.voucherValue.value.trim());
        });

        this.checkoutButton.addEventListener("click", event => {
            event.preventDefault();
            if (typeof this.submitHandler === "function") {
                this.submitHandler();
            }
        });
    }

    onVoucherCodeSubmit(handler) {
        this.voucherCodeSubmitHandler = handler;
    }

    onSubmitButton(handler) {
        this.submitHandler = handler;
    }

    displayErrorMessage(msg) {
        this.promotionHolder.innerHTML = `<h5 id=\"error-message\">${msg}</h5>`;
    }

    update(items, voucherProperties) {
        const promotions = voucherProperties.amount ? voucherProperties.amount / 100 : 0;
        const summedUpPrices = sumProductPrices(items);
        const grandTotal = summedUpPrices - promotions;

        if (promotions) {
            this.promotionHolder.innerHTML = `<h5>${voucherProperties.code}<span>${promotions.toFixed(2)}$ OFF</span></h5>
            <span>-$${promotions.toFixed(2)}</span>`;
            this.subtotal.innerHTML = `$${summedUpPrices}`;
            this.grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
            this.allDiscountsSpan.innerHTML = promotions ? `-$${promotions.toFixed(2)}` : "0";
        }
    }
}

// Checkout components

export class ProductList {
    constructor() {
        this.summedProducts = document.querySelector(".summed-products");
    }
    update(products) {
        this.summedProducts.innerHTML = `${products.map((item, index) => {
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
    }
}

export class OrderCard {
    constructor() {
        this.couponValueSpan = document.querySelector(".coupon");
        this.discountValueSpan = document.querySelector(".discount-value span");
        this.subtotalValueSpan = document.querySelector(".subtotal span");
        this.allDiscountsValueSpan = document.querySelector(".all-discounts span");
        this.shippingValueSpan = document.querySelector(".shipping span");
    }
    update(products, voucherProperties) {
        const promotions = voucherProperties.amount ? voucherProperties.amount / 100 : 0;
        const summedUpPrices = sumProductPrices(products);
        const grandTotal = summedUpPrices - promotions;

        this.discountValueSpan.innerHTML = `-$${promotions}`;

        // todo!!!!!

        // this.allDiscountsValueSpan.innerHTML = `${voucherProperties.discount === 0 ? "Free shipping" : (`-$${voucherProperties.discount}`)}`;
        // this.subtotalValueSpan.innerHTML = `$${grandTotal}`;
        // couponValueSpan.innerHTML = `<span class="coupon-value">${values.campaign ? values.campaign : values.voucher}</span>`;
        // const grandTotalValueSpan = document.querySelector(".grand-total span");
        // shippingValueSpan.innerHTML = `${values.discount === 0 ? values.discount : shippingValueSpan.innerHTML}`;
        // grandTotalValueSpan.innerHTML = `$${(+shippingValueSpan.innerHTML + +values.subtotal - values.discount).toFixed(2)}`;
        // shippingValueSpan.innerHTML = "$" + shippingValueSpan.innerHTML;
    }
}

// Utils
const sumProductPrices = items => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((acc, a) => acc + a, 0)
        .toFixed(2);
};

export const getCartAndVoucherFromSessionStorage = () => {
    const products = JSON.parse(sessionStorage.getItem("products") || "[]");
    const voucherProperties = JSON.parse(sessionStorage.getItem("voucherProperties") || "{}");
    return { products, voucherProperties };
};

export const saveCartAndVoucherInSessionStorage = (items, voucherProperties) => {
    window.sessionStorage.setItem("products", JSON.stringify(items));
    window.sessionStorage.setItem("voucherProperties", JSON.stringify(voucherProperties));
};

export const defaultCartProducts = [
    {
        productName: "Johan & Nystrom Caravan",
        productDescription: "20 oz bag",
        quantity: 1,
        price: "26.99",
        src: "./images/johan2.jpeg",
    },
    {
        productName: "Illy Arabica",
        productDescription: "Bestseller 18 oz bag",
        quantity: 1,
        price: "21.02",
        src: "./images/illy_arabica.jpeg",
    },
    {
        productName: "Hard Beans Etiopia",
        productDescription: "6 oz bag",
        quantity: 1,
        price: "3.88",
        src: "./images/hardbean.jpeg",
    },
    {
        productName: "Johan & Nystrom Bourbon",
        productDescription: "20 oz bag",
        quantity: 2,
        price: "41.98",
        src: "./images/johan2.jpeg",
    },
];