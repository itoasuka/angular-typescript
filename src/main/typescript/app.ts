/// <reference path="../../../typings/tsd.d.ts"/>
/// <reference path="controllers/IndexController.ts"/>

(function () {
    /**
     * @ngInject
     */
    function config($routeProvider:ng.route.IRouteProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/index.html',
            controller: 'IndexController',
            controllerAs: 'index'
        }).otherwise({
            redirectTo: '/'
        });

    }
    console.log('start app!');

    angular.module('myApp', [
        'ngRoute'
    ])
        .config(config)
        .controller('IndexController', IndexController);

})();
