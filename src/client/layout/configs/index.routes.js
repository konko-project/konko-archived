'use strict';

/**
 * Returns the promise of Category
 *
 * @param $stateParams - service in module ui.router.state
 * @param CategoryService - service in module konko.layout
 * @returns {Promise} Category promise
 */
const resolveCategory = ($stateParams, CategoryService) => {
  'ngInject';
  return CategoryService.get({
    categoryId: $stateParams.categoryId,
  }).$promise;
};

/**
 * Returns the promise of Categories
 *
 * @param CategoryService - service in module konko.layout
 * @returns {Promise} Category promise
 */
const resolveCategories = CategoryService => {
  'ngInject';
  return CategoryService.query().$promise;
};

/**
 * Returns the promise of Slides
 *
 * @param SlideService - service in module konko.core
 * @returns {Promise} Slide promise
 */
const resolveSlides = SlideService => {
  'ngInject';
  return SlideService.query().$promise;
};

/**
 * Index routing configurations
 *
 * @author C Killua
 * @module Konko/Client/Layout/Configurations/Index
 */
export default $stateProvider => {
  'ngInject';
  $stateProvider.state('home', {
    abstract: true,
    url: '/',
    template: '<ui-view/>',
  }).state('home.index', {
    url: '',
    controller: 'IndexController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/home/index.view.html',
    resolve: {
      categories: resolveCategories,
      slides: resolveSlides,
    },
  }).state('category', {
    abstract: true,
    url: '/c',
    template: '<ui-view/>',
  }).state('category.view', {
    url: '/:categoryId',
    controller: 'IndexController',
    controllerAs: 'vm',
    templateUrl: 'styles/core/views/home/index.view.html',
    resolve: {
      categories: resolveCategory,
      slides: resolveSlides,
    },
  });
};
