const w : number = window.innerWidth 
const h : number = window.innerHeight
const parts : number = 9  
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