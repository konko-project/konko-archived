'use strict';

/**
 * Editor directive
 *
 * @author C Killua
 * @module Konko/Client/Posts/Directives/Editor
 * @param $timeout - service in module ng
 * @param $sce - service in module ng
 * @returns {Object} Directive of konko-editor
 */
export default ($timeout, $sce) => {
  'ngInject';
  return {
    restrict: 'AE',
    replace: true,
    transclude: true,
    scope: {
      title: '=titleModel',
      content: '=contentModel',
      tPattern: '=titlePattern',
      tTitle: '=titleTitle',
      cMax: '=contentMax',
    },
    templateUrl: 'styles/core/views/posts/editor.template.html',
    controller: ['$window', '$document', '$scope', '$element', ($window, $document, $scope, $element) => {
      $scope.editor = $element.find('#editor__content');
      $scope.editor_wysiwyg = $element.find('#editor__content__wysiwyg');
      $scope.wysiwyg = '';
      $scope.trustedHtml = '';
      $scope.toggleHtml = false;

      const addTag = (start, end, ...rest) => {
        end = end || start;
        let editor = $scope.editor[0];
        let slices = [$scope.content.slice(0, editor.selectionStart),
                      $scope.content.slice(editor.selectionStart, editor.selectionEnd),
                      $scope.content.slice(editor.selectionEnd)];
        let rst = '';
        if (rest) {
          for (let t in rest) {
            rst = t % 2 ? `${rst + rest[t]}` : `${rst + rest[t] + slices[1]}`;
          }
        }
        $scope.content = `${slices[0] + start + slices[1] + end + rst + slices[2]}`;
      };

      const addHtmlTag = tag => {
        let range;
        if ($window.getSelection) {
          let selection = $window.getSelection();
          if (selection.rangeCount) {
            let ele;
            range = selection.getRangeAt(0);
            ele = angular.element(tag).has(selection.anchorNode).length ? $document[0].createElement('n' + tag) : $document[0].createElement(tag);
            ele.appendChild(range.cloneContents());
            range.deleteContents();
            range.insertNode(ele);
          }
        } else if ($document.selection && $document.selection.createRange) {
          // range = $document.selection.createRange();
          // range.text = start + range.text + end;  // need test
          console.log('TODO');
        }
      };

      $scope.bold = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('strong');
        } else {
          addTag('**');
        }
      };

      $scope.italic = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('em');
        } else {
          addTag('_');
        }
      };

      $scope.strike = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('del');
        } else {
          addTag('~~');
        }
      };

      $scope.color = () => {
        if ($scope.toggleHtml) {
          // addHtmlTag('small');
        } else {
          addTag('\(', '\ color\=\'\#666\'\)');
        }
      };

      $scope.link = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('a');
        } else {
          addTag('<', '>');
        }
      };

      $scope.image = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('img');
        } else {
          addTag('![Alt text](', ' "")');
        }
      };

      $scope.quote = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('blockquote');
        } else {
          addTag('> ', ' ');
        }
      };

      $scope.horizontal = () => {
        if ($scope.toggleHtml) {
          addHtmlTag('hr /');
        } else {
          addTag('***', '');
        }
      };

      $scope.toHtml = () => {
        if ($scope.content === undefined) {
          $scope.content = '';
        }

        $scope.wysiwyg = $scope.content.replace(/</gm, '&lt;')
                                      .replace(/(.)(\>)/gm, '$1&gt;')
                                      .replace(/(\*|\_|\~)\1{3}/gm, '')
                                      .replace(/\&lt\;(((http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)))\&gt\;/gm, '<a href="$1" style="color: inherit;">$1</a>')
                                      .replace(/\{([^\{]*)\}\((size\=(.*?))?\ *(color\=(.*?))?\ *\)/gm, '<span style="font-size: calc(1rem*.9 + 0.$3rem); color: $5">$1</span>')
                                      .replace(/\!\[([^\(]*)\]\(([^\!\[\(]*)\ \"(.*?)\"\)/gm, '<img alt="$1" src="$2" title="$3">')
                                      .replace(/\[(.*)\]\((.*?)\ ?(\"(.*)\")*\)/gm, '<a href="$2" title="$4" style="color: inherit;">$1</a>')
                                      .replace(/(\*\*)([^\*\*]*)\1/gm, '<strong>$2</strong>')
                                      .replace(/(\_\_)([^\*\*]*)\1/gm, '<em>$2</em>')
                                      .replace(/(\~\~)([^\*\*]*)\1/gm, '<s>$2</s>')
                                      .replace(/\\(\\|\`|\*|\_|\{|\}|\[|\]|\(|\)|\#|\+|\-|\.|\!)/gm, '$1');
        $scope.wysiwyg = _.map($scope.wysiwyg.split('\n'), i => {
          while (i.match(/^\>\ /gm)) {
            i = i.replace(/(\&gt\;|\>)\ (?!(\&gt\;|\>)\ )(.*)/gm, '<blockquote>$3</blockquote>');
          }

          return i;
        }).join('\n');
        while ($scope.wysiwyg.match(/(<\/(blockquote)\>)\n(<\2\>)/gm)) {
          $scope.wysiwyg = $scope.wysiwyg.replace(/(<\/(blockquote)\>)\n(<\2\>)/gm, '\n');
        }

        $scope.wysiwyg = $scope.wysiwyg.replace(/\n/gm, '<br />');
        $scope.wysiwyg = $sce.trustAsHtml($scope.wysiwyg);
      };

      $scope.toText = () => {
        $scope.wysiwyg = $scope.wysiwyg.replace(/<n(.+)\>/gm, '</$1>')
                                    .replace(/<\/n(.+)\>/gm, '<$1>')
                                    .replace(/<\>/gm, '');
        $scope.content = $scope.wysiwyg.replace(/<b\>|<\/b\>/gm, '**')
                            .replace(/<i\>|<\/i\>/gm, '__')
                            .replace(/<s\>|<\/s\>/gm, '~~')
                            .replace(/<br\>/gm, '\n');
        // $scope.trustedHtml = $sce.trustAsHtml($scope.wysiwyg);
      };
    }],
    link: (scope, element, attrs) => {
      if (attrs.titleModel) {
        element.find('#editor__title')[0].required = true;
        element.find('#editor__title')[0].autofocus = true;
      } else {
        element.find('.editor-title').remove();
        scope.editor.autofocus = true;
      }

      $timeout(() => {
        scope.$watch('content', (_new, old) => {
          if (!scope.toggleHtml) {
            scope.toHtml();
          }
        }, true);
        scope.$watch('wysiwyg', (_new, old) => {
          if (scope.toggleHtml) {
            scope.toText();
          }
        }, true);
      });
    },
  };
};
