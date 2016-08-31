'use strict';

import previewDirective from './directives/image.preview.directive';
import uploadDirective from './directives/upload.directive';
import uploadService from './services/upload.service';

angular.module('konko.utils', [])
  .directive('konkoUploader', uploadDirective)
  .directive('konkoPreviewer', previewDirective)
  .service('UploadService', uploadService);

angular.module('konko').requires.push('konko.utils');
