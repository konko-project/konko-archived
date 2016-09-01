'use strict';

const AUTH = new WeakMap();
const USER = new WeakMap();
const PANEL = new WeakMap();
const STATE = new WeakMap();
const SLIDE = new WeakMap();
const REPORT = new WeakMap();
const CATEGORY = new WeakMap();
const ROOTSCOPE = new WeakMap();

let {
  element
} = angular;

/**
 * Admin Controller
 *
 * @author C Killua
 * @module Konko/Client/Core/Controllers/Admin
 */
export default class AdminController {

  /**
   * Constructor of AdminController
   *
   * @param $state - service in module ui.router.state
   * @param $scope - type in module ng
   * @param $rootScope - service in module ng
   * @param $timeout - service in module ng
   * @param $compile - service in module ng
   * @param AuthenticationService - service in module konko.authentication
   * @param PanelService - service in module konko.panels
   * @param CategoryService - service in module konko.layout
   * @param ProfileService - service in module konko.profiles
   * @param ReportService - service in module konko.core
   * @param SlideService - service in module konko.core
   * @param {Object} core - resolved core
   * @param {Array} categories - resolved categories
   * @param {Array} panels - resolved panels
   * @param {Array} reports - resolved reports
   * @param {Array} slides - resolved slides
   * @constructs
   */
  /*@ngInject;*/
  constructor($state, $scope, $rootScope, $timeout, $compile, AuthenticationService, PanelService, CategoryService, ProfileService, ReportService, SlideService, core, categories, panels, reports, slides) {
    // locals
    STATE.set(this, $state);
    ROOTSCOPE.set(this, $rootScope);
    PANEL.set(this, PanelService);
    CATEGORY.set(this, CategoryService);
    AUTH.set(this, AuthenticationService);
    USER.set(this, ProfileService);
    REPORT.set(this, ReportService);
    SLIDE.set(this, SlideService);

    // docs
    this.core = core;
    this.reports = reports;
    this.slides = slides;
    this.panels = panels;
    this.categories = categories;
    this.destructor(this.core);

    // vars
    this.alert = null;
    this.adminPass = null;
    this.confirmed = false; // default false
    this.showSideBar = false;
    this.adminLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNTEycHgiIHdpZHRoPSI1MTJweCI+CgkJPGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIyNTYiIGZpbGw9IiNGRkZGRkYiLz4KCQk8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZHk9IjE4MHB4IiBzdHlsZT0iZm9udC1mYW1pbHk6IEFyaWFsIEJsYWNrOyBmb250LXNpemU6IDUxMnB4OyBmaWxsOiAjOTk5OyIKIHRleHQtYW5jaG9yPSJtaWRkbGUiPiYjOTg4MTs8L3RleHQ+CgoJPC9zdmc+';

    // vars - panel
    this.n_Panel = {};
    this.n_Category = {};
    this.p_parent = undefined;
    this.panelNamePattern = `.{${this.panel.panel.name.min},${this.panel.panel.name.max}}`;
    this.panelDescriptionPattern = `.{${this.panel.panel.description.min},${this.panel.panel.description.max}}`;
    this.panelNameTitle = `Panel name must between ${this.panel.panel.name.min} to ${this.panel.panel.name.max} characters.`;
    this.panelDescriptionTitle = `Panel description must between ${this.panel.panel.description.min} to ${this.panel.panel.description.max} characters.`;
    this.categoryNamePattern = `.{${this.panel.category.name.min},${this.panel.category.name.max}}`;
    this.categoryNameTitle = `Category name must between ${this.panel.category.name.min} to ${this.panel.category.name.max} characters.`;

    // vars - user
    this.found = null;

    // scope
    $scope.Date = (date) => new Date(date);

    // toggle model to confirm permission
    element(document).ready(() => {
			if(!AuthenticationService.isAdminTokenValid()) {
	      element('#adminConfirmation').modal();
			} else {
				this.confirmed = true;
			}
    });

    // set handler
    $timeout(() => {
      _.map(['#newCategoryModal', '#newPanelModal'], e => element(e).on('hidden.bs.modal', e => this.alert = null));
    });

    // update html title
    $rootScope.$broadcast('title_update', 'Admin');
  }

