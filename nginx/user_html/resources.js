(function (angular, undefined) {
   'use strict';

  angular.module('EqTornApp')
    .config(configFn)
    .controller('ResourcesCtrl', ResourcesCtrlFn);

  function configFn($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/home').otherwise('/home');
    $stateProvider
      .state('resources', {
        name: 'Resources',
        url: '/resources/:articleName',
        controller: 'ResourcesCtrl as $ctrl',
        templateUrl: 'resources.html',
        params: {
          articleName: '',
        },
      });
  }

  function ResourcesCtrlFn(_, $state) {
    var $ctrl = this;

    _.assignIn($ctrl, {
      articles: {
        chainPrep: false,
      },

      $onInit: $onInit,
      showArticle: showArticle,
    });

    /**
     * Initializes the controller.
     */
    function $onInit() {
      // If an article is specified in the URL, automatically show that article.
      if ($state.params.articleName) {
        $ctrl.articles[$state.params.articleName] = true;
      }
    }

    /**
     * Shows the selected article and updates the URL.
     * 
     * @method   showArticle
     */
    function showArticle(name) {
      // Hide open articles
      _.forEach($ctrl.articles, function(value, key) {
        value = false;
      });

      // Show specified article.
      $ctrl.articles[name] = true;

      // Update the URL with the selected article.
      $state.go('resources', {articleName: name}, {location: 'replace'});
    }

  };

})(angular);