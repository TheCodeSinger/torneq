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
      27312: {
        name: 'Equilibrium',
      },
      525: {
        name: 'EQ: Ministry of Mayhem',
      },
    };

    _.assignIn($ctrl, {
      apiKey: localStorage && localStorage.getItem('apiKey'),
      auditLogs: [],
      factionsMap: factionsMap,
      filters: previousFilters || {
        factionId: '27312',
        type: 'fundsnews',
      },
      hasLocalStorage: !!localStorage,
      itemsByPage: 10,
      moment: moment,

      // Exposed methods.
      applyFilters: applyFilters,
      login: login,
      logout: logout,
    });

    // Model for Date Range component.
    $ctrl.dateRange = {
      startDate: moment().subtract(6, "days"),
      endDate: moment(),
    };

    // Options for Date Range component.
    $ctrl.opts = {
      locale: {
        applyClass: 'btn-green',
        applyLabel: "Apply",
        fromLabel: "From",
        format: "MMM D, YYYY",
        toLabel: "To",
        cancelLabel: 'Cancel',
        customRangeLabel: 'Custom range',
      },
      ranges: {
        'Today': [moment().startOf('day'), moment()],
        'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
        'Past 7 Days': [moment().subtract(6, 'days'), moment()],
        'Past 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    };

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
        start: $ctrl.dateRange.startDate.unix(),
        end: $ctrl.dateRange.endDate.unix(),
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
