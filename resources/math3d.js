// MIT License
//
// Copyright (c) 2017 Christopher Chudzicki
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

class Math3D {
    constructor(containerId, settings) {
        this.mathbox = this.initializeMathBox();
        
        if (settings !== undefined){
            this.load(settings)
        }
    }

    setDefaultScopes() {
        var defaultMathScope = {
            'pi': Math.PI,
            'e': Math.E,
            'i': [1, 0, 0],
            'j': [0, 1, 0],
            'k': [0, 0, 1],
            'diff': MathUtility.diff,
            'unitT': MathUtility.unitT,
            'unitN': MathUtility.unitN,
            'unitB': MathUtility.unitB,
        };
        this.mathScope = new WatchedScope(this.settings.mathScope)
        var onVariableChange = this.onVariableChange.bind(this);
        for (let key in defaultMathScope) {
            let val = defaultMathScope[key];
            this.mathScope.addVariable(key, val, onVariableChange)
        }
        
        this.toggleScope = new WatchedScope(this.settings.toggleScope);
    }

    setDefaults(settings) {
        this.defaultSettings = {
            containerId: null,
            range: {
                xMin: -5,
                xMax: +5,
                yMin: -5,
                yMax: +5,
                zMin: -5,
                zMax: +5
            },
            scale: {
                x: 1,
                y: 1,
                z: 0.5
            },
            camera: {
                position: [-0.75, -1.5, 0.25],
            },
            grids: {
                xy: true,
                xz: false,
                yz: false
            },
            axes: {
                'x': genDefaultAxisSettings.call(this, 'x', 'x'),
                'y': genDefaultAxisSettings.call(this, 'y', 'y'),
                'z': genDefaultAxisSettings.call(this, 'z', 'z'),
            },
            wrappedMathTree: [{
                name: "General",
                objects: []
            }]
        }

        function genDefaultAxisSettings(axisId, axisLabel) {
            // swizzle: user ---> mathbox
            // double swizzle: mathbox ---> user
            var mathboxAxes = this.swizzle(this.swizzle({
                x: 'x',
                y: 'y',
                z: 'z'
            }))

            if (axisId === 'z') {
                var tickLabelOffset = [20, 0, 0];
            } else {
                var tickLabelOffset = undefined;
            }

            var defaultAxisSettings = {
                visible: true,
                axisLabel: axisLabel,
                labelOffset: [0, 40, 0],
                axis: {
                    width: 2,
                    axis: mathboxAxes[axisId]
                },
                scale: {
                    divide: 10,
                    nice: true,
                    zero: false,
                    axis: mathboxAxes[axisId]
                },
                ticksVisible: true,
                ticks: {
                    width: 2
                },
                ticksFormat: {
                    digits: 2
                },
                ticksLabel: {
                    offset: tickLabelOffset
                }
            };

            return defaultAxisSettings
        }

        settings = _.merge({}, this.defaultSettings, settings);
        return settings
    }

    makeDynamicSettings() {
        var math3d = this;
        var dynamicSettings = {
            range: {},
            grids: {},
            scale: {},
            axes: {
                x: {},
                y: {},
                z: {}
            }
        }

        var _this = this;
        Object.defineProperties(dynamicSettings.range, {
            xMin: {
                set: function(val) {
                    this._xMin = val;
                    math3d.updateRange();
                },
                get: function() {
                    return this._xMin;
                }
            },
            xMax: {
                set: function(val) {
                    this._xMax = val;
                    math3d.updateRange();
                    math3d.updateAxisLabelPositions();
                },
                get: function() {
                    return this._xMax;
                }
            },
            yMin: {
                set: function(val) {
                    this._yMin = val;
                    math3d.updateRange();
                },
                get: function() {
                    return this._yMin;
                }
            },
            yMax: {
                set: function(val) {
                    this._yMax = val;
                    math3d.updateRange();
                    math3d.updateAxisLabelPositions();
                },
                get: function() {
                    return this._yMax;
                }
            },
            zMin: {
                set: function(val) {
                    this._zMin = val;
                    math3d.updateRange();
                },
                get: function() {
                    return this._zMin;
                }
            },
            zMax: {
                set: function(val) {
                    this._zMax = val;
                    math3d.updateRange();
                    math3d.updateAxisLabelPositions();
                },
                get: function() {
                    return this._zMax;
                }
            },
        })

        Object.defineProperties(dynamicSettings.grids, {
            xy: {
                set: function(val) {
                    this._xy = val;
                    math3d.scene.select('#xy-grid').set('visible', val);
                },
                get: function() {
                    return this._xy;
                }
            },
            xz: {
                set: function(val) {
                    this._xz = val;
                    math3d.scene.select('#xz-grid').set('visible', val);
                },
                get: function() {
                    return this._xz;
                }
            },
            yz: {
                set: function(val) {
                    this._yz = val;
                    math3d.scene.select('#yz-grid').set('visible', val);
                },
                get: function() {
                    return this._yz;
                }
            }
        })

        Object.defineProperties(dynamicSettings.scale, {
            x: {
                set: function(val) {
                    this._x = val;
                    _this.mathbox.select('#main-cartesian').set("scale", _this.swizzle(_this.settings.scale));
                },
                get: function() {
                    return this._x;
                }
            },
            y: {
                set: function(val) {
                    this._y = val;
                    _this.mathbox.select('#main-cartesian').set("scale", _this.swizzle(_this.settings.scale));
                },
                get: function() {
                    return this._y;
                }
            },
            z: {
                set: function(val) {
                    this._z = val;
                    _this.mathbox.select('#main-cartesian').set("scale", _this.swizzle(_this.settings.scale));
                },
                get: function() {
                    return this._z;
                }
            }
        })

        Object.defineProperties(dynamicSettings.axes.x, {
            visible: {
                set: function(val) {
                    this._visible = val;
                    _this.mathbox.select('#axis-x').set("visible", val);
                },
                get: function() {
                    return this._visible;
                }
            },
            ticksVisible: {
                set: function(val) {
                    this._ticksVisible = val;
                    _this.mathbox.select('#axis-x .ticks').set("visible", val);
                },
                get: function() {
                    return this._ticksVisible;
                }
            },
            axisLabel: {
                set: function(val) {
                    this._axisLabel = val;
                    _this.mathbox.select('#axis-x .axis-label text').set("data", [val]);
                },
                get: function() {
                    return this._axisLabel;
                }
            }
        })
        Object.defineProperties(dynamicSettings.axes.y, {
            visible: {
                set: function(val) {
                    this._visible = val;
                    _this.mathbox.select('#axis-y').set("visible", val);
                },
                get: function() {
                    return this._visible;
                }
            },
            ticksVisible: {
                set: function(val) {
                    this._ticksVisible = val;
                    _this.mathbox.select('#axis-y .ticks').set("visible", val);
                },
                get: function() {
                    return this._ticksVisible;
                }
            },
            axisLabel: {
                set: function(val) {
                    this._axisLabel = val;
                    _this.mathbox.select('#axis-y .axis-label text').set("data", [val]);
                },
                get: function() {
                    return this._axisLabel;
                }
            }
        })
        Object.defineProperties(dynamicSettings.axes.z, {
            visible: {
                set: function(val) {
                    this._visible = val;
                    _this.mathbox.select('#axis-z').set("visible", val);
                },
                get: function() {
                    return this._visible;
                }
            },
            ticksVisible: {
                set: function(val) {
                    this._ticksVisible = val;
                    _this.mathbox.select('#axis-z .ticks').set("visible", val);
                },
                get: function() {
                    return this._ticksVisible;
                }
            },
            axisLabel: {
                set: function(val) {
                    this._axisLabel = val;
                    _this.mathbox.select('#axis-z .axis-label text').set("data", [val]);
                },
                get: function() {
                    return this._axisLabel;
                }
            }
        })

        return _.merge(dynamicSettings, this.settings);

    }

