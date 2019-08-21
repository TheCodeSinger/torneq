(function () {
   'use strict';

  angular.module('LevelingTargets', [])
    .controller('ListCtrl', ListCtrlFn)
    .service('TornApiService', TornApiServiceFn);

  function ListCtrlFn($scope, TornApiService) {
    angular.extend($scope, {
      fetchingTargets: true,
      filters: {},
      targets: [],

      applyFilters: applyFilters,
    });

    function _onInit(){
      _getTargets();
    };

    /**
     * Gets a list of targets.
     *
     * @method    _getTargets
     * @param     {Object}   [params]   Optional params.
     * @return    {Object}   Promise to resolve the API request.
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

    function applyFilters(){
      _getTargets($scope.filters);
    };

    _onInit();
  };


  function TornApiServiceFn($http, $q) {

    var TornService = {
      fetchTargets: fetchTargets,
    };

    /**
     * Requests a list of targets.
     *
     * @method    fetchTargets
     * @param     {Object}   [params]   Optional params.
     * @return    {Object}   Promise to resolve the API request.
     */
    function fetchTargets(params) {
      //return $q.resolve(mockFetchTargetsResponse.targets);
      params = params || {};
      return $http({
        method: 'get',
        url: '/app/targets/json',
        params: params
      }).then(
        function fetchTargetsSuccess(response) {
          return response.data.targets || [];
        }
      );
    }

    return TornService;
  }

})();