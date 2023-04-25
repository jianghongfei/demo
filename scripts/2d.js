let draggable = false;

(function (Konva) {
  var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  })();

  var ElementArray = /** @class */ (function () {
    function ElementArray(count) {
        this.NullMask = 0x10;
        this.count = count || 0;
    }
    Object.defineProperty(ElementArray.prototype, "count", {
        set: function (count) {
            this.Elements = [count];
            for (var i = 0; i < count; i++) {
                this.Elements[i] = 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    ElementArray.prototype.setText = function (value, charMaps) {
        // Get the string of the value passed in
        if (value === null) {
            value = "";
        }
        // Clear the elements
        for (var i = 0; i < this.Elements.length; i++) {
            this.setValue(i, 0);
        }
        if (value.length === 0) {
            return;
        }
        // Set the bitmask to dispay the proper character for each element
        for (var e = 0; e < this.Elements.length && e < value.length; e++) {
            var c = value[e];
            var mask = charMaps[c];
            // Use blank of there is no bitmask for this character
            if (mask === null || mask === undefined) {
                mask = this.NullMask;
            }
            this.setValue(e, mask);
        }
    };
    ElementArray.prototype.setValue = function (i, value) {
        if (i >= 0 && i < this.Elements.length) {
            this.Elements[i] = value;
        }
    };
    return ElementArray;
}());
var Led = /** @class */ (function (_super) {
    __extends(Led, _super);
    function Led(config) {
        var _this = _super.call(this, config) || this;
        _this.SegmentWidth = 0.16; // Width of segments (% of Element Width)
        _this.SegmentInterval = 0.05; // Spacing between segments (% of Element Width)
        _this.BevelWidth = 0.06; // Size of corner bevel (% of Element Width)
        _this.SideBevelEnabled = false; // Should the sides be beveled
        _this.FillLight = "#090909"; // Color of an on segment
        _this.FillDark = "#e0e0e0"; // Color of an off segment
        _this.StrokeLight = "#007700"; // Color of an on segment outline
        _this.StrokeDark = "#440044"; // Color of an off segment outline
        _this.StrokeWidth = 0; // Width of segment outline
        _this.Padding = 10; // Padding around the display
        _this.Spacing = 10; // Spacing between elements
        _this.X = 0; // Starting position on the canvas
        _this.Y = 0;
        _this.Width = 200; // Default size of the display
        _this.Height = 100;
        return _this;
    }
    Led.prototype._sceneFunc = function (context) {
        // Recalculate points in case any settings changed
        this.calcPoints();
        if (!this.Points) {
            return;
        }
        // Set the display patterns and draw the canvas
        var elements = new ElementArray(parseInt(this.getAttr('count')));
        elements.setText(this.text(), Led.masks);
        // Calculate the width and spacing of each element
        var elementWidth = this.calcElementDimensions().Width;
        // // Offset to adjust for starting point and padding
        // context.translate(this.X, this.Y);
        // context.translate(this.Padding, this.Padding);
        // Draw each segment of each element
        for (var _i = 0, _a = elements.Elements; _i < _a.length; _i++) {
            var element = _a[_i];
            for (var s = 0; s < this.Points.length; s++) {
                // Pick the on or off color based on the bitmask
                var color = (element & 1 << s) ? this.FillLight : this.FillDark;
                var stroke = (element & 1 << s) ? this.StrokeLight : this.StrokeDark;
                context.lineWidth = this.StrokeWidth;
                context.strokeStyle = stroke;
                context.fillStyle = color;
                context.beginPath();
                context.moveTo(this.Points[s][0].x, this.Points[s][0].y);
                // Create the segment path
                for (var p = 1; p < this.Points[s].length; p++) {
                    context.lineTo(this.Points[s][p].x, this.Points[s][p].y);
                }
                context.closePath();
                context.fill();
                if (this.StrokeWidth > 0) {
                    context.stroke();
                }
            }
            context.translate(elementWidth + this.Spacing, 0);
        }
        context.restore();
    };
    Led.prototype.text = function (value) {
        if (!arguments.length) {
            return this.getAttr('text');
        }
        this.setAttr('text', value);
    };
    Led.prototype.count = function (value) {
        if (!arguments.length) {
            return this.getAttr('count');
        }
        this.setAttr('count', value);
    };
    Led.prototype.calcPoints = function () {
        var d = this.calcElementDimensions(), w = d.Width, h = d.Height, sw = this.SegmentWidth * w, si = this.SegmentInterval * w, bw = this.BevelWidth * sw, br = bw / sw, ib = (this.SideBevelEnabled) ? 1 : 0, sf = sw * .8, slope = h / w, sqrt2 = Math.SQRT2, sqrt3 = Math.sqrt(3);
        // Calculate Points[][] for all 7 segments
        var A = 0, B = 1, C = 2, D = 3, E = 4, F = 5, G = 6;
        var points = [];
        points[A] = [
            { x: sw * br * 2 + si / sqrt2, y: 0 },
            { x: w - sw * br * 2 - si / sqrt2, y: 0 },
            { x: w - sw * br - si / sqrt2, y: sw * br },
            { x: w - sw - si / sqrt2, y: sw },
            { x: sw + si / sqrt2, y: sw },
            { x: sw * br + si / sqrt2, y: sw * br }
        ];
        points[B] = [
            { x: w, y: sw * br * 2 + si / sqrt2 },
            { x: w, y: h / 2 - si * .5 },
            { x: w - sw / 2, y: h / 2 - si * .5 },
            { x: w - sw, y: h / 2 - sw / 2 - si * .5 },
            { x: w - sw, y: sw + si / sqrt2 },
            { x: w - sw * br, y: sw * br + si / sqrt2 }
        ];
        points[G] = [
            { x: sw + si / 2 * sqrt3, y: h / 2 - sw / 2 },
            { x: w - sw - si / 2 * sqrt3, y: h / 2 - sw / 2 },
            { x: w - sw / 2 - si / 2 * sqrt3, y: h / 2 },
            { x: w - sw - si / 2 * sqrt3, y: h / 2 + sw / 2 },
            { x: sw + si / 2 * sqrt3, y: h / 2 + sw / 2 },
            { x: sw / 2 + si / 2 * sqrt3, y: h / 2 }
        ];
        points[C] = this.flipVertical(points[B], h);
        points[D] = this.flipVertical(points[A], h);
        points[E] = this.flipHorizontal(points[C], w);
        points[F] = this.flipHorizontal(points[B], w);
        this.Points = points;
    };
    Led.prototype.calcElementDimensions = function () {
        var n = parseInt(this.getAttr('count'));
        var h = this.Height;
        h -= this.Padding * 2;
        var w = this.Width;
        w -= this.Spacing * (n - 1);
        w -= this.Padding * 2;
        w /= n;
        return { Width: w, Height: h };
    };
    Led.prototype.flipVertical = function (points, height) {
        var flipped = [];
        for (var i = 0; i < points.length; i++) {
            flipped[i] = {};
            flipped[i].x = points[i].x;
            flipped[i].y = height - points[i].y;
        }
        return flipped;
    };
    Led.prototype.flipHorizontal = function (points, width) {
        var flipped = [];
        for (var i = 0; i < points.length; i++) {
            flipped[i] = {};
            flipped[i].x = width - points[i].x;
            flipped[i].y = points[i].y;
        }
        return flipped;
    };
    Led.masks = {
        ' ': parseInt("0000000", 2),
        '': parseInt("0000000", 2),
        '0': parseInt("0111111", 2),
        '1': parseInt("0000110", 2),
        '2': parseInt("1011011", 2),
        '3': parseInt("1001111", 2),
        '4': parseInt("1100110", 2),
        '5': parseInt("1101101", 2),
        '6': parseInt("1111101", 2),
        '7': parseInt("0000111", 2),
        '8': parseInt("1111111", 2),
        '9': parseInt("1100111", 2),
        'A': parseInt("1110111", 2),
        'B': parseInt("1111111", 2),
        'C': parseInt("0111001", 2),
        'D': parseInt("0111111", 2),
        'E': parseInt("1111001", 2),
        'F': parseInt("1110001", 2),
        'G': parseInt("1111101", 2),
        'H': parseInt("1110110", 2),
        'I': parseInt("0000110", 2),
        'J': parseInt("0011110", 2),
        'K': parseInt("1110000", 2),
        'L': parseInt("0111000", 2),
        'M': parseInt("0110111", 2),
        'N': parseInt("0110111", 2),
        'O': parseInt("0111111", 2),
        'P': parseInt("1110011", 2),
        'Q': parseInt("0111111", 2),
        'R': parseInt("1110111", 2),
        'S': parseInt("1101101", 2),
        'T': parseInt("0000111", 2),
        'U': parseInt("0111110", 2),
        'V': parseInt("0111110", 2),
        'W': parseInt("0111110", 2),
        'X': parseInt("1110000", 2),
        'Y': parseInt("1110010", 2),
        'Z': parseInt("1011011", 2),
        '-': parseInt("1000000", 2)
    };
    return Led;
}(Konva.Shape));
Konva.Led = Led;
  var Range = /** @class */ (function (_super) {
    __extends(Range, _super);
    function Range(config) {
      var _this = _super.call(this, config) || this;
      _this.init();
      _this.on(['background', 'foreground', 'min', 'max', 'value'].map(function (o) { return o + 'Change'; }).join(' '), _this.update);
      return _this;
    }
    Range.prototype.min = function (value) {
      if (!arguments.length) {
        return this.getAttr('min');
      }
      this.setAttr('min', value);
    };
    Range.prototype.max = function (value) {
      if (!arguments.length) {
        return this.getAttr('max');
      }
      this.setAttr('max', value);
    };
    Range.prototype.value = function (value) {
      if (!arguments.length) {
        return this.getAttr('value');
      }
      this.setAttr('value', value);
    };
    Range.prototype.foreground = function (value) {
      if (!arguments.length) {
        return this.getAttr('foreground');
      }
      this.setAttr('foreground', value);
    };
    Range.prototype.background = function (value) {
      if (!arguments.length) {
        return this.getAttr('background');
      }
      this.setAttr('background', value);
    };
    Range.prototype.checkValue = function () {
      var value = this.value();
      if (value > this.max()) {
        value = this.max();
      }
      if (value < this.min()) {
        value = this.min();
      }
      return value;
    };
    Range.prototype.init = function () {
      var background = new Konva.Rect({
        width: 100,
        height: 100,
        fill: this.background(),
      });
      var value = this.checkValue();
      var height = 100 * value / (this.max() - this.min());
      this.indicator = new Konva.Rect({
        width: 100,
        height: height,
        y: 100 - height,
        fill: this.foreground(),
      });
      this.add(background);
      this.add(this.indicator);
    };
    Range.prototype.update = function () {
      var value = this.checkValue();
      var height = 100 * value / (this.max() - this.min());
      this.indicator.setAttrs({
        height: height,
        y: 100 - height
      });
    };
    return Range;
  }(Konva.Group));
  Konva.Range = Range;
})(Konva || (Konva = {}));

let model = {
  version: '0.0.1',
  author: 'Jiang Hongfei',
  style: {
    pipe: {
      background: {
        stroke: 'orange',
        strokeWidth: 14,
        lineCap: 'round',
        lineJoin: 'round'
      },
      foreground: {
        stroke: 'green',
        strokeWidth: 10,
        lineCap: 'round',
        lineJoin: 'round',
        dash: [30, 30]
      }
    },
    pipe2: {
      foreground: {
        stroke: 'green',
        strokeWidth: 6,
        lineCap: 'round',
        lineJoin: 'round',
        dash: [30, 30]
      }
    },
    pipe3: {
      foreground: {
        stroke: '#4990e24f',
        strokeWidth: 20,
        lineCap: 'round',
        lineJoin: 'round',
        dash: [30, 40]
      }
    },
  },
  components: [
    { type: 'image', position: [100, 200, 0], rotation: [20, 0, 0], scale: [1, 1, 1], src: '../images/gear.gif' },
    { type: 'image', position: [300, 300, 0], rotation: [0, 0, 0], scale: [1, 1, 1], src: 'data:image/gif;base64,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' },
    {
      type: 'group', position: [100, 500, 0], rotation: [0, 0, 0], scale: [1, 1, 1], tooltip: 'Hello, tooltip', components: [
        { type: 'image', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], src: '../images/bg.png' },
        { type: 'range', id: 'thermometer', min: 0, max: 100, value: 10, foreground: '#ff492f80', position: [266, 7, 0], scale: [0.1, 1.2, 0] },
        { type: 'image', id: 'faucet_1', position: [160, 45, 0], rotation: [0, 0, 0], scale: [0.5, 0.5, 1], offset: [64, 64], src: '../images/faucet_1.png' },
        { type: 'line', id: 'pointer', position: [603, 178, 0], offset: [2, 12], fill: 'red', closed: true, strokeWidth: 0, points: [2, 0, 4, 12, 0, 12] },
        { type: 'path', class: 'pipe2 foreground', position: [0, 0, 0], style: { dashOffset: 0 }, animation: 'pipe.flow', data: 'M188.37,409.43h189.9a11,11,0,0,0,11-11v-46.1' },
        { type: 'path', class: 'pipe3 foreground', position: [0, 0, 0], style: { dashOffset: 0 }, animation: 'pipe.flow', data: 'M391.9,184.9V98.25a26.69,26.69,0,0,1,26.69-26.68h23.35a26.69,26.69,0,0,1,26.69,26.68V375.4a56,56,0,0,0,56,56H806.9' },
        { type: 'led', id: 'led', position: [600, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], text: "0001", count: 4},
      ]
    },
    {
      type: 'group', position: [100, 100, 0], rotation: [0, 0, 0], scale: [1, 1, 1], tooltip: 'Hello, tooltip', components: [
        { type: 'line', class: 'pipe background', points: [10, 70, 100, 70, 140, 23, 250, 60, 300, 20] },
        { type: 'line', class: 'pipe background', points: [10, 140, 100, 140, 100, 70, 140, 23, 140, 100, 400, 100] },
        { type: 'line', class: 'pipe foreground', dashOffset: 0, points: [10, 70, 100, 70, 140, 23, 250, 60, 300, 20], animation: 'pipe.flow' },
        { type: 'line', class: 'pipe foreground', dashOffset: 10, points: [10, 140, 100, 140, 100, 70, 140, 23, 140, 100, 400, 100], animation: 'pipe.flow' },
      ]
    }],
  links: [

  ],
  bindings: [

  ]
};

let xsom = {
  animations: {
    pipe: {
      flow: function (line) {
        var offset = line.dashOffset();
        return function () {
          offset++; line.dashOffset(-offset);
        }
      }
    }
  }
};

var stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight
});