    swizzle(arg, swizzleOrder) {
        // similar to mathbox swizzle operator, but for regular arrays and objects.
        // Example: swizzle([1,2,3], 'zyx') = [3,2,1]
        swizzleOrder = Utility.defaultVal(swizzleOrder, this.swizzleOrder);
        if (Array.isArray(arg)) {
            return swizzleArray(arg, swizzleOrder)
        } else {
            return swizzleObject(arg, swizzleOrder)
        }

        function swizzleArray(array, swizzleOrder) {
            var keys = {
                'x': 0,
                'y': 1,
                'z': 2,
                'w': 3
            }
            return swizzleOrder.split('').map(function(elem) {
                return array[keys[elem]]
            })
        }

        function swizzleObject(object, swizzleOrder) {
            var newObject = {};
            var oldKeys = ['x', 'y', 'z', 'w'];
            var newKeys = swizzleOrder.split('');
            for (var j = 0; j < newKeys.length; j++) {
                newObject[oldKeys[j]] = object[newKeys[j]];
            }
            return newObject
        }
    }

    initializeMathBox(containerId) {
        // if necessary, add a container for mathbox
        if ($("#" + containerId).length === 0) {
            containerId = _.uniqueId();
            this.container = $("<div class='mathbox-container'></div>");
            this.container.attr('id', containerId);
            $('body').append(this.container);
        } else {
            this.container = $("#" + containerId)
            this.container.addClass('mathbox-container');
        }

        var plugins = ['core', 'cursor', 'controls'];
        var controls = {
            klass: THREE.OrbitControls
        };
        var mathbox = mathBox({
            plugins: plugins,
            controls: controls,
            element: this.container[0]
        });
        
        mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

        return mathbox;
    }
    
    load(settings){
        this.swizzleOrder = Utility.defaultVal(settings.swizzleOrder, 'yzx');
        this.settings = this.setDefaults(settings);
        
        this.setCamera();
        this.scene = this.setupScene();
        this.updateRange();

        // Initial Drawing
        this.drawAxes();
        this.drawGrids();

        // Add getters and setters for updating after initial rendering
        this.settings = this.makeDynamicSettings();

        // create mathScope and toggleScope
        this.mathTree = [] //onVariableChange checks mathTree, so define it as empty for now.
        this.setDefaultScopes();
        
        //Render math objects; this will update this.mathTree
        this.renderMathObjects();
    }
    
    clear(){
        // Remove objects before re-assigning mathTree. I'm not entirely sure if this is necessary.
        _.forEach(this.mathTree, function(branch, idx) {
            var branchLength = branch.objects.length; // each iteration of loop changes branch.objects.length, so store it at beginning.
            for (let j=0; j<branchLength; j++){
                branch.objects[0].remove();
            }
        });
        this.mathTree = [];
        // wipe mathbox
        this.mathbox.remove('*');
    }
    
    setCamera(){
        // setup camera
        this.mathbox.camera({
            proxy: true,
            position: this.swizzle(this.settings.camera.position),
        });
    }

    setupScene() {
        var scene = this.mathbox
            .set({
                focus: this.settings.focus,
            })
            .cartesian({
                id: 'main-cartesian',
                scale: this.swizzle(this.settings.scale)
            });

        return scene
    }

    drawAxes() {

        var axesGroup = this.scene.group().set('classes', ['axes-group']);
        drawSingleAxis.call(this, 'x');
        drawSingleAxis.call(this, 'y');
        drawSingleAxis.call(this, 'z');

        function drawSingleAxis(axisId) {
            var axisSettings = this.settings.axes[axisId];

            var axisNums = {
                'x': 0,
                'y': 1,
                'z': 2
            };
            var axisNum = axisNums[axisId];
            var labelPos = [0, 0, 0];
            labelPos[axisNum] = this.settings.range[axisId + 'Max'];
            labelPos = this.swizzle(labelPos);

            axesGroup.group()
                .set('id', 'axis-' + axisId)
                .set('classes', ['axis'])
                .set('visible',axisSettings.visible)
                .axis(axisSettings.axis)
                .scale(axisSettings.scale)
                .group()
                .set('classes', ['ticks'])
                .set('visible',axisSettings.ticksVisible)
                .ticks(axisSettings.ticks)
                .format(axisSettings.ticksFormat)
                .label(axisSettings.ticksLabel)
                .set('classes', ['tick-labels'])
                .end()
                .group()
                .set('classes', ['axis-label'])
                .array({
                    data: [labelPos],
                    channels: 3,
                    live: false
                })
                .text({
                    data: [axisSettings.axisLabel],
                    weight: 'bold',
                })
                .label({
                    offset: axisSettings.labelOffset
                })
                .end()
                .end();
        }
    }

    updateAxisLabelPositions() {
        var axisNums = {
            'x': 0,
            'y': 1,
            'z': 2
        };

        for (var axisId in axisNums) {
            var axisNum = axisNums[axisId];
            var labelPos = [0, 0, 0];
            labelPos[axisNum] = this.settings.range[axisId + 'Max'];
            labelPos = this.swizzle(labelPos);
            this.scene.select("#axis-" + axisId + " .axis-label array").set('data', [labelPos]);
        }
    }

    updateRange() {
        var range = this.settings.range;
        this.scene.set("range", this.swizzle([
            [range.xMin, range.xMax],
            [range.yMin, range.yMax],
            [range.zMin, range.zMax]
        ]));
    }

    drawGrids() {
        // TODO: enable drawing of other grids
        var divX = 10;
        var divY = divX * this.settings.scale.y / this.settings.scale.x
        var divZ = divZ * this.settings.scale.z / this.settings.scale.x

        var trueAxes = this.swizzle(this.swizzle({
            x: 'x',
            y: 'y',
            z: 'z'
        }))

        var grids = this.scene.group()
            .set('classes', ['grids']);

        grids.grid({
            id: 'xy-grid',
            axes: [trueAxes.x, trueAxes.y],
            width: 1,
            divideX: divX,
            divideY: divY,
            opacity: 0.5,
            visible: this.settings.grids.xy
        });

        grids.grid({
            id: 'xz-grid',
            axes: [trueAxes.x, trueAxes.z],
            width: 1,
            divideX: divX,
            divideY: divZ,
            opacity: 0.5,
            visible: this.settings.grids.xz
        });

        grids.grid({
            id: 'yz-grid',
            axes: [trueAxes.y, trueAxes.z],
            width: 1,
            divideX: divY,
            divideY: divZ,
            opacity: 0.5,
            visible: this.settings.grids.yz
        });

    }

