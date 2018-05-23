document.documentElement.classList.remove("no-js");

(function () {
  var nav = document.querySelector('.page-nav');
  var toggle = nav.querySelector('.page-nav__toggle');

  toggle.addEventListener('click', function () {
    nav.classList.toggle('page-nav--opened');
  });
})();
