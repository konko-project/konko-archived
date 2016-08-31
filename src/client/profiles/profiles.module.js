'use strict';

import ProfileConfig from './configs/profiles.routes';
import ProfileService from './services/profiles.service';
import ProfileController from './controllers/profiles.controller';

angular.module('konko.profiles', [])
  .config(ProfileConfig)
  .controller('ProfileController', ProfileController)
  .service('ProfileService', ProfileService);

angular.module('konko').requires.push('konko.profiles');
