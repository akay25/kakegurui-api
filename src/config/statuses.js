const allStatuses = {
  suspend: 0,
  playing: 1,
  ended: 2,
};

const statuses = Object.keys(allStatuses);

module.exports = {
  statuses,
  allStatuses,
};
