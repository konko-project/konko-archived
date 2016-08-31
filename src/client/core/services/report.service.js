'use strict';

/**
 * Server-side data source of Report
 *
 * @author C Killua
 * @module Konko/Client/Core/Services/Report
 * @param $resource - service in module ngResource
 * @returns $resource
 */
export default $resource => {
  'ngInject';
  return $resource('/api/v1/reports/:reportId', {
    reportId: '@_id',
  }, {
    save: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    done: {
      url: '/api/v1/reports/:reportId/done',
      method: 'PUT',
    },
  });
};
