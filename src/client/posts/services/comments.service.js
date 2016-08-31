'use strict';

/**
 * Server-side data source of Comment
 *
 * @author C Killua
 * @module Konko/Client/Posts/Services/Comments
 * @param $resource - service in module ngResource
 * @param $stateParams - service in module ui.router.state
 * @returns $resource
 */
export default ($resource, $stateParams) => {
  'ngInject';
  return $resource('/api/v1/topics/:topicId/comments/:commentId', {
    topicId: '@topicId',
    commentId: '@_id',
  }, {
    getNoTopic: {
      url: '/api/v1/comments/:commentId',
      method: 'GET',
    },
    query: {
      method: 'GET',
      params: {
        topicId: $stateParams.topicId,
        page: 1,
      },
      isArray: false,
    },
    save: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    like: {
      url: '/api/v1/topics/:topicId/comments/:commentId/like',
      method: 'PUT',
    },
    dislike: {
      url: '/api/v1/topics/:topicId/comments/:commentId/like',
      method: 'DELETE',
    },
  });
};
