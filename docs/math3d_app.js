var globalScope = {};
var container = $(".container")
container.attr("ng-app", 'math3dApp')
// container.attr("ng-controller", 'main')

// app = angular.module('math3dApp', ['ui.sortable']);
app = angular.module('math3dApp', ['ui.tree', 'ngAnimate', 'ui.bootstrap']);

app.directive('compileTemplate', ["$compile", "$parse", function($compile, $parse) {
    // http://stackoverflow.com/a/25407201/2747370
    return {
        restrict: 'A',
        link: function($scope, element, attr) {
            var parse = $parse(attr.ngBindHtml);
            function value() { return (parse($scope) || '').toString(); }

            $scope.$watch(value, function() {
                $compile(element, null, -9999)($scope); 
            });
        }
    }
}]);

app.controller('saveCtrl', ['$scope', function($scope){
        $scope.saveURL = function(){
        var url = math3d.saveSettingsAsURL();
        $("#save-modal textarea").val(url);
        $("#url-length").html(url.length);
    };
}])

app.controller('addObjectCtrl',['$scope', '$sce', function($scope, $sce) {    
    $scope.debug = arg => console.log(arg);
    
    $scope.mathTree = math3d.mathTree;
    
    $scope.createNewObject = function(type){
        var metaMathObj = {type:type, settings:{}};
        var mathObj = MathObject.renderNewObject(math3d, metaMathObj);
    }
    
    $scope.createNewFolder = function(){
        $scope.mathTree.push({name:'Untitled', objects:[]});
    }
    
    $scope.addOjbectToUi = function(obj){
        var content = genObjectTemplate(obj.type)
        
        //Re-initialize jscolor palletes. This seems hacky.
        setTimeout(function(){ jscolor.installByClassName("jscolor"); }, 0);
        
        return $sce.trustAsHtml(content)
    };
    
    $scope.removeFolder = function(branch){
        // Should only be used if branch is empty
        if (branch.objects.length===0){
            _.remove(math3d.mathTree, function(arg){return arg===branch;});
        }
    }
    
    function genObjectTemplate(type){
        var template = ``;
        if (_.indexOf(['Point', 'Line', 'Vector', 'ParametricCurve', 'ParametricSurface'], type)>=0) {
            template = `
            <form class="form-horizontal math-object-settings">
                <div class="row">
                    <div class="form-group">
                        <div class="col-xs-1">
                            <span ui-tree-handle class="grippy"></span>
                        </div> 
                        <div class="col-xs-1">
                            <input class="jscolor hide-text" ng-model="obj.settings.color" ></input>
                        </div>
                        <div class="col-xs-8">
                            <div class="input-group input-group-sm">
                                <input type="text" class="form-control" ng-model="obj.settings.rawExpression"></input>
                                <span class="input-group-btn">
                                    <a class="popover-trigger btn btn-link btn-xs" 
                                        type="button"
                                        ng-controller="popoverCtrl"
                                        popover-is-open="myPopover.isOpen"  
                                        popover-class="popover-settings"
                                        uib-popover-template="'templates/settings_popover.html'" 
                                        popover-placement="right" 
                                        popover-trigger="outsideClick"
                                        popover-append-to-body="true"
                                        type="button"
                                        class="btn btn-default"
                                        >
                                        <span class="glyphicon glyphicon-wrench"></span>
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-link btn-xs remove-item upper-right" ng-click="obj.remove();">
                        <span class="glyphicon glyphicon-remove remove-item"></span>
                    </button>
                </div>
            </form>
        `
        }        
        if (type === 'ParametricCurve'){
            template += `
            <div class="row">
                <div class="col-xs-2"></div>
                <div class="col-xs-9">
                    <div class="input-group input-group-sm">
                        t ∈ <input style="width:100px" type="text" ng-model="obj.settings.range"></input>
                    </div>
                </div>
            </div>
            `
        }
        if (type === 'ParametricSurface'){
            template += `
            <div class="row">
                <div class="col-xs-2"></div>
                <div class="col-xs-9">
                    <div class="input-group input-group-sm">
                        u, v ∈ <input style="width:100px" type="text" ng-model="obj.settings.range"></input>
                    </div>
                </div>
            </div>
            `
        }
        if (type === 'Variable'){
            template = `
            <form class="form-horizontal math-object-settings">
                <div class="row">
                    <div class="form-group">
                        <div class="col-xs-1">
                            <span ui-tree-handle class="grippy"></span>
                        </div>
                        <div class="col-xs-9">
                            <div class="input-group input-group-sm">
                                <input size="4" ng-class="{'has-error': !obj.valid}" class="form-control has-feedback" ng-model="obj.settings.rawName" ></input>
                                <span style="padding-left:2pt;padding-right:2pt;" class="input-group-addon"> = </span>
                                <input type="text" class="form-control" ng-model="obj.settings.rawExpression"></input>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-link btn-xs remove-item upper-right" ng-click="obj.remove();">
                        <span class="glyphicon glyphicon-remove remove-item"></span>
                    </button>
                </div>
            </form>
            `
        }
        if (type === 'VariableSlider'){
            template = `
            <form class="form-horizontal math-object-settings">
                <div class="row">
                    <div class="form-group">
                        <div class="col-xs-1">
                            <span ui-tree-handle class="grippy"></span>
                        </div>
                        <div class="col-xs-4">
                            <div class="input-group input-group-sm">
                                <input style="width:auto" type="text" ng-class="{'has-error': !obj.valid}" class="form-control has-feedback" size="{{1+obj.settings.name.length}}" type="text" ng-model="obj.settings.name"></input>
                                <span style="padding-left:2pt;padding-right:2pt;" class="input-group-addon"> = {{obj.settings.value}} </span>
                            </div>
                        </div>
                    </div>  
                </div>
                <div class="row">
                    <div class="form-group">
                        <div class="col-xs-1">
                        </div>
                        <div class="col-xs-8">
                            <input type="range" ng-model="obj.settings.value" min="{{obj.min}}" max="{{obj.max}}" step="{{(obj.max-obj.min)/100}}"></input>
                        </div>
                        <div class="col-xs-2">
                        </div>
                    </div>
                    <button type="button" class="btn btn-link btn-xs remove-item upper-right" ng-click="obj.remove();">
                        <span class="glyphicon glyphicon-remove remove-item"></span>
                    </button>
                </div>
                <div class="row">
                    <div class="form-group">
                        <div class="col-xs-1"></div>
                        <div class="col-xs-2">
                            <input class="form-incognito" type="text" size="{{obj.settings.min.length}}" ng-model="obj.settings.min"></input>
                        </div>
                        <div class="col-xs-4"></div>
                        <div class="col-xs-2">
                            <input class="form-incognito" type="text" size="{{obj.settings.max.length}}" ng-model="obj.settings.max"></input>
                        </div>
                    </div>
                    <button type="button" class="btn btn-link btn-xs remove-item upper-right" ng-click="obj.remove();">
                        <span class="glyphicon glyphicon-remove remove-item"></span>
                    </button>
                </div>
            </form>
            `
        }
        return template
    }
    
}]);

//http://stackoverflow.com/a/32366115/2747370
//http://codepen.io/dmvianna/pen/OyNNJx
app.controller('popoverCtrl', ['$scope', function($scope) {
    // query popover
    $scope.myPopover = {
        isOpen: false,
        templateUrl: 'templates/settings_popover.html',
        open: function open() {
            $scope.myPopover.isOpen = true;
            $scope.myPopover.data = 'Hello!';
        },
        close: function close() {
            $scope.myPopover.isOpen = false;
        }
    };
}]);