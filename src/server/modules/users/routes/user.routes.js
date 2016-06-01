'use strict';

import jwt from 'express-jwt';
import user from '../controllers/user.controller';
import topics from '../../posts/controllers/topic.controller';
import permission from '../../../configs/permission';
import utils from '../../../configs/utils';

/**
 * Profile routing.
 *
 * @author C Killua
 * @module Konko/Users/Routes/Profile
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/users')
    .get(JWT_AUTH, permission.get('allowAdmin'), user.list);

  app.route('/api/v1/users/:userId')
    .get(JWT_AUTH, permission.get('allowOwner', 'user'), user.get)
    .put(JWT_AUTH, permission.get('allowAdmin', 'user'), user.update);

  app.route('/api/v1/users/:userId/profile')
    .get(JWT_AUTH, permission.get('allowUser'), user.getProfile)
    .put(JWT_AUTH, permission.get('allowAdminOwner', 'user'), user.updateProfile);

  app.route('/api/v1/users/:userId/preference')
    .get(JWT_AUTH, permission.get('allowOwner', 'user'), user.getPreference)
    .put(JWT_AUTH, permission.get('allowOwner', 'user'), user.updatePreference);

  app.route('/api/v1/users/:userId/bookmarks')
    .get(JWT_AUTH, permission.get('allowUser'), user.getBookmarks);

  app.route('/api/v1/users/:userId/bookmarks/:topicId')
    .delete(utils.throttle, JWT_AUTH, permission.get('allowOwner', 'user'), user.removeBookmark);

  app.route('/api/v1/users/:userId/permission')
    .get(utils.throttle, JWT_AUTH, permission.get('allowAll'), user.getPermission)
    .put(JWT_AUTH, permission.get('allowAdmin'), user.setPermission);

  app.param('userId', user.findUserById);
  app.param('topicId', topics.findTopicById);
};
