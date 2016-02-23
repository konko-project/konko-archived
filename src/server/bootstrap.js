'use strict';

import Server from './configs/server';

const server = new Server(__dirname);
server.start();
