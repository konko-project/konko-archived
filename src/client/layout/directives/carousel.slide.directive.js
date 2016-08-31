'use strict';

/**
 * Carousel slide directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/CarouselSlide
 * @returns {Object} Directive of konko-slide
 */
export default () => {
  return {
    require: '^konkoCarousel',
    restrict: 'AE',
    replace: true,
    transclude: true,
    templateUrl: 'styles/core/views/home/slide.carousel.view.html',
  };
};
