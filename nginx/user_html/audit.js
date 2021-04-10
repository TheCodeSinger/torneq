(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp')
    .config(configFn)
    .controller('AuditCtrl', AuditCtrlFn);

  function configFn($stateProvider) {
    $stateProvider
      .state('audit', {
        name: 'Audit',
        url: '^/audit',
        controller: 'AuditCtrl as $ctrl',
        templateUrl: 'audit.html',
      });
  }

  function AuditCtrlFn(_, $scope, EqTornService) {
    var $ctrl = this;

    // Pull last known filters from Local Storage.
    var previousFilters = localStorage && JSON.parse(localStorage.getItem('auditFilters'));
    var previousFilters;

    var factionsMap = {
      9524: {
        name: 'Equilibrium',
      },
      10296: {
        // Now EQ2
        name: 'Equilibrate',
      },
      21040: {
        name: 'The Foundation',
      },
    };

    _.assignIn($ctrl, {
      apiKey: localStorage && localStorage.getItem('apiKey'),
      auditLogs: [],
      factionsMap: factionsMap,
      filters: previousFilters || {
        factionId: '9524',
        type: 'mainnewsfull',
      },
      hasLocalStorage: !!localStorage,
      itemsByPage: 10,
      moment: moment,

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
     * Gets a list of audit logs.
     *
     * @method    _getAuditLogs
     * @param     {Object}   [params]   Optional request params.
     */
    function _getAuditLogs(params) {
      $ctrl.fetchingAuditLogs = true;
      $ctrl.showServerError = false;

      EqTornService.fetchAuditLogs(params).then(
        function getAuditLogsSuccess(auditLogs) {
          $ctrl.auditLogs = auditLogs;
        },
        function getAuditLogsFailure(response) {
          $ctrl.showServerError = true;
        },
      ).finally(
        function getAuditLogsFinally() {
          $ctrl.fetchingAuditLogs = false;
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

      // Ceate a new object in order to clean stale filter params from
      // local storage. This means we have to update this object any
      // time we add/remove filter params.
      var newFilters = {
        factionId: $ctrl.filters.factionId,
        type: $ctrl.filters.type,
      };

      // Save latest filter values in local storage.
      if (localStorage) {
        localStorage.removeItem('auditFilters');
        localStorage.setItem('auditFilters', JSON.stringify(newFilters));
      }

      _getAuditLogs(newFilters);
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
        localStorage.removeItem('auditFilters');
      }
    }
  };

})(angular);
