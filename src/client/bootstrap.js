'use strict';

import konko from './app';

let {
  element,
  bootstrap,
} = angular;

element(document).ready(() => {
  bootstrap(document, [konko]);
});
