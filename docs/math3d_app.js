var globalScope = {};
var container = $(".container")
container.attr("ng-app", 'math3dApp')
// container.attr("ng-controller", 'main')

app = angular.module('math3dApp', []);

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
    // Load initial mathObjects
    $scope.objectList = [];
    for (let j=0; j<math3d.mathObjects.length; j++){
        let mathObj = math3d.mathObjects[j];
        let uiSettings = Utility.deepCopyValuesOnly(mathObj.settings); // Deep copy mathObject settings; user edits will directly affect these copies; we can validate data before passing to math3d if necessary.
        $scope.objectList.push({uiSettings:uiSettings, mathObj:mathObj, type:mathObj.constructor.name})
    }
    
    $scope.createNewObject = function(objectList, type){
        var metaMathObj = {type:type, settings:{}}
        var mathObj = MathObject.renderNewObject(math3d, metaMathObj);
        var uiSettings = Utility.deepCopyValuesOnly(mathObj.settings);
        objectList.push({uiSettings:uiSettings, mathObj:mathObj, type:type});
    }
    
    $scope.addOjbectToUi = function(obj){
        var color_id = 'color-value-' + _.uniqueId();
        var content = genObjectTemplate(obj.type)
        //Re-initialize jscolor palletes. This seems hacky.
        setTimeout(function(){ jscolor.installByClassName("jscolor"); }, 0);
        
        return $sce.trustAsHtml(content)
    };
    
    function genObjectTemplate(type){
        var common = `
            <form class="form-horizontal">
                <div class="row">
                    <div class="form-group">
                        <div class="col-xs-1">
                            <input class="jscolor hide-text" ng-model="obj.uiSettings.color" ></input>
                        </div>
                        <div class="col-xs-9">
                            <div class="input-group input-group-sm">
                                <input type="text" class="form-control" ng-model="obj.uiSettings.rawExpression"></input>
                                <span class="input-group-btn settings">
                                    <a class="btn btn-xs" type="button">
                                        <span class="glyphicon glyphicon-wrench"></span>
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-xs remove-item upper-right" ng-click="removeMathObj(obj)">
                        <span class="glyphicon glyphicon-remove remove-item"></span>
                    </button>
                </div>
            </form>
        `
        var footer = ``
        if (type === 'ParametricCurve'){
            footer = `
            <div class="row">
                <div class="col-xs-9 offset-xs-1">
                    <div class="input-group input-group-sm">
                        t ∈ <input style="width:100px" type="test" ng-model="obj.uiSettings.range"></input>
                    </div>
                </div>
            </div>
            `
        } if (type === 'ParametricSurface'){
            footer = `
            <div class="row">
                <div class="col-xs-9 offset-xs-1">
                    <div class="input-group input-group-sm">
                        u, v ∈ <input style="width:100px" type="test" ng-model="obj.uiSettings.range"></input>
                    </div>
                </div>
            </div>
            `
        }
        return common + footer
    }
    
}]);

app.controller('mathObjectCtrl', function($scope){
    $scope.removeMathObj = function(obj){
        obj.mathObj.remove();
        var objectList = $scope.$parent.$parent.objectList;
        var objIdx = objectList.indexOf(obj);
        objectList.splice(objIdx, 1);
    }
    $scope.$watch("$parent.obj.uiSettings", function(newVal, oldVal){
        var settingsDiff = Utility.deepObjectDiff(newVal, oldVal)
        for (let key in settingsDiff){
            if (key[0] === '$'){
                delete settingsDiff[key];
            }
            if (key ==='color'){
                settingsDiff[key] = "#" + settingsDiff[key];
            }
        }
        _.merge($scope.$parent.obj.mathObj.settings, settingsDiff);
    },
    true)
    
})



