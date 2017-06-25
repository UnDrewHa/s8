//= plugins.js

$(document).ready(function() {


	var PanoramaDrag = function (phoneSelector, panoramaSelector, animationStartDelay, animator) {
		this.phoneSelector = phoneSelector || '.draggable';
		this.panoramaSelector = panoramaSelector || '.panorama';
		this.ANIMATION_START_DELAY = animationStartDelay || 4000;
    this.animator = animator;
    this.timerId = null;
  };

  PanoramaDrag.prototype.init = function () {
    this._cacheElements();
    this._centerPanorama();
    this._getDragIncrement();
    this._draggableInit();
    this._bind();
  };

  PanoramaDrag.prototype._bind = function () {
    var self = this;
    window.addEventListener('resize', function () {
     self._centerPanorama();
     self._centerPhone();
     self._getDragIncrement();
   });
  };

  PanoramaDrag.prototype._cacheElements = function () {
    this._window = window;
    this._panorama = document.querySelector(this.panoramaSelector);
    this._phone = document.querySelector(this.phoneSelector);
    this._hideOnDragElements = document.querySelectorAll('._hide-on-drag');
  };

  PanoramaDrag.prototype._centerPanorama = function () {
    var bounds = this._panorama.getBoundingClientRect();

    this._panorama.style.webkitTransform =
    this._panorama.style.transform = 'translateX(' + bounds.width/2 * -1 + 'px)';

    this._panorama.setAttribute('data-x', bounds.width/2 * -1);
  };

  PanoramaDrag.prototype._centerPhone = function () {
    this._phone.style.webkitTransform =
    this._phone.style.transform = 'translate(0px,0px)';

    this._phone.setAttribute('data-x', 0);
    this._phone.setAttribute('data-y', 0);
  };

  PanoramaDrag.prototype._getDragIncrement = function () {
    var windowW = window.innerWidth,
    leftOffset = this._panorama.getBoundingClientRect().width / 2 - windowW / 2;

    this.DRAG_INCREMENT = Math.abs(leftOffset / (windowW / 2));
  };

  PanoramaDrag.prototype._draggableInit = function () {
    var self = this;
    this.interact = interact(this.phoneSelector)
    .draggable({
     inertia: true,
     restrict: {
      restriction: "parent",
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    onstart: self._dragStartEventListener.bind(self),
    onmove: self._dragMoveEventListener.bind(self),
    onend: self._dragEndEventListener.bind(self)
  });
  };

  PanoramaDrag.prototype._dragStartEventListener = function () {
    Array.prototype.forEach.call(this._hideOnDragElements, function (elem) {
     elem.classList.add('is-hidden');
   });

    this._phone.classList.add('_animation-stop');
    this._setTimer();
  };
  PanoramaDrag.prototype._dragMoveEventListener = function (event) {
    this._changePhonePosition(event);
    this._changePanoramaPosition(event);
  };
  PanoramaDrag.prototype._dragEndEventListener = function () {
  };

  PanoramaDrag.prototype._changePhonePosition = function (event) {
    if (this.dragDisabled) return;
    var target = event.target,
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.webkitTransform =
    target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  };

  PanoramaDrag.prototype._changePanoramaPosition = function (event) {
    if (this.dragDisabled) return;
    var target = this._panorama,
    windowW = window.innerWidth,
    targetW = target.getBoundingClientRect().width,
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx * -1 * this.DRAG_INCREMENT;

    if (event.dx < 1 && x > windowW/2 * -1) { 
    	// Левая граница блока панорамы = левой границе окна
    	x = windowW/2 * -1;
    }

    if (event.dx > 1 && x < windowW/2 - targetW) { 
    	// Правая граница блока панорамы = провай границе окна
    	x = windowW/2 - targetW;
    }

    target.style.webkitTransform =
    target.style.transform =
    'translateX(' + x + 'px)';

    target.setAttribute('data-x', x);
  };

  PanoramaDrag.prototype._setTimer = function () {
    var self = this;
    if (this.timerId) return;
    this.timerId = setTimeout(function () {
      self._disableDrag();
      self.animator && self.animator.notify("timer_tick");
    }, this.ANIMATION_START_DELAY);
  };

  PanoramaDrag.prototype._dropTimer = function () {
    clearInterval(this.timerId);
    this.timerId = null;
  };

  PanoramaDrag.prototype._disableDrag = function () {
    this.interact.draggable(false);
    interact(this._phone).draggable(false);
    interact(this._phone).unset();
    this.dragDisabled = true;
  }

  var PanoramaAnimator = function () {

  };

  PanoramaAnimator.prototype.init = function () {
    this._firstStageIn();
  };

  PanoramaAnimator.prototype.notify = function (type) {
    if (type === 'timer_tick') {
      this._firstStageOut();
    }
  };

  PanoramaAnimator.prototype._firstStageIn = function () {
    var self = this;
    var pfsi = new TimelineLite({onComplete: this._firstStageInCompleted, delay: .4});
    pfsi
    .fromTo($('.circle-big__title .title1'), .5, {x: "-30"}, {x: 0, opacity: 1})
    .fromTo($('.circle-big__title .title2'), .5, {x: "30"}, {x: 0, opacity: 1}, "-=.1")
    .fromTo($('.circle-big__title .title3'), .5, {x: "-30"}, {x: 0, opacity: 1}, "-=.1")
    .fromTo($('.info-text'), .6, {y: "10"}, {y: 0, opacity: 1})
    .to($('.phone'), .6, {opacity: 1}, "-=.3")
    .to($('.rotate-icon'), .8, {opacity: 1}, "-=.4")
  };

  PanoramaAnimator.prototype._firstStageInCompleted = function () {
    $('.phone').addClass("_animation-start");
    $('.start-social.social').addClass("_top");
  };

  PanoramaAnimator.prototype._firstStageOut = function () {
    var self = this;
    var pfso = new TimelineLite({onComplete: this._firstStageOutCompleted.bind(this)});
    pfso
    .staggerTo($('.phone, .info-text, .rotate-icon'), .4, {opacity: 0})
    .to($('.circle-big__title .title1'), .3, {x: 75, opacity: 0})
    .to($('.circle-big__title .title2'), .3, {x: -75, opacity: 0})
    .to($('.circle-big__title .title3'), .3, {x: 75, opacity: 0})
  };

  PanoramaAnimator.prototype._firstStageOutCompleted = function () {
    $(".screen0").addClass("_second-stage");
    setTimeout(this._secondStageIn.bind(this), 0);
  };

  PanoramaAnimator.prototype._secondStageIn = function () {
    $('.animation-parts, .panorama').addClass("_disabled");

    var pfsi = new TimelineLite({onComplete: this._secondStageInCompleted, delay: .4});
    pfsi
    .fromTo($('.screen0 .st1'), .4, {x: "-30"}, {x: 0, opacity: 1})
    .fromTo($('.screen0 .st2'), .4, {x: "30"}, {x: 0, opacity: 1}, "-=.1")
    .fromTo($('.screen0 .st3'), .4, {x: "-30"}, {x: 0, opacity: 1}, "-=.1")
    .fromTo($('.screen0 .st4'), .4, {x: "30"}, {x: 0, opacity: 1}, "-=.1")
    .fromTo($('.screen0__text'), .6, {y: "30"}, {y: 0, opacity: 1}, "-=.2")
  };

  PanoramaAnimator.prototype._secondStageInCompleted = function () {
    $('.screen0__btn').addClass('_animation-start');
    $('html, body').addClass('is-enabled');
  };

  window.PanoramaDrag = PanoramaDrag;
  window.PanoramaAnimator = PanoramaAnimator;

  function _throttle(func, limit) {
    var inThrottle,
    lastFunc,
    throttleTimer;
    return function() {
      var context = this,
      args = arguments;
      if (inThrottle) {
        clearTimeout(lastFunc);
        return lastFunc = setTimeout(function() {
          func.apply(context, args);
          inThrottle = false;
        }, limit);
      } else {
        func.apply(context, args);
        inThrottle = true;
        return throttleTimer = setTimeout(function() {
          return inThrottle = false;
        }, limit);
      }
    };
  };

  function _debounce(func, wait, immediate) {
   var timeout;
   return function() {
    var context = this, args = arguments;
    var later = function() {
     timeout = null;
     if (!immediate) func.apply(context, args);
   };
   var callNow = immediate && !timeout;
   clearTimeout(timeout);
   timeout = setTimeout(later, wait);
   if (callNow) func.apply(context, args);
 };
};



function getBounds (elem) {
	var bounds = {},
	docW = window.innerWidth,
	docH = window.innerHeight;
	if (!elem) return {};
	bounds.T = elem.getBoundingClientRect().top;
	bounds.L = elem.getBoundingClientRect().left;
	bounds.B = docH - elem.getBoundingClientRect().bottom;
	bounds.R = docW - elem.getBoundingClientRect().right;
	bounds.px = parseInt(elem.getAttribute('data-px'));
	bounds.py = parseInt(elem.getAttribute('data-py'));
	bounds.id = parseInt(elem.getAttribute('data-id'));
	return bounds;
}
});
