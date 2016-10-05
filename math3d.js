'use strict';

class Utility {
    static defaultVal(variable, defaultVal) {
        return typeof variable !== 'undefined' ? variable : defaultVal;
    }
    
    static detectObjectDifferences(a,b){
        // Returns keys that appear in the difference a - b
        // http://stackoverflow.com/a/31686152/2747370
        var diffKeys = _.reduce(a, function(result, value, key) {
            return _.isEqual(value, b[key]) ? result : result.concat(key);
        }, []);
        return diffKeys
    }

    static isPureObject(arg){
        // Test if something is an object. 
        // OK, [1,2,3] is an object in JS. I mean test if something is an object like {a:1,b:[1,2,3],c:{aa:5}}.
        return arg !== null && typeof arg === 'object' && !Array.isArray(arg)
    }

    static deepObjectDiff(a, b){
        var diff = {};
        var keys = Utility.detectObjectDifferences(a,b);
        for (var j=0; j < keys.length; j++){
            var key = keys[j];
            var aValue = a[key];
            var bValue = b[key];
            if ( Utility.isPureObject(aValue) && Utility.isPureObject(bValue) ){
                diff[key] = Utility.deepObjectDiff(aValue, bValue);
            }
            else {
                diff[key] = aValue;
            }
        }
        return diff
    }

    static deepCopyValuesOnly(obj){
        //Intended to help serialize objects with a getter named KEY that stores values in _KEY. 
        var deepCopy = {};
        for (var key in obj){
            if (key[0]=='_'){
                //In this case, the object should have a getter, but let's check
                var subkey = key.substring(1)
                if (obj[subkey] !== undefined && typeof Object.getOwnPropertyDescriptor(obj,subkey).get === 'function'){
                    key = subkey
                }
            }
            if ( deepCopy.hasOwnProperty(key) ){
                throw `Error: Input Object has both ${key} and _${key} properties.`
            }
            if (Utility.isPureObject(obj[key])){
                deepCopy[key] = Utility.deepCopyValuesOnly(obj[key]);
            } else {
                deepCopy[key] = obj[key];
            }
        }
        return deepCopy;
    }

    static getQueryString() {
        // modified from http://stackoverflow.com/a/979995/2747370
        var query_string = {};
        var query = window.location.search.substring(1);
        if (query === ""){
            return query_string
        }
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }
}

class Math3D {
    constructor(settings){
        this.swizzleOrder = Utility.defaultVal(settings.swizzleOrder, 'yzx');
        this.settings = this.setDefaults(settings);
    
        this.mathbox = this.initializeMathBox();
        this.scene = this.setupScene();
        this.updateRange();
    
        // Initial Drawing
        this.drawAxes();
        this.drawGrids();
        
        // Add getters and setters for updating after initial rendering
        this.settings = this.makeDynamicSettings();
        
        // create math scope
        this.mathScope = new WatchedScope(this.settings.mathScope)
        this.mathObjects = [] //onVariableChange checks mathObjects, so define it as empty for now.
        var onVariableChange = this.onVariableChange.bind(this);
        for (let key in this.settings.mathScope){
            let val = this.settings.mathScope[key];
            this.mathScope.addVariable(key, val, onVariableChange)
        }
        
        //Render math objects
        this.mathObjects = this.renderMathObjects();
    }
    
    setDefaults(settings){
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
            scale: [1, 1, 0.5],
            camera: {
                position: [-0.75,-1.5,0.25],
            },
            grids: {
                xy: true,
                xz: false,
                yz: false
            },
            axes: {
                'x': genDefaultAxisSettings.call(this,'x', 'x'),
                'y': genDefaultAxisSettings.call(this,'y', 'y'),
                'z': genDefaultAxisSettings.call(this,'z', 'z'),
            },
            mathScope:{
                'pi': Math.PI,
                'e': Math.E
            },
            wrappedMathObjects: []
        }
    
        function genDefaultAxisSettings(axisId, axisLabel) {        
            // swizzle: user ---> mathbox
            // double swizzle: mathbox ---> user
            var mathboxAxes = this.swizzle(this.swizzle({x:'x', y:'y', z:'z'}))
        
            if (axisId === 'z') {
                var tickLabelOffset = [20,0,0];
            } else {
                var tickLabelOffset = undefined;
            }
        
            var defaultAxisSettings = {
                axisLabel: axisLabel,
                labelOffset: [0,40,0],
                axis: {width:2, axis: mathboxAxes[axisId]},
                scale: {divide:10, nice:true, zero:false, axis: mathboxAxes[axisId] },
                ticks: {width:2},
                ticksFormat: {digits:2},
                ticksLabel: {offset:tickLabelOffset, visible:true}
            };
        
            return defaultAxisSettings
        }
    