var bind;

(function (model) {
  var shapesLayer = new Konva.Layer();
  var tooltipLayer = new Konva.Layer();

  bind = function (model) {
    model.visual.on("mousemove", e => {
      if (model.tooltip) {
        var position = stage.getPointerPosition();
        showTooltip({ x: position.x + 10, y: position.y + 10 }, model.tooltip);
      }
    });

    model.visual.on("mouseout", hideTooltip);
  };

  var scheduled = [];

  if (model.components) {
    for (const component of model.components) {
      drawComponent(shapesLayer, model.style, xsom.animations, scheduled, component);
    }
  }

  // add the layer to the stage
  stage.add(shapesLayer);

  var tooltip = new Konva.Text({
    text: "",
    fontFamily: "Calibri",
    fontSize: 12,
    padding: 5,
    textFill: "white",
    fill: "black",
    alpha: 0.75,
    visible: false
  });

  tooltipLayer.add(tooltip);

  stage.add(tooltipLayer);

  function showTooltip(position, text) {
    tooltip.position(position);
    tooltip.text(text);
    tooltip.show();

    tooltipLayer.batchDraw();
  };

  function hideTooltip() {
    tooltip.hide();
    tooltipLayer.draw();
  };

  // one revolution per 4 seconds
  let anim = new Konva.Animation(function (frame) {
    for (const animation of scheduled) {
      animation();
    }
  }, shapesLayer);

  anim.start();
})(model);

