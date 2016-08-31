'use strict';

/**
 * Server-side data source of Panel
 *
 * @author C Killua
 * @module Konko/Client/Panels/Services/Panels
 * @param $resource - service in module ngResource
 * @param $stateParams - service in module ui.router.state
 * @returns $resource
 */
export default ($resource, $stateParams) => {
  'ngInject';
  return $resource('/api/v1/categories/:categoryId/panels/:panelId', {
    categoryId: '@categoryId',
    panelId: '@panelId',
  }, {
    getAll: {
      url: '/api/v1/panels',
      method: 'GET',
      isArray: true,
    },
    getNoCat: {
      url: '/api/v1/panels/:panelId',
      method: 'GET',
    },
    getBasic: {
      method: 'GET',
      params: {
        panelId: $stateParams.panelId,
        fields: '_id,name',
      },
    },
    update: {
      method: 'PUT',
    },
  });
};
