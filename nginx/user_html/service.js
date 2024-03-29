(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp')
    .service('EqTornService', EqTornServiceFn);

  function EqTornServiceFn($q, $http) {

    // Set true to return mock API responses.
    var mockMode = false;

    // Publicly exposed service methods.
    var EqTornService = {
      fetchAuditLogs: fetchAuditLogs,
      fetchTargets: fetchTargets,
      hideLi: hideLi,
      login: login,
      showLi: showLi,
    };

    // Cached value for number of seconds in a day.
    var secondsInDay = 24 * 60 * 60;

    // If not hosted on the primary domain, the use fqdn in endpoints.
    var fqdn = window.location.href.indexOf('closes.org') > -1 ? 'http://torneq.com' : '';

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

      // Store short string versions of status and delay, if known.
      // version for responsive layout.
      if (target._isHospitalized || target._isJailed) {
        target._delayTime = _humanizeDuration(target.status_delay_sec, true);
        target._shortStatus =
          (target._isHospitalized ? 'Hospital ' : 'Jail ') + target._delayTime;
      } else if (target._isTraveling) {
        target._delayTime = '';
        target._shortStatus = target.status;
      }

      // Calculate humanized statements of age. The raw value is in days, so
      // need to convert to seconds first.
      target._age = _humanizeDuration(target.age * secondsInDay);
      target._shortAge = _humanizeDuration(target.age * secondsInDay, true);

      // Calculate humanized statements of Last Action: 54 secs, 1 hour, 2 days.
      target._LastAction = _humanizeDuration(target.last_action_diff);
      target._shortLastAction = _humanizeDuration(target.last_action_diff, true);

      // Calculate humanized stat numbers: 1.2m, 54k.
      target._total = _humanizeStats(target.total);
      target._strength = _humanizeStats(target.strength);
      target._dexterity = _humanizeStats(target.dexterity);
      target._speed = _humanizeStats(target.speed);
      target._defense = _humanizeStats(target.defense);

      // Consider target active if last action was less than 365 days ago.
      // 60 seconds * 60 minutes * 24 hours * 365 days = 31,536,000 seconds.
      target._isPossiblyActive = 2592000 < target.last_action_diff &&
        target.last_action_diff <= 31536000;

      // Consider target active if last action was less than 30 days ago.
      // 60 seconds * 60 minutes * 24 hours * 30 days = 2,592,000 seconds.
      target._isRecentlyActive = 259200 < target.last_action_diff &&
        target.last_action_diff <= 2592000;

      // Consider target very active if last action was less than 7 days ago.
      // 60 seconds * 60 minutes * 24 hours * 7 days = 604,800 seconds.
      target._isVeryActive = target.last_action_diff <= 604800;

      // Scrub html from `status2`. We only need the name, not the <a> element.
      // example:
      //  Attacked by <a href = "http://www.torn.com/profiles.php?XID=2514253">ThepeAnutz</a>
      target._scrubbedReason = (target.status2 || '')
        .replace(/<a href\s?=\s?.*profiles\.php\?XID=\d*>(.*)<\/a>/, '$1');

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
     * Returns a humanized stats string: 1.8b, 54k, 2k.
     *
     * @method   _humanizeStats
     * @param    {Number}    stats         Number of stats.
     * @param    {Number}    [precision]   Number of decimal places to show. Default 1.
     * @return   {String}    Humanized stats string.
     */
    function _humanizeStats(stats, precision) {
      precision = precision || 1;

      switch(true) {
        case !stats:
          return '0';

        // 1 - 999 stats
        case stats < 1000:
          return stats;

        // 1,000 - 999,999 stats
        case stats < 1000000:
          return (stats/1000).toFixed(precision) + 'k';

        // 1 million - 999,999,999 stats
        case stats < 1000000000:
          return (stats/1000000).toFixed(precision) + 'm';

        // 1 billion+
        default:
          return (stats/1000000000).toFixed(precision) + 'b';
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
      params = angular.merge({
        targetCount: 10,
      }, params);
      return $http({
        method: 'get',
        url: fqdn + '/app/targets/json',
        params: params
      }).then(
        function fetchTargetsSuccess(response) {
          return (response.data.targets || []).map(_transformTarget);
        }
      );
    }

    /**
     * Shows all showable <li> which are hidden.
     *
     * @method    showLi
     */
    function showLi() {
      var elements = document.getElementsByClassName('hidden-li');
      for (var x = elements.length - 1; x >= 0; x--) {
        elements[x].className = 'visible-li';
      }
      document.getElementById('show-li-link').className = 'hidden-li';
    }

    /**
     * Hides all hidable <li> which are visible.
     *
     * @method    hideLi
     */
    function hideLi() {
      var elements = document.getElementsByClassName('visible-li');
      for (var i = elements.length - 1; i >= 0; i--) {
        elements[i].className = 'hidden-li';
      }
      document.getElementById('show-li-link').className = 'visible-li';
    }

    /**
     * Authenticates API Key.
     *
     * @method    login
     * @param     {Number}   apiKey   API Key to auth.
     * @return    {Object}   Promise to resolve the API request.
     */
    function login(apiKey) {
      if (mockMode) {
        var mockLoginResponse = { login: true, name: 'MockUser', tornid: 1234567 };
        return $q.resolve(mockLoginResponse);
      }

      return $http({
        method: 'post',
        url: fqdn + '/app/keymanager/tornauth',
        data: { apikey: apiKey },
      }).then(
        function loginApiSuccess(response) {
          return response.data || {};
        }
      );
    }

    /**
     * Requests a list of Audit Logs.
     *
     * @method    fetchAuditLogs
     * @param     {Object}   [params]   Optional request params.
     * @return    {Object}   Promise to resolve the API request.
     */
    function fetchAuditLogs(params) {
      console.log(params);

      const queryParams = {
        // Default to last 7 days.
        start: params.start || moment().subtract(7,'d'),
        end: params.end || moment(),
      };

      if (mockMode) {
        var mockAuditLogsJsonResponse = {
          "data": {
            "auditLogs": [
              {
                "timestamp": 1617951818,
                "news": "<a href = http://www.torn.com/profiles.php?XID=2273492>Yup</a> was given $10,000,000 by <a href = http://www.torn.com/profiles.php?XID=2273492>Yup</a>."
              },
              {
                "timestamp": 1617810788,
                "news": "<a href = http://www.torn.com/profiles.php?XID=2536918>Twistedfury</a> was given $1,000,000 by <a href = http://www.torn.com/profiles.php?XID=1118257>Metallistar</a>."
              },
              {
                "timestamp": 1617739160,
                "news": "<a href = http://www.torn.com/profiles.php?XID=2273492>Yup</a> was given $10,000,000 by <a href = http://www.torn.com/profiles.php?XID=2273492>Yup</a>."
              },
              {
                "timestamp": 1617723196,
                "news": "<a href = http://www.torn.com/profiles.php?XID=2587336>Last_Sin</a> was given $382,000,000 by <a href = http://www.torn.com/profiles.php?XID=2273492>Yup</a>."
              },
              {
                "timestamp": 1617718706,
                "news": "<a href = http://www.torn.com/profiles.php?XID=2587336>Last_Sin</a> deposited $382,000,000"
              },
              {
                "news": "<a href = http://www.torn.com/profiles.php?XID=2307055>St-Finn</a> filled one of the faction's Empty Blood Bag items.",
                "timestamp": "1618183539"
              },
              {
                "news": "<a href = http://www.torn.com/profiles.php?XID=2307055>St-Finn</a> filled one of the faction's Empty Blood Bag items.",
                "timestamp": "1618183537"
              },
              {
                "news": "<a href = http://www.torn.com/profiles.php?XID=2300097>Giggin</a> filled one of the faction's Empty Blood Bag items.",
                "timestamp": "1618179696"
              },
              {
                "news": "<a href = http://www.torn.com/profiles.php?XID=2300097>Giggin</a> filled one of the faction's Empty Blood Bag items.",
                "timestamp": "1618179695"
              },
              {
                "news": "<a href = http://www.torn.com/profiles.php?XID=2300097>Giggin</a> filled one of the faction's Empty Blood Bag items.",
                "timestamp": "1618179694"
              },
            ],
          }
        };
        return $q.resolve(mockAuditLogsJsonResponse.data.auditLogs);
      }

      return $http({
        method: 'get',
        url: fqdn + `/api/v1/history/faction/${params.factionId}/${params.type}`,
        params: queryParams
      }).then(
        function fetchAuditLogsSuccess(response) {
          return response.data.auditlogs || [];
        }
      );
    }


    return EqTornService;
  }

})(angular);