function drawComponent(layer, styles, animations, scheduled, component) {
  let config = getCommonConfig(styles, component);

  let visual;
  if (component.type === 'group') {
    visual = drawGroup(styles, animations, scheduled, component, config);
  } else if (component.type === 'range') {
    visual = drawRange(component, config);
  } else if (component.type === 'image') {
    visual = drawImage(layer, component, config);
  } else if (component.type === 'line') {
    visual = drawLine(config);
  } else if (component.type === 'path') {
    visual = drawPath(config);
  } else if (component.type === 'led') {
    visual = drawLed(config);
  } else {
    throw new Error(`Unknown type ${component.type}`);
  }

  if (visual) {
    layer.add(visual);
    component.visual = visual;
    bind(component);

    if (component.animation) {
      let animation = component.animation.split('.').reduce((o, i) => o[i], animations);
      if (animation) {
        scheduled.push(animation(visual));
      }
    }
  }
}

function drawGroup(styles, animations, scheduled, component, config) {
  let group = new Konva.Group(config);

  styles = mergeStyles(styles, component.style);

  for (const c of component.components) {
    drawComponent(group, styles, animations, scheduled, c);
  }
  return group;
}

function drawRange(component, config) {
  // var group = new Konva.Group(config);

  // var background = new Konva.Rect({
  //   width: 100,
  //   height: 100,
  //   fill: component.background,
  // });

  // var height = 100 * component.value / (component.max - component.min);
  // var front = new Konva.Rect({
  //   width: 100,
  //   height: height,
  //   y: 100 - height,
  //   fill: component.foreground,
  // });

  // group.add(background);
  // group.add(front);

  // return group;

  var range = new Konva.Range(config);

  return range;
}

