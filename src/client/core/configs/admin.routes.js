'use strict';

/**
 * Returns the promise of Core
 *
 * @param $state - service in module ui.router.state
 * @param CoreService - service in module konko.core
 * @returns {Promise} Core promise
 */
const resolveCoreBasic = ($state, CoreService) => {
  'ngInject';
  return CoreService.get({ fields: 'basic' }).$promise;
};

/**
 * Returns the promise of Core
 *
 * @param $state - service in module ui.router.state
 * @param AuthenticationService - service in module konko.authentication
 * @param CoreService - service in module konko.core
 * @param {Object} coreBasic - core that contains the basic info
 * @returns {Promise} Core promise, or null if not Admin
 */
const resolveCore = ($state, AuthenticationService, CoreService, coreBasic) => {
  'ngInject';
  return AuthenticationService.isAdmin() ? CoreService.get({
    coreId: coreBasic._id,
  }).$promise : null;
};

/**
 * Returns the promise of Panels
 *
 * @param $state - service in module ui.router.state
 * @param AuthenticationService - service in module konko.authentication
 * @param PanelService - service in module konko.panels
 * @returns {Promise} Panel promise, or null if not Admin
 */
const resolvePanels = ($state, AuthenticationService, PanelService) => {
  'ngInject';
  return AuthenticationService.isAdmin() ? PanelService.getAll({
    fields: 'name,order,description,children,parent,category,logo',
  }).$promise : null;
};

/**
 * Returns the promise of Categories
 *
 * @param $state - service in module ui.router.state
 * @param AuthenticationService - service in module konko.authentication
 * @param CategoryService - service in module konko.layout
 * @returns {Promise} Category promise, or null if not Admin
 */
const resolveCategories = ($state, AuthenticationService, CategoryService) => {
  'ngInject';
  return AuthenticationService.isAdmin() ? CategoryService.query({
    fields: 'name,order',
  }).$promise : null;
};

/**
 * Returns the promise of Reports
 *
 * @param $state - service in module ui.router.state
 * @param AuthenticationService - service in module konko.authentication
 * @param ReportService - service in module konko.core
 * @returns {Promise} Report promise, or null if not Admin
 */
const resolveReports = ($state, AuthenticationService, ReportService) => {
  'ngInject';
  return AuthenticationService.isAdmin() ? ReportService.query().$promise : null;
};

/**
 * Returns the promise of Slides
 *
 * @param $state - service in module ui.router.state
 * @param AuthenticationService - service in module konko.authentication
 * @param SlideService - service in module konko.core
 * @returns {Promise} Slide promise, or null if not Admin
 */
const resolveSlides = ($state, AuthenticationService, SlideService) => {
  'ngInject';
  return AuthenticationService.isAdmin() ? SlideService.query().$promise : null;
};

/**
 * Admin routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Core/Configurations/Admin
 */
export default ($stateProvider, $urlRouterProvider) => {
  'ngInject';
  $urlRouterProvider.when('/admin', '/admin/settings/basic');
  $stateProvider.state('admin', {
    abstract: true,
    url: '/admin',
    controller: 'AdminController',
    controllerAs: 'vm',
    resolve: {
      coreBasic: resolveCoreBasic,
      core: resolveCore,
      categories: resolveCategories,
      panels: resolvePanels,
      reports: resolveReports,
      slides: resolveSlides,
    },
    onEnter: ($state, AuthenticationService, coreBasic) => {
      if (!AuthenticationService.isAdmin()) {
        $state.go('error', {
          status: '🚫',
          title: 'Unauthorized',
          message: 'Staff only, keep out!',
        }, { reload: true });
      }
    },
    templateUrl: 'styles/core/views/admin/admin.view.html',
  }).state('admin.settings', {
    abstract: true,
    url: '/settings',
    views: {
      sidebar: {
        templateUrl: 'styles/core/views/admin/sidebar.admin.view.html',
      },
      '': {
        templateUrl: 'styles/core/views/admin/admin.settings.html',
      },
    },
  }).state('admin.settings.basic', {
    url: '/basic',
    templateUrl: 'styles/core/views/admin/basic.admin.view.html',
  }).state('admin.settings.global', {
    url: '/global',
    templateUrl: 'styles/core/views/admin/global.admin.view.html',
  }).state('admin.settings.mailer', {
    url: '/mailer',
    templateUrl: 'styles/core/views/admin/mailer.admin.view.html',
  }).state('admin.settings.registration', {
    url: '/registration',
    templateUrl: 'styles/core/views/admin/registration.admin.view.html',
  }).state('admin.settings.panel', {
    url: '/panel',
    templateUrl: 'styles/core/views/admin/panel.admin.view.html',
  }).state('admin.settings.user', {
    url: '/user',
    templateUrl: 'styles/core/views/admin/user.admin.view.html',
  }).state('admin.settings.profile', {
    url: '/profile',
    templateUrl: 'styles/core/views/admin/profile.admin.view.html',
  }).state('admin.settings.post', {
    url: '/post',
    templateUrl: 'styles/core/views/admin/post.admin.view.html',
  }).state('admin.settings.reports', {
    url: '/reports',
    templateUrl: 'styles/core/views/admin/report.admin.view.html',
  }).state('admin.settings.carousel', {
    url: '/carousel',
    templateUrl: 'styles/core/views/admin/carousel.admin.view.html',
  });
};
