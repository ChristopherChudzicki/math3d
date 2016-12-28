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

// https://gist.github.com/BobNisco/9885852 (modifications in comments)
// Add this directive where you keep your directives
app.directive('onLongPress', function($timeout) {
    return {
		restrict: 'A',
        link: function(scope, elem, attrs) {
            var timeoutHandler;
            
            elem.bind('mousedown', function() {
                timeoutHandler = $timeout(function() {
                    scope.$eval(attrs.onLongPress);
                }, 600);
            });

            elem.bind('mouseup', function() {
                $timeout.cancel(timeoutHandler);
            });
		}
	};
})
app.directive('onShortPress', function($timeout) {
	return {
		restrict: 'A',
		link: function($scope, $elm, $attrs) {
			$elm.bind('mousedown', function(evt) {
				// Locally scoped variable that will keep track of the short press
				$scope.shortPress = true;

				// After a timeout of 600 ms, shortPress is false;
				$timeout(function() {
					$scope.shortPress=false;
				}, 600);
			});

			$elm.bind('mouseup', function(evt) {
				// Prevent the onShortPress event from firing
                if ($scope.shortPress){
					$scope.$apply(function() {
						$scope.$eval($attrs.onShortPress)
					});
                }
				// If there is an on-touch-end function attached to this element, apply it
				if ($attrs.onTouchEnd) {
					$scope.$apply(function() {
						$scope.$eval($attrs.onTouchEnd)
					});
				}
			});
		}
	};
})

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
        var content = `
            <div ng-include="'templates/${obj.type.toLowerCase()}.html'">
            </div>`;
        
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
    
}]);

app.controller('mathObjectCtrl',['$scope', function($scope){
    $scope.debug = arg => console.log(arg)
    $scope.setColor = function(obj){
        document.getElementById(`jscolor-${obj.id}`).jscolor.show()
    }
    $scope.getStyle = function(obj){
        if (obj.settings.visible){
            var backgroundColor = obj.settings.color;
            var borderColor = Utility.lightenColor(obj.settings.color,-0.5);       
        } else {
            var backgroundColor = 'lightgray';
            var borderColor = 'darkgray';
        }
        return `background-color:${backgroundColor}; border-color:${borderColor}`
    }
}])

app.controller('sliderCtrl', ['$scope', function($scope){
    $scope.animationRunning = false;
    $scope.intervalID = null;
    $scope.toggleAnimate = function(obj){
        if (!$scope.animationRunning){
            $scope.startAnimation(obj)
        }
        else {
            $scope.stopAnimation(obj)
        }
        return
    }
    $scope.startAnimation = function(obj){
        $scope.animationRunning = true;
        var ele = document.getElementById("slider-"+obj.id)
        $scope.intervalID = setInterval(function(){
           ele.stepUp();
           if (ele.value >= ele.max){
               ele.value = ele.min
           }
           angular.element(ele).trigger('input')
        },40)
    }
    $scope.stopAnimation = function(obj){
        $scope.animationRunning = false;
        clearInterval($scope.intervalID);
    }
}])

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