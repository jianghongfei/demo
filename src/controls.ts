namespace Konva {
  export class Group {
    constructor(config) {

    }

    add(node: any) {

    }

    getAttr(attr: string): any {

    }

    setAttr(attr: string, value) {

    }

    on(event: string, callback: (e) => any) {

    }

  }

  export class Rect {
    constructor(config) {

    }
    setAttrs(attributes: any) {

    }
  }

  export class Shape {
    constructor(config) {

    }

    add(node: any) {

    }

    getAttr(attr: string): any {

    }

    setAttr(attr: string, value) {

    }

    on(event: string, callback: (e) => any) {

    }
  }
}

namespace Konva {
  class ElementArray {
    private NullMask: number = 0x10;

    Elements: number[];

    constructor(count?: number) {
      this.count = count || 0;
    }

    set count(count: number) {
      this.Elements = [count];
      for (let i = 0; i < count; i++) {
        this.Elements[i] = 0;
      }
    }

    setText(value: string, charMaps: { [key: string]: number }) {
      // Get the string of the value passed in
      if (value === null) {
        value = "";
      }

      // Clear the elements
      for (let i = 0; i < this.Elements.length; i++) {
        this.setValue(i, 0);
      }
      if (value.length === 0) {
        return;
      }

      // Set the bitmask to dispay the proper character for each element
      for (let e = 0; e < this.Elements.length && e < value.length; e++) {
        const c = value[e];
        let mask = charMaps[c];
        // Use blank of there is no bitmask for this character
        if (mask === null || mask === undefined) {
          mask = this.NullMask;
        }
        this.setValue(e, mask);
      }
    }

    setValue(i: number, value: number) {
      if (i >= 0 && i < this.Elements.length) {
        this.Elements[i] = value;
      }
    }
  }

  export class Led extends Konva.Shape {
    SegmentWidth = 0.16;           // Width of segments (% of Element Width)
    SegmentInterval = 0.05;        // Spacing between segments (% of Element Width)
    BevelWidth = 0.06;             // Size of corner bevel (% of Element Width)
    SideBevelEnabled = false;      // Should the sides be beveled
    FillLight = "#ffa500";         // Color of an on segment
    FillDark = "#e7e7e7";          // Color of an off segment
    StrokeLight = "#007700";       // Color of an on segment outline
    StrokeDark = "#440044";        // Color of an off segment outline
    StrokeWidth = 0;               // Width of segment outline
    Padding = 10;                  // Padding around the display
    Spacing = 10;                  // Spacing between elements
    X = 0;                         // Starting position on the canvas
    Y = 0;
    Width = 200;                   // Default size of the display
    Height = 100;
    Points: Array<{ x: number, y: number }[]>;

    static readonly masks = {
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

    constructor(config) {
      super(config);
    }

    _sceneFunc(context) {
      // Recalculate points in case any settings changed
      this.calcPoints();

      if (!this.Points) {
        return;
      }

      // Set the display patterns and draw the canvas
      let elements = new ElementArray(parseInt(this.getAttr('count')));
      elements.setText(this.text(), Led.masks);

      // Calculate the width and spacing of each element
      const elementWidth = this.calcElementDimensions().Width;

      // // Offset to adjust for starting point and padding
      // context.translate(this.X, this.Y);
      // context.translate(this.Padding, this.Padding);

      // Draw each segment of each element
      for (const element of elements.Elements) {
        for (let s = 0; s < this.Points.length; s++) {
          // Pick the on or off color based on the bitmask
          const color = (element & 1 << s) ? this.FillLight : this.FillDark;
          const stroke = (element & 1 << s) ? this.StrokeLight : this.StrokeDark;
          context.lineWidth = this.StrokeWidth;
          context.strokeStyle = stroke;
          context.fillStyle = color;
          context.beginPath();
          context.moveTo(this.Points[s][0].x, this.Points[s][0].y);
          // Create the segment path
          for (let p = 1; p < this.Points[s].length; p++) {
            context.lineTo(this.Points[s][p].x, this.Points[s][p].y);
          }
          context.closePath();
          context.fill();
          if (this.StrokeWidth > 0) { context.stroke(); }
        }
        context.translate(elementWidth + this.Spacing, 0);
      }
      context.restore();
    }

    text(value?: string) {
      if (!arguments.length) {
        return this.getAttr('text');
      }

      this.setAttr('text', value);
    }

    count(value?: number) {
      if (!arguments.length) {
        return this.getAttr('count');
      }

      this.setAttr('count', value);
    }

    private calcPoints() {
      const d = this.calcElementDimensions(),
        w = d.Width, h = d.Height,
        sw = this.SegmentWidth * w,
        si = this.SegmentInterval * w,
        bw = this.BevelWidth * sw,
        br = bw / sw,
        ib = (this.SideBevelEnabled) ? 1 : 0,
        sf = sw * .8,
        slope = h / w,
        sqrt2 = Math.SQRT2,
        sqrt3 = Math.sqrt(3);

      // Calculate Points[][] for all 7 segments
      const A = 0, B = 1, C = 2, D = 3, E = 4, F = 5, G = 6;
      const points = [];
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
    }

    private calcElementDimensions() {
      const n = parseInt(this.getAttr('count'));
      let h = this.Height;
      h -= this.Padding * 2;

      let w = this.Width;
      w -= this.Spacing * (n - 1);
      w -= this.Padding * 2;
      w /= n;

      return { Width: w, Height: h };
    }

    private flipVertical(points, height) {
      const flipped = [];
      for (let i = 0; i < points.length; i++) {
        flipped[i] = {};
        flipped[i].x = points[i].x;
        flipped[i].y = height - points[i].y;
      }
      return flipped;
    }

    private flipHorizontal(points, width) {
      const flipped = [];
      for (let i = 0; i < points.length; i++) {
        flipped[i] = {};
        flipped[i].x = width - points[i].x;
        flipped[i].y = points[i].y;
      }
      return flipped;
    }
  }

  export class Range extends Konva.Group {
    private indicator: Konva.Rect;

    constructor(config) {
      super(config);

      this.init();

      this.on(['background', 'foreground', 'min', 'max', 'value'].map(o => o + 'Change').join(' '), this.update);
    }

    min(value?: number) {
      if (!arguments.length) {
        return this.getAttr('min');
      }

      this.setAttr('min', value);
    }

    max(value?: number) {
      if (!arguments.length) {
        return this.getAttr('max');
      }

      this.setAttr('max', value);
    }

    value(value?: number) {
      if (!arguments.length) {
        return this.getAttr('value');
      }

      this.setAttr('value', value);
    }

    foreground(value?: string) {
      if (!arguments.length) {
        return this.getAttr('foreground');
      }

      this.setAttr('foreground', value);
    }

    background(value?: string) {
      if (!arguments.length) {
        return this.getAttr('background');
      }

      this.setAttr('background', value);
    }

    private checkValue() {
      var value = this.value();
      if (value > this.max()) {
        value = this.max();
      }

      if (value < this.min()) {
        value = this.min();
      }

      return value;
    }

    private init() {
      var background = new Konva.Rect({
        width: 100,
        height: 100,
        fill: this.background(),
      });

      let value = this.checkValue();

      var height = 100 * value / (this.max() - this.min());
      this.indicator = new Konva.Rect({
        width: 100,
        height: height,
        y: 100 - height,
        fill: this.foreground(),
      });

      this.add(background);
      this.add(this.indicator);
    }

    private update() {
      var value = this.checkValue();
      var height = 100 * value / (this.max() - this.min());
      this.indicator.setAttrs({
        height,
        y: 100 - height
      });
    }
  }
}
