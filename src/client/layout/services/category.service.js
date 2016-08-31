'use strict';

/**
 * Server-side data source of Category
 *
 * @author C Killua
 * @module Konko/Client/Layout/Services/Category
 * @param $resource - service in module ngResource
 * @returns $resource
 */
export default $resource => {
  'ngInject';
  return $resource('/api/v1/categories/:categoryId', {
    categoryId: '@_id',
  }, {
    update: {
      method: 'PUT',
    },
  });
};
