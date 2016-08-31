'use strict';

/**
 * Contenteditable directive
 *
 * @author C Killua
 * @module Konko/Client/Posts/Directives/Contenteditable
 * @param $sce - service in module ng
 * @returns {Object} Directive of contenteditable
 */
export default ($sce) => {
  'ngInject';
  return {
    restrict: 'A',
    require: '?ngModel',
    link: (scope, element, attr, ngModel) => {
      ngModel.$render = () => element.html(ngModel.$viewValue || '');

      element.keydown(e => {
        if (e.keyCode === 13) {
          document.execCommand('insertHTML', false, '<br /><br />');
          return false;
        }
      });

      element.on('paste', e => {
        e.preventDefault();
        let text = e.originalEvent.clipboardData.getData('text');
        document.execCommand('insertHTML', false, text);
      });

      const read = () => {
        var html = element.html();
        if (html === '<div><br></div>') {
          html = '';
        }

        ngModel.$setViewValue(html);
      };

      element.on('blur keyup change', () => scope.$evalAsync(read));
      read();
    },
  };
};
