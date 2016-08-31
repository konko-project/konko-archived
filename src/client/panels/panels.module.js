'use strict';

import PanelConfig from './configs/panels.routes';
import PanelController from './controllers/panels.controller';
import PanelListDirective from './directives/panels.directive';
import PanelService from './services/panels.service';

angular.module('konko.panels', [])
  .config(PanelConfig)
  .controller('PanelController', PanelController)
  .directive('konkoPanelList', PanelListDirective)
  .service('PanelService', PanelService);

angular.module('konko').requires.push('konko.panels');
