const express = require('express');
const roomRoute = require('./room.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/rooms',
    route: roomRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
