// import count from "./js/count";
import sum from "./js/sum";

import "./css/index.css";
import "./less/index.less";
import "./sass/index.scss";
import "./css/iconfont.css";

// console.log(count(2, 1));
console.log(sum(1, 2, 3, 4, 5));

// 在react中 使用react-hot-loader 自动完成此步骤
if (module.hot) {
  module.hot.accept();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
