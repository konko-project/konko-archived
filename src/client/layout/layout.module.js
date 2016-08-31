'use strict';

import LayoutConfig from './configs/index.routes';
import IndexController from './controllers/index.controller';
import NavbarController from './controllers/navbar.controller';
import AlertDirective from './directives/alert.directive';
import AtBottomDirective from './directives/atBottom.directive';
import BreadcrumbDirective from './directives/breadcrumb.directive';
import CarouselDirective from './directives/carousel.directive';
import CarouselSlideDirective from './directives/carousel.slide.directive';
import CategoryDirective from './directives/category.directive';
import PaginationDirective from './directives/pagination.directive';
import PanelStatDirective from './directives/panelStat.directive';
import PopoverDirective from './directives/popover.directive';
import ScrollToDirective from './directives/scrollTo.directive';
import TitleDirective from './directives/title.directive';
import TooltipDirective from './directives/tooltip.directive';
import CategoryService from './services/category.service';

angular.module('konko.layout', [])
  .config(LayoutConfig)
  .controller('IndexController', IndexController)
  .controller('NavbarController', NavbarController)
  .directive('konkoAlert', AlertDirective)
  .directive('atBottom', AtBottomDirective)
  .directive('breadcrumb', BreadcrumbDirective)
  .directive('konkoCarousel', CarouselDirective)
  .directive('konkoSlide', CarouselSlideDirective)
  .directive('konkoCategory', CategoryDirective)
  .directive('konkoPagination', PaginationDirective)
  .directive('panelStat', PanelStatDirective)
  .directive('popover', PopoverDirective)
  .directive('scrollTo', ScrollToDirective)
  .directive('title', TitleDirective)
  .directive('konkoTooltip', TooltipDirective)
  .service('CategoryService', CategoryService);

angular.module('konko').requires.push('konko.layout');
