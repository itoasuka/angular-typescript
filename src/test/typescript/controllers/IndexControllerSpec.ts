/// <reference path="../../../../typings/tsd.d.ts"/>
/// <reference path="../../../main/typescript/controllers/IndexController.ts"/>

describe('IndexController', function () {

    beforeEach(module('myApp'));

    it('初期化する', inject(function ($controller:ng.IControllerService) {
        var index:IndexController = $controller('IndexController');
        expect(index.greeting).toEqual('Hello, world!');
    }));
});
