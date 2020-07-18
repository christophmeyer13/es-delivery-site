import Observable, { Event } from "./Observable.js";

class OrderForm extends Observable {
  constructor() {
    super();
  }

  hide() {
    this.element.classList.add("hidden");
  }

  show() {
    this.element.classList.remove("hidden");
  }

  setElement(element) {
    this.element = element;
    this.element
      .querySelector(".submit")
      .addEventListener("click", this.onSubmit.bind(this));
  }

  onSubmit() {
    let name = this.element.querySelector(".name").value,
      address = this.element.querySelector(".address").value,
      phone = this.element.querySelector(".phone").value;
    if (name === "" || address === "" || phone === "") {
      alert("Bitte fülle alle benötigten Felder aus.");
    } else {
      let submitEvent = new Event("submit", {
        name: name,
        address: address,
        phone: phone
      });
      this.notifyAll(submitEvent);
    }
  }

  reset() {
    let name = (this.element.querySelector(".name").value = ""),
      address = (this.element.querySelector(".address").value = ""),
      phone = (this.element.querySelector(".phone").value = "");
  }
}
export default new OrderForm();
