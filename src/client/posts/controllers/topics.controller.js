'use strict';

const AUTH = new WeakMap();
const STATE = new WeakMap();
const PARAM = new WeakMap();
const SLIDE = new WeakMap();
const REPORT = new WeakMap();
const COMMENT = new WeakMap();

/**
 * Topics Controller
 *
 * @author C Killua
 * @module Konko/Client/Posts/Controllers/Topics
 */
export default class TopicController {

  /**
   * Constructor of TopicController
   *
   * @param $scope - service in module ng
   * @param $state - service in module ui.router.state
   * @param $stateParams - service in module ui.router.state
   * @param {Object} core - resolved core
   * @param {Object} topic - resolved topic
   * @param {Object} page - resolved page
   * @param {Object} panel - resolved panel
   * @param AuthenticationService - service in module konko.authentication
   * @param CommentService - service in module konko.posts
   * @param ReportService - service in module konko.core
   * @param SlideService - service in module konko.core
   * @constructs
   */
  /*@ngInject;*/
  constructor($scope, $state, $stateParams, core, topic, page, panel, AuthenticationService, CommentService, ReportService, SlideService) {
    // docs
    this.core = core;
    this.topic = topic;
    this.page = page;
    this.comments = page ? page.comments : [];
    this.panel = panel;

    // set locals const
    AUTH.set(this, AuthenticationService);
    STATE.set(this, $state);
    PARAM.set(this, $stateParams);
    SLIDE.set(this, SlideService);
    REPORT.set(this, ReportService);
    COMMENT.set(this, CommentService);

    // other vars
    this.content = this.topic.content;
    this.user = AUTH.get(this).currentUser();
    this.limit = 5;
    this.updating = false;
    this.loadcomment = '';

    // other vars - editor
    this.slide = { title: '', description: '', url: '', order: 0, image: '', alt: '' };
    this.report = { iid: '', type: '', url: '', reason: '' };
    this.alert = null;
    this.topicTitlePattern = `.{${this.core.post.topic.title.min},${this.core.post.topic.title.max}}`;
    this.topicTitlePatternTitle = `Topic title must be within ${this.core.post.topic.title.min} to ${this.core.post.topic.title.max} characters.`;
    this.topicContentPattern = new RegExp(`.{${this.core.post.topic.content.min},${this.core.post.topic.content.max}}`);
    this.topicContentPatternTitle = `Content must be within ${this.core.post.topic.content.min} to ${this.core.post.topic.content.max} characters.`;

    // set listener
    // $scope.$on('at_bottom', event => this.updateComments());
  }

  /**
   * Save a topic
   *
   * @param {Boolean} isValid - Form validation
   */
  save(isValid) {
    if (!isValid) {
      return false;
    } else if (!this.topic.content.match(this.topicContentPattern)) {
      this.alert = { type: 'warning', message: this.topicContentPatternTitle };
      return false;
    }
    this.alert = null;
    if (this.topic._id) {
      this.topic.$update()
        .then(data => STATE.get(this).go('topic.view', { topicId: data._id }))
        .catch(err => this.alert = { type: 'danger', message: err.data.message });
    } else {
      this.topic.$save({ panelId: PARAM.get(this).panelId })
        .then(data => STATE.get(this).go('topic.view', { topicId: data._id }))
        .catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

  /**
   * Remove a topic
   *
   */
  remove() {
    this.topic.$remove()
      .then(data => PARAM.get(this).go('panel.view', { panelId: this.topic.panel }, { reload: true }))
      .catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Checks if Admin
   *
   * @returns {Boolean} true if Admin, false otherwise
   */
  isAdmin() {
    return AUTH.get(this).isAdmin();
  }

  /**
   * Checks if current user is the Author
   *
   * @param {String} authorId - id of the author
   * @returns {Boolean} true if is Author, false otherwise
   */
  isAuthor(authorId) {
    return AUTH.get(this).isLoggedIn() && AUTH.get(this).currentUser() && AUTH.get(this).currentUser()._id === authorId;
  }

  /**
   * Checks if current user can edit doc
   *
   * @param {String} authorId - id of the author
   * @returns {Boolean} true if can edit, false otherwise
   */
  canEdit(authorId) {
    return this.isAuthor(authorId) || AUTH.get(this).isAdmin();
  }

  /**
   * Checks if current user can act on doc
   *
   * @returns {Boolean} true if can act, false otherwise
   */
  canAct() {
    return AUTH.get(this).isLoggedIn() && !AUTH.get(this).getUserPermission().match(/(guest|none|banned)/g);
  }

  /**
   * Finds if current user liked the topic/comment
   *
   * @param {Array} likes - a list of users liked the topic/comment
   * @returns {String} user id if user liked the topic/comment
   */
  liked(likes) {
    return _.find(likes, u => u === AUTH.get(this).currentUser()._id);
  }

  /**
   * Finds if current user bookmarked the topic
   *
   * @returns {String} user id if user bookmarked the topic
   */
  bookmarked() {
    return _.find(this.topic.bookmarks, u => u === AUTH.get(this).currentUser()._id);
  }

  /**
   * Report a topic or comment
   *
   * @param {Boolean} isValid - Form validation
   */
  flag(isValid) {
    if(!isValid) {
      return false;
    }

    REPORT.get(this).save(this.report).$promise.then(data => {
      this.alert = { type: 'success', message: `This ${this.report.type} has reported. Thank you!` };
      angular.element('#reportModal button[type="submit"]').attr('disabled', 'true');
    }).catch(err => this.alert = { type: 'danger', message:  err.data.message });

    angular.element('#reportModal').on('hidden.bs.modal', e => {
      angular.element('#reportModal button[disabled]').removeAttr('disabled');
      this.report = { iid: '', type: '', url: '', reason: '' };
      this.alert = null;
    });
  }

  /**
   * Add topic to Carousel
   *
   * @param {Boolean} isValid - Form validation
   */
  addSlide(isValid) {
    if(!isValid) {
      return false;
    }

    SLIDE.get(this).save(this.slide).$promise.then(data => {
      this.alert = { type: 'success', message:  `${this.slide.title} has been added to Carousel.` };
      angular.element('#addSlideModal button[type="submit"]').attr('disabled', 'true');
    }).catch(err => this.alert = { type: 'danger', message:  err.data.message });

    angular.element('#addSlideModal').on('hidden.bs.modal', e => {
      angular.element('#addSlideModal button[disabled]').removeAttr('disabled');
      this.slide = { title: '', description: '', url: '', order: 0, image: '', alt: '' };
      this.alert = null;
    });
  }

  // updateComments() {
  //
  // }
}