    renderMathObjects() {
        var _this = this;
        // Variable Objects needs to be added to mathTree first because other objects might reference them. 
        // The following seems a bit hacky, but works well.
        // 1. Add only Variable objects to the mathTree. This will expand mathScope
        // 2. redefine mathTree as []
        // 3. Add all mathObjects to the mathTree. Delete Variable names from mathScope just before they are added.


        _.forEach(this.settings.wrappedMathTree, function(branch, idx) {
            var branchCopy = {
                name: branch.name,
                collapsed: branch.collapsed,
                objects: []
            };
            _this.mathTree.push(branchCopy);
            _.forEach(branch.objects, function(metaObj, idx) {
                // only add variables
                if (metaObj.type === 'Variable' || metaObj.type === 'VariableSlider' || metaObj.type === 'VariableToggle') {
                    var mathObj = MathObject.renderNewObject(_this, metaObj);
                }
            });
        })
        this.mathTree = [];
        _.forEach(this.settings.wrappedMathTree, function(branch, idx) {
            var branchCopy = {
                name: branch.name,
                collapsed: branch.collapsed,
                objects: []
            };
            _this.mathTree.push(branchCopy);
            _.forEach(branch.objects, function(metaObj, idx) {
                // creating a new object appends to last branch
                var mathObj = MathObject.renderNewObject(_this, metaObj);
                if (mathObj.type === 'VariableSlider' || mathObj.type === 'Variable' || mathObj.type === 'VariableToggle') {
                    mathObj.valid = true;
                    mathObj.lastValidName = mathObj.name;
                }
            });
        })

        // Now, render all other objects

        this.settings.wrappedMathTree = [];
    }

    onVariableChange(varName) {
        // update objects where the variables have changed
        _.forEach(this.mathTree, function(branch, idx) {
            _.forEach(branch.objects, function(obj, idx) {
                if (_.contains(obj.variables, varName) || _.contains(obj.toggleVariables, varName)) {
                    try {
                        obj.recalculateData();
                    } catch (e) {
                        console.log(`Caught:${e}`);
                    }
                }
            })
        })
    }
    
    onToggleVariableChange(varName) {
        // update objects where the variables have changed
        _.forEach(this.mathTree, function(branch, idx) {
            _.forEach(branch.objects, function(obj, idx) {
                if (_.contains(obj.variables, varName) || _.contains(obj.toggleVariables, varName)) {
                    try {
                        obj.recalculateVisibility();
                    } catch (e) {
                        console.log(`Caught:${e}`);
                    }
                }
            })
        })
    }

    serialize(settings) {
        //Do not copy this.mathScope; those anything added to mathScope should be stored in mathTree;

        settings = Utility.defaultVal(settings, this.settings);
        // copy settings values, no setters and getters
        var rawSettings = Utility.deepCopyValuesOnly(this.settings)
            // camera is a THREE js Vec3 object
        var camera = this.mathbox.three.camera.position;
        // Round camera positions to keep encoded settings small.
        rawSettings.camera.position = [camera.x, camera.y, camera.z].map(function(x) {
            return Math.round(x * 1000) / 1000;
        });
        rawSettings.camera.position = this.swizzle(this.swizzle(rawSettings.camera.position));
        
        // add math objects
        _.forEach(this.mathTree, function(branch) {
            rawSettings.wrappedMathTree.push({
                name: branch.name,
                collapsed: branch.collapsed,
                objects: []
            });
            var serialBranch = rawSettings.wrappedMathTree[rawSettings.wrappedMathTree.length - 1];
            _.forEach(branch.objects, function(mathObj) {
                serialBranch.objects.push(JSON.parse(mathObj.serialize())); // serialized then parsed to remove getters and setters
            });
        });
        return JSON.stringify(Utility.deepObjectDiff(rawSettings, this.defaultSettings));
    }

    saveSettingsAsURL(settings) {
        settings = Utility.defaultVal(settings, this.settings);
        var settingsDiff64 = window.btoa(this.serialize(settings));
        var url = window.location.href.split('#')[0].split("?")[0] + "?settings=" + settingsDiff64;
        return url
    }

    static decodeSettingsAsURL64(encodedSettings) {
        var settings = JSON.parse(window.atob(encodedSettings))

        return settings
    }
}

class WatchedScope {
    //An object where each property is watched for change
    constructor() {}

    addVariable(key, val, onChangeFunction) {
        // If key already defined, return false; else add variable and return true
        if (this.hasOwnProperty(key) || key === '') {
            return false;
        } else {
            Object.defineProperty(this, key, {
                get: function() {
                    return this['_' + key];
                },
                set: function(val) {
                    this['_' + key] = val;
                    onChangeFunction(key, val);
                },
                configurable: true
            })
            this[key] = val
            return true
        }

    }

    removeVariable(key) {
        delete this["_" + key];
        delete this[key];
    }

    serialize() {
        var rawSettings = Utility.deepCopyValuesOnly(this)
        return JSON.stringify(rawSettings);
    }

}

class MathExpression {
    // Holds data for math expressions.
    constructor(expression) {
        // store initial representation
        this.expression = expression;

        var parsed = this.parse();

        this.variables = []
        this.functions = []

        parsed.traverse(function(node) {
            if (node.type === 'SymbolNode') {
                this.variables.push(node.name);
            }
            if (node.type === 'FunctionNode') {
                this.functions.push(node.name);
            }
        }.bind(this))

        var compiled = parsed.compile();

        if (expression[0] == "[") {
            this.eval = function(scope) {
                return compiled.eval(scope).toArray();
            }
        } else {
            this.eval = function(scope) {
                return compiled.eval(scope);
            }
        }

    }

    parse() {
        // Cross and dot products are not built into mathjs express. Let's replace "cross" and "dot" by mathjs operators that we probably won't use. Then we'll reassign functionality to these operators.
        this.expression = this.expression.replace(/dot/g, '|');
        this.expression = this.expression.replace(/cross/g, '&');
        
        this.expression = functionOperatorParser(this.expression, 'diff');
        this.expression = functionOperatorParser(this.expression, 'unitT');
        this.expression = functionOperatorParser(this.expression, 'unitN');
        this.expression = functionOperatorParser(this.expression, 'unitB');
        
        var parsed = math.parse(this.expression);

        parsed.traverse(function(node) {
            if (node.type === 'OperatorNode' && node.op === '|') {
                node.fn = 'dot';
            }
            if (node.type === 'OperatorNode' && node.op === '&') {
                node.fn = 'cross';
            }
        }.bind(this))
        this.expression = this.expression.replace(/:/, 'dot')
        this.expression = this.expression.replace(/&/, 'cross')
        return parsed
        
        function functionOperatorParser(string, opName){
            // MathJS's parse function does not deal well with functions that return functions. 
            // Math3D supports functions that have two related syntax. diff is one example:
            //      diff(f) ... returns a function
            //      diff(f,args) ... returns value of derivative evaluated at args
            // Mathematically, we prefer the function operator syntax followed by evaluation: diff(f)(args), but MathJS parser can't handle this. (It thinks multiplication)
            // functionOperatorParser converts between the two syntaxes
    
            // Examples:
            // diff(f1)(u,v) --> diff(f1,u,v)
            // diff(diff(f1))(u,v) --> diff( diff(f1), u, v )
    
            // Note that diff(f) w/o a subsequent evaluation needs to remain unchanged. This could show up in second+ derivatives.
    
            // Remove whitespace preceeding or following parentheses
            string = string.replace(/\s+\)/g, '\)').replace(/\s+\(/g, '\(');
            string = string.replace(/\)\s+/g, '\)').replace(/\(\s+/g, '\(');

            var opStart = string.indexOf(opName);
                
            if (opStart < 0) {return string;}

            var funcStart = opStart + opName.length,
                funcClose = Utility.findClosingBrace(string, funcStart);
    
            // 'PLACEHOLDER' marks a opName as finished.
            if (string[funcClose+1] !== '('){
                string = string.slice(0, opStart) + "PLACEHOLDER" + string.slice(funcStart,string.length);
            }
            else{
                var argStart = funcClose+1;
                var argClose = Utility.findClosingBrace(string, argStart);
                string = string.slice(0, opStart) + "PLACEHOLDER" + string.slice(funcStart,funcClose) + ',' + string.slice(argStart+1,string.length);
            }
    
            // Test if diffs remain
            funcStart = string.indexOf(opName)
            if (funcStart < 0){
                return Utility.replaceAll(string,'PLACEHOLDER',opName);
            }
            else {
                return functionOperatorParser(string, opName);
            }

        }
    }
}

