'use strict';

/**
 * Image preview directive directive
 *
 * @author C Killua
 * @module Konko/Client/Utils/Directives/ImagePreview
 * @param $timeout - service in module ng
 * @returns {Object} Directive of konko-previewer
 */
export default ($timeout) => {
  'ngInject';
  return {
    restrict: 'A',
    replace: true,
    scope: {
      method: '@',
      file: '=',
      src: '=',
    },
    link: (scope, element, attrs) => {
      let canvas = element[0];
      let ctx = canvas.getContext('2d');
      let img = new Image();

      const drawImage = (canvas, ctx, img) => {
        let ratio = img.width / img.height;
        let height, width;
        if (img.width > img.height) {
          height = canvas.width / img.width * img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, (canvas.height - height) / 2, canvas.width, height);
        } else {
          width = canvas.height / img.height * img.width;
          ctx.drawImage(img, 0, 0, img.width, img.height, (canvas.width - width) / 2, 0, width, canvas.height);
        }
      };

      scope.$watchCollection('[method, file, src]', ([method, file, src], oldValues) => {
        URL.revokeObjectURL(img.src);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (method === 'url') {
          img.src = src;
          img.onload = () => {
            drawImage(canvas, ctx, img);
          };
        } else {
          if (file) {
            let reader = new FileReader();
            reader.onload = event => {
              img.src = event.target.result;
              img.onload = () => {
                drawImage(canvas, ctx, img);
              };
            };
            reader.readAsDataURL(file);
          }
        }
      });
    },
  };
};
