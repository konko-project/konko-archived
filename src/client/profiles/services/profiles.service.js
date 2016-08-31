'use strict';

/**
 * Server-side data source of Profiles
 *
 * @author C Killua
 * @module Konko/Client/Profiles/Services/Profiles
 * @param $resource - service in module ngResource
 * @returns $resource
 */
export default $resource => {
  'ngInject';
  return $resource('/api/v1/users/:userId', {
    userId: '@_id',
  }, {
    update: {
      method: 'PUT',
    },
    updateProfile: {
      url: '/api/v1/users/:userId/profile',
      method: 'PUT',
    },
    updatePreference: {
      url: '/api/v1/users/:userId/preference',
      method: 'PUT',
    },
  });
};