// Abstract
class MathObject {
    constructor(math3d, settings) {
        /*Guidelines:
            this.settings: 
                should only contain information intended for serialization.
                if MEOW is a getter/setter, store associated value in _MEOW
        */
        this.math3d = math3d;
        this.id = _.uniqueId();
        // Add new objects to newest mathTree branch
        math3d.mathTree[math3d.mathTree.length - 1].objects.push(this);

        this.type = this.constructor.name;
        
        // Record all MathQuill mathfields associated with with this object for the UI
        this.wrappedMathFields = [];
        // Record MathExpressions
        this.mathExpressions = {};
    }

    setDefaults(settings) {
        settings = _.merge({}, this.defaultSettings, settings);
        _.merge(this.settings, settings);
        return this.settings;
    }

    get defaultSettings() {
        var defaults = {
            showInUI: true
        }
        return defaults
    }

    genMathExpression(expr, name) {
        var mathExpr = new MathExpression(expr);
        this.mathExpressions[name] = mathExpr;
        return mathExpr
    }

    serialize() {
        // copy settings values, no setters and getters
        var rawSettings = Utility.deepCopyValuesOnly(this.settings)
        var metaObj = {
                type: this.constructor.name,
                settings: Utility.deepObjectDiff(rawSettings, this.defaultSettings)
            }
            // Our object setters store values in properties prefixed with '_'. Let's remove the underscores.
        return JSON.stringify(metaObj);
    };

    remove() {
        var objIdx = -1;
        var branchIdx = -1;
        while (objIdx < 0) {
            branchIdx += 1;
            var objIdx = this.math3d.mathTree[branchIdx].objects.indexOf(this);
        }
        this.math3d.mathTree[branchIdx].objects.splice(objIdx, 1);
    }

    static renderNewObject(math3d, metaObj) {
        if (metaObj.type === 'MathObject') {
            return new MathObject(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Variable') {
            return new Variable(math3d, metaObj.settings)
        };
        if (metaObj.type === 'VariableSlider') {
            return new VariableSlider(math3d, metaObj.settings)
        };

        if (metaObj.type === 'Point') {
            return new Point(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Line') {
            return new Line(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Vector') {
            return new Vector(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ParametricCurve') {
            return new ParametricCurve(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ParametricSurface') {
            return new ParametricSurface(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ExplicitSurface') {
            return new ExplicitSurface(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ExplicitSurfacePolar') {
            return new ExplicitSurfacePolar(math3d, metaObj.settings)
        };
        if (metaObj.type === 'VariableToggle') {
            return new VariableToggle(math3d, metaObj.settings)
        };
    }
}

class AbstractVariable extends MathObject {
    constructor(math3d, settings) {
        super(math3d, settings);
        
        this.scope = null; // to be set as math3d.mathScope or math3d.toggleScope by subclasses.

        this.name = null;
        this.lastValidName = null;
        this.variables = [];

        var _this = this;
        this.settings = {};
        Object.defineProperties(this.settings, {
            name: {
                set: function(val) {
                    // _this.name: current name
                    // val: new name
                    this._name = val;
                    val = _this.setName(val);
                },
                get: function(val) {
                    return this._name;
                }
            }
        });
    }
    setName(newName) {
        this.scope.removeVariable(this.lastValidName);
        this.valid = this.addVarToScope(newName);

        if (this.valid) {
            this.lastValidName = newName;
        }
        this.name = newName;

        // name change might cause other variables to be valid / invalid. Let's check

        this.updateOthers();

        return newName;
    }
    // addVarToScope(newName){} defined by all subclasses
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            description: ''
        });
        return defaults
    }

    remove() {
        this.scope.removeVariable(this.lastValidName);
        this.updateOthers();
        MathObject.prototype.remove.call(this);
    }
    updateOthers() {
        var _this = this;
        _.forEach(this.math3d.mathTree, function(branch) {
            _.forEach(branch.objects, function(obj) {
                if (obj.constructor.prototype instanceof AbstractVariable && obj !== _this && !obj.valid) {
                    obj.valid = obj.addVarToScope(obj.name);
                    if (obj.valid) {
                        obj.lastValidName = obj.name;
                        obj.recalculateData();
                    }
                }
            })
        })
    }
}

class Variable extends AbstractVariable {
    constructor(math3d, settings) {
        super(math3d, settings);
        this.scope = math3d.mathScope;
        
        this.parsedExpression = null;
        this.argNames = null;
        this.holdEvaluation = null;

        var _this = this;
        Object.defineProperties(this.settings, {
            rawExpression: {
                set: function(val) {
                    this._rawExpression = val;
                    _this.parsedExpression = _this.genMathExpression(val,'expression');
                    _this.updateVariablesList();
                    _this.setRawExpression(val);
                },
                get: function() {
                    return this._rawExpression;
                }
            },
            rawName: {
                set: function(val) {
                    this._rawName = val;
                    _this.setRawName(val);
                },
                get: function() {
                    return this._rawName;
                }
            }
        });
        this.settings = this.setDefaults(settings);

    }

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            rawName: 'f(t)',
            rawExpression: 'e^t',
            description: 'Function'
        });
        return defaults
    }

    setRawName(val) {
        var expr = this.genMathExpression(val,'name');
        // expr should be something like f_1(s,t); should have 1 function and 0+ variables
        if (expr.functions.length === 1) {
            this.holdEvaluation = true;
            this.argNames = expr.variables;
            this.settings.name = expr.functions[0];
            if (this.settings.description === 'Variable') {
                this.settings.description = 'Function'
            };
        } else if (expr.functions.length === 0) {
            this.holdEvaluation = false;
            this.argNames = []
            this.settings.name = expr.variables[0];
            if (this.settings.description === 'Function') {
                this.settings.description = 'Variable'
            };
        } else {}
        this.setRawExpression(this.settings.rawExpression);
    }
    addVarToScope(newName) {
        var onVariableChange = this.math3d.onVariableChange.bind(this.math3d);
        return this.scope.addVariable(newName, this.value, onVariableChange);
    }
    setRawExpression(val) {
        var expr = this.parsedExpression;
        if (!this.valid || expr === null) {
            return
        }

        if (expr === null) {
            return
        }
        var localMathScope = Utility.deepCopyValuesOnly(this.scope);
        if (this.holdEvaluation) {
            let argNames = this.argNames;
            this.value = function() {
                //arguments and this.argNames should have same length
                for (let j = 0; j < argNames.length; j++) {
                    localMathScope[argNames[j]] = arguments[j];
                }
                return expr.eval(localMathScope);
            }
            this.value.numberOfArguments = argNames.length;
        } else {
            this.value = expr.eval(localMathScope);
        }
        this.scope[this.name] = this.value;
    }
    
    updateVariablesList() {
        this.variables = []
        if (this.parsedExpression !== null) {
            this.variables = this.variables.concat(this.parsedExpression.variables);
            this.variables = this.variables.concat(this.parsedExpression.functions);
        }
    }
    recalculateData() {
        this.settings.rawExpression = this.settings.rawExpression;
    }
}

class VariableSlider extends AbstractVariable {
    constructor(math3d, settings) {
        super(math3d, settings);
        this.scope = math3d.mathScope;
        
        this.parsedMin = null;
        this.parsedMax = null;

        this.speeds = [{
            value: 1 / 16,
            string: "1/16"
        }, {
            value: 1 / 8,
            string: "1/8"
        }, {
            value: 1 / 4,
            string: "1/4"
        }, {
            value: 1 / 2,
            string: "1/2"
        }, {
            value: 3 / 4,
            string: "3/4"
        }, {
            value: 1,
            string: "1"
        }, {
            value: 1.5,
            string: "1.5"
        }, {
            value: 2,
            string: "2"
        }, {
            value: 3,
            string: "3"
        }, {
            value: 4,
            string: "4"
        }, {
            value: 8,
            string: "8"
        }, ]

        var _this = this;
        Object.defineProperties(this.settings, {
            min: {
                set: function(val) {
                    this._min = val;
                    _this.setMin(val);
                },
                get: function() {
                    return this._min;
                },
            },
            max: {
                set: function(val) {
                    this._max = val;
                    _this.setMax(val);
                },
                get: function() {
                    return this._max;
                },
            },
            value: {
                set: function(val) {
                    this._value = val;
                    _this.setValue(val);
                },
                get: function() {
                    return this._value;
                },
            }
        });

        this.settings = this.setDefaults(settings);
        var onVariableChange = math3d.onVariableChange.bind(math3d);
        this.scope.addVariable(this.settings.name, this.settings.value, onVariableChange);

    }

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            value: 0.5,
            min: '0',
            max: '10',
            name: 'X',
            speedIdx: 5,
            animationRunning: false,
            description: this.type,
        });
        return defaults
    }

    updateVariablesList() {
        this.variables = []
        if (this.parsedMin !== null) {
            this.variables = this.variables.concat(this.parsedMin.variables);
            this.variables = this.variables.concat(this.parsedMin.functions);
        }
        if (this.parsedMax !== null) {
            this.variables = this.variables.concat(this.parsedMax.variables);
            this.variables = this.variables.concat(this.parsedMax.functions);
        }
    }

    setMin(val) {
        this.parsedMin = this.genMathExpression(val, 'min');
        this.min = this.parsedMin.eval(this.scope);
        this.updateVariablesList();
    }
    setMax(val) {
        this.parsedMax = this.genMathExpression(val, 'max');
        this.max = this.parsedMax.eval(this.scope);
        this.updateVariablesList();
    }
    setValue(val) {
        if (!this.valid) {
            return
        }
        this.scope[this.name] = val;
    }

    addVarToScope(newName) {
        var onVariableChange = this.math3d.onVariableChange.bind(this.math3d);
        return this.scope.addVariable(newName, this.settings.value, onVariableChange);
    }

    recalculateData() {
        this.settings.min = this.settings.min;
        this.settings.value = this.settings.value;
        this.settings.max = this.settings.max;
    }
}

