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

  function TargetsCtrlFn(_, EqTornService) {
    var $ctrl = this;

    // Pull last known filters from Local Storage.
    var previousFilters = 
      localStorage && JSON.parse(localStorage.getItem('targetFilters'));

    _.assignIn($ctrl, {
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
      if ($ctrl.filters.minStats || $ctrl.filters.maxStats) {
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
      $ctrl.fetchingTargets = true;
      $ctrl.showServerError = false;

      EqTornService.fetchTargets(params).then(
        function getTargetsSuccess(targets) {
          $ctrl.targets = targets;
        },
        function getTargetsFailure(response) {
          $ctrl.showServerError = true;
        },
      ).finally(
        function getTargetsFinally() {
          $ctrl.fetchingTargets = false;
        }
      );
    }

    /**
     * Applies the filters as populated.
     *
     * @method    applyFilters
     */
    function applyFilters(){
      $ctrl.filtersApplied = true;

      if (localStorage) {
        localStorage.setItem('targetFilters', JSON.stringify($ctrl.filters));
      }

      _getTargets($ctrl.filters);
    };
  };

})(angular);
