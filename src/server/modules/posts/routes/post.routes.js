'use strict';

import jwt from 'express-jwt';
import topics from '../controllers/topic.controller';
import comments from '../controllers/comment.controller';

/**
 * Post routing.
 *
 * @author C Killua
 * @module Konko/Posts/Routes/Post
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/topics')
    .get(topics.list)
    .post(JWT_AUTH, topics.create);

  app.route('/api/topics/:topicId')
    .get(topics.get)
    .put(JWT_AUTH, topics.update)
    .delete(JWT_AUTH, topics.delete);

  app.route('/api/topics/:topicId/comments')
    .get(comments.list)
    .post(JWT_AUTH, comments.create);

  app.route('/api/topics/:topicId/comments/:commentId')
    .put(JWT_AUTH, comments.update)
    .delete(JWT_AUTH, comments.delete);

  app.route('/api/topics/:topicId/upvote')
    .put(JWT_AUTH, topics.upvote);
  app.route('/api/topics/:topicId/downvote')
    .put(JWT_AUTH, topics.downvote);
  app.route('/api/topics/:topicId/comments/:commentId/upvote')
    .put(JWT_AUTH, comments.upvote);
  app.route('/api/topics/:topicId/comments/:commentId/downvote')
    .put(JWT_AUTH, comments.downvote);

  app.param('topicId', topics.findTopicById);
  app.param('commentId', comments.findCommentById);
};