class VariableToggle extends AbstractVariable{
    constructor(math3d, settings) {
        super(math3d, settings);
        this.scope = math3d.toggleScope;
        
        var _this = this;
        Object.defineProperties(this.settings, {
            value: {
                set: function(val) {
                    this._value = val;
                    _this.setValue(val);
                },
                get: function() {
                    return this._value;
                },
            }
        });

        this.settings = this.setDefaults(settings);
        var onToggleVariableChange = math3d.onToggleVariableChange.bind(math3d);
        this.scope.addVariable(this.settings.name, this.settings.value, onToggleVariableChange);
    }
    
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            name:'toggle',
            value:true,
            description: this.type,
        });
        return defaults
    }
    
    setValue(val) {
        if (!this.valid) {
            return
        }
        this.scope[this.name] = val;
    }
    
    addVarToScope(newName) {
        var onToggleVariableChange = this.math3d.onToggleVariableChange.bind(this.math3d);
        return this.scope.addVariable(newName, this.value, onToggleVariableChange);
    }
}

// All classes below are used for rendering graphics with MathBox
class MathGraphic extends MathObject {
    constructor(math3d, settings) {
        //Every sublcass should define these
        super(math3d, settings);
        this.mathboxGroup = null;
        this.mathboxDataType = null; // e.g., 'array'
        this.mathboxRenderTypes = null; // e.g., 'point'

        this.parsedExpression = null;
        this.parsedRange = null;
        this.variables = [];
        
        this.parsedVisibility = null;
        this.toggleVariables = [];

        this.settings = {};
        this.userSettings = [
            //{attribute:'visible',format:'Boolean'},
            {attribute:'calculatedVisibility', format:'String'},
            {
                attribute: 'opacity',
                format: 'Number'
            },
            //{attribute:'color',format:'String'},
            {
                attribute: 'zBias',
                format: 'Number'
            },
            //{attribute:'rawExpression',format:'String'}
        ]

        var _this = this;
        Object.defineProperties(this.settings, {
            rawExpression: {
                set: function(val) {
                    this._rawExpression = val;
                    _this.parsedExpression = _this.genMathExpression(val, 'expression');
                    _this.updateVariablesList();
                    _this.recalculateData();
                },
                get: function() {
                    return this._rawExpression;
                },
            },
            color: {
                set: function(val) {
                    // test whether val is a valid hex color except for missing '#', e.g., 00FF2A. jscolor provides such colors.
                    var needsHash = /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(val);
                    if (needsHash) {
                        val = "#" + val;
                    }
                    this._color = val[0] === '#' ? val : Utility.namedColorToHexColor(val);
                    if (_this.mathboxGroup !== null) {
                        _this.setColor(val);
                    }
                },
                get: function() {
                    return this._color;
                },
            },
            shaded: {
                set: function(val) {
                    this._shaded = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setShaded(val);
                    }
                },
                get: function() {
                    return this._shaded;
                },
            },
            opacity: {
                set: function(val) {
                    this._opacity = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setOpacity(val);
                    }
                },
                get: function() {
                    return this._opacity;
                },
            },
            zIndex: {
                set: function(val) {
                    this._zIndex = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setZIndex(val);
                    }
                },
                get: function() {
                    return this._zIndex;
                },
            },
            zBias: {
                set: function(val) {
                    this._zBias = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setZBias(val);
                    }
                },
                get: function() {
                    return this._zBias;
                },
            },
            visible: {
                set: function(val) {
                    this._visible = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setVisible(val);
                    }
                },
                get: function() {
                    return this._visible;
                },
                configurable:true
            },
            calculatedVisibility: {
                set: function(val){
                    this._calculatedVisibility = val;
                    _this.setCalculatedVisibility(val);
                },
                get: function(){
                    return this._calculatedVisibility;
                }
            },
            size: {
                set: function(val) {
                    this._size = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setSize(val);
                    }
                },
                get: function() {
                    return this._size;
                },
            },
            width: {
                set: function(val) {
                    this._width = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setWidth(val);
                    }
                },
                get: function() {
                    return this._width;
                },
            },
            range: {
                set: function(val) {
                    this._range = val;
                    _this.setRange(val);
                },
                get: function() {
                    return this._range;
                },
            },
            samples: {
                set: function(val) {
                    this._samples = val;
                    _this.setSamples(val);
                },
                get: function() {
                    return this._samples;
                },
            },
            end: {
                set: function(val) {
                    this._end = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setEnd(val);
                    }
                },
                get: function() {
                    return this._end;
                },
            },
            start: {
                set: function(val) {
                    this._start = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setStart(val);
                    }
                },
                get: function() {
                    return this._start;
                },
            },
            size: {
                set: function(val) {
                    this._size = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setSize(val);
                    }
                },
                get: function() {
                    return this._size;
                },
            },
        });

    };

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            visible: true,
            color: '#3090FF',
            zIndex: 0,
            opacity: 1,
            description: this.type,
        });
        return defaults
    }

    //Define this for every subclass
    recalculateData() {}

    updateVariablesList() {
        this.variables = []
        if (this.parsedExpression !== null) {
            this.variables = this.variables.concat(this.parsedExpression.variables);
            this.variables = this.variables.concat(this.parsedExpression.functions);
        }

        if (this.parsedRange !== null) {
            this.variables = this.variables.concat(this.parsedRange.variables);
            this.variables = this.variables.concat(this.parsedRange.functions);
        }
        
        if (this.parsedVisibility !== null){
            this.toggleVariables = this.toggleVariables.concat(this.parsedVisibility.variables);
        }
    }

    get data() {
        return this._data;
    }
    set data(val) {
        this._data = val;
        if (this.mathboxGroup !== null) {
            this.setData(val);
        };
    }

    setData(val) {
        this.mathboxGroup.select(this.mathboxDataType).set("data", val);
    }

    setColor(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("color", val);
    }

    setShaded(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("shaded", val);
    }

    setOpacity(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("opacity", val);
    }

    setZIndex(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("zIndex", val);
    }
    
    setZBias(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("zBias", val);
    }

    setSize(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("size", val);
    }

    setVisible(val) {
        this.mathboxGroup.set("visible", val);
    }

    setCalculatedVisibility(val){
        this.parsedVisibility = this.genMathExpression(val, 'calculatedVisibility');
        this.updateVariablesList();
        this.recalculateVisibility();
    }
    
    recalculateVisibility(){
        try {
            this.settings.visible = this.parsedVisibility.eval(this.math3d.toggleScope);
        } 
        catch (e) {
            console.log(e.message);
        }
    }

    setWidth(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("width", val);
    }

    setRange(val) {
        this.parsedRange = this.genMathExpression(val, 'range');
        this.range = this.parsedRange.eval(this.math3d.mathScope);
        this.updateVariablesList();
        this.recalculateData();
    }

    setSamples(val) {
        this.recalculateData();
    }

    setStart(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("start", val);
    }

    setEnd(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("end", val);
    }

    setSize(val) {
        this.mathboxGroup.select(this.mathboxRenderTypes).set("size", val);
    }

    remove() {
        this.mathboxGroup.remove();
        MathObject.prototype.remove.call(this);
    }
}

