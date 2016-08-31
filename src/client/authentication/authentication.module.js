'use strict';

import AuthenticationConfig from './configs/authentication.routes';
import LoginController from './controllers/login.controller';
import RegisterController from './controllers/register.controller';
import WelcomeController from './controllers/welcome.controller';
import ResetPasswordController from './controllers/reset.controller';
import AuthenticationService from './services/authentication.service';

angular.module('konko.authentication', [])
  .config(AuthenticationConfig)
  .controller('LoginController', LoginController)
  .controller('RegisterController', RegisterController)
  .controller('WelcomeController', WelcomeController)
  .controller('ResetPasswordController', ResetPasswordController)
  .service('AuthenticationService', AuthenticationService);

angular.module('konko').requires.push('konko.authentication');
