(function () {
  var lang = "ko";
  if (navigator.language != null) {
    lang = navigator.language || navigator.userLanguage;
  }

  lang = String(lang).toLowerCase().substring(0, 2);

  if (lang === "cn") {
    window.location.replace("cn/index.html");
  } else if (lang === "zh") {
    window.location.replace("zh/index.html");
  } else if (lang === "th") {
    window.location.replace("th/index.html");
  } else {
    window.location.replace("index_ko.html");
  }
})();
