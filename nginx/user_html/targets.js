(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp')
    .config(configFn)
    .controller('TargetsCtrl', TargetsCtrlFn);

  function configFn($stateProvider) {
    $stateProvider
      .state('targets', {
        name: 'Targets',
        url: '^/targets',
        controller: 'TargetsCtrl as $ctrl',
        templateUrl: 'targets.html',
      });
  }

  function TargetsCtrlFn($scope, EqTornService) {
    var $ctrl = this;

    // Pull last known filters from Local Storage.
    var previousFilters = 
      localStorage && JSON.parse(localStorage.getItem('targetFilters'));

    angular.merge($scope, {
      filters: previousFilters || {
        // Default number of targets to fetch.
        targetCount: '10',
      },
      targets: [],

      // Exposed methods.
      applyFilters: applyFilters,
    });

    this.$onInit = function $onInit() {
      // If previous filters are available, then fetch targets, otherwise wait 
      // for user to specify parameters.
      if ($scope.filters.minStats || $scope.filters.maxStats) {
        applyFilters();
      }
    }

    /**
     * Gets a list of targets.
     *
     * @method    _getTargets
     * @param     {Object}   [params]   Optional request params.
     */
    function _getTargets(params) {
      $scope.fetchingTargets = true;
      $scope.showServerError = false;

      EqTornService.fetchTargets(params).then(
        function getTargetsSuccess(targets) {
          $scope.targets = targets;
        },
        function getTargetsFailure(response) {
          $scope.showServerError = true;
        },
      ).finally(
        function getTargetsFinally() {
          $scope.fetchingTargets = false;
        }
      );
    }

    /**
     * Applies the filters as populated.
     *
     * @method    applyFilters
     */
    function applyFilters(){
      $scope.filtersApplied = true;

      if (localStorage) {
        localStorage.setItem('targetFilters', JSON.stringify($scope.filters));
      }

      _getTargets($scope.filters);
    };
  };

})(angular);
