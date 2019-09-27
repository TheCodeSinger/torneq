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
      apiKey: localStorage && localStorage.getItem('apiKey'),
      filters: previousFilters || {
        // Default number of targets to fetch.
        targetCount: '10',
      },
      targets: [],

      // Exposed methods.
      applyFilters: applyFilters,
      login: login,
      logout: logout,
    });

    this.$onInit = function $onInit() {
      // If API Key was saved, then log in user.
      if($ctrl.apiKey) {
        login();
      }

      $ctrl.ready = true;
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

      // Save latest filter values in local storage.
      if (localStorage) {
        localStorage.setItem('targetFilters', JSON.stringify($ctrl.filters));
      }

      _getTargets($ctrl.filters);
    }

    /**
     * Saves the API Key and logs in the user.
     *
     * @method    login
     */
    function login(){
      $ctrl.logging = true;
      $ctrl.showLoginError = false;
      $ctrl.user = {};

      EqTornService.login($ctrl.apiKey).then(
        function loginSuccess(response) {
          $ctrl.user = response;

          if (!$ctrl.user.login) {
            return $ctrl.showLoginError = true;
          }

          // Store the API Key in local storage.
          if (localStorage) {
            localStorage.setItem('apiKey', $ctrl.apiKey);
          };

          // If previous filters are available, then fetch targets,
          // otherwise wait for user to specify parameters.
          if ($ctrl.filters.minStats || $ctrl.filters.maxStats) {
            applyFilters();
          }
        },
        function loginFailure(response) {
          $ctrl.showLoginError = true;
        },
      ).finally(
        function loginFinally() {
          $ctrl.logging = false;
          $ctrl.ready = true;
        }
      );
    }

    /**
     * Clears the API Key and logs out the user.
     *
     * @method    logout
     */
    function logout(){
      $ctrl.user = {};
      $ctrl.apiKey = undefined;

      // Clear the API Key from local storage.
      if (localStorage) {
        localStorage.removeItem('apiKey');
      }
    }
  };

})(angular);
