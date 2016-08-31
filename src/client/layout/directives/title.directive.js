'use strict';

/**
 * Title directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Popover
 * @param $state - service in ui.router.state
 * @returns {Object} Directive of title
 */
export default ($state) => {
  'ngInject';
  return {
    restrict: 'E',
    link: (scope, element) => scope.$on('title_update', (event, page, title) => {
      if (title) {
        element[0].innerHTML = element.html().search(' - ') >= 0 ? element.html().replace(/(^.+\ \-\ ).+/, `$1${title}`) : title;
      }
      if (page) {
        element[0].innerHTML = element.html().search(' - ') >= 0 ? element.html().replace(/^.+(?=.\-)/, page) : `${page} - ${element.html()}`;
      }
    }),
  };
};
