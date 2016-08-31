'use strict';

const AUTH = new WeakMap();
const ROOT = new WeakMap();
const SCOPE = new WeakMap();
const STATE = new WeakMap();
const TOPIC = new WeakMap();
const UPLOAD = new WeakMap();
const TIMEOUT = new WeakMap();
const PROFILE = new WeakMap();

let {
  element,
} = angular;

/**
 * Profiles Controller
 *
 * @author C Killua
 * @module Konko/Client/Profiles/Controllers/Profiles
 */
export default class ProfileController {

  /**
   * Constructor of ProfileController
   *
   * @param $scope - service in module ng
   * @param $state - service in module ui.router.state
   * @param $timeout - service in module ng
   * @param $rootScope - service in module ui.router.state
   * @param {Object} core - resolved core
   * @param {Object} user - resolved user
   * @param {Object} topics - resolved topics
   * @param TopicService - service in module konko.posts
   * @param UploadService - service in module konko.utils
   * @param AuthenticationService - service in module konko.authentication
   * @param ProfileService - service in module konko.profiles
   * @constructs
   */
  /*@ngInject;*/
  constructor($scope, $state, $timeout, $rootScope, core, user, topics, TopicService, UploadService, AuthenticationService, ProfileService) {
    // user info
    this.core = core;
    this.user = user;
    this.profile = user.profile;
    this.bookmarks = user.bookmarks;
    this.preference = user.preference;
    this.profile.dob = new Date(this.profile.dob);

    // set locals const
    AUTH.set(this, AuthenticationService);
    ROOT.set(this, $rootScope);
    SCOPE.set(this, $scope);
    STATE.set(this, $state);
    TOPIC.set(this, TopicService);
    UPLOAD.set(this, UploadService);
    TIMEOUT.set(this, $timeout);
    PROFILE.set(this, ProfileService);
    this.gender = {
      None: '&bigcirc;',
      Male: '&male;',
      Female: '&female;',
      Bigender: '&#x026a5;',
      Neutrois: '&#x026b2;',
    };

    // other vars
    this.alert = null;
    this.topics = topics.topics;
    this.showSideBg = false;
    this.showSideBar = false;

    // other vars - profile images
    this.profileImage = null;
    this.profileImageUrl = null;
    this.profileImageType = '';
    this.profileImageMethod = 'url';

    // set listener
    TIMEOUT.get(this)(() => {
      SCOPE.get(this).$on('nav_expanding', event => {
        this.showSideBar = false;
        element('.profile-sidebar, .p-s-menu').addClass('ng-hide');
        element('.profile-sidebar-avatar').removeClass('show');
        element('.profile-sidebar-avatar-cover').removeClass('hide');
        element('.profile-container').removeClass('pushed');
        SCOPE.get(this).$apply('this.showSideBar', (_new, old) => {
          if (_new) {
            element('.collapse').collapse('hide');
          }
        });
      });
      SCOPE.get(this).$watch('');
    });

    // update html title
    $rootScope.$broadcast('title_update', this.profile.username);
  }

  /**
   * Gets the list of genders
   *
   * @returns {Array} genders
   */
  getGenderList() {
    return _.keys(this.gender);
  }

  /**
   * Gets the display of a gender
   *
   * @param {String} key - the gender about to displayed
   * @returns {String} gender
   */
  getGenderDisplay(key) {
    return _.get(this.gender, key);
  }

  /**
   * Check if it is me
   *
   * @returns {Boolean} true if is Me, false otherwise
   */
  isMe() {
    return AUTH.get(this).isLoggedIn() && AUTH.get(this).currentUser() && AUTH.get(this).currentUser()._id === this.user._id;
  }

  /**
   * Check if birthday today
   *
   * @returns {Boolean} true if is birthday, false otherwise
   */
  isBirthday() {
    let dob = new Date(this.profile.dob);
    let today = new Date();
    return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
  }

  /**
   * Update a profile
   *
   * @param {Boolean} isValid - Form validation
   */
  updateProfile(isValid) {
    if (!isValid || !this.isMe()) {
      return false;
    }

    PROFILE.get(this).updateProfile({ userId: this.user._id }, this.profile).$promise.then(data => {
      this.alert = { type: 'success', message: 'Your profile has updated.' };
      STATE.get(this).go(STATE.get(this).current, {}, { reload: true });
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Update a preference
   *
   * @param {Boolean} isValid - Form validation
   */
  updatePreference(isValid) {
    if (!isValid || !this.isMe()) {
      return false;
    }

    PROFILE.get(this).updatePreference({ userId: this.user._id }, this.preference).$promise.then(data => {
      this.alert = { type: 'success', message: 'Your preference has updated.' };
      ROOT.get(this).$broadcast('update_auth');
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }

  /**
   * Update a profile image
   *
   */
  updateProfileImage() {
    if (this.profileImageMethod === 'upload') {
      if (this.profileImage instanceof Object && this.profileImageType) {
        UPLOAD.get(this).uploadProfileImages(this.user._id, this.profileImage, this.profileImageType).then(data => {
          element('#changeProfileImage').modal('hide');
          element('#changeProfileImage').on('hidden.bs.modal', e => {
            if (this.profileImageType === 'avatar') {
              this.profile.avatar = data.data.url;
            } else {
              this.profile.banner = data.data.url;
            }
            this.updateProfile(true);
          });
        }).catch(err => this.alert = { type: 'danger', message: err.data.message });
      }
    } else if (this.profileImageMethod === 'url') {
      this.profile[this.profileImageType] = this.profileImageUrl;
      element('#changeProfileImage').modal('hide');
      element('#changeProfileImage').on('hidden.bs.modal', e => {
        this.updateProfile(true);
      });
    } else {
      return false;
    }
  }

  /**
   * Set which profile image is going to update
   *
   * @param {String} type - type of the profile image
   */
  setProfileImageType(type) {
    this.profileImageType = type;
    this.profileImageUrl = this.profile[type];
  }

  /**
   * Set which way to update profile image
   *
   * @param {String} method - method to update profile image
   */
  setProfileImageMethod(method) {
    this.profileImageMethod = method;
  }

  /**
   * Check if allow to upload profile image
   *
   * @returns {Boolean} true if allowed, false otherwise
   */
  allowUpload() {
    return (this.profileImageType === 'avatar' && this.core.profile.avatar.upload) || (this.profileImageType === 'banner' && this.core.profile.banner.upload);
  }

  /**
   * Reset alert
   *
   */
  reset() {
    this.alert = null;
  }

  /**
   * Remove a bookmark
   *
   * @param {String} tid - the id of the bookmark going to be removed
   */
  removeBookmark(tid) {
    TOPIC.get(this).unbookmark({ topicId: tid }).$promise.then(data => {
      _.remove(this.bookmarks, b => b._id === tid);
    }).catch(err => this.alert = { type: 'danger', message: err.data.message });
  }
}
