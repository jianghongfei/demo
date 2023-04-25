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
var Konva;
(function (Konva) {
    var Group = /** @class */ (function () {
        function Group(config) {
        }
        Group.prototype.add = function (node) {
        };
        Group.prototype.getAttr = function (attr) {
        };
        Group.prototype.setAttr = function (attr, value) {
        };
        Group.prototype.on = function (event, callback) {
        };
        return Group;
    }());
    Konva.Group = Group;
    var Rect = /** @class */ (function () {
        function Rect(config) {
        }
        Rect.prototype.setAttrs = function (attributes) {
        };
        return Rect;
    }());
    Konva.Rect = Rect;
    var Shape = /** @class */ (function () {
        function Shape(config) {
        }
        Shape.prototype.add = function (node) {
        };
        Shape.prototype.getAttr = function (attr) {
        };
        Shape.prototype.setAttr = function (attr, value) {
        };
        Shape.prototype.on = function (event, callback) {
        };
        return Shape;
    }());
    Konva.Shape = Shape;
})(Konva || (Konva = {}));
(function (Konva) {
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
            _this.FillLight = "#ffa500"; // Color of an on segment
            _this.FillDark = "#e7e7e7"; // Color of an off segment
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
