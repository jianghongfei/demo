class ElementArray {
  private NullMask: number = 0x10;

  Elements: number[];

  constructor(count?: number) {
    this.count = count || 0;
  }

  set count(count: number) {
    this.Elements = [count];
    for (var i = 0; i < count; i++) {
      this.Elements[i] = 0;
    }
  }

  setText(value: string, charMaps: { [key: string]: number }) {
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
  }

  setValue(i: number, value: number) {
    if (i >= 0 && i < this.Elements.length) {
      this.Elements[i] = value;
    }
  }
}

abstract class SegmentCanvas {
  SegmentWidth = 0.16;           // Width of segments (% of Element Width)
  SegmentInterval = 0.05;        // Spacing between segments (% of Element Width)
  BevelWidth = 0.06;             // Size of corner bevel (% of Element Width)
  SideBevelEnabled = false;      // Should the sides be beveled
  FillLight = "#86FD06";         // Color of an on segment
  FillDark = "#004400";          // Color of an off segment
  StrokeLight = "#007700";       // Color of an on segment outline
  StrokeDark = "#440044";        // Color of an off segment outline
  StrokeWidth = 0;               // Width of segment outline
  Padding = 10;                  // Padding around the display
  Spacing = 10;                  // Spacing between elements
  X = 0;                         // Starting position on the canvas
  Y = 0;
  Width = 200;                   // Default size of the display
  Height = 100;
  ElementArray = new ElementArray(1);
  Points: Array<{ x: number, y: number }[]>;

  protected Canvas: HTMLCanvasElement;
  protected CharacterMasks: { [key: string]: number };

  constructor(canvas: HTMLCanvasElement, masks: { [key: string]: number }, x?: number, y?: number, width?: number, height?: number) {
    this.Canvas = canvas;
    this.CharacterMasks = masks;
    this.X = x || 0;
    this.Y = y || 0;

    this.Width = width || canvas.width;
    this.Height = height || canvas.height;
  }

  DispayText(value: string) {
    // Recalculate points in case any settings changed
    this.calcPoints();
    // Set the display patterns and draw the canvas
    this.ElementArray.setText(value, this.CharacterMasks);
    this.draw(this.Canvas, this.ElementArray.Elements);
  }

  abstract calcPoints();

  private draw(canvas, elements) {
    // Get the context and clear the area
    var context = canvas.getContext('2d');
    context.clearRect(this.X, this.Y, this.Width, this.Height);
    context.save();

    // Calculate the width and spacing of each element
    var elementWidth = this.calcElementDimensions().Width;

    // Offset to adjust for starting point and padding
    context.translate(this.X, this.Y);
    context.translate(this.Padding, this.Padding);

    // Draw each segment of each element
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
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
        if (this.StrokeWidth > 0) { context.stroke(); }
      }
      context.translate(elementWidth + this.Spacing, 0);
    }
    context.restore();
  }

  protected calcElementDimensions() {
    var n = this.ElementArray.Elements.length;
    var h = this.Height;
    h -= this.Padding * 2;

    var w = this.Width;
    w -= this.Spacing * (n - 1);
    w -= this.Padding * 2;
    w /= n;

    return { Width: w, Height: h };
  }

  protected flipVertical(points, height) {
    var flipped = [];
    for (var i = 0; i < points.length; i++) {
      flipped[i] = {};
      flipped[i].x = points[i].x;
      flipped[i].y = height - points[i].y;
    }
    return flipped;
  }

  protected flipHorizontal(points, width) {
    var flipped = [];
    for (var i = 0; i < points.length; i++) {
      flipped[i] = {};
      flipped[i].x = width - points[i].x;
      flipped[i].y = points[i].y;
    }
    return flipped;
  }
}

class SevenSegment extends SegmentCanvas {
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

  constructor(canvas: HTMLCanvasElement, count: number, x?: number, y?: number, width?: number, height?: number) {
    super(canvas, SevenSegment.masks, x, y, width, height);

    this.X = x || 0;
    this.Y = y || 0;

    this.Width = width || canvas.width;
    this.Height = height || canvas.height;

    this.calcPoints();
    this.ElementArray.count = count;
  }

  calcPoints() {
    var d = this.calcElementDimensions(),
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
  }
}