class Point extends MathGraphic {
    constructor(math3d, settings) {
        super(math3d, settings);
        this.mathboxDataType = 'array';
        this.mathboxRenderTypes = 'point';

        var _this = this;
        Object.defineProperties(this.settings, {
            label: {
                set: function(val) {
                    this._label = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setLabel(val);
                    }
                    return
                },
                get: function() {
                    return this._label;
                }
            },
            labelVisible: {
                set: function(val) {
                    this._labelVisible = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setLabelVisible(val);
                    }
                    return
                },
                get: function() {
                    return this._labelVisible;
                }
            }
        });

        this.settings = this.setDefaults(settings);
        this.userSettings = this.userSettings.concat([{
            attribute: 'size',
            format: 'Number'
        }, ])

        this.mathboxGroup = this.render();
    }

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            rawExpression: "[[0,0,0]]",
            size: 14,
            labelVisible: false,
            label: null,
        });
        return defaults
    }

    recalculateData() {
        this.data = this.parsedExpression.eval(this.math3d.mathScope);
    }

    render() {
        var group = this.math3d.scene.group().set('classes', ['point']);

        var point = group.array({
                data: this.data,
                live: false,
                items: 1,
                channels: 3,
            }).swizzle({
                order: this.math3d.swizzleOrder
            }).point({
                color: this.settings.color,
                size: this.settings.size,
                visible: this.settings.visible,
                zIndex: this.settings.zIndex,
                zBias:this.settings.zBias
            })
            .format({
                data: [this.settings.label]
            }).label({
                size: 20,
                visible: this.settings.labelVisible,
                offset: [0, 20]
            });

        return group;
    }

    setLabel(val) {
        this.mathboxGroup.select('format').set("data", [val]);
    }
    setLabelVisible(val) {
        this.mathboxGroup.select('label').set("visible", val);
    }

}

class AbstractCurve extends MathGraphic {
    constructor(math3d, settings) {
        super(math3d, settings);
        this.mathboxDataType = 'interval';
        this.mathboxRenderTypes = 'line';

    }

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            width: 4,
            start: false,
            end: false
        });
        return defaults
    }
}

class AbstractCurveFromData extends AbstractCurve {
    constructor(math3d, settings) {
        super(math3d, settings);
        this.mathboxDataType = 'array';

        this.userSettings = this.userSettings.concat([{
            attribute: 'size',
            format: 'Number'
        }, {
            attribute: 'start',
            format: 'Boolean'
        }, {
            attribute: 'end',
            format: 'Boolean'
        }])
    }

    recalculateData() {
        this.data = this.parsedExpression.eval(this.math3d.mathScope);
    }

    render() {
        var group = this.math3d.scene.group().set('classes', ['curve']);

        group.array({
                data: this.data,
                live: false,
                items: 1,
                channels: 3,
            }).swizzle({
                order: this.math3d.swizzleOrder
            }).line({
                color: this.settings.color,
                width: this.settings.width,
                visible: this.settings.visible,
                start: this.settings.start,
                end: this.settings.end,
                size: this.settings.size,
                zIndex: this.settings.zIndex,
                zBias:this.settings.zBias
            })
            .format({
                data: ['', this.settings.label]
            }).label({
                size: 20,
                visible: this.settings.labelVisible,
                offset: [0, 20]
            });;

        return group;
    }
}

class Line extends AbstractCurveFromData {
    constructor(math3d, settings) {
        super(math3d, settings);

        this.settings = this.setDefaults(settings);

        this.mathboxGroup = this.render();
    }
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            rawExpression: "[[0,0,0],[pi,0,0],[pi,pi,0],[0,pi,0]]",
            start: false,
            end: false,
            size: 6,
        });
        return defaults
    }
}

class Vector extends AbstractCurveFromData {
    constructor(math3d, settings) {
        super(math3d, settings);

        var _this = this;
        Object.defineProperties(this.settings, {
            tail: {
                set: function(val) {
                    this._tail = val;
                    _this.setTail(val);
                    return
                },
                get: function() {
                    return this._tail;
                }
            },
            components: {
                set: function(val) {
                    this._components = val;
                    _this.setComponents(val);
                    return
                },
                get: function() {
                    return this._components;
                }
            },
            label: {
                set: function(val) {
                    this._label = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setLabel(val);
                    }
                    return
                },
                get: function() {
                    return this._label;
                }
            },
            labelVisible: {
                set: function(val) {
                    this._labelVisible = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setLabelVisible(val);
                    }
                    return
                },
                get: function() {
                    return this._labelVisible;
                }
            }
        });

        this.settings = this.setDefaults(settings);
        this.userSettings = this.userSettings.concat([{
                attribute: 'tail',
                format: 'String'
            },
            // {attribute:'components', format:'String'}
        ])

        this.mathboxGroup = this.render();
    }

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            end: true,
            start: false,
            size: 6,
            rawExpression: "[[0,0,0],[1,2,3]]",
            tail: "[0,0,0]",
            components: "[1,2,3]",
            labelVisible: false,
            label: null,
        });
        return defaults
    }

    setTail(val) {
        if (this.settings.components !== undefined) {
            this.settings.rawExpression = `[${val},${val}+${this.settings.components}]`
        }
    }
    setComponents(val) {
        if (this.settings.tail !== undefined) {
            this.settings.rawExpression = `[${this.settings.tail},${this.settings.tail}+${val}]`
        }
    }

    setLabel(val) {
        this.mathboxGroup.select('format').set("data", ['', val]);
    }
    setLabelVisible(val) {
        this.mathboxGroup.select('label').set("visible", val);
    }
}

