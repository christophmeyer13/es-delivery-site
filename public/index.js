import Database from "./Database.js";
import TabakView from "./TabakView.js";
import OrderView from "./OrderView.js";
import OrderForm from "./OrderForm.js";
import { analytics } from "./Database.js";
import GutscheinView from "./GutscheinView.js";
import Product from "./Product.js";

let products;

async function init() {
  products = await Database.getProducts();
  let tabak = [],
    zubehör = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].art === "Tabak") {
      tabak.push(products[i]);
    } else {
      zubehör.push(products[i]);
    }
  }
  TabakView.setElement(document.querySelector(".tabak"));
  TabakView.getListItems(tabak, zubehör);
  TabakView.addEventListener("appendOrder", onProductToOrderRequest);
  OrderView.setElement(document.querySelector(".order"), products);
  OrderView.addEventListener("priceCheck", checkPrice);
  OrderForm.setElement(document.querySelector(".form"));
  OrderForm.addEventListener("submit", onSubmitRequest);

  GutscheinView.setElement(document.querySelector(".gutschein-btn"));
  GutscheinView.addEventListener("giftCardRequest", onGiftCardRequested);
}

function onProductToOrderRequest(event) {
  let id = event.data.id;
  let product;
  for (let i = 0; i < products.length; i++) {
    if (products[i].name === id) {
      product = products[i];
    }
  }
  OrderView.pushProduct(product);
  let gesamt = OrderView.calcWholeOrder();
  if (gesamt >= 20) {
    OrderForm.show();
  } else {
    OrderForm.hide();
  }
}

function onGiftCardRequested(event) {
  let product = new Product(
    `Gutschein ${event.data.value}€`,
    1000,
    "Gutschein",
    event.data.value
  );
  OrderView.pushProduct(product);
  let gesamt = OrderView.calcWholeOrder();
  if (gesamt >= 20) {
    OrderForm.show();
  } else {
    OrderForm.hide();
  }
}

async function onSubmitRequest(event) {
  let name = event.data.name,
    address = event.data.address,
    phone = event.data.phone,
    orderString = "",
    order = OrderView.getOrder(),
    giftCardCount = 0,
    productCount = 0;
  for (let i = 0; i < order[0].length; i++) {
    if (order[0][i].name.includes("Gutschein")) {
      giftCardCount++;
    } else {
      productCount++;
    }
    orderString += `${order[0][i].quantity}x ${order[0][i].name}<br>`;
  }

  let price;
  if (giftCardCount > 0 && productCount === 0) {
    price = order[1] - 4;
  } else {
    price = order[1];
  }

  let templateParams = {
    name: name,
    address: address,
    phone: phone,
    orderX: orderString,
    gesamt: (price + 4).toFixed(2) + "",
  };

  let flag = await Database.uploadChanges(order[0], (order[1] + 4).toFixed(2));

  if (flag) {
    emailjs.send("gmail", "template_EzarfTK1", templateParams).then(
      function (response) {},
      function (error) {
        console.error("index_error_sending_email");
      }
    );
    resetForm(price);
    analytics.logEvent("order_sent");
  } else {
    alert(
      "Unser Bestand von einem deiner ausgewählten Produkte wurde inzwischen aufgebraucht! Bitte lade die Seite erneut und versuche es noch einmal."
    );
    location.reload();
  }
}

async function resetForm(gesamt) {
  OrderView.reset();
  OrderForm.reset();
  OrderForm.hide();
  alert(
    `Danke für deine Bestellung! Bitte halte ${(gesamt + 4).toFixed(
      2
    )}€ möglichst passend bereit.`
  );
  TabakView.reset();
  products = await Database.getProducts();
  let tabak = [],
    zubehör = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].art === "Tabak") {
      tabak.push(products[i]);
    } else {
      zubehör.push(products[i]);
    }
  }
  TabakView.getListItems(tabak, zubehör);
}

function checkPrice(event) {
  let gesamt = event.data.gesamt;
  if (gesamt < 20) {
    OrderForm.hide();
  }
}

const _error = console.error;

console.error = function (args) {
  analytics.logEvent(args);
  return _error.apply(console, arguments);
};

init();
