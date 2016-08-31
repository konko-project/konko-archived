'use strict';

import PostConfig from './configs/posts.routes';
import CommentController from './controllers/comments.controller';
import TopicController from './controllers/topics.controller';
import EditorDirective from './directives/editor.directive';
import PostDirective from './directives/post.directive';
import ContenteditableDirective from './directives/contenteditable.directive';
import PostToolbarDirective from './directives/postToolbar.directive';
import PostToolbarToolsDirective from './directives/postToolbarTools.directive';
import CommentService from './services/comments.service';
import TopicService from './services/topics.service';

angular.module('konko.posts', [])
  .config(PostConfig)
  .controller('CommentController', CommentController)
  .controller('TopicController', TopicController)
  .directive('konkoEditor', EditorDirective)
  .directive('konkoPost', PostDirective)
  .directive('contenteditable', ContenteditableDirective)
  .directive('konkoPostToolbar', PostToolbarDirective)
  .directive('tools', PostToolbarToolsDirective)
  .service('CommentService', CommentService)
  .service('TopicService', TopicService);

angular.module('konko').requires.push('konko.posts');
