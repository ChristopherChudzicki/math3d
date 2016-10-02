'use strict';

function defaultVal(variable, defaultVal) {
    return typeof variable !== 'undefined' ? variable : defaultVal;
}

class Math3D {
    constructor(settings){
        this.swizzleOrder = defaultVal(settings.swizzleOrder, 'yzx');
        this.settings = this.sanitizeSettings(settings);
    
    
        this.mathbox = this.initializeMathBox();
        this.scene = this.setupScene();
        this.updateRange();
    
        // Initial Drawing
        this.drawAxes();
        this.drawGrids();
    
        this.settings = this.makeDynamicSettings();
    }
    
    sanitizeSettings(settings){
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
            }
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
        swizzleOrder = defaultVal(swizzleOrder, this.swizzleOrder);
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
    
}

Math3D.prototype.color = 'gold'

class MathObject {
    constructor(){};
    
    serialize(){
        var metaObj = {
            type: this.constructor.name,
            obj: this
        }
        return JSON.stringify(metaObj).replace(new RegExp(/_/, 'g'), '');
    };
}

MathObject.deserialize = function(serializedObj){
        var metaObj = JSON.parse(serializedObj);
        if (metaObj.type === 'MathObject'){
            return new MathObject(metaObj.obj)
        }
        if (metaObj.type === 'Point'){
            return new Point(metaObj.obj)
        }
    }

class Point extends MathObject {
    constructor(settings){
        super();
        Object.defineProperties(this,{
            x: {
                set: function(val){this._x = val; console.log(`Setting x to value ${val}`);},
                get: function(){return this._x;},
            },
            y: {
                set: function(val){this._y = val; console.log(`Setting y to value ${val}`);},
                get: function(){return this._y;},
            }
        });
        
        this.x = settings.x;
        this.y = settings.y;
    }
    
}