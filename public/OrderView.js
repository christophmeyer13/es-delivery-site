import { Event, Observable } from "./Observable.js";

class OrderView extends Observable {
  constructor() {
    super();
    this.order = [];
  }

  setElement(element) {
    this.element = element;
  }

  pushProduct(product) {
    let flag = false;
    let items = this.element.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      if (items[i].getAttribute("id") === product.name) {
        flag = true;
        // if (product.name === "Kohle") {
        //   alert(
        //     "Wir können im Moment leider nicht mehr als ein Kilo Kohle pro Bestellung verkaufen. Danke für dein Verständnis."
        //   );
        //   return;
        // }
        break;
      } else {
        flag = false;
      }
    }
    if (!flag) {
      let item = document.createElement("div"),
        template = document.querySelector(".list-item-order").innerHTML;
      item.innerHTML = template;
      item = item.firstElementChild;
      item.querySelector(".product").textContent = `1x ${product.name} |`;
      item.querySelector(".price").textContent =
        product.price.toFixed(2) + "€ ";
      item.querySelector(".price").setAttribute("price", product.price);
      item
        .querySelector(".delete")
        .addEventListener("click", this.onClick.bind(this));
      item.setAttribute("id", product.name);
      this.order.push(item);
      this.element.appendChild(item);
    } else {
      let elements = this.element.getElementsByTagName("li");
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].getAttribute("id") === product.name) {
          let quantity = parseInt(
            elements[i].querySelector(".product").textContent[0]
          );
          if (quantity < product.stock) {
            elements[i].querySelector(".product").textContent = `${
              quantity + 1
            }x ${product.name} |`;
            elements[i].querySelector(".price").textContent = `${(
              (quantity + 1) *
              product.price
            ).toFixed(2)}€ `;
          } else {
            alert("Unser Bestand is leider aufgebraucht");
          }
        }
      }
    }
  }

  calcWholeOrder() {
    let items = this.element.getElementsByTagName("li"),
      gesamt = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].firstElementChild) {
        gesamt += parseFloat(
          items[i]
            .querySelector(".price")
            .textContent.substring(
              0,
              items[i].querySelector(".price").textContent.length - 2
            )
        );
      }
    }
    this.element.nextElementSibling.firstElementChild.textContent =
      gesamt.toFixed(2) + "€";
    return gesamt.toFixed(2);
  }

  onClick(event) {
    let target = event.target;
    if (parseInt(target.parentElement.firstElementChild.textContent[0]) >= 1) {
      let quantity = parseInt(
        target.parentElement.querySelector(".product").textContent[0]
      );
      quantity -= 1;
      if (quantity > 0) {
        target.parentElement.querySelector(
          ".product"
        ).textContent = `${quantity}x ${target.parentElement.getAttribute(
          "id"
        )} |`;
        let priceString = target.parentElement
            .querySelector(".price")
            .getAttribute("price"),
          price = parseFloat(priceString);
        target.parentElement.querySelector(".price").textContent = `${(
          quantity * price
        ).toFixed(2)}€ `;
        let gesamt = this.calcWholeOrder();
        let gesamtEvent = new Event("priceCheck", { gesamt: gesamt });
        this.notifyAll(gesamtEvent);
      } else {
        target.parentElement.remove();
        let gesamt = this.calcWholeOrder();
        let gesamtEvent = new Event("priceCheck", { gesamt: gesamt });
        this.notifyAll(gesamtEvent);
      }
    }
  }

  getOrder() {
    let order = [],
      gesamt,
      items = this.element.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      if (items[i].getAttribute("id")) {
        let id = items[i].getAttribute("id"),
          quantity = parseInt(
            items[i].querySelector(".product").textContent[0]
          );
        gesamt = parseFloat(
          this.element.nextElementSibling.firstElementChild.textContent.substring(
            0,
            this.element.nextElementSibling.firstElementChild.textContent
              .length - 1
          )
        );
        order.push({ name: id, quantity: quantity });
      }
    }
    return [order, gesamt];
  }

  reset() {
    this.element.textContent = "";
    this.element.nextElementSibling.firstElementChild.textContent = "0.00€";
  }
}
export default new OrderView();