class ParametricCurve extends AbstractCurve {
    constructor(math3d, settings) {
        super(math3d, settings);

        this.settings = this.setDefaults(settings);
        this.userSettings = this.userSettings.concat([{
            attribute: 'samples',
            format: 'Integer'
        }])

        this.mathboxGroup = this.render();
    }
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            parameter: 't',
            rawExpression: "[cos(t),sin(t),t]",
            range: "[-2*pi,2*pi]",
            samples: 64,
        });
        return defaults
    }

    recalculateData() {
        if (this.mathboxGroup !== null) {
            this.mathboxGroup.select("cartesian").set("range", [this.range, [0, 1]]);
            var expr = this.parsedExpression;
            var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
            var param = this.settings.parameter;

            this.range = this.parsedRange.eval(this.math3d.mathScope);
            this.mathboxGroup.select("cartesian").set("range", [this.range, [0, 1]]);
            this.mathboxGroup.select("interval").set("width", this.settings.samples);

            this.mathboxGroup.select("interval").set("expr", function(emit, t, i, j, time) {
                localMathScope[param] = t;
                var xyz = expr.eval(localMathScope);
                emit(...xyz);
            });
        }
        return
    }

    render() {
        // NOTE: Updating an <area>'s range does not work. However, it does work to make range a child of its own <cartesian>, inherit range from cartesian, and update <cartesian>'s range. See https://groups.google.com/forum/?fromgroups#!topic/mathbox/zLX6WJjTDZk
        var group = this.math3d.scene.group().set('classes', ['curve', 'parametric']);
        var expr = this.parsedExpression;
        var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
        var param = this.settings.parameter[0];

        var gridColor = Utility.defaultVal(this.settings.gridColor, Utility.lightenColor(this.settings.color, -0.5));

        var data = group.cartesian({
            range: [this.range, [0, 1]]
        }).interval({
            width: this.settings.samples,
            expr: function(emit, t, i, j, time) {
                localMathScope[param] = t;
                var xyz = expr.eval(localMathScope);
                emit(...xyz);
            },
            channels: 3,
            axis: 1,
            live: false,
        }).swizzle({
            order: this.math3d.swizzleOrder
        });

        group.line({
            points: data,
            color: this.settings.color,
            opacity: this.settings.opacity,
            width: this.settings.width,
            visible: this.settings.visible,
            start: this.settings.start,
            end: this.settings.end,
            size: this.settings.size,
            zIndex: this.settings.zIndex,
            zBias:this.settings.zBias
        });

        return group;
    }

}

class AbstractSurface extends MathGraphic {
    constructor(math3d, settings) {
        super(math3d, settings);
        this.mathboxDataType = 'area';
        this.mathboxRenderTypes = 'surface, line';
        this.userSettings = this.userSettings.concat([{
            attribute: 'gridU',
            format: 'Integer'
        }, {
            attribute: 'gridV',
            format: 'Integer'
        }, {
            attribute: 'gridOpacity',
            format: 'Number'
        }, {
            attribute: 'shaded',
            format: 'Boolean'
        }])

        var _this = this;
        Object.defineProperties(this.settings, {
            gridU: {
                set: function(val) {
                    this._gridU = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setGridX(val);
                    }
                },
                get: function() {
                    return this._gridU;
                },
            },
            gridV: {
                set: function(val) {
                    this._gridV = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setGridY(val);
                    }
                },
                get: function() {
                    return this._gridV;
                },
            },
            gridOpacity: {
                set: function(val) {
                    this._gridOpacity = val;
                    if (_this.mathboxGroup !== null) {
                        _this.setGridOpacity(val);
                    }
                },
                get: function() {
                    return this._gridOpacity;
                },
            },
        })

    }
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            opacity: 0.66,
            gridU: 8,
            gridV: 8,
            gridOpacity: 0.75,
            shaded: false
        });
        return defaults
    }

    setGridX(val) {
        this.mathboxGroup.select('.gridU resample').set("width", val);
    }
    setGridY(val) {
        this.mathboxGroup.select('.gridV resample').set("height", val);
    }
    setGridOpacity(val) {
        this.mathboxGroup.select('line').set('opacity', val);
    }
    setColor(val) {
        super.setColor(val);
        var gridColor = Utility.lightenColor(val, -0.5);
        this.mathboxGroup.select('line').set('color', gridColor);
    }
    
}

class ParametricSurface extends AbstractSurface {
    constructor(math3d, settings) {
        super(math3d, settings);

        var _this = this;
        Object.defineProperties(this.settings, {
            samplesU: {
                set: function(val) {
                    this._samplesU = val;
                    if (_this.mathboxGroup !== null) {
                        _this.recalculateData();
                    }
                },
                get: function() {
                    return this._samplesU;
                },
            },
            samplesV: {
                set: function(val) {
                    this._samplesV = val;
                    if (_this.mathboxGroup !== null) {
                        _this.recalculateData();
                    }
                },
                get: function() {
                    return this._samplesV;
                },
            },
            rangeU: {
                set: function(val) {
                    this._rangeU = val;
                    if (this.rangeV !== undefined){
                        this.range = `[${val},${this.rangeV}]`;
                    }
                },
                get: function() {
                    return this._rangeU;
                },
            },
            rangeV: {
                set: function(val) {
                    this._rangeV = val;
                    if (this.rangeU !== undefined){
                        this.range = `[${this.rangeU},${val}]`;
                    }
                },
                get: function() {
                    return this._rangeV;
                },
            }
        })

        //TODO: samplesU and samplesV set OK, but are updating strangely.
        this.settings = this.setDefaults(settings);
        this.userSettings = this.userSettings.concat([
            //{attribute:'samplesU', format:'Integer'},
            //{attribute:'samplesV', format:'Integer'}
        ])

        this.mathboxGroup = this.render();
    }

    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            parameters: ['u', 'v'],
            rawExpression: "[v*cos(u),v*sin(u),v]",
            rangeU: "[-pi, pi]",
            rangeV: "[-1, 1]",
            samplesU: 64,
            samplesV: 64
        });
        return defaults
    }

    recalculateData() {
        if (this.mathboxGroup !== null) {
            this.mathboxGroup.select("cartesian").set("range", this.range);

            var expr = this.parsedExpression;
            var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
            var param0 = this.settings.parameters[0];
            var param1 = this.settings.parameters[1];
            
            this.range = this.parsedRange.eval(this.math3d.mathScope);
            this.mathboxGroup.select("cartesian").set("range", this.range);

            this.mathboxGroup.select("area").set("width", this.settings.samplesU);
            this.mathboxGroup.select("area").set("height", this.settings.samplesV);
            this.mathboxGroup.select("area").set("expr", function(emit, u, v, i, j, time) {
                localMathScope[param0] = u;
                localMathScope[param1] = v;
                var xyz = expr.eval(localMathScope);
                emit(...xyz);
            });
        }
        return
    }

    render() {
        // NOTE: Updating an <area>'s range does not work. However, it does work to make range a child of its own <cartesian>, inherit range from cartesian, and update <cartesian>'s range. See https://groups.google.com/forum/?fromgroups#!topic/mathbox/zLX6WJjTDZk
        var group = this.math3d.scene.group().set('classes', ['surface', 'parametric']);
        var expr = this.parsedExpression;
        var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
        var param0 = this.settings.parameters[0];
        var param1 = this.settings.parameters[1];

        var gridColor = Utility.defaultVal(this.settings.gridColor, Utility.lightenColor(this.settings.color, -0.5));

        var data = group.cartesian({
            range: this.range
        }).area({
            width: this.settings.samplesU,
            height: this.settings.samplesV,
            expr: function(emit, u, v, i, j, time) {
                localMathScope[param0] = u;
                localMathScope[param1] = v;
                var xyz = expr.eval(localMathScope);
                emit(...xyz);
            },
            channels: 3,
            axes: [1, 2],
            live: false,
        }).swizzle({
            order: this.math3d.swizzleOrder
        })

        var surface = group.set('visible', this.settings.visible)
            .surface({
                points: data,
                color: this.settings.color,
                opacity: this.settings.opacity,
                shaded: this.settings.shaded,
                zBias:this.settings.zBias
            }).group().set('classes', ['gridV'])
            .resample({
                height: this.settings.gridV,
                source: data
            })
            .line({
                color: gridColor,
                opacity: this.settings.gridOpacity,
                zBias:this.settings.zBias
            })
            .end()
            .group().set('classes', ['gridU'])
            .resample({
                width: this.settings.gridU,
                source: data,
            })
            .transpose({
                order: 'yx'
            })
            .line({
                color: gridColor,
                opacity: this.settings.gridOpacity,
                zBias:this.settings.zBias
            })
            .end();

        return group;
    }

}