function drawImage(layer, component, config) {
  let image = new Konva.Image(config);
  // layer.add(image);

  if (typeof component.src === 'string' && component.src.indexOf('gif') >= 0) {
    let canvas = document.createElement('canvas');
    gifler(component.src)
      .frames(canvas, (ctx, frame) => {
        // update canvas size
        canvas.width = frame.width;
        canvas.height = frame.height;
        // update canvas that we are using for Konva.Image
        ctx.drawImage(frame.buffer, 0, 0);
        // redraw the layer
        layer.draw();
      });

    image.image(canvas);
    // draw resulted canvas into the stage as Konva.Image
  } else {
    var img = new Image();
    img.onload = () => {
      image.image(img);
      layer.draw();
    };
    img.src = component.src;
  }

  return image;
}

function drawLine(config) {
  let line = new Konva.Line(config);

  return line;
}

function drawPath(config) {
  let path = new Konva.Path(config);

  return path;
}

function drawLed(config) {
  let led = new Konva.Led(config);

  return led;
}

function getCommonConfig(styles, component) {

  let style = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    offset: [0, 0, 0]
  };
  if (component['class']) {
    style = mergeStyles(style, component['class'].split(' ').reduce((o, i) => o[i], styles));
  }

  style = mergeStyles(style, component.style || {}, component);
  let { id, position: [x, y], rotation: [rotation], scale: [sx, sy], offset: [ox, oy], type, tooltip, components, ...rest } = style;
  return { ...rest, id, x, y, rotation, scale: { x: sx, y: sy }, offset: { x: ox, y: oy } };
}

function mergeStyles(...styles) {
  return styles.filter(o => !!o).reduce((previous, current) => mergeDeep(previous, current))

  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  function mergeDeep(target, source) {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = mergeDeep(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
}

function toggle() {
  draggable = !draggable;

  for (const node of model.nodes) {
    if (node.visual) {
      node.visual.setDraggable(draggable);
    }
  }
}

function turnoff() {
  var faucet_1 = stage.findOne('#faucet_1');
  faucet_1.rotate(45);

  let pointer = stage.findOne('#pointer');
  pointer.rotate(45);

  let thermometer = stage.findOne('#thermometer');

  let old = thermometer.value();
  thermometer.value(old + 10);

  let led = stage.findOne('#led');
  let value = parseInt(led.text());
  led.text((value + 1).toString().padStart(4, '0'));
}
