'use strict';

/**
 * Scroll to directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/ScrollTo
 * @returns {Object} Directive of scroll-to
 */
export default () => {
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      let top = element.offset().top;
      if (element.hasClass('pos-f-t')) {
        top = 0;
      }

      element.click(event => {
        if (event.target === event.currentTarget) {
          angular.element('html, body').animate({
            scrollTop: top,
          }, 100);
        }
      });
    },
  };
};
