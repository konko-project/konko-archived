'use strict';

/**
 * Controller that handles file uploads.
 *
 * @author C Killua
 * @module Konko/Core/Controllers/Upload
 */
export default class UploadController {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Responses back uploaded file url if no error.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns An HTTP response.
   */
  static profileUpload(req, res, next) {
    if (req.payload._id !== req.body.userId) {
      return res.status(401).send({
        message: 'Unauthorized'
      });
    }
    let url = '/uploads/users/' + req.payload._id + '/' + req.file.fieldname + '/' + req.file.filename;
    return res.status(200).send({
      url: url
    });
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 */
