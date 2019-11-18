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

  function TargetsCtrlFn(_, $scope, EqTornService) {
    var $ctrl = this;

    // Pull last known filters from Local Storage.
    var previousFilters = localStorage && JSON.parse(localStorage.getItem('targetFilters'));

    var factionsMap = {
      10296: {
        name: 'Kyokos bedroom',
      }
    };

    _.assignIn($ctrl, {
      apiKey: localStorage && localStorage.getItem('apiKey'),
      factionsMap: factionsMap,
      favorites: (localStorage && JSON.parse(localStorage.getItem('favorites'))) || {},
      filters: previousFilters || {
        // Default number of targets to fetch.
        targetCount: '10',
      },
      hasLocalStorage: !!localStorage,
      showAdditionalFilters:
        _.get(previousFilters, 'factionId') ||
        _.get(previousFilters, 'minStats') ||
        _.get(previousFilters, 'includeActive'),
      targets: [],

      // Exposed methods.
      applyFilters: applyFilters,
      fetchNextPage: fetchNextPage,
      fetchPreviousPage: fetchPreviousPage,
      login: login,
      logout: logout,
      onChangeInput: _.debounce(parseInput, 150),
      toggleFavorite: toggleFavorite,
    });

    /**
     * Always default to 10 targets because it's better performance.
     * User can always change it back.
     */
    $ctrl.filters.targetCount = '10';

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
          if ($ctrl.filters.minStats) {
            _.reverse(targets)
          }

          $ctrl.targets = targets;
        },
        function getTargetsFailure(response) {
          $ctrl.showServerError = true;
        },
      ).finally(
        function getTargetsFinally() {
          $ctrl.fetchingTargets =
          $ctrl.fetchingNextPage =
          $ctrl.fetchingPreviousPage = false;
        }
      );
    }

    /**
     * Applies the filters as populated.
     *
     * @method    applyFilters
     */
    function applyFilters(){
      var minStats = $ctrl.filters.minStats;
      var maxStats = $ctrl.filters.maxStats;

      // Validate minStats before fetching.
      if (typeof minStats !== 'undefined' && !/^[0-9]*$/.test(minStats)) {
        $ctrl.filtersForm.minStats.$setValidity('valid', false);
        $ctrl.fetchingNextPage = $ctrl.fetchingPreviousPage = false;
        return;
      }

      // Validate maxStats before fetching.
      if (typeof maxStats !== 'undefined' && !/^[0-9]*$/.test(maxStats)) {
        $ctrl.filtersForm.maxStats.$setValidity('valid', false);
        $ctrl.fetchingNextPage = $ctrl.fetchingPreviousPage = false;
        return;
      }

      $ctrl.filtersApplied = true;

      // Indicate whether filtered by a faction.
      $ctrl.isFilteredByFaction = !!$ctrl.filters.factionId;

      // Clear minStats if maxStats is set.
      minStats = !!maxStats ? undefined : minStats;

      // Ceate a new object in order to clean stale filter params from
      // local storage. This means we have to update this object any
      // time we add/remove filter params.
      var newFilters = {
        minStats: minStats,
        maxStats: maxStats,
        targetCount: $ctrl.filters.targetCount,

        // Only add the following two params if those filters are visible.
        factionId: $ctrl.showAdditionalFilters ? $ctrl.filters.factionId : undefined,
        includeActive: $ctrl.showAdditionalFilters ? $ctrl.filters.includeActive : undefined,
      };

      // Save latest filter values in local storage.
      if (localStorage) {
        localStorage.removeItem('targetFilters');
        localStorage.setItem('targetFilters', JSON.stringify(newFilters));
      }

      _getTargets(newFilters);
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

          // If previous filters are available, then fetch targets immediately,
          // otherwise wait for user to specify parameters.
          /*if ($ctrl.filters.minStats || $ctrl.filters.maxStats) {
            applyFilters();
          }*/
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
        localStorage.removeItem('targetFilters');
      }
    }

    /**
     * Toggles whether the selected target is a favorite and updates local Storage.
     *
     * @method    toggleFavorite
     * @param     {Object}   tornId   Torn ID of target.
     */
    function toggleFavorite(tornId) {
      $ctrl.favorites[tornId] = !$ctrl.favorites[tornId];
      localStorage.setItem('favorites', JSON.stringify($ctrl.favorites));
    }

    /**
     * Sets new maxStats equal to the stats of the current last
     * target and fetches a new list.

     * @method    fetchNextPage
     */
    function fetchNextPage() {
      var numTargets = $ctrl.targets.length;
      var lastTarget = $ctrl.targets[numTargets - 1];

      $ctrl.filters.maxStats = lastTarget.total;
      $ctrl.filters.minStats = undefined;

      $ctrl.fetchingNextPage = true;

      applyFilters();
    }

    /**
     * Sets new minStats equal to the stats of the current first
     * target and fetches a new list.

     * @method    fetchPreviousPage
     */
    function fetchPreviousPage() {
      $ctrl.showAdditionalFilters = true;
      $ctrl.filters.maxStats = undefined;
      $ctrl.filters.minStats = $ctrl.targets[0].total;

      $ctrl.fetchingPreviousPage = true;

      applyFilters();
    }

    /**
     * Validates the number inputs. We allow a format of number and
     * optional letter unit.
     *
     * @example  '50' ==> '50'
     * @example  '50k' ==> '50000'
     * @example  '50m' ==> '50000000'
     *
     * @method   validateInput
     * @return   {Boolean}   True if valid.
     */
    function validateInput(input, elementId) {
      var valid = /^[0-9\.]*[hkmbt]?$/.test(input);
      var formField = angular.element(document.querySelector('#' + elementId));

      // Reset invalid class and then validate.
      formField.removeClass('invalid');

      if (!valid) {
        // Invalid. Add invalid class.
        formField.addClass('invalid');
      }

      return valid;
    }

    function parseInput(input, elementId) {
      var units = {
        h: 100,
        k: 1000,
        m: 1000000,
        b: 1000000000,
        t: 1000000000000,
      }

      var number;
      var unit;
      var scrubbed;

      if (!input || !validateInput(input, elementId)) {
        // No input or invalid input.
        return;
      }

      // Validation already verified the expected format of
      // numbers + one letter. Split numbers from letter so
      // we isolate the value and the unit.
      number = input.match(/[0-9\.]/g).join('');
      unit = (input.match(/[hkmbt]/g) || [])[0] ;

      if (!unit) {
        // If there is no letter unit, then do nothing.
        return;
      }

      // Multiply the number times the unit
      scrubbed = number * (units[unit] || 1);

      // Overwrite the value for the field input.
      $ctrl.filters.maxStats = scrubbed;

      // Fire a digest cycle on the latent change.
      $scope.$apply();
    }
  };

})(angular);
