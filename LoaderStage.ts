const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#1565C0"
const backColor : string = "#BDBDBD"
const nodes : number = 5
const lines : number = 4

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