  /**
   * Core destructor
   *
   * @param {Object} core - core
   */
  destructor({ basic, global, mailer, registration, profile, panel, post }) {
    this.basic = Object.assign({}, basic);
    this.global = Object.assign({}, global);
    this.mailer = Object.assign({}, mailer);
    this.registration = Object.assign({}, registration);
    this.profile = Object.assign({}, profile);
    this.panel = Object.assign({}, panel);
    this.post = Object.assign({}, post);
  }

  /**
   * Create new Category
   *
   * @param {Boolean} isValid - Form validation
   */
  newCategory(isValid) {
    if (!isValid) {
      return false;
    }

    let category = new (CATEGORY.get(this))();
    category = Object.assign(category, this.n_Category);
    category.$save().then(data => {
      this.hideModal('#newCategoryModal', STATE.get(this).current);
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Create new Panel
   *
   * @param {Boolean} isValid - Form validation
   */
  newPanel(isValid) {
    if (!isValid) {
      return false;
    }

    let panel = new (PANEL.get(this))();
    let parent = JSON.parse(this.p_parent);
    panel = Object.assign(panel, this.n_Panel);
    panel.$save({
      categoryId: parent.category ? parent.category : parent._id,
      panelId: parent.category ? parent._id : '',
    }).then(data => {
      this.hideModal('#newPanelModal', STATE.get(this).current);
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Update a panel
   *
   * @param {Object} panel - panel that going to be updated
   */
  updatePanel(panel) {
    PANEL.get(this).update({ categoryId: panel.category, panelId: panel._id }, panel).$promise.then(data => {
      STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Update a category
   *
   * @param {Object} category - category that going to be updated
   */
  updateCategory(category) {
    CATEGORY.get(this).update({ categoryId: category._id }, category).$promise.then(data => {
      STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Remove a panel
   *
   * @param {Object} panel - panel that going to be removed
   */
  removePanel({ _id, name, category }) {
    let msg = `Are you sure to remove ${name}? All related panels will also be removed. This cannot be undone.`;
    if (confirm(msg)) {
      PANEL.get(this).remove({ categoryId: category, panelId: _id }).$promise.then(data => {
        STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
      }).catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

  /**
   * Remove a category
   *
   * @param {Object} category - category that going to be removed
   */
  removeCategory(category) {
    let msg = `Are you sure to remove ${category.name}? All related panels will also be removed. This cannot be redone.`;
    if (confirm(msg)) {
      CATEGORY.get(this).remove({ categoryId: category._id }).$promise.then(data => {
        STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
      }).catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

  /**
   * Add an empty style
   *
   */
  newStyle() {
    this.global.styles.push({
      name: '',
      root: '',
    });
  }

  /**
   * Remove a style by index
   *
   * @param {number} index - index of the style
   */
  removeStyle(index) {
    this.global.styles.splice(index, 1);
  }

  /**
   * Add an empty Nav
   *
   */
  newNav() {
    this.global.navbar.navs.push({
      name: '',
      url: '',
      order: undefined,
    });
  }

  /**
   * Remove an Nav
   *
   * @param {Object} nav - nav that going to be removed
   */
  removeNav(nav) {
    this.global.navbar.navs.splice(this.global.navbar.navs.indexOf(nav), 1);
  }

  /**
   * Update password regex
   *
   */
  updatePass() {
    let {
      min, max, capital, lower, digit, special
    } = this.registration.password;
    let _lower = '(?=.*[a-z])';
    let _upper = '(?=.*[A-Z])';
    let _digit = '(?=.*\\d)';
    let _special = '(?=.*[\\!\\@\\#\\$\\%\\^\\&\\*\\_\\ ])';
    let _length = `{${min},${max}}`;
    this.registration.password.regex = `${digit ? _digit : ''}${lower ? _lower : ''}${capital ? _upper : ''}${special ? _special : ''}.${_length}`;
  }

  /**
   * Update core with selected field
   *
   * @param {Boolean} isValid - Form validation
   * @param {String} key - Field that going to be updated in core
   */
  updateCore(isValid, key) {
    if (!isValid) {
      return false;
    }

    this.core[key] = Object.assign({}, this[key]);
    this.core.$update({ fields: key }).then(data => {
      ROOTSCOPE.get(this).$broadcast('core_updated');
      STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
    }).catch(err => {
      STATE.get(this).go('error', {
        status: err.status,
        title: err.statusText,
        message: err.data,
      }, { reload: true });
    });
  }

  /**
   * Confirm admin's identity
   *
   * @param {Boolean} flag - confirm or not
   */
  confirm(flag) {
    if (flag === 'confirm') {
      if (!this.adminPass) {
        return false;
      }
      element('#adminConfirmation').modal('hide');
			let adminVerify = btoa(window.crypto.getRandomValues(new Int32Array(10)).toLocaleString());
      AUTH.get(this).checkPass({ adminPass: this.adminPass, adminVerify: adminVerify }).then(data => {
				AUTH.get(this).saveAdminToken(data.data.adminToken);
				AUTH.get(this).saveAdminVerify(adminVerify);
        this.confirmed = true;
      }).catch(err => {
        element('#adminConfirmation').on('hidden.bs.modal', e => {
          STATE.get(this).go('error', {
            status: err.status,
            title: err.statusText,
            message: err.data,
          }, { reload: true });
        });
      });
    } else {
      this.hideModal('#adminConfirmation', 'home.index');
    }
  }

  /**
   * Hides a modal and go to state
   *
   * @param {String} id - modal id
   * @param {String} state - state that ready to go
   * @param {Object} param - parameters that going to new state
   */
  hideModal(id, state, param = {}) {
    element(id).modal('hide');
    element(id).on('hidden.bs.modal', e => {
      STATE.get(this).go(state, param, { reload: true });
    });
  }

  /**
   * Search an user
   *
   * @param {String} keyword - keyword used to search for user
   */
  searchUser(keyword) {
    USER.get(this).query({ search: keyword, fields: '-hash,-salt,-bookmarks,-preference' }).$promise.then(data => {
      this.found = data;
      this.alert = null;
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Update an user
   *
   * @param {Object} user - user that going to be updated
   */
  updateUser(user) {
    USER.get(this).update(user).$promise.then(u_data => {
      USER.get(this).updateProfile({ userId: user._id }, user.profile).$promise.then(data => {
        this.alert = { type: 'success', message: `User '${data.username}' is updated.` };
        if (AUTH.get(this).currentUser()._id === user._id && u_data.permission !== 'admin') {
          STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
        }
      }).catch(err => this.alert = { type: 'danger', message: err.data.message });
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Process a report
   *
   * @param {String} rid - id of the report going to be processed
   */
  processReport(rid) {
    REPORT.get(this).done({ reportId: rid }, {}).$promise.then(data => {
      _.remove(this.reports, r => r._id === rid);
      this.alert = { type: 'success', message: `Report ${rid} has been processed.` };
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Create an empty Slide
   *
   */
  newSlide() {
    this.slides.push(new (SLIDE.get(this))());
  }

  /**
   * Gets the title for button
   *
   * @param {Object} slide - a slide
   * @returns {String} title of the button
   */
  slideCrossButtonTitle(slide) {
    return slide._id ? `Remove ${slide.title}` : 'Remove';
  }

  /**
   * Gets the title for button
   *
   * @param {Object} slide - a slide
   * @returns {String} title of the button
   */
  slideCheckButtonTitle(slide) {
    return slide._id ? `Update ${slide.title}` : 'Save';
  }

  /**
   * Remove a slide
   *
   * @param {Object} slide - slide going to be removed
   */
  removeSlide(slide) {
    _.remove(this.slides, s => s.$$hashKey === slide.$$hashKey);
    if (slide._id) {
      slide.$remove()
        .then(data => this.alert = { type: 'success', message: data.message })
        .catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

  /**
  * Update a slide
  *
  * @param {Object} slide - slide going to be updated
   */
  updateSlide(slide) {
    if (slide._id) {
      slide.$update().then(data => {
        slide = data;
        this.alert = { type: 'success', message: `${slide.title} is updated.` };
      }).catch(err => this.alert = { type: 'danger', message: err.data.message });
    } else {
      slide.$save().then(data => {
        slide = data;
        this.alert = { type: 'success', message: `${slide.title} is created.` };
      }).catch(err => this.alert = { type: 'danger', message: err.data.message });
    }
  }

}
