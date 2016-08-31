'use strict';

/**
 * Returns the promise of Core
 *
 * @param CoreService - service in module konko.core
 * @returns {Promise} Core promise
 */
const resolveCore = CoreService => {
  'ngInject';
  return CoreService.get({
    fields: 'post'
  }).$promise;
};

/**
 * Returns the promise of Topic
 *
 * @param $stateParams - service in module ui.router.state
 * @param TopicService - service in module konko.posts
 * @returns {Promise} Topic promise
 */
const resolveTopic = ($stateParams, TopicService) => {
  'ngInject';
  return TopicService.get({
    topicId: $stateParams.topicId,
  }).$promise;
};

/**
 * Returns the promise of Topic
 *
 * @param $stateParams - service in module ui.router.state
 * @param TopicService - service in module konko.posts
 * @returns {Promise} Topic promise
 */
const resolveTopicBasic = ($stateParams, TopicService) => {
  'ngInject';
  return TopicService.getBasic({
    topicId: $stateParams.topicId,
  }).$promise;
};

/**
 * Returns the promise of Comment
 *
 * @param $stateParams - service in module ui.router.state
 * @param CommentService - service in module konko.posts
 * @returns {Promise} Comment promise
 */
const resolveComment = ($stateParams, CommentService) => {
  'ngInject';
  return CommentService.getNoTopic({
    commentId: $stateParams.commentId,
  }).$promise;
};

/**
 * Returns the promise of Comment
 *
 * @param $stateParams - service in module ui.router.state
 * @param CommentService - service in module konko.posts
 * @returns {Promise} Comment promise
 */
const resolveCommentsPage = ($stateParams, CommentService) => {
  'ngInject';
  return CommentService.query({
    topicId: $stateParams.topicId,
    page: $stateParams.page,
  }).$promise;
};

/**
 * Returns the promise of Panel
 *
 * @param $stateParams - service in module ui.router.state
 * @param PanelService - service in module konko.panels
 * @returns {Promise} Panel promise
 */
const resolvePanel = ($stateParams, PanelService) => {
  'ngInject';
  return $stateParams.categoryId ? PanelService.getBasic({
    categoryId: $stateParams.categoryId,
    panelId: $stateParams.panelId,
  }).$promise : PanelService.getNoCat({
    panelId: $stateParams.panelId,
  }).$promise;
};

/**
 * Returns new topic service
 *
 * @param TopicService - service in module konko.posts
 * @returns {Object} topic service
 */
const newTopic = TopicService => {
  'ngInject';
  return new TopicService();
};

/**
 * Returns new comment service
 *
 * @param CommentService - service in module konko.posts
 * @returns {Object} comment service
 */
const newComment = CommentService => {
  'ngInject';
  return new CommentService();
};

/**
 * Posts routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Posts/Configurations/Posts
 */
export default ($stateProvider, $urlRouterProvider) => {
  'ngInject';
  $stateProvider.state('topic', {
    abstract: true,
    url: '/t',
    template: '<ui-view autoscroll="true"/>',
  }).state('topic.new', {
    url: '^/p/:panelId/post',
    controller: 'TopicController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/posts/topic.new.html',
    params: {
      categoryId: null,
    },
    resolve: {
      core: resolveCore,
      topic: newTopic,
      page: (() => null),
      panel: resolvePanel,
    },
    onEnter: ($state, AuthenticationService) => {
      if (AuthenticationService.isGuest() || AuthenticationService.isBanned() || !AuthenticationService.isVerified()) {
        $state.go('error', {
          status: '⛔',
          title: 'No Entry',
          message: 'You do not have permission to post a topic.',
        }, { reload: true });
      }
    },
  }).state('topic.view', {
    url: '/:topicId',
    controller: 'TopicController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/posts/topic.view.html',
    params: {
      page: 1,
    },
    resolve: {
      core: resolveCore,
      topic: resolveTopic,
      page: resolveCommentsPage,
      panel: (() => null),
    },
  }).state('topic.view.page', {
    url: '/page/:page',
    onEnter: ($state, page) => {
      if (!page.comments || !page.comments.length) {
        $state.go('topic.view.page', {
          topicId: page.tid,
          page: 1,
        });
      }
    },
  }).state('topic.edit', {
    url: '/:topicId/edit',
    controller: 'TopicController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/posts/topic.edit.html',
    resolve: {
      core: resolveCore,
      topic: resolveTopic,
      page: (() => null),
      panel: (() => null),
    },
    onEnter: ($state, AuthenticationService, topic) => {
      let user = AuthenticationService.currentUser();
      if (user._id !== topic.author._id && !AuthenticationService.isAdmin()) {
        $state.go('error', {
          status: '🈲',
          title: 'Prohibited',
          message: 'You cannot modify someone\'s topic.',
        }, { reload: true });
      }
    },
  }).state('topic.comment', {
    url: '/:topicId/reply',
    controller: 'CommentController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/posts/comment.new.html',
    params: {
      content: null,
    },
    resolve: {
      core: resolveCore,
      comment: newComment,
      topic: resolveTopicBasic,
    },
    onEnter: ($state, AuthenticationService) => {
      if (AuthenticationService.isGuest() || AuthenticationService.isBanned() || !AuthenticationService.isVerified()) {
        $state.go('error', {
          status: '⛔',
          title: 'No Entry',
          message: 'You do not have permission to post a comment.',
        }, { reload: true });
      }
    },
  }).state('comment', {
    abstract: true,
    url: '/c',
    template: '<ui-view autoscroll="true"/>',
  }).state('comment.edit', {
    url: '/:commentId/edit',
    controller: 'CommentController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/posts/comment.edit.html',
    resolve: {
      core: resolveCore,
      comment: resolveComment,
      topic: (() => null),
    },
    onEnter: ($state, AuthenticationService, comment) => {
      let user = AuthenticationService.currentUser();
      if (user._id !== comment.author._id && !AuthenticationService.isAdmin()) {
        $state.go('error', {
          status: '🈲',
          title: 'Prohibited',
          message: 'You cannot modify someone\'s comment.',
        }, { reload: true });
      }
    },
  });
};
