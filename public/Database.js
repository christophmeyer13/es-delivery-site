import Product from "./Product.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2pYnTv_WParIUa-bOvf0kfMJupAu6MT4",
  authDomain: "es-lieferservice.firebaseapp.com",
  databaseURL: "https://es-lieferservice.firebaseio.com",
  projectId: "es-lieferservice",
  storageBucket: "es-lieferservice.appspot.com",
  messagingSenderId: "1048914763298",
  appId: "1:1048914763298:web:c98d7b20934d8c5ab1b47b",
  measurementId: "G-QSMX6L18C0",
};
firebase.initializeApp(firebaseConfig);

const database = firebase.firestore();
const analytics = firebase.analytics();

(function (sa, fbc) {
  function load(f, c) {
    var a = document.createElement("script");
    a.async = 1;
    a.src = f;
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(a, s);
  }
  load(sa);
  window.onload = function () {
    firebase.initializeApp(fbc).performance();
  };
})(
  "https://www.gstatic.com/firebasejs/7.12.0/firebase-performance-standalone.js",
  firebaseConfig
);

class Database {
  async getProducts() {
    let products = [];
    await database
      .collection("products")
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          if (doc.data().stock > 0) {
            let product = new Product(
              doc.id,
              doc.data().stock,
              doc.data().art,
              doc.data().price
            );
            products.push(product);
          }
        });
      })
      .catch(function (error) {
        console.error("database_get_products_error_downloading_products");
      });
    return products;
  }

  async getLiveProducts() {
    let products = [];
    await database
      .collection("products")
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          let product = new Product(
            doc.id,
            doc.data().stock,
            doc.data().art,
            doc.data().price
          );
          products.push(product);
        });
      })
      .catch(function (error) {
        console.error("database_get_live_products_error_downloading_products");
      });
    return products;
  }

  async uploadChanges(order, gesamt) {
    let now = new Date(),
      dateString =
        now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear(),
      liveProducts = await this.getLiveProducts(),
      flag;
    for (let i = 0; i < liveProducts.length; i++) {
      for (let j = 0; j < order.length; j++) {
        if (order[j].name.includes("Gutschein")) {
          flag = true;
          continue;
        }
        if (liveProducts[i].name === order[j].name) {
          if (liveProducts[i].stock >= order[j].quantity) {
            flag = true;
            console.log(liveProducts[i].stock, flag);
            liveProducts[i].stock -= order[j].quantity;
            await database
              .collection("products")
              .doc(liveProducts[i].name)
              .set(
                {
                  stock: liveProducts[i].stock,
                },
                { merge: true }
              )
              .catch(function (error) {
                console.error(
                  "database_upload_changes_error_uploading_products"
                );
              });
          } else {
            flag = false;
            console.log(liveProducts[i].stock, flag);
          }
        }
      }
    }
    if (flag) {
      database
        .collection("order")
        .doc()
        .set({
          products: order,
          date: dateString,
          sales: gesamt,
        })
        .then(function () {
          console.log("Doc written");
        })
        .catch(function (error) {
          console.error("database_upload_changes_error_uploading_order");
        });
    }
    return flag;
  }
}
export default new Database();
export { analytics };
export { database };

const _error = console.error;

console.error = function (args) {
  analytics.logEvent(args);
  return _error.apply(console, arguments);
};
