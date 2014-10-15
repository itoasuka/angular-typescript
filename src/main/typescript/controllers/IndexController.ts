/// <reference path="../../../../typings/tsd.d.ts"/>

module app {
    'use strict';

    export class IndexController {
        greeting:string;

        /**
         * @ngInject
         */
        constructor() {
            this.greeting = 'Hello, world!'
        }
    }
}
