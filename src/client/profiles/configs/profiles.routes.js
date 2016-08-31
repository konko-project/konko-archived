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
    fields: 'profile',
  }).$promise;
};

/**
 * Returns the promise of Core
 *
 * @param $stateParams - service in module ui.router.state
 * @param ProfileService - service in module konko.profiles
 * @returns {Promise} Profile promise
 */
const resolveUser = ($stateParams, ProfileService) => {
  'ngInject';
  return ProfileService.get({
    userId: $stateParams.userId,
  }).$promise;
};

/**
 * Returns the promise of Topic
 *
 * @param $stateParams - service in module ui.router.state
 * @param TopicService - service in module konko.posts
 * @returns {Promise} Topic promise
 */
const resolveUserTopics = ($stateParams, TopicService) => {
  'ngInject';
  return TopicService.query({
    uid: $stateParams.userId,
    page: 1,
  }).$promise;
};

/**
 * checks if visiting my own profile page
 *
 * @param $state - service in module ui.router.state
 * @param AuthenticationService - service in module konko.authentication
 * @param {Object} user - resolved user
 */
const isMe = ($state, AuthenticationService, user) => {
  if (AuthenticationService.currentUser()._id !== user._id) {
    $state.go('error', {
      status: '⛔',
      title: 'Top Secret Reached!!!',
      message: 'You do not have permission to view this page.',
    }, { reload: true });
  }
};

/**
 * Profile routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Profiles/Configurations/Profiles
 */
export default ($stateProvider) => {
  'ngInject';
  $stateProvider.state('user', {
    abstract: true,
    url: '/u/:userId',
    controller: 'ProfileController',
    controllerAs: 'vm',
    resolve: {
      core: resolveCore,
      user: resolveUser,
      topics: resolveUserTopics,
    },
    templateUrl: 'styles/core/views/profiles/profile.view.html',
    onEnter: ($state, AuthenticationService, user) => {
      let current = AuthenticationService.currentUser();
      if (AuthenticationService.isGuest() || (current._id !== user._id && (AuthenticationService.isBanned() || !AuthenticationService.isVerified()))) {
        $state.go('error', {
          status: '🔞',
          title: 'Adult Only!',
          message: 'Just kidding... You do not have permission view someone\'s profile.',
        }, { reload: true });
      }
    },
  }).state('user.profile', {
    abstract: true,
    views: {
      sidebar: {
        templateUrl: 'styles/core/views/profiles/sidebar.profile.view.html',
      },
      '': {
        template: '<ui-view/>',
      },
    },
  }).state('user.profile.view', {
    url: '/view',
    templateUrl: 'styles/core/views/profiles/view.profile.view.html',
  }).state('user.profile.bookmarks', {
    url: '/bookmarks',
    onEnter: isMe,
    templateUrl: 'styles/core/views/profiles/bookmarks.profile.view.html',
  }).state('user.profile.profile', {
    url: '/profile',
    onEnter: isMe,
    templateUrl: 'styles/core/views/profiles/edit.profile.view.html',
  }).state('user.profile.preference', {
    url: '/preference',
    onEnter: isMe,
    templateUrl: 'styles/core/views/profiles/edit.preference.view.html',
  });
};