        settings = _.merge({}, this.defaultSettings, settings);
    
        return settings
    }

    makeDynamicSettings(){
        var math3d = this;
        var dynamicSettings = {
            range: {},
            grids: {}
        }
    
        Object.defineProperties(dynamicSettings.range,{
            xMin: {
                set: function(val){ this._xMin = val; math3d.updateRange();},
                get: function(){ return this._xMin; }
            },
            xMax: {
                set: function(val){ this._xMax = val; math3d.updateRange(); math3d.updateAxisLabelPositions();},
                get: function(){ return this._xMax; }
            },
            yMin: {
                set: function(val){ this._yMin = val; math3d.updateRange();},
                get: function(){ return this._yMin; }
            },
            yMax: {
                set: function(val){ this._yMax = val; math3d.updateRange(); math3d.updateAxisLabelPositions(); },
                get: function(){ return this._yMax; }
            },
            zMin: {
                set: function(val){ this._zMin = val; math3d.updateRange();},
                get: function(){ return this._zMin; }
            },
            zMax: {
                set: function(val){ this._zMax = val; math3d.updateRange(); math3d.updateAxisLabelPositions(); },
                get: function(){ return this._zMax; }
            },
        })
    
        Object.defineProperties(dynamicSettings.grids,{
            xy: {
                set: function(val){ this._xy = val; math3d.scene.select('#xy-grid').set('visible',val);},
                get: function(){ return this._xy; }
            },
            xz: {
                set: function(val){ this._xz = val; math3d.scene.select('#xz-grid').set('visible',val);},
                get: function(){ return this._xz; }
            },
            yz: {
                set: function(val){ this._yz = val; math3d.scene.select('#yz-grid').set('visible',val);},
                get: function(){ return this._yz; }
            }
        })
    
        return _.merge(dynamicSettings, this.settings);
    
    }

    swizzle(arg, swizzleOrder){
        // similar to mathbox swizzle operator, but for regular arrays and objects.
        // Example: swizzle([1,2,3], 'zyx') = [3,2,1]
        swizzleOrder = Utility.defaultVal(swizzleOrder, this.swizzleOrder);
        if (Array.isArray(arg)){
            return swizzleArray(arg, swizzleOrder)
        }
        else {
            return swizzleObject(arg, swizzleOrder)
        }
        function swizzleArray(array, swizzleOrder){
            var keys = {'x':0, 'y': 1, 'z': 2, 'w':3}
            return swizzleOrder.split('').map(function(elem){return array[keys[elem]] })
        }
        function swizzleObject(object, swizzleOrder){
            var newObject = {};
            var oldKeys = ['x','y','z','w'];
            var newKeys = swizzleOrder.split('');
            for (var j=0; j < newKeys.length; j++){
                newObject[ oldKeys[j] ] = object[ newKeys[j] ];
            }
            return newObject
        }
    }

    initializeMathBox(){
        var settings = this.settings
    
        // if necessary, add a container for mathbox
        if ($("#"+settings.containerId).length === 0){
            settings.containerId = _.uniqueId();
            this.container = $("<div class='mathbox-container'></div>");
            this.container.attr('id',settings.containerId);
            $('body').append(this.container);
        } else {
            this.container = $("#"+settings.containerId)
            this.container.addClass('mathbox-container');
        }
    
        var plugins = ['core', 'cursor','controls'];
        var controls = {klass:THREE.OrbitControls};
        var mathbox = mathBox({
            plugins: plugins,
            controls: controls,
            element: this.container[0]
        });
    
        // setup camera
        mathbox.camera({
            proxy: true,
            position: this.swizzle(settings.camera.position),
        });
        mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    
        return mathbox;
    }

    setupScene(){
        var scene = this.mathbox
            .set({
                focus: this.settings.focus,
            })
            .cartesian({
                scale: this.swizzle(this.settings.scale)
            });
        
        return scene
    }

    drawAxes(){
    
        var axesGroup = this.scene.group().set('classes', ['axes-group']);
        drawSingleAxis.call(this, 'x');
        drawSingleAxis.call(this, 'y');
        drawSingleAxis.call(this, 'z');
    
        function drawSingleAxis(axisId){
            var axisSettings = this.settings.axes[axisId];
        
            var axisNums = {'x':0,'y':1,'z':2};
            var axisNum = axisNums[axisId];
            var labelPos = [0,0,0];
            labelPos[axisNum] = this.settings.range[axisId+'Max'];
            labelPos = this.swizzle(labelPos);
        
            axesGroup.group()
                .set('id','axis-' + axisId)
                .set('classes',['axis'])
                .axis(axisSettings.axis)
                .scale(axisSettings.scale)
                .ticks(axisSettings.ticks)
                .format(axisSettings.ticksFormat)
                .label(axisSettings.ticksLabel)
                .set('classes',['tick-labels'])
                .group()
                    .set('classes',['axis-label'])
                    .array({
                        data: [labelPos],
                        channels: 3,
                        live: false
                    })
                    .text({
                        data: [ axisSettings.axisLabel ],
                        weight: 'bold',
                    })
                    .label({
                        offset: axisSettings.labelOffset
                    })
                .end()
            .end();
        }
    }

    updateAxisLabelPositions(){
        var axisNums = {'x':0,'y':1,'z':2};
    
        for (var axisId in axisNums){
            var axisNum = axisNums[axisId];
            var labelPos = [0,0,0];
            labelPos[axisNum] = this.settings.range[axisId+'Max'];
            labelPos = this.swizzle(labelPos);
            this.scene.select("#axis-" + axisId + " .axis-label array").set('data', [labelPos]);
        }
    }

    updateRange(){
        var range = this.settings.range;
        this.scene.set("range", this.swizzle([
            [range.xMin, range.xMax],
            [range.yMin, range.yMax],
            [range.zMin, range.zMax]
        ]) );
    }

    drawGrids(){
        // TODO: enable drawing of other grids
        var divX = 10;
        var divY = divX * this.settings.scale[1]/this.settings.scale[0]
        var divZ = divZ * this.settings.scale[2]/this.settings.scale[0]
    
        var trueAxes = this.swizzle(this.swizzle({x:'x', y:'y', z:'z'}))
    
        var grids = this.scene.group()
            .set('classes',['grids']);
        
        grids.grid({
            id: 'xy-grid',
            axes: [trueAxes.x, trueAxes.y],
            width: 1,  
            divideX: divX,
            divideY: divY,
            opacity:0.5,
            visible:this.settings.grids.xy
        });
        
        grids.grid({
            id: 'xz-grid',
            axes: [trueAxes.x, trueAxes.z],
            width: 1,
            divideX: divX,
            divideY: divZ,
            opacity:0.5,
            visible:this.settings.grids.xz
        });

        grids.grid({
            id: 'yz-grid',
            axes: [trueAxes.y, trueAxes.z],
            width: 1,
            divideX: divY,
            divideY: divZ,
            opacity:0.5,
            visible:this.settings.grids.yz
        });
    
    }
    
    renderMathObjects(){
        var mathObjects = [];
        while (this.settings.wrappedMathObjects.length>0){
            // shift pops and returns first value
            var metaObj = this.settings.wrappedMathObjects.shift();
            var mathObj = MathObject.renderNewObject(this, metaObj);
            mathObjects.push(mathObj);
        }
        return mathObjects;
    }
    
    onVariableChange(varName){
        // update objects where the variables have changed
        _.forEach( this.mathObjects, function(obj, idx){
            if ( _.contains( obj.parsedExpression.variables, varName) ||  _.contains( obj.parsedExpression.functions, varName) ){
                obj.recalculateData();
            }
        })
    }
    
    serialize(settings){
        settings = Utility.defaultVal(settings, this.settings);
        // copy settings values, no setters and getters
        var rawSettings = Utility.deepCopyValuesOnly(this.settings)
        // camera is a THREE js Vec3 object
        var camera = this.mathbox.three.camera.position;
        // Round camera positions to keep encoded settings small.
        rawSettings.camera.position = [camera.x, camera.y, camera.z].map( function(x){return Math.round(x*1000)/1000; } );
        rawSettings.camera.position = this.swizzle(this.swizzle(rawSettings.camera.position));
        // add math objects
        _.forEach(this.mathObjects, function(mathObj){
            rawSettings.wrappedMathObjects.push( mathObj.serialize() )
        })
        return JSON.stringify(Utility.deepObjectDiff(rawSettings,this.defaultSettings));
    }
    
    saveSettingsAsURL(settings){
        settings = Utility.defaultVal(settings, this.settings);
        var settingsDiff64 = window.btoa( this.serialize(settings) );
        var url = window.location.href.split('?')[0] + "?settings=" + settingsDiff64;
        console.log(url)
        return url
    }
    
    static decodeSettingsAsURL64(encodedSettings){
        var settings = JSON.parse(window.atob(encodedSettings))
        
        _.forEach(settings.wrappedMathObjects, function(wrappedMathObj, idx){
            settings.wrappedMathObjects[idx] = JSON.parse(wrappedMathObj);
        })
        
        return settings
    }
}

