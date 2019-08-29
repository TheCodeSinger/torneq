(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp')
    .config(configFn)
    .controller('ContactCtrl', ContactCtrlFn);

  function configFn($stateProvider) {
    $stateProvider
      .state('contact', {
        name: 'Contact',
        url: '^/contact',
        controller: 'ContactCtrl as $ctrl',
        templateUrl: 'contact.html',
      });
  }

  function ContactCtrlFn() {
    var $ctrl = this;
  };

})(angular);
