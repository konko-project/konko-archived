'use strict';

/**
 * Server-side data source of Topic
 *
 * @author C Killua
 * @module Konko/Client/Posts/Services/Topics
 * @param $resource - service in module ngResource
 * @param $stateParams - service in module ui.router.state
 * @returns $resource
 */
export default ($resource, $stateParams) => {
  'ngInject';
  return $resource('/api/v1/topics/:topicId', {
    topicId: '@_id',
  }, {
    getBasic: {
      method: 'GET',
      params: {
        topicId: $stateParams.topicId,
        fields: '_id,title',
      },
    },
    save: {
      method: 'POST',
      params: {
        panelId: $stateParams.panelId,
      },
    },
    query: {
      method: 'GET',
      params: {
        pid: $stateParams.panelId,
        page: 1,
      },
      isArray: false,
    },
    queryUserTopics: {
      method: 'GET',
      params: {
        userId: $stateParams.userId,
        offset: $stateParams.offset,
      },
      isArray: true,
    },
    update: {
      method: 'PUT',
    },
    like: {
      url: '/api/v1/topics/:topicId/like',
      method: 'PUT',
    },
    dislike: {
      url: '/api/v1/topics/:topicId/like',
      method: 'DELETE',
    },
    bookmark: {
      url: '/api/v1/topics/:topicId/bookmark',
      method: 'PUT',
    },
    unbookmark: {
      url: '/api/v1/topics/:topicId/bookmark',
      method: 'DELETE',
    },
    bookmarks: {
      url: '/api/v1/topics/:topicId/bookmark',
      method: 'GET',
    },
  });
};
