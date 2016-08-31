'use strict';

/**
 * Pagination directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/Pagination
 * @param $location - service in module ng
 * @returns {Object} Directive of konko-pagination
 */
export default $location => {
  'ngInject';
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'styles/core/views/layout/pagination.view.html',
    scope: {
      page: '=',  // current page
      pages: '=', // totle pages
      max: '=',   // max numbered pages allowed
    },
    link: (scope, element, attrs) => {
      const buildPages = (start, end) => _.map(_.range(start, end + 1), i => ({ page: i, url: `${scope.url}/page/${i}` }));

      scope.url = $location.path().replace(/(\/.*\/.*)(\/page\/)(.*)/, '$1');
      scope.previous = scope.page - 1 ? `${scope.url}/page/${scope.page - 1}` : '#';
      scope.next = scope.page - scope.pages ? `${scope.url}/page/${scope.page + 1}` : '#';

      if (scope.pages > scope.max + 1) {
        if (scope.page < scope.max) {
          scope.pagesObj = _.map(_.range(1, scope.max + 1), i => {
            return { page: i, url: `${scope.url}/page/${i}` };
          }).concat({ page: '...', url: `${scope.url}/page/${scope.page + scope.max}` })
            .concat(buildPages(scope.pages, scope.pages));
        } else if (scope.page > scope.pages - scope.max) {
          scope.pagesObj = [{ page: 1, url: `${scope.url}/page/1` }]
            .concat({ page: '...', url: `${scope.url}/page/2` })
            .concat(buildPages(scope.pages - scope.max + 1, scope.pages));
        } else {
          let start = scope.page - Math.ceil(scope.max / 2) + 1;
          let end = scope.page + Math.floor(scope.max / 2);
          scope.pagesObj = [{ page: 1, url: `${scope.url}/page/1` }]
            .concat({ page: '...', url: `${scope.url}/page/2` })
            .concat(buildPages(start, end))
            .concat({ page: '...', url: `${scope.url}/page/${end + 1}` })
            .concat({ page: scope.pages, url: `${scope.url}/page/${scope.pages}` });
        }
      } else {
        scope.pagesObj = _.map(_.range(1, scope.pages + 1), i => {
          return { page: i, url: `${scope.url}/page/${i}` };
        });
      }
      scope.pagerSize = _.range(1, scope.pages + 1);
    },
  };
};