class ExplicitSurface extends ParametricSurface {
    constructor(math3d, settings){
        super(math3d, settings);
        
        var _this = this;
        delete this.settings.rawExpressionZ; // rawExpressionZ was previously set. Adding the getter/setter for it now messes up Utility.deepCopyValuesOnly unless we explicity delete the key.
        Object.defineProperties(this.settings, {
            rawExpressionZ: {
                set: function(val) {
                    this._rawExpressionZ = val;
                    this.rawExpression = `[x,y,${val}]`;
                },
                get: function() {
                    return this._rawExpressionZ;
                },
            },
        })
        
        // Need to set defaults again, since Object.defineProperties just overrode rawExpressionZ
        this.settings = this.setDefaults(settings);
    }
    
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            parameters:['x','y'],
            rawExpression: "[x, y, x^2 + y^2]",
            rawExpressionZ: "x^2 + y^2",
            rangeU: "[-2, 2]",
            rangeV: "[-2, 2]",
        });
        return defaults
    }
}

class ExplicitSurfacePolar extends ParametricSurface {
    constructor(math3d, settings){
        super(math3d, settings);
        
        var _this = this;
        delete this.settings.rawExpressionZ;
        Object.defineProperties(this.settings, {
            rawExpressionZ: {
                set: function(val) {
                    this._rawExpressionZ = val;
                    this.rawExpression = `[r*cos(theta),r*sin(theta),${val}]`;
                },
                get: function() {
                    return this._rawExpressionZ;
                },
            },
        })
        
        // Need to set defaults again, since Object.defineProperties just overrode rawExpressionZ
        this.settings = this.setDefaults(settings);
    }
    
    get defaultSettings() {
        var defaults = _.merge(super.defaultSettings, {
            parameters:['r','theta'],
            rawExpression: "[r*cos(theta), r*sin(theta), 3*e^-r]",
            rawExpressionZ: "3*e^-r",
            rangeU: "[0, 4]",
            rangeV: "[0, 2pi]",
        });
        return defaults
    }
}

// TODO: toward improving parsing feedback, one idea is:
// 1. move all MathExpressions associated with an object into obj.mathExpressions
// 2. While I'm at it, remove all instances of this.parseRawExpression. It's a dumb method.
// 3. Add an error message property to MathExpression class
// 4. Now that every object has a mathExpressions list, append error messages to object in UI.

// This should all really go into another file. It's specific to the math3d.org webapp design.

// Customize MathQuill's MathField; bind to math3d MathObject
class WrappedMathField {
    constructor(el, mathObj, mathObjKey, $scope, settings) {
        this.$scope = $scope; //angular scope. We need to $scope.$apply() during mathquill edit events
        
        this.settings = {};
        this.settings = this.setDefaults(settings);
        
        //Set the inner HTML
        var expression = math.parse(mathObj.settings[mathObjKey]).toTex({handler:MathUtility.toTexHandler});
        expression = Utility.replaceAll(expression,'~','');
        el.innerHTML = expression;
        
        this.mathfield = MathQuill.getInterface(2).MathField(el, this.settings);
        if (this.mathfield){
            $(el).addClass("has-mq");
        }
        this.mathObj = mathObj;
        mathObj.wrappedMathFields.push(this);
        this.mathObjKey = mathObjKey;

    }
    
    setDefaults(settings) {
        settings = _.merge({}, this.defaultSettings, settings);
        _.merge(this.settings, settings);
        return this.settings;
    }
    
    get defaultSettings() {
        var defaults = {
            autoCommands: 'pi theta sqrt',
            autoOperatorNames: 'diff unitT unitN unitB cos sin tan sec csc cot log ln exp'
        }
        return defaults
    }
    
    updateMathObj(key){
        try {
            this.mathObj.settings[key] = MathUtility.texToMathJS(this.mathfield.latex());
            this.$scope.$apply(); // for variables, changing the name can change object description from between variable and function. Propagating this change requires an apply().
        } 
        catch (e) {
            console.log(e.message);
        }
    }
    
}

class WrappedMathFieldMain extends WrappedMathField {
    constructor(el, mathObj, mathObjKey, $scope, settings){
        super(el, mathObj, mathObjKey, $scope, settings);
        
        this.cellMain = $(`#object-${mathObj.id} .object-cell-main`);
        this.item = $(el).closest('.list-group-item')[0];
        
        var _this=this;
        $(this.cellMain).unbind().on('focusin', function(e){
            if ( !$(e.target).hasClass('btn')){
                _this.onFocusIn();
            }
        })
        .on('focusout', function(){
            _this.onFocusOut();
        })
        .on('mouseenter', function(){
            $("div.math3d-controller").resizable('disable');
        })
        .on('mouseleave', function(){
            $("div.math3d-controller").resizable('enable');
        })
    }
    
    get defaultSettings() {
        var _this = this;
        var defaults = _.merge(super.defaultSettings, {
            handlers:{
                edit:function(){
                    _this.onEditHandler();
                }
            }
        });
        return defaults
    }
    
    updateItemWidth(){
        this.item.style.width = `${this.cellMain[0].offsetWidth+25}px`;
    }
    restoreItemWidth(){
        this.item.style.width = 'auto';
    }    
    onFocusIn(){
        this.cellMain.addClass('focused');
        this.updateItemWidth();
    }
    onFocusOut(){
        this.cellMain.removeClass('focused');
        this.restoreItemWidth();
    }
    onEditHandler(){
        this.updateItemWidth();
        this.updateMathObj(this.mathObjKey);
    }
}