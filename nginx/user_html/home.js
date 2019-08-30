(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp')
    .config(configFn)
    .controller('HomeCtrl', HomeCtrlFn);

  function configFn($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/home').otherwise('/home');
    $stateProvider
      .state('home', {
        name: 'Home',
        url: '/home',
        controller: 'HomeCtrl as $ctrl',
        templateUrl: 'home.html',
      });
  }

  function HomeCtrlFn(_, EqTornService) {
    var $ctrl = this;

    _.assignIn($ctrl, {
      hideLi: EqTornService.hideLi,
      showLi: EqTornService.showLi,
    });

  };

})(angular);