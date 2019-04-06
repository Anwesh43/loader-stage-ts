const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const innerFactor : number = 1.7
const sizeFactor : number = 2.9
const foreColor : string = "#1565C0"
const backColor : string = "#BDBDBD"
const nodes : number = 5
const arcs : number = 4

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static scaleFactor(scale : number) : number {
        return Math.floor(scale / scDiv)
    }

    static mirrorValue(scale : number, a : number, b : number) : number {
        const k : number = ScaleUtil.scaleFactor(scale)
        return (1 - k) / a + k / b
    }

    static updateValue(scale : number, dir : number, a : number, b : number) : number {
        return ScaleUtil.mirrorValue(scale, a, b) * dir * scGap
    }
}

class DrawingUtil {
    static drawLoadingArc(context : CanvasRenderingContext2D, r : number) {
        context.beginPath()
        context.arc(0, 0, r, 0, 2 * Math.PI)
        context.stroke()
    }

    static drawDegArc(context : CanvasRenderingContext2D, deg : number, r : number) {
        const maxDeg : number = 180 / (arcs + 1)
        context.save()
        context.rotate(deg)
        for (var j = 0; j <= maxDeg; j++) {
            const x : number = r * Math.cos(j * Math.PI / 180)
            const y : number = r * Math.sin(j * Math.PI / 180)
            if (j == 0) {
                context.moveTo(x, y)
            } else {
                context.lineTo(x, y)
            }
        }
        context.stroke()
        context.restore()
    }

    static drawLoaderNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
        const gap : number = w / (nodes + 2)
        const size : number = gap / sizeFactor
        const r : number = size
        const innerR : number = size / innerFactor
        const finalR = (r + innerR) / 2
        context.lineWidth = r - innerR
        context.lineCap = 'round'
        context.strokeStyle = foreColor
        const gapDeg = (2 * Math.PI) / arcs
        context.save()
        context.translate(r + gap * i + gap * sc1, h / 2)
        DrawingUtil.drawLoadingArc(context, finalR)
        var deg = 0
        for (var j = 0; j < arcs; j++) {
            deg += gapDeg * ScaleUtil.divideScale(sc2, j, arcs)
            context.save()
            DrawingUtil.drawDegArc(context, deg, finalR)
            context.restore()
        }
        context.restore()
    }
}

class LoaderStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    static init() {
        const stage : LoaderStage = new LoaderStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += ScaleUtil.updateValue(this.scale, this.dir, 1, arcs)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LoaderNode {
    prev : LoaderNode
    next : LoaderNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LoaderNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawLoaderNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LoaderNode {
        var curr : LoaderNode = this.prev
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
