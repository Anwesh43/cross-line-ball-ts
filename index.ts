const w : number = window.innerWidth 
const h : number = window.innerHeight
const lines : number = 4 
const parts : number = 2 * lines + 1 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const ballRFactor : number = 25.2
const lineFactor : number = 4.2    
const delay : number = 20 
const colors : Array<string> = [
    "#F44336",
    "#4CAF50",
    "#673AB7",
    "#FFC107",
    "#009688"
]
const backColor : string = "#BDBDBD"

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawCrossLineBall(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const r : number = Math.min(w, h) / ballRFactor 
        const size : number = Math.min(w, h) / lineFactor 
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        context.save()
        context.translate(w / 2, h / 2)
        for (var j = 0; j < lines; j++) {
            const sfj1 : number = ScaleUtil.divideScale(sf, 1 + j, parts)
            const sfj2 : number = ScaleUtil.divideScale(sf, 5 + j, parts)
            context.save()
            context.rotate(j * Math.PI / 2 + Math.PI / 4)
            if (sfj1 >= 0.1) { 
                DrawingUtil.drawLine(context, 0, 0, size * sfj1, 0)
            }
            DrawingUtil.drawCircle(context, size * sfj2, 0, r * sf1)
            context.restore()
        }
        context.restore()
    }

    static drawCLBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        context.fillStyle = colors[i]
        DrawingUtil.drawCrossLineBall(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    prevScale : number = 0 
    dir : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class CLBNode {

    prev : CLBNode 
    next : CLBNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }
    
    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new CLBNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawCLBNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : CLBNode {
        var curr : CLBNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class CrossLineBall {

    curr : CLBNode = new CLBNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    clb : CrossLineBall = new CrossLineBall()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.clb.draw(context)
    }

    handleTap(cb : Function) {
        this.clb.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.clb.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}