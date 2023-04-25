class Indicator {
    constructor(text, style) {
        this.defaultStyle = {
            color: 'rgba(0, 0, 0, 1.0)',
            fontface: 'Arial',
            fontsize: 18,
            borderThickness: 4,
            border: 'rgba(0, 0, 0, 1.0)',
            background: 'rgba(255, 255, 255, 1.0)'
        };
        this.style = { ...this.defaultStyle, ...style };
        this.init(text);
    }

    text(value, style) {
        this.style = { ...this.style, ...style };
        this.render(value);
    }

    init(message) {
        // var spriteAlignment = THREE.SpriteAlignment.topLeft;
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        this.context = canvas.getContext('2d');

        // canvas contents will be used for a texture
        this.texture = new THREE.Texture(canvas);

        this.render(message);

        var spriteMaterial = new THREE.SpriteMaterial({
            map: this.texture,
            useScreenCoordinates: false
        });
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.scale.set(50, 25, 1.0);
    }

    render(message) {
        this.context.clearRect(0, 0, 256, 256);

        if (message) {
            this.context.font = `Bold ${this.style.fontsize}px ${this.style.fontface}`;
            this.context.fillStyle = this.style.background;
            this.context.strokeStyle = this.style.border;
            this.context.lineWidth = this.style.borderThickness;

            var metrics = this.context.measureText(message);
            var textWidth = metrics.width;

            this.drawBorder(textWidth);

            // color for text
            this.context.fillStyle = this.style.color;

            this.context.fillText(message, this.style.borderThickness, this.style.fontsize + this.style.borderThickness);
        }
        this.texture.needsUpdate = true;
    }

    drawBorder(textWidth) {
        let x = this.style.borderThickness / 2;
        let y = this.style.borderThickness / 2;
        let w = textWidth + this.style.borderThickness;
        let h = this.style.fontsize * 1.4 + this.style.borderThickness;
        let r = 6;
        this.context.beginPath();
        this.context.moveTo(x + r, y);
        this.context.lineTo(x + w - r, y);
        this.context.quadraticCurveTo(x + w, y, x + w, y + r);
        this.context.lineTo(x + w, y + h - r);
        this.context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.context.lineTo(x + r, y + h);
        this.context.quadraticCurveTo(x, y + h, x, y + h - r);
        this.context.lineTo(x, y + r);
        this.context.quadraticCurveTo(x, y, x + r, y);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    }
}