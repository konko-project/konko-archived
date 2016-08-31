'use strict';

/**
 * Category directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Category
 * @returns {Object} Directive of konko-category
 */
export default () => {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'styles/core/views/home/category.list.view.html',
  };
};
