import { Event, Observable } from "./Observable.js";

class GutscheinView extends Observable {
  constructor() {
    super();
  }

  setElement(element) {
    this.element = element;
    this.input = this.element.querySelector(".gutschein-wert");
    this.element.addEventListener("click", this.onClick.bind(this));
  }

  reset() {
    this.input.value = "";
  }

  onClick(event) {
    console.log(event.target, this);
    if (!event.target.classList.contains("gutschein-wert")) {
      if (
        parseInt(this.input.value) > 0 &&
        this.input.value.slice(-1) === "0"
      ) {
        let giftCardEvent = new Event("giftCardRequest", {
          value: parseInt(this.input.value),
        });
        this.notifyAll(giftCardEvent);
        this.reset();
      } else {
        alert(
          "Gutscheine müssen mindestens einen Wert von 10€ haben und sind in 10€-Schritten erhältlich. Bitte versuche es erneut."
        );
      }
    }
  }
}
export default new GutscheinView();
