(function () {
   'use strict';

  angular.module('LevelingTargets')
    .service('TornApiService', TornApiServiceFn);

  function TornApiServiceFn($q, $http) {
    
    var TornService = {
      fetchTargets: fetchTargets,
    }; 

    /**
     * Transforms a target by decorating with derived properties.
     *
     * @method    _transformTarget
     * @param     {Object}   target   Target object.
     * @return    {Object}   Transformed target object.
     */
    function _transformTarget(target) {
      target = target || {};

      // Convert enum to human readable properties.
      switch (target.status_enum) {
        case (0):                
          target._isOkay = true;
          break;
        case (1):                
          target._isHospitalized = true;
          break;
        case (2):                
          target._isJailed = true;
          break;
        case (3):                
          target._isTraveling = true;
          break;
        default:
          console.log('target.status_enum is an unknown value: ' + target.status_enum);
      }

      // If we know how long the target will be unavailbeld, store a short string 
      // version for responsive layout.
      if (target._isHospitalized || target._isJailed) {
        target._shortStatus = _humanizeTime(target.status_delay_sec);
      }

      // Consider target active if last action was less than 30 days ago.
      target._isActive = target.last_action_diff < 2592000;

      // Consider target very active if last action was less than 14 days ago.
      target._isVeryActive = target.last_action_diff < 1209600;

      // Strip the html from the username. We only need the name.
      target._scrubbedReason = (target.status2 || '')
        .replace(/<a href=\"profiles\.php\?XID=\d*\">(.*)<\/a>/, '$1');

      return target;
    }

    /**
     * Returns a humanized duration string: 54s, 3hr, 2days.
     *
     * @method    _humanizeTime
     * @param     {Number}   secs   Number of seconds remaining.
     * @return    {String}   Humanized string duration.
     */
    function _humanizeTime(secs) {
      var timeString;

      switch(true) {
        case secs < 1:
          timeString = '';
          break;

        case secs < 60:
          timeString = secs + 's';
          break;

        case secs < 3600:
          timeString = Math.floor(secs/60) + 'm';
          break;

        case secs <= 7199:
          timeString = Math.floor(secs/60/60) + 'hr';
          break;

        case secs < 86400:
          timeString = Math.floor(secs/60/60) + 'hrs';
          break;

        case secs <= 172799:
          timeString = Math.floor(secs/60/60/24) + 'day';
          break;

        default:
          timeString = Math.floor(secs/60/60/24) + 'days';
      }

      return timeString;
    }

    /**
     * Requests a list of targets.
     *
     * @method    fetchTargets
     * @param     {Object}   [params]   Optional request params.
     * @return    {Object}   Promise to resolve the API request.
     */
    function fetchTargets(params) {
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
    }

    return TornService;
  }  

})();