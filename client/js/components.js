export const checkoutButton = document.getElementById("checkout-button");
export const redeemVoucherButton = document.querySelector(".nav-buttons button");

export const getCartPreviewRender = ({ onIncrement, onDecrement }) => {
    const render = cartItems => {
        const htmlElement = document.getElementById("cart-summary-list");
        const listRowHtmlElement = document.getElementById("cart-summary-row-template");
        htmlElement.replaceChildren(...cartItems
            .map(
                (item, index) => {
                    const row = listRowHtmlElement.cloneNode(true).content.children[0];
                    row.setAttribute("key", index);
                    row.querySelector("img").setAttribute("src", item.src);
                    row.querySelector("input").setAttribute("value", item.quantity);
                    row.querySelector(".name-and-description span:nth-child(1)").innerHTML = item.productName;
                    row.querySelector(".name-and-description span:nth-child(2)").innerHTML = item.productDescription;
                    row.querySelector(".price").innerHTML = item.price;

                    row.querySelector(".increment").addEventListener("click", () => {
                        if (typeof onIncrement === "function") {
                            onIncrement(index, render);
                        }
                    });

                    row.querySelector(".decrement").addEventListener("click", () => {
                        if (typeof onDecrement === "function") {
                            onDecrement(index, render);
                        }
                    });
                    return row;
                }
            ));
    };
    return render;
};

export const getOrderSummaryRender = ({ onVoucherCodeSubmit }) => {
    const render = (items, voucherProperties) => {
        const htmlElement = document.getElementById("total-order-holder");
        const holderOrderHtmlElement = document.getElementById("total-order-holder-template");
        const template = holderOrderHtmlElement.cloneNode(true).content;
        const promotions = voucherProperties?.amount ? voucherProperties.amount / 100 : 0;
        const summedUpPrices = sumProductPrices(items);
        const grandTotal = summedUpPrices - promotions;
        if (voucherProperties?.code) {
            template.getElementById("promotion-holder").innerHTML = `<h5>${voucherProperties.code}<span>${promotions.toFixed(2)}$ OFF</span></h5>
            <span>$${promotions.toFixed(2)}</span>`;
        }
        template.getElementById("subtotal").innerHTML = `$${summedUpPrices}`;
        template.getElementById("grand-total").innerHTML = `$${grandTotal <= 0 ? "0.00" : grandTotal.toFixed(2)}`;
        template.getElementById("all-discounts").innerHTML = promotions ? `$${promotions.toFixed(2)}` : "$0.00";
        const voucherValue = template.getElementById("voucher-code");
        template.getElementById("voucher-code-form").addEventListener("submit", event => {
            event.preventDefault();
            if (typeof onVoucherCodeSubmit === "function") {
                onVoucherCodeSubmit(voucherValue.value.trim(), render);
            }
        });

        htmlElement.replaceChildren(template);
        return template;
    };
    return render;
};

export const displayErrorMessage = message => {
    document.getElementById("promotion-holder").innerHTML = `<h5 id="error-message">${message}</h5>`;
    document.getElementById("voucher-code-form").addEventListener("submit", event => {
        event.preventDefault();
    });
    return false;
};

export const renderProductsFromStorage = products => {
    const htmlElement = document.querySelector(".summed-products");
    const summedProductsHtmlElement = document.querySelector(".summed-products-template");
    htmlElement.replaceChildren(...products.map((item, index) => {
        const summedProductsTemplate = summedProductsHtmlElement.cloneNode(true).content.children[0];
        summedProductsTemplate.setAttribute("key", index);
        summedProductsTemplate.querySelector("img").setAttribute("src", item.src);
        summedProductsTemplate.querySelector("h6").innerHTML = `${item.productName}`;
        summedProductsTemplate.querySelector("p").innerHTML = `Quantity ${item.quantity}`;
        summedProductsTemplate.querySelector("span").innerHTML = `${item.price}`;
        return summedProductsTemplate;
    }));
};

export const renderVoucherPropertiesFromStorage = (voucherProperties, products) => {
    const htmlElement = document.querySelector(".discounts");
    const discountsHtmlElement = document.querySelector(".discounts-template");
    const discountsTemplate = discountsHtmlElement.cloneNode(true).content;
    const subtotal = sumProductPrices(products);
    const discountValue = discountsTemplate.querySelector(".discount-value span").innerHTML = `$${voucherProperties.amount / 100 || 0}`;
    discountsTemplate.querySelector(".all-discounts span").innerHTML = voucherProperties.amount ? `$${voucherProperties.amount / 100}` : "Free shipping";
    discountsTemplate.querySelector(".subtotal span").innerHTML = `$${subtotal}`;
    discountsTemplate.querySelector(".coupon").innerHTML = `<span class="coupon-value">${voucherProperties.code}</span>`;
    const shipping = discountsTemplate.querySelector(".shipping span").innerHTML = `${!voucherProperties.amount ? 0 : "$20"}`;
    discountsTemplate.querySelector(".grand-total span").innerHTML = `$${(+shipping.replace("$", "") + +subtotal - discountValue.replace("$", "")).toFixed(2)}`;
    htmlElement.replaceChildren(discountsTemplate);
    return discountsTemplate;
};

export const sumProductPrices = items => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((partialSum, a) => partialSum + a, 0)
        .toFixed(2);
};

export const filterAndReduceItemsWithAmount = products => {
    const items = products.filter(item => item.quantity !== 0).map(product => ({ sku_id: product.productName, quantity: product.quantity, price: parseFloat(product.price) * 100 }));
    const amount = items.reduce((acc, product) => acc + product.quantity * product.price, 0);
    return { items, amount };
};

export const getCartAndVoucherFromSessionStorage = () => {
    const productsFromSessionStorage = JSON.parse(sessionStorage.getItem("products") || "[]");
    const voucherPropertiesFromSessionStorage = JSON.parse(sessionStorage.getItem("voucherProperties") || "{}");

    return {
        products         : productsFromSessionStorage.length ? productsFromSessionStorage : items,
        voucherProperties: voucherPropertiesFromSessionStorage.code ? voucherPropertiesFromSessionStorage : {
            amount: "",
            code  : ""
        }
    };
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