'use strict';

import CoreConfig from './configs/core.routes';
import AdminConfig from './configs/admin.routes';
import AdminController from './controllers/admin.controller';
import SetupController from './controllers/setup.controller';
import ErrorController from './controllers/error.controller';
import CoreService from './services/core.service';
import ReportService from './services/report.service';
import SlideService from './services/slides.service';

angular.module('konko.core', [])
  .config(CoreConfig)
  .config(AdminConfig)
  .controller('AdminController', AdminController)
  .controller('SetupController', SetupController)
  .controller('ErrorController', ErrorController)
  .service('CoreService', CoreService)
  .service('ReportService', ReportService)
  .service('SlideService', SlideService);

angular.module('konko').requires.push('konko.core');
