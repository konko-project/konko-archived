'use strict';

/**
 * Post toolbar tools directive
 *
 * @author C Killua
 * @module Konko/Client/Posts/Directives/PostToolbarTools
 * @param $state - service in module ui.router.state
 * @param CommentService - service in module konko.posts
 * @param TopicService - service in module konko.posts
 * @param AuthenticationService - service in module konko.authentication
 * @returns {Object} Directive of tools
 */
export default ($state, CommentService, TopicService, AuthenticationService) => {
  'ngInject';
  return {
    require: '^konkoPostToolbar',
    restrict: 'AE',
    replace: true,
    templateUrl: 'styles/core/views/posts/tools.toolbar.template.html',
    link: (scope, element, attr) => {
      scope.liked = scope.vm.liked(scope.doc.likes);
      scope.bookmarked = scope.vm.bookmarked();

      scope.like = () => {
        let like = scope.liked ? 'dislike' : 'like';
        if (scope.doc.topic) {  // comment
          CommentService[like]({
            topicId: scope.doc.topic._id,
            commentId: scope.doc._id,
          }, {}).$promise.then(data => {
            scope.doc.likes = data.likes;
            scope.liked = scope.vm.liked(scope.doc.likes);
          }, data => {
            console.log(data);
          });
        } else {                // topic
          TopicService[like]({
            topicId: scope.doc._id,
          }, {}).$promise.then(data => {
            scope.doc.likes = data.likes;
            scope.liked = scope.vm.liked(scope.doc.likes);
          }, data => {
            console.log(data);
          });
        }
      };
      scope.bookmark = () => {
        let bookmark = scope.bookmarked ? 'unbookmark' : 'bookmark';
        TopicService[bookmark]({
          topicId: scope.doc._id,
        }, {}).$promise.then(data => {
          scope.doc.bookmarks = data.bookmarks;
          scope.bookmarked = scope.vm.bookmarked();
        }, data => {
          console.log(data);
        });
      };
      scope.quote = () => {
        let tid = scope.doc.topic ? scope.doc.topic._id : scope.doc._id;
        $state.go('topic.comment', { topicId: tid, content: scope.doc });
      };
      scope.edit = () => {
        if (scope.doc.topic) {  // comment
          $state.go('comment.edit', { commentId: scope.doc._id });
        } else {                // topic
          $state.go('topic.edit', { topicId: scope.doc._id });
        }
      };
      scope.report = () => {
        scope.vm.report.iid = scope.doc._id;
        scope.vm.report.type = scope.doc.topic ? 'comment' : 'topic';
        scope.vm.report.url = scope.doc.topic ? `/t/${scope.doc.topic._id}#${scope.doc._id}` : `/t/${scope.doc._id}`;
        angular.element('#reportModal').modal('show');
      };
      scope.share = () => {
        angular.element('.konko-topic .toolbar .share').popover({
          container: 'body',
          placement: 'top',
        });
      };
      scope.slide = () => {
        let firstImage = /\!\[([^\]]*)\]\(([^\s]*?)\ ?((\'|\")(.*?)\4)?\)/gm.exec(scope.doc.content);
        scope.vm.slide.title = scope.doc.title;
        scope.vm.slide.description = '';
        scope.vm.slide.url = `/t/${scope.doc._id}`;
        scope.vm.slide.order = 0;
        scope.vm.slide.image = firstImage ? firstImage[2] : '';
        scope.vm.slide.alt = firstImage ? firstImage[1] || scope.doc.title : scope.doc.title;
        angular.element('#addSlideModal').modal('show');
      };
    },
  };
};
