'use strict';

import pug from 'pug';
import nodemailer from 'nodemailer';
import sesTransport from 'nodemailer-ses-transport';
import sendmailTransport from 'nodemailer-sendmail-transport';

/**
 * Configurate express-mailer for current app to send email.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Mailer
 * @param {Object} app - An express app.
 * @param {Object} mailer - Express-Mailer
 */
export default class Mailer {

  /**
   * @constructs
   *
   * @param {Object} app - Express app
   * @param {Object} core - Core setting of this site
   */
  constructor(app, core) {
    this.app = app;
    this.core = core;
    this.transporter = this.getTransporter(this.core.mailer.method);
  }

  /**
   * Initialize the mailer transporter based on core settings
   *
   * @param {String} method - The method that used for sending email
   * @returns {Object} The initialized mailer transporter
   */
  getTransporter(method) {
    if (method === 'sendmail') {
      return nodemailer.createTransport(sendmailTransport());
    } else if (method === 'smtp') {
      let smtpConfig = {
        host: this.core.mailer.host,
        port: this.core.mailer.port,
        secure: this.core.mailer.secure,
        auth: {
          user: this.core.mailer.user,
          pass: this.core.mailer.password,
        },
      };
      return nodemailer.createTransport(smtpConfig);
    } else if (method === 'ses') {
      return nodemailer.createTransport(sesTransport({
        accessKeyId: this.core.mailer.ses_keyId,
        secretAccessKey: this.core.mailer.ses_secret,
      }));
    } else {
      return null;
    }
  }

  /**
   * Compiles the pug template into html
   *
   * @param {String} fileName - The pug template file name
   * @param {Object} data - The data that parse into the template
   * @param {pugCallback} cb - Callback that handles the compiled HTML
   */
  compilePug(fileName, data, cb) {
    let absPath = this.app.pwd + '/static/pug/' + fileName + '.pug';
    pug.renderFile(absPath, data, (error, compiled) => {
      if (error) {
        cb(error, null);
      } else {
        cb(null, compiled);
      }
    });
  }

  /**
   * Sends a message
   *
   * @param {String} to - The recipient's email.
   * @param {String} subject - The subject of the email.
   * @param {Object} html - The compiled HTML.
   * @param {sendMailCallBack} cb - Callback that handles response from email server.
   */
  sendMail(to, subject, html, cb) {
    let data = {
      from: this.core.mailer.from,
      to: to,
      subject: subject,
      html: html,
    };
    if (this.transporter) {
      this.transporter.sendMail(data, (err, info) => cb(err, info));
    } else {
      cb('Error when sending verification email, please contact admin.', null);
    }
  }

}

/**
 * Callback that handles the compiled HTML or error.
 *
 * @callback pugCallback
 * @param {Object} error - Error, if has any.
 * @param {Object} compiled - The compiled HTML
 */

/**
 * Callback that handles the sent mail info or error.
 *
 * @callback sendMailCallBack
 * @param {Object} error - Error, if has any.
 * @param {Object} info - Info about the sent message.
 */
