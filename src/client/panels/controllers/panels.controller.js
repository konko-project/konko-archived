'use strict';

const AUTH = new WeakMap();
const TOPIC = new WeakMap();
const STATE = new WeakMap();

/**
 * Panel Controller
 *
 * @author C Killua
 * @module Konko/Client/Panels/Controllers/Panels
 */
export default class PanelController {

  /**
   * Constructor of PanelController
   *
   * @param $scope - service in module ng
   * @param $state - service in module ui.router.state
   * @param {Object} panel - resolved panel
   * @param {Object} page - resolved page of topics
   * @param TopicService - service in module konko.posts
   * @param AuthenticationService - service in module konko.authentication
   * @constructs
   */
  /*@ngInject;*/
  constructor($scope, $state, panel, page, TopicService, AuthenticationService) {
    // docs
    this.panel = panel;
    this.page = page;
    this.topics = this.page.topics;

    // set locals const
    AUTH.set(this, AuthenticationService);
    TOPIC.set(this, TopicService);
    STATE.set(this, $state);

    // other vars
    this.updating = false;
    this.loadtopic = 'Load more topics';
    this.user = AUTH.get(this).currentUser();

    // set handler
    // $scope.$on('at_bottom', event => this.updateTopics());
  }

  // updateTopics() {
  //
  // }

}
