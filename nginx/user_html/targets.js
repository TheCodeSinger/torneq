(function () {
   'use strict';

  angular.module('LevelingTargets', [])
    .controller('TargetsCtrl', TargetsCtrlFn)
    .service('TornApiService', TornApiServiceFn);

  function TargetsCtrlFn($scope, TornApiService) {
    angular.extend($scope, {
      filters: {},
      targets: [],

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

    function applyFilters(){
      $scope.filtersApplied = true;
      _getTargets($scope.filters);
    };
  };

  function TornApiServiceFn($q, $http) {

    var TornService = {
      fetchTargets: fetchTargets,
    }; 

    /**
     * Requests a list of targets.
     *
     * @method    fetchTargets
     * @param     {Object}   [params]   Optional request params.
     * @return    {Object}   Promise to resolve the API request.
     */
    function fetchTargets(params) {
      return $q.resolve([{"age": 3372, "level": 19, "life_current": 650, "life_max": 866, "rank": "Rookie Scavenger", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "1442848", "torn_name": "casper619", "last_action_relative": "1331 days", "last_action_diff": 115073618, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 221, "dexterity": 269, "speed": 212, "strength": 210, "total": 912}, {"age": 4441, "level": 19, "life_current": 825, "life_max": 825, "rank": "Average Deserter", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "477364", "torn_name": "beggerboy", "last_action_relative": "2403 days", "last_action_diff": 207703645, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 54, "dexterity": 61, "speed": 382, "strength": 232, "total": 729}, {"age": 4560, "level": 20, "life_current": 176, "life_max": 875, "rank": "Reasonable Healer", "status_enum": 1, "status_delay_sec": 529, "status": "In hospital for 8 mins ", "status2": "Attacked by <a href=\"profiles.php?XID=2352079\">Dethgeer</a>", "torn_id": "424049", "torn_name": "RamboX", "last_action_relative": "2088 days", "last_action_diff": 180428284, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 29, "dexterity": 37, "speed": 156, "strength": 427, "total": 649}, {"age": 4128, "level": 14, "life_current": 272, "life_max": 603, "rank": "Average Deserter", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "849274", "torn_name": "deathreaper123", "last_action_relative": "3100 days", "last_action_diff": 267873242, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 158, "dexterity": 158, "speed": 158, "strength": 161, "total": 635}, {"age": 4849, "level": 20, "life_current": 657, "life_max": 875, "rank": "Reasonable Tank", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "295976", "torn_name": "JBauer", "last_action_relative": "2191 days", "last_action_diff": 189321255, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 89, "dexterity": 171, "speed": 185, "strength": 187, "total": 632}, {"age": 4090, "level": 24, "life_current": 1343, "life_max": 1343, "rank": "Competent Punchbag", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "876999", "torn_name": "Smarties", "last_action_relative": "3 days", "last_action_diff": 285362, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 67, "dexterity": 114, "speed": 92, "strength": 337, "total": 610}, {"age": 3533, "level": 19, "life_current": 866, "life_max": 866, "rank": "Below average Intimidator ", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "1380052", "torn_name": "-007", "last_action_relative": "1601 days", "last_action_diff": 138337890, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 112, "dexterity": 106, "speed": 162, "strength": 219, "total": 599}, {"age": 3991, "level": 20, "life_current": 918, "life_max": 918, "rank": "Below average Loser", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "956400", "torn_name": "RedArmy92", "last_action_relative": "1636 days", "last_action_diff": 141430720, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 150, "dexterity": 130, "speed": 155, "strength": 155, "total": 590}, {"age": 3934, "level": 20, "life_current": 962, "life_max": 962, "rank": "Below average Scavenger", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "999990", "torn_name": "mic1000", "last_action_relative": "1784 days", "last_action_diff": 154150396, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 29, "dexterity": 85, "speed": 77, "strength": 397, "total": 588}, {"age": 3007, "level": 24, "life_current": 1128, "life_max": 1128, "rank": "Reasonable Punchbag", "status_enum": 9, "status_delay_sec": 999999, "status": "Traveling to China", "status2": "", "torn_id": "1558279", "torn_name": "tobsy1", "last_action_relative": "1 hr", "last_action_diff": 3813, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 127, "dexterity": 128, "speed": 125, "strength": 206, "total": 586}, {"age": 4246, "level": 20, "life_current": 368, "life_max": 918, "rank": "Below average Merchant", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "640201", "torn_name": "jackwatkins", "last_action_relative": "1986 days", "last_action_diff": 171609668, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 141, "dexterity": 132, "speed": 140, "strength": 152, "total": 565}, {"age": 4151, "level": 20, "life_current": 832, "life_max": 875, "rank": "Below average Merchant", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "785081", "torn_name": "n1ghtk11lerz", "last_action_relative": "1448 days", "last_action_diff": 125166256, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 39, "dexterity": 84, "speed": 391, "strength": 44, "total": 558}, {"age": 5156, "level": 15, "life_current": 251, "life_max": 625, "rank": "Reasonable Deserter", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "91892", "torn_name": "abcdragonmaster", "last_action_relative": "3830 days", "last_action_diff": 330972480, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 98, "dexterity": 117, "speed": 130, "strength": 207, "total": 552}, {"age": 3818, "level": 20, "life_current": 526, "life_max": 875, "rank": "Below average Outcast", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "1151368", "torn_name": "Mr_Sosa", "last_action_relative": "1467 days", "last_action_diff": 126772698, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 95, "dexterity": 108, "speed": 91, "strength": 238, "total": 531}, {"age": 4127, "level": 19, "life_current": 372, "life_max": 825, "rank": "Below average Punchbag", "status_enum": 0, "status_delay_sec": 0, "status": "Okay", "status2": "", "torn_id": "850551", "torn_name": "eliotte", "last_action_relative": "767 days", "last_action_diff": 66276633, "status_updated_relative": "1 secs", "status_updated_diff": 1, "defense": 72, "dexterity": 16, "speed": 14, "strength": 526, "total": 528}].map(_transformTarget));
      params = angular.extend({
        targetCount: 10,
      }, params);
      return $http({
        method: 'get',
        url: 'http://home.n1029.com:49012/app/targets/json',
        params: params
      }).then(
        function fetchTargetsSuccess(response) {
          return (response.data.targets || []).map(_transformTarget);
        }
      );

      /**
       * Transforms a target by decorating with derived properties.
       *
       * @method    _transformTarget
       * @param     {Object}   target   Target object.
       * @return    {Object}   Transformed target object.
       */
      function _transformTarget(target) {
        target = target || {};

        target._isOkay = target.status.match('Okay');
        target._isHospitalized = target.status.match('hospital');
        target._isTraveling = target.status.match('Traveling');
        target._isInactive = _getDaysInactive(target.last_action_relative) > 100;
        target._statusReason = (target.status2 || '')
          .replace(/<a href=\"profiles\.php\?XID=\d*\">(.*)<\/a>/, '$1');

        function _getDaysInactive(lastActionStr) {
          var words = lastActionStr.split(' ');
          return words[1] === 'days' ? words[0] : 0;
        }

        return target;
      }
    }

    return TornService;
  }  

})();