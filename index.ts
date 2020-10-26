const w : number = window.innerWidth 
const h : number = window.innerHeight
const lines : number = 4 
const parts : number = 2 * lines + 1 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const ballRFactor : number = 13.2 
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
        return Math.min(1 / n, scale - i / n) * n 
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
        context.arc(0, 0, r, 0, 2 * Math.PI)
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
            DrawingUtil.drawLine(context, 0, 0, size * sfj1, 0)
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