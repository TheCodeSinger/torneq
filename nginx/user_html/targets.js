(function (angular, undefined) {
   'use strict';

  angular.module('LevelingTargets', [])
    .controller('TargetsCtrl', TargetsCtrlFn);

  function TargetsCtrlFn($scope, TornApiService) {
    angular.extend($scope, {
      filters: {},
      targets: [],

      // Exposed methods.
      applyFilters: applyFilters,
    });

    /**
     * Gets a list of targets.
     *
     * @method    _getTargets
     * @param     {Object}   [params]   Optional request params.
     */
    function _getTargets(params) {
      $scope.fetchingTargets = true;
      $scope.showServerError = false;

      TornApiService.fetchTargets(params).then(
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
      _getTargets($scope.filters);
    };
  };

})(angular);
