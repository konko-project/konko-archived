'use strict';

const FILTER = new WeakMap();
const STATE = new WeakMap();
const PARAM = new WeakMap();

/**
 * Comments Controller
 *
 * @author C Killua
 * @module Konko/Client/Posts/Controllers/Comments
 */
export default class CommentController {

  /**
   * Constructor of CommentController
   *
   * @param $filter - service in module ng
   * @param $state - service in module ui.router.state
   * @param $stateParams - service in module ui.router.state
   * @param {Object} core - resolved core
   * @param {Object} comment - resolved comment
   * @param {Object} topic - resolved topic
   * @constructs
   */
  /*@ngInject;*/
  constructor($filter, $state, $stateParams, core, comment, topic) {
    // docs
    this.core = core;
    this.comment = comment;
    this.topic = topic || comment.topic;

    // editor
    this.alert = null;
    this.commentContentPattern = new RegExp(`.{${this.core.post.comment.content.min},${this.core.post.comment.content.max}}`);
    this.commentContentPatternTitle = `Comment must be within ${this.core.post.comment.content.min} to ${this.core.post.comment.content.max} characters.`;

    // set locals const
    FILTER.set(this, $filter);
    STATE.set(this, $state);
    PARAM.set(this, $stateParams);

    this.comment.content = PARAM.get(this).content ? this.quoteContent(PARAM.get(this).content) : this.comment.content;
  }

  /**
   * Save a comment
   *
   * @param {Boolean} isValid - Form validation
   */
  save(isValid) {
    if (!isValid) {
      return false;
    } else if (!this.comment.content.match(this.commentContentPattern)) {
      this.alert = { type: 'warning', message: this.commentContentPatternTitle };
      return false;
    }
    this.alert = null;
    if (this.comment._id) {
      this.comment.$update({ topicId: this.topic._id })
        .then(data => STATE.get(this).go('topic.view.page', { topicId: data.comment.topic, page: data.page, '#': data.comment._id }))
        .catch(err => this.alert = { type: 'danger', message: err.data.message });
    } else {
      this.comment.$save({ topicId: PARAM.get(this).topicId })
        .then(data => STATE.get(this).go('topic.view', { topicId: data.topic._id }))
        .catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

  /**
   * Remove a comment
   *
   */
  remove() {
    this.comment.$remove()
      .then(data => STATE.get(this).go('topic.view', { topicId: this.topic._id }, { reload: true }))
      .catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Create a quote comment
   *
   * @param {String} content - content to be quoted
   * @returns {String} Quote that formatted
   */
  quoteContent(content) {
    const source = `[${content.author.profile.username}]`;
    const time = FILTER.get(this)('date')(content.date, 'short');
    const ref = content.topic ? `(/t/${content.topic._id}#${content._id} "${time}")` : `(/t/${content._id} "${time}")`;

    let cs = content.content.split('\n');
    cs.push(`--${source}${ref}\n`);
    return _.map(cs, i => `> ${i}`).join('\n');
  }
}
