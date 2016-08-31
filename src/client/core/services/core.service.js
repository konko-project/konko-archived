'use strict';

/**
 * Server-side data source of Core
 *
 * @author C Killua
 * @module Konko/Client/Core/Services/Core
 * @param $resource - service in module ngResource
 * @returns $resource
 */
export default $resource => {
  'ngInject';
  return $resource('/api/v1/core/:coreId', {
    coreId: '@_id',
  }, {
    save: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
  });
};
