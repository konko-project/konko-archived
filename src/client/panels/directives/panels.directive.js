'use strict';

/**
 * Panel directive
 *
 * @author C Killua
 * @module Konko/Client/Panels/Directives/Panels
 * @returns {Object} directive of konko-panel-list
 */
export default () => {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'styles/core/views/panels/panel.list.view.html',
  };
};
