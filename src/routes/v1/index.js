const express = require('express');
const roomRoute = require('./room.route');
const themeRoute = require('./theme.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/rooms',
    route: roomRoute,
  },
  {
    path: '/themes',
    route: themeRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
