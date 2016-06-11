'use strict';

import jwt from 'express-jwt';
import topics from '../controllers/topic.controller';
import comments from '../controllers/comment.controller';
import permission from '../../../configs/permission';
import utils from '../../../configs/utils';

/**
 * Post routing.
 *
 * @author C Killua
 * @module Konko/Posts/Routes/Post
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/topics')
    .get(JWT_AUTH, permission.get('allowAll'), topics.list)
    .post(JWT_AUTH, permission.get('allowUser'), topics.create);

  app.route('/api/v1/topics/:topicId')
    .get(JWT_AUTH, permission.get('allowAll'), topics.get)
    .put(JWT_AUTH, permission.get('allowAdminOwner', 'topic'), topics.update)
    .delete(JWT_AUTH, permission.get('allowAdmin'), topics.delete);

  app.route('/api/v1/topics/:topicId/comments')
    .get(JWT_AUTH, permission.get('allowAll'), comments.list)
    .post(JWT_AUTH, permission.get('allowUser'), comments.create);

  app.route('/api/v1/topics/:topicId/comments/:commentId')
    .get(JWT_AUTH, permission.get('allowAll'), comments.get)
    .put(JWT_AUTH, permission.get('allowAdminOwner', 'comment'), comments.update)
    .delete(JWT_AUTH, permission.get('allowAdmin'), comments.delete);

  app.route('/api/v1/topics/:topicId/like')
    .put(utils.throttle, JWT_AUTH, permission.get('allowUser'), topics.like)
    .delete(utils.throttle, JWT_AUTH, permission.get('allowUser'), topics.unlike);
  app.route('/api/v1/topics/:topicId/comments/:commentId/like')
    .put(utils.throttle, JWT_AUTH, permission.get('allowUser'), comments.like)
    .delete(utils.throttle, JWT_AUTH, permission.get('allowUser'), comments.unlike);

  app.route('/api/v1/topics/:topicId/bookmark')
    .get(utils.throttle, JWT_AUTH, permission.get('allowUser'), topics.bookmarked)
    .put(utils.throttle, JWT_AUTH, permission.get('allowUser'), topics.bookmark)
    .delete(utils.throttle, JWT_AUTH, permission.get('allowUser'), topics.unbookmark);

  app.param('topicId', topics.findTopicById);
  app.param('commentId', comments.findCommentById);
};
