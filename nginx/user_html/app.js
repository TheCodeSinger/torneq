(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp', ['ui.router'])
    .constant('_', window._)
    .config(configFn)
    .controller('MainCtrl', MainCtrlFn);

  function configFn($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/').otherwise('/');
    $stateProvider
      .state('home', {
        name: 'Home',
        url: '/',
        controller: 'MainCtrl as $ctrl',
        templateUrl: 'home.html',
      });
  }

  function MainCtrlFn(_) {
    var $ctrl = this;

    _.assignIn($ctrl, {
      $onInit: $onInit,
    });

    function $onInit() { 
    }

  };

})(angular);