class WatchedScope{
    //An object where each property is watched for change
    constructor(){
    }
    
    addVariable(key, val, onChangeFunction){
        // onChangeFunction = Utility.defaultVal(onChangeFunction, function(a, b){console.log(`Variable ${a} now has value ${b}`)})
        Object.defineProperty(this, key, {
            get: function(){return this['_'+key];},
            set: function(val){
                this['_'+key] = val;
                onChangeFunction(key, val);
            }
        })
        this[key] = val
    }
    
    removeVariable(key){
        delete this["_"+key];
        delete this[key];
    }

    serialize(){
        var rawSettings = Utility.deepCopyValuesOnly(this)
        return JSON.parse(rawSettings);
    }

}

class MathExpression {
    // Holds data for math expressions.
    constructor(expression, scope){
        // store initial representation
        this.expression = expression;
        this.variables = []
        this.functions = []
        
        var parsed = math.parse(expression);
        parsed.traverse(function(node){
            if (node.type === 'SymbolNode'){ this.variables.push(node.name); }
            if (node.type === 'FunctionNode'){ this.functions.push(node.name); }
        }.bind(this))
        
        
        if (expression[0]=="["){
            this.eval = function(customScope){
                customScope = Utility.defaultVal(customScope, scope);
                return parsed.compile().eval(customScope).toArray();
            }
        } else {
            this.eval() = function(customScope){
                customScope = Utility.defaultVal(customScope, scope);
                return parsed.compile().eval(scope);
            }
        }

    }
}

