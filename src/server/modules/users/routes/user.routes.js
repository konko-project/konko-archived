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
  const JWT = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/users')
    .get(JWT, permission.get('allowAdmin'), user.list);

  app.route('/api/v1/users/:userId')
    .get(JWT, permission.get('allowUser', 'user'), user.get)
    .put(JWT, permission.get('allowAdmin', 'user'), user.update);

  app.route('/api/v1/users/:userId/profile')
    .get(JWT, permission.get('allowUser'), user.getProfile)
    .put(JWT, permission.get('allowAdminOwner', 'user'), user.updateProfile);

  app.route('/api/v1/users/:userId/preference')
    .get(JWT, permission.get('allowOwner', 'user'), user.getPreference)
    .put(JWT, permission.get('allowOwner', 'user'), user.updatePreference);

  app.route('/api/v1/users/:userId/bookmarks')
    .get(JWT, permission.get('allowOwner', 'user'), user.getBookmarks);

  app.route('/api/v1/users/:userId/bookmarks/:topicId')
    .delete(utils.throttle, JWT, permission.get('allowOwner', 'user'), user.removeBookmark);

  app.route('/api/v1/users/:userId/permission')
    .get(utils.throttle, JWT, permission.get('allowAll'), user.getPermission)
    .put(JWT, permission.get('allowAdmin'), user.setPermission);

  app.param('userId', user.findUserById);
  app.param('topicId', topics.findTopicById);
};
