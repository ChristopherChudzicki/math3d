var globalScope = {};
var container = $(".container")
container.attr("ng-app", 'math3dApp')
// container.attr("ng-controller", 'main')

// app = angular.module('math3dApp', ['ui.sortable']);
app = angular.module('math3dApp', ['ui.tree']);

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
    // displayTree will hold mathObjects and custom vars, funcs, sliders
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
        var common = `
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
                                    <a class="btn btn-link btn-xs" type="button">
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
        var footer = ``
        if (type === 'ParametricCurve'){
            footer = `
            <div class="row">
                <div class="col-xs-2"></div>
                <div class="col-xs-9">
                    <div class="input-group input-group-sm">
                        t ∈ <input style="width:100px" type="test" ng-model="obj.settings.range"></input>
                    </div>
                </div>
            </div>
            `
        } if (type === 'ParametricSurface'){
            footer = `
            <div class="row">
                <div class="col-xs-9 offset-xs-1">
                    <div class="input-group input-group-sm">
                        u, v ∈ <input style="width:100px" type="test" ng-model="obj.settings.range"></input>
                    </div>
                </div>
            </div>
            `
        }
        return common + footer
    }
    
}]);



