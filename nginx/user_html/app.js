(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp', ['ui.router'])
    .constant('_', window._)
    .config(configFn)
    .controller('MainCtrl', MainCtrlFn);

  function configFn($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/home').otherwise('/home');
  }

  function MainCtrlFn() {
  };

})(angular);