'use strict';

import jwt from 'express-jwt';
import report from '../controllers/report.controller';
import permission from '../../../configs/permission';

/**
 * Report routing.
 *
 * @author C Killua
 * @module Konko/Core/Routes/Report
 * @param {Object} app - Express app.
 */
export default app => {
  const JWT_AUTH = jwt({ secret: app.get('secret'), userProperty: 'payload' });

  app.route('/api/v1/reports')
    .get(JWT_AUTH, permission.get('allowAdmin'), report.list)
    .post(JWT_AUTH, permission.get('allowAll'), report.create);

  app.route('/api/v1/reports/:reportId')
    .get(JWT_AUTH, permission.get('allowAdmin'), report.get)
    .put(JWT_AUTH, permission.get('allowAdmin'), report.update);

  app.route('/api/v1/reports/:reportId/done')
    .put(JWT_AUTH, permission.get('allowAdmin'), report.done);

  app.param('reportId', report.findReportById);
};
