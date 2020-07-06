module.exports = {
  _actions: {
    build: require('./actions/build')
  },

  entrypoint: 'src/lib.rs',
  cargo: {}
}
