'use strict';

/**
 * upload directive directive
 *
 * @author C Killua
 * @module Konko/Client/Utils/Directives/Upload
 * @param $parse - service in module ng
 * @param $timeout - service in module ng
 * @returns {Object} Directive of konko-uploader
 */
export default ($parse, $timeout) => {
  'ngInject';
  return {
    restrict: 'AE',
    replace: true,
    transclude: true,
    templateUrl: 'styles/core/views/utils/uploader.template.html',
    link: (scope, element, attrs) => {
      const model = $parse(attrs.ngModel);
      const setter = model.assign;
      scope.accept = attrs.accept;

      let file = null;
      element.change(() => {
        scope.$apply(() => {
          file = element.find('#file')[0].files[0];
          if (file && !file.type.match(/image\/.*/)) {
            scope.error = 'File type is not supported.';
          } else if (file && file.size > scope.fileLimit) {
            scope.error = 'Image is too large.';
          } else {
            scope.error = undefined;
            setter(scope, file);
            element.find('.file-custom').attr('data-content', file ? file.name : 'Choose file...');
          }
        });
      });
      $timeout(() => {
        angular.element('#changeProfileImage').on('show.bs.modal', e => {
          scope.vm.error = null;
          scope.error = null;
          scope.fileLimit = scope.vm.core.profile[scope.vm.profileImageType].limit * 1024;
        });
      });
    },
  };
};
