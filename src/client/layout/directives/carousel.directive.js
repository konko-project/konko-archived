'use strict';

/**
 * Carousel directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Carousel
 * @returns {Object} Directive of konko-carousel
 */
export default () => {
  return {
    restrict: 'AE',
    replace: true,
    transclude: true,
    templateUrl: 'styles/core/views/home/carousel.view.html',
    scope: {
      length: '@',
    },
    link: (scope, element, attrs) => {
      scope.indicators = _.range(scope.length);
      element.carousel(); // kick carousel to animate
    },
  };
};
