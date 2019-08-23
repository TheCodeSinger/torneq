(function (angular, undefined) {
   'use strict';

  angular.module('LevelingTargets')
    .service('TornApiService', TornApiServiceFn);

  function TornApiServiceFn($q, $http) {
    
    var TornService = {
      fetchTargets: fetchTargets,
    }; 

    var secondsInDay = 24 * 60 * 60;

    /**
     * Transforms a target by decorating with derived properties.
     *
     * @method    _transformTarget
     * @param     {Object}   target   Target data object.
     * @return    {Object}   Transformed target data object.
     */
    function _transformTarget(target) {
      target = target || {};

      // Convert `status_enum`` to human readable properties.
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
          console.warn('target.status_enum is an unknown value: ' + 
            target.status_enum);
      }

      // If we know how long the target will be unavailble, store a short string 
      // version for responsive layout.
      if (target._isHospitalized || target._isJailed) {
        target._shortStatus = _humanizeDuration(target.status_delay_sec, true);
      }

      // Calculate humanized statements of age. The raw value is in days, so 
      // need to convert to seconds first.
      target._age = _humanizeDuration(target.age * secondsInDay);
      target._shortAge = _humanizeDuration(target.age * secondsInDay, true);

      // Calculate humanized statements of Last Action: 54 secs, 1 hour, 2 days.
      target._LastAction = _humanizeDuration(target.last_action_diff);
      target._shortLastAction = _humanizeDuration(target.last_action_diff, true);

      // Consider target active if last action was less than 30 days ago. 
      // 60 seconds * 60 minutes * 24 hours * 30 days = 2592000 seconds.
      target._isActive = target.last_action_diff < 2592000;

      // Consider target very active if last action was less than 14 days ago.
      // 60 seconds * 60 minutes * 24 hours * 14 days = 1209600 seconds.
      target._isVeryActive = target.last_action_diff < 1209600;

      // Scrub html from `status2`. We only need the name, not the <a> element.
      target._scrubbedReason = (target.status2 || '')
        .replace(/<a href=\"profiles\.php\?XID=\d*\">(.*)<\/a>/, '$1');

      return target;
    }

    /**
     * Returns a humanized duration string: 54s, 1h, 2d.
     *
     * @method   _humanizeDuration
     * @param    {Number}    seconds       Number of seconds remaining.
     * @param    {Boolean}   abbreviated   True to use abbreviated units.
     * @return   {String}    Humanized string duration.
     */
    function _humanizeDuration(seconds, abbreviated) {
      var longUnits = [' sec', ' secs', ' min', ' mins', ' hour', ' hours', ' day', ' days', ' month', ' months', ' year', ' years'];
      var shortUnits = ['s', 's', 'm', 'm', 'h', 'h', 'd', 'd', 'mo', 'mo', 'y', 'y'];
      var units = abbreviated ? shortUnits : longUnits;

      switch(true) {
        case seconds < 1:
          return '';

        // 1 second
        case seconds === 1:
          return seconds + units[0];

        // 2-59 seconds
        case seconds < 60:
          return seconds + units[1];

        // 1 minute
        case seconds < 120:
          return Math.floor(seconds/60) + units[2];

        // 2-59 minutes
        case seconds < 3600:
          return Math.floor(seconds/60) + units[3];

        // 1 hour
        case seconds < 7200:
          return Math.floor(seconds/60/60) + units[4];

         // 2-23 hours
        case seconds < 86400:
          return Math.floor(seconds/60/60) + units[5];

        // 1 day
        case seconds < 172800:
          return Math.floor(seconds/60/60/24) + units[6];

        // 2-29 days
        case seconds < 2592000:
          return Math.floor(seconds/60/60/24) + units[7];

        // 1 month
        case seconds < 5184000:
          return Math.floor(seconds/60/60/24/30) + units[8];

        // 2-11 months
        case seconds < 31104000:
          return Math.floor(seconds/60/60/24/30) + units[9];

        // 1 year
        case seconds < 62208000:
          return Math.floor(seconds/60/60/24/30/12) + units[10];

        // 2+ years
        default:
          return Math.floor(seconds/60/60/24/30/12) + units[11];
      }
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
        url: '/app/targets/json',
        params: params
      }).then(
        function fetchTargetsSuccess(response) {
          return (response.data.targets || []).map(_transformTarget);
        }
      );
    }

    return TornService;
  }  

})(angular);
