import { database, analytics } from "./Database.js";

let order = undefined;

async function init() {
  let now = new Date(),
    dateString =
      now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
  await database
    .collection("order")
    .where("date", "==", dateString)
    .get()
    .then(function (querySnapshot) {
      let orders = [];
      querySnapshot.forEach(function (doc) {
        orders.push({
          date: doc.data().date,
          products: doc.data().products,
          sales: doc.data().sales,
        });
      });
      let orderString = "",
        gesamtSales = 0;
      for (let i = 0; i < orders.length; i++) {
        gesamtSales += parseFloat(orders[i].sales);
        for (let j = 0; j < orders[i].products.length; j++) {
          orderString += `${orders[i].products[j].quantity}x ${orders[i].products[j].name}<br>`;
        }
      }

      let quantities = [],
        products = [];
      orderString = orderString.split("<br>");
      orderString = orderString.slice(0, -1);
      for (let i = 0; i < orderString.length; i++) {
        let product = orderString[i].split("x ")[1];
        let quantity = 0;
        if (products.indexOf(product) === -1) {
          products.push(product);
          for (let j = 0; j < orderString.length; j++) {
            if (orderString[j].includes(product)) {
              quantity += parseInt(orderString[j].split("x ")[0]);
            }
          }
          quantities.push(quantity);
        }
      }

      orderString = "";
      for (let i = 0; i < products.length; i++) {
        orderString += `${quantities[i]}x ${products[i]}<br>`;
      }

      let templateParams = {
        orders: orderString,
        sales: gesamtSales.toFixed(2) + "",
        sales2: (gesamtSales - 4 * orders.length).toFixed(2) + "",
        date: orders[0].date,
      };

      emailjs.init("user_oXFmyn3FTjlcrtbiThka6");
      emailjs.send("gmail", "tagesabschluss", templateParams).then(
        function (response) {
          console.log("Email sent...", response);
        },
        function (error) {
          console.error("Email not sent", error);
        }
      );
    })
    .catch(function (error) {
      console.error("ta_error_sending_email");
    });
}

const _error = console.error;

console.error = function (args) {
  analytics.logEvent(args);
  return _error.apply(console, arguments);
};

init();
