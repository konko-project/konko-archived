'use strict';

/**
 * Upload Service
 *
 * @author C Killua
 * @module Konko/Client/Utils/Services/Upload
 */
export default class UploadService {

  /**
   * Constructor of UploadService
   *
   * @param $http - service in module ng
   * @constructs
   */
  /*@ngInject;*/
  constructor($http) {
    this.HTTP = $http;
  }

  /**
   * Sends a request to upload profile image
   *
   * @param {String} userId - which user's profile
   * @param {File} file - the file going to be uploaded
   * @param {String} type - which profile image
   * @returns
   */
  uploadProfileImages(userId, file, type) {
    let fd = new FormData();
    fd.append('userId', userId);
    fd.append(type, file);
    return this.HTTP({
      method: 'POST',
      url: '/api/v1/upload/' + type,
      headers: { 'Content-Type': undefined },
      transformRequest: angular.identity,
      data: fd,
    });
  }
}
