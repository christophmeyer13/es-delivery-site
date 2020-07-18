import { Event, Observable } from "./Observable.js";

class TabakView extends Observable {
  constructor() {
    super();
  }

  setElement(element) {
    this.element = element;
  }

  reset() {
    this.element.textContent = "";
  }

  getListItems(tabakProducts, elseProducts) {
    let sonstiges = document.createElement("li"),
      kohle;
    sonstiges.classList.add("sonstiges");
    sonstiges.textContent = "Tabak";
    this.element.appendChild(sonstiges);

    for (let i = 0; i < tabakProducts.length; i++) {
      let item = document.createElement("div"),
        template = document.querySelector(".list-item").innerHTML;
      item.innerHTML = template;
      item = item.firstElementChild;
      item.firstElementChild.textContent = tabakProducts[i].name;
      item.firstElementChild.setAttribute("id", tabakProducts[i].name);
      item.addEventListener("click", this.onClick.bind(this));
      this.element.appendChild(item);
    }

    sonstiges = document.createElement("li");
    sonstiges.classList.add("sonstiges");
    sonstiges.textContent = "Zubehör";
    this.element.appendChild(sonstiges);

    for (let i = 0; i < elseProducts.length; i++) {
      if (elseProducts[i].name === "Kohle") {
        kohle = elseProducts[i];
        continue;
      }
      let item = document.createElement("div"),
        template = document.querySelector(".list-item").innerHTML;
      item.innerHTML = template;
      item = item.firstElementChild;
      item.firstElementChild.textContent = elseProducts[i].name;
      item.firstElementChild.setAttribute("id", elseProducts[i].name);
      item.addEventListener("click", this.onClick.bind(this));
      this.element.appendChild(item);
    }

    if (kohle) {
      sonstiges = document.createElement("li");
      sonstiges.classList.add("sonstiges");
      sonstiges.textContent = "Kohle";
      this.element.appendChild(sonstiges);
      let item = document.createElement("div"),
        template = document.querySelector(".list-item").innerHTML;
      item.innerHTML = template;
      item = item.firstElementChild;
      item.firstElementChild.textContent = kohle.name;
      item.firstElementChild.setAttribute("id", kohle.name);
      item.addEventListener("click", this.onClick.bind(this));
      this.element.appendChild(item);
    }
  }

  onClick(event) {
    let clickEvent = new Event("appendOrder", {
      id: event.target.getAttribute("id"),
    });
    this.notifyAll(clickEvent);
  }
}

export default new TabakView();
