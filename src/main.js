import './style.css'
import { Application, Graphics, Container, Matrix } from 'pixi.js';

(async () => {
    const app = new Application();
    await app.init({
        background: '0xfff',
        antialias: true,
        resizeTo: window,
        frameRate: 60,
        resolution: 1
    });

    document.getElementById('app').appendChild(app.canvas);

    const gridSize = 30;
    const dotSize = 2;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let dragTarget = null;

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerup', onDragEnd);
    app.stage.on('pointerupoutside', () => {
        onDragEnd()
        isDragging = false;
        app.canvas.style.cursor = 'auto';
    });

    function addBullsEye(workCanvas, app) {
        let isDragging = false;

        const bullsEye = new Graphics();
        bullsEye
            .circle(0, 0, 15)
            .fill(0xFF3300)
            .circle(0, 0, 10)
            .fill(0xFFFFFF)
            .circle(0, 0, 5)
            .fill(0xFF3300)

        bullsEye.position.set(app.canvas.width / 2, app.canvas.height / 2);

        workCanvas.addChild(bullsEye);

        bullsEye.eventMode = 'static';

        bullsEye.addEventListener('pointerdown', onDragStart, bullsEye);
    }

    function onDragMove(event)
    {
        if (dragTarget)
        {
            dragTarget.parent.toLocal(event.global, null, dragTarget.position);
        }
    }

    function onDragStart()
    {
        dragTarget.alpha = 0.5;
        dragTarget = this;
        app.stage.on('pointermove', onDragMove);
    }

    function onDragEnd()
    {
        if (dragTarget)
        {
            app.stage.off('pointermove', onDragMove);
            dragTarget.alpha = 1;
            dragTarget = null;
        }
    }

    const workCanvas = new Container();
    app.stage.addChild(workCanvas);

    const grid = new Graphics();
    workCanvas.addChild(grid);

    addBullsEye(workCanvas, app);

    function drawGrid() {
        grid.clear();

        const startX = Math.floor((-translateX/scale) / gridSize) * gridSize;
        const startY = Math.floor((-translateY/scale) / gridSize) * gridSize;
        const endX = startX + (app.canvas.width / scale) + gridSize * 2;
        const endY = startY + (app.canvas.height / scale) + gridSize * 2;

        for (let x = startX; x < endX; x += gridSize) {
            for (let y = startY; y < endY; y += gridSize) {
                grid.circle(x, y, dotSize);
            }
        }

        grid.fill(0xDDDDDD);
    }

    drawGrid();

    app.canvas.addEventListener('wheel', (event) => {
        event.preventDefault();

        const zoomSpeed = 0.1;
        const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;

        const previousScale = scale;
        scale += delta;
        scale = Math.min(Math.max(0.5, scale), 5);

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const canvasMouseX = (mouseX - translateX) / previousScale;
        const canvasMouseY = (mouseY - translateY) / previousScale;

        translateX = mouseX - canvasMouseX * scale;
        translateY = mouseY - canvasMouseY * scale;

        workCanvas.setFromMatrix(new Matrix().scale(scale, scale).translate(translateX, translateY));

        drawGrid();
    });

    let isDragging = false;
    let lastPosition = { x: 0, y: 0 };

    app.canvas.addEventListener('pointerdown', (event) => {
        if (event.button === 1) { // Middelste muisknop
            event.preventDefault(); // Voorkom het scroll-icoon
            isDragging = true;
            lastPosition = { x: event.clientX, y: event.clientY };
            app.canvas.style.cursor = 'grabbing';
        }
    });

    app.canvas.addEventListener('pointermove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - lastPosition.x;
            const deltaY = event.clientY - lastPosition.y;

            translateX += deltaX;
            translateY += deltaY;

            workCanvas.setFromMatrix(new Matrix().scale(scale, scale).translate(translateX, translateY));

            drawGrid();
            lastPosition = { x: event.clientX, y: event.clientY };
        }
    });

    app.canvas.addEventListener('pointerup', (event) => {
        if (event.button === 1) {
            isDragging = false;
            app.canvas.style.cursor = 'auto';
        }
    });

   window.addEventListener('keyup', (event) => {
        if (event.code === 'KeyR') {
            scale = 1;
            translateX = 0;
            translateY = 0;
            workCanvas.setFromMatrix(new Matrix().scale(scale, scale).translate(translateX, translateY));
            drawGrid();
        }
    });

    window.addEventListener('resize', () => {
        drawGrid();
    });
})();




