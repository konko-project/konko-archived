'use strict';

/**
 * Returns the promise of Panel
 *
 * @param $stateParams - service in module ui.router.state
 * @param PanelService - service in module konko.panels
 * @returns {Promise} Panel promise
 */
const resolvePanel = ($stateParams, PanelService) => {
  'ngInject';
  return $stateParams.categoryId ?
    PanelService.get({
      categoryId: $stateParams.categoryId,
      panelId: $stateParams.panelId,
    }).$promise : PanelService.getNoCat({
      panelId: $stateParams.panelId,
    }).$promise;
};

/**
 * Returns the promise of Topic
 *
 * @param $stateParams - service in module ui.router.state
 * @param TopicService - service in module konko.posts
 * @param AuthenticationService - service in module konko.authentication
 * @returns {Promise} Topic promise
 */
const resolveTopicsPage = ($stateParams, TopicService, AuthenticationService) => {
  'ngInject';
  return TopicService.query({
    pid: $stateParams.panelId,
    page: $stateParams.page,
  }).$promise;
};

/**
 * Panels routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Panels/Configurations/Panels
 */
export default $stateProvider => {
  'ngInject';
  $stateProvider.state('panel', {
    abstract: true,
    url: '/p',
    template: '<ui-view/>',
  }).state('panel.view', {
    url: '/:panelId',
    controller: 'PanelController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/panels/panel.view.html',
    params: {
      page: 1,
      categoryId: null,
    },
    resolve: {
      panel: resolvePanel,
      page: resolveTopicsPage,
    },
  }).state('panel.view.page', {
    url: '/page/:page',
  });
};
