window.addEventListener("load", () => {
    const redeemCode = async voucherCode => {
        const response = await fetch("/redeem-voucher", {
            method : "POST",
            headers: {
                //prettier-ignore
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

    const innerSummedProducts = summedProducts => {
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

    const innerSummedValues = (discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, couponValueSpan, shippingValueSpan) => {
        const values = JSON.parse(sessionStorage.getItem("values") || "[]");
        values.map(item => {
            discountValueSpan.innerHTML = `-$${item.discount}`;
            allDiscountsValueSpan.innerHTML = `${item.discount === 0 ? "Free shipping" : (`-$${item.discount}`)}`;
            subtotalValueSpan.innerHTML = `$${item.subtotal}`;
            couponValueSpan.innerHTML = `<span class="coupon-value">${item.campaign ? item.campaign : item.voucher}</span>`;
            const grandTotalValueSpan = document.querySelector(".grand-total span");
            shippingValueSpan.innerHTML = `${item.discount === 0 ? item.discount : shippingValueSpan.innerHTML}`;
            grandTotalValueSpan.innerHTML = `$${(+shippingValueSpan.innerHTML + +item.subtotal - item.discount).toFixed(2)}`;
            shippingValueSpan.innerHTML = "$" + shippingValueSpan.innerHTML;
        });
    };

    const summedProducts = document.querySelector(".summed-products");
    const couponValueSpan = document.querySelector(".coupon");
    const discountValueSpan = document.querySelector(".discount-value span");
    const subtotalValueSpan = document.querySelector(".subtotal span");
    const allDiscountsValueSpan = document.querySelector(".all-discounts span");
    const shippingValueSpan = document.querySelector(".shipping span");
    const completeOrderButton = document.querySelector(".nav-buttons button");

    document.getElementById("ephone").value = "voucherify@sample.io";
    document.getElementById("fullname").value = "Jack Smith";
    document.getElementById("company").value = "Voucherify";
    document.getElementById("adress").value = "Magic Street 10";
    document.getElementById("postal").value = "11-130";
    document.getElementById("city").value = "Warsaw";

    innerSummedValues(discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, couponValueSpan, shippingValueSpan);
    innerSummedProducts(summedProducts);
    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
    const voucherCode = values[0].voucher;
    sessionStorage.removeItem("values");
    sessionStorage.removeItem("products");

    completeOrderButton.addEventListener("click", e => {
        e.preventDefault();
        redeemCode(voucherCode)
            .then(result => {
                if (result.status === "success") {
                    setTimeout(() => {
                        completeOrderButton.innerHTML = "Order completed";
                    }, 1000);
                }
            })
            .catch(error => {
                completeOrderButton.innerHTML = `${error.message}`;
            });
    });
});