// Abstract
class MathObject {
    constructor(math3d, settings){
        /*Guidelines:
            this.settings: 
                should only contain information intended for serialization.
                if MEOW is a getter/setter, store associated value in _MEOW
        */
        this.math3d = math3d;
        
        //Every abstract sublcass should define these
        this.mathboxGroup = null; 
        this.mathboxDataType = null; // e.g., 'array'
        this.mathboxRenderType = null; // e.g., 'point'
        
        this.settings = {};
        this.defaultSettings = {
            visible: true,
            color: '#3090FF',
        };
        
        var _this = this;
        Object.defineProperties(this.settings,{
            rawExpression: {
                set: function(val){
                    _this.parsedExpression = _this.parseRawExpression(val);
                    _this.recalculateData();
                },
                get: function(){return this._userData;},
            },
            color: {
                set: function(val){
                    this._color = val;
                    if (_this.mathboxGroup !== null){
                        _this.setColor(val);
                    }
                },
                get: function(){return this._color;},
            },
            visible: {
                set: function(val){
                    this._visible = val;
                    if (_this.mathboxGroup !== null){
                        _this.setVisible(val);
                    }
                },
                get: function(){return this._visible;},
            },
            size: {
                set: function(val){
                    this._size = val;
                    if (_this.mathboxGroup !== null){
                        _this.setSize(val);
                    }
                },
                get: function(){return this._size;},
            },
            width: {
                set: function(val){
                    this._width = val;
                    if (_this.mathboxGroup !== null){
                        _this.setWidth(val);
                    }
                },
                get: function(){return this._width;},
            },
            range: {
                set: function(val){
                    this._range = val;
                    _this.setRange(val);
                },
                get: function(){return this._range;},
            },
            samples: {
                set: function(val){
                    this._samples = val;
                    _this.setSamples(val);
                },
                get: function(){return this._samples;},
            },
        });
        
    };
    
    setDefaults(settings){
        _.merge(this.settings, this.defaultSettings, settings);
        return this.settings;
    }
    
    parseRawExpression(expr){
        return new MathExpression(expr, this.math3d.mathScope);
    }
    
    //Define this for every subclass
    recalculateData(){}
    
    get data() {return this._data;}
    set data(val) {
        this._data = val; 
        if (this.mathboxGroup !== null){
            this.setData(val);
        };
    }
    
    setData(val){
        this.mathboxGroup.select(this.mathboxDataType).set("data",val);
    }
    
    setColor(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("color",val);
    }
    
    setVisible(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("visible",val);
    }
    
    setWidth(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("width",val);
    }
    
    setRange(val){
        this.range = this.parseRawExpression(val).eval();
        this.recalculateData();
    }
    
    setSamples(val){
        this.recalculateData();
    }
    
    serialize(){
        // copy settings values, no setters and getters
        var rawSettings = Utility.deepCopyValuesOnly(this.settings)
        var metaObj = {
            type: this.constructor.name,
            settings: Utility.deepObjectDiff(rawSettings, this.defaultSettings)
        }
        // Our object setters store values in properties prefixed with '_'. Let's remove the underscores.
        return JSON.stringify(metaObj);
    };
    
    static renderNewObject(math3d, metaObj) {
        if (metaObj.type === 'MathObject'){
            return new MathObject(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Point'){
            return new Point(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Line'){
            return new Line(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ParametricCurve'){
            return new ParametricCurve(math3d, metaObj.settings)
        };
    }
}

class Point extends MathObject {
    constructor(math3d, settings){
        super(math3d, settings);
        this.mathboxDataType = 'array';
        this.mathboxRenderType = 'point';
        
        _.merge(this.defaultSettings, {
            rawExpression: "[[0,0,0]]",
            size: 12,
        });
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
    
    recalculateData(){
        this.data = this.parsedExpression.eval();
    }
    
    render(){
        var group = this.math3d.scene.group().set('classes', ['point']);
        
        var point = group.array({
            data: this.data,
            live:true,
            items: 1,
            channels: 3,
        }).swizzle({
          order: this.math3d.swizzleOrder
        }).point({
            color: this.settings.color,
            size: this.settings.size,
            visible: this.settings.visible,
        });
        
        return group;
    }
    
}

class AbstractCurve extends MathObject {
    constructor(math3d, settings){
        super(math3d, settings);
        this.mathboxDataType = 'array';
        this.mathboxRenderType = 'line';
        
        _.merge(this.defaultSettings,{
            width: 4,
            start: false,
            end: false
        })
        
    }
    
    recalculateData(){
        this.data = this.parsedExpression.eval();
    }
    
    render(){
        var group = this.math3d.scene.group().set('classes', ['curve']);
        
        group.array({
            data: this.data,
            live:true,
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
        });
        
        return group;
    }
    
}

class Line extends AbstractCurve {
    constructor(math3d, settings){
        super(math3d, settings);
        _.merge(this.defaultSettings, {
            rawExpression: "[[0,0,0],[pi,0,0],[pi,pi,0],[0,pi,0]]",
        })
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
}

class Vector extends AbstractCurve {
    constructor(math3d, settings){
        super(math3d, settings);
        _.merge(this.defaultSettings, {
            rawExpression: "[[0,0,0],[pi,0,0],[pi,pi,0],[0,pi,0]]",
            end:true,
            size:6,
        })
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
}

class ParametricCurve extends AbstractCurve{
    constructor(math3d, settings){
        super(math3d, settings);
        
        _.merge(this.defaultSettings, {
            parameter:'t',
            rawExpression: "[cos(t),sin(t),t]",
            range: "[-2*pi,2*pi]",
            samples:64,
        });
        
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
    
    recalculateData(){
        if (this.settings.samples === undefined || this.range === undefined){
            return
        }
        // TODO This is probably slow, we're evaluating every variable in the parametric function. Can we get a single-variable function first?
        
        var scope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
        var t = this.settings.parameter;
        
        var t1 = this.range[0];
        var dt = (this.range[1] - this.range[0])/(this.settings.samples);
        var expr = this.parsedExpression;
        
        this.data = Array(this.settings.samples).fill(0).map(function(val, idx){
            scope[t] = t1 + idx*dt;
            return expr.eval(scope);
        })
        
        var t_old = scope[t];
        
        // this.data = [[0,0,0],[1,0,0]]
    }
    
}

// TODO: Rewrite parametric curve grapher to generate array by evaluating a single-variable function.