'use strict';

/**
 * Server-side data source of Slide
 *
 * @author C Killua
 * @module Konko/Client/Core/Services/Slide
 * @param $resource - service in module ngResource
 * @returns $resource
 */
export default $resource => {
  'ngInject';
  return $resource('/api/v1/slides/:slideId', {
    slideId: '@_id',
  }, {
    update: {
      method: 'PUT',
    },
  });
};
