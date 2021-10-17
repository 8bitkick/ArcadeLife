

export class Life{

  constructor(){

    this.cellWide      = Math.floor( Math.max(window.screen.width,window.screen.height)/4)
    this.cellHigh      = Math.floor( Math.max(window.screen.width,window.screen.height)/4)

    this.cells         = new Uint8Array(this.cellWide * this.cellHigh)
    this.imageDataOut  = new ImageData(this.cellWide*4,this.cellHigh*4)
    this.imageOut32    = new Uint32Array(this.imageDataOut.data.buffer).fill(0xff000000)

    this.height        =  this.cellHigh
    this.width         =  this.cellWide
    this.cellsVisible  =  this.cellWide * this.height

  }


  resize(ctx){
    this.height           =  Math.ceil(ctx.canvas.clientHeight/4)
    this.cellsVisible     =  this.cellWide *   this.height
    console.log("Resized to "+this.height+"x"+this.width+" "+  this.cellsVisible +" cells ")
  }

  setCtx(ctx) {
    this.ctx              = ctx
    this.resize(ctx)
  }


  pixelate() {
    let image   = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    let xd      = this.ctx.canvas.width/this.cellWide;
    let yd      = this.ctx.canvas.height/this.cellHigh;
    let c       = 0

    for (let y = 0; y<this.cellHigh;y++){
      for (let x = 0; x< this.cellWide;x++){
        let p = x*4 + (y*4 * this.ctx.canvas.width)
        if (image.data[p<<2]>4) {
          this.cells[c]= image.data[p<<2]>32 ? 255 : image.data[p<<2]
        }
        c++;
      }
    }
  }

  randomize(){
    for (let p = 0; p<this.cellWide*this.cellHigh;p++ ){
      let r = Math.random()*255
      this.cells[p] = r > 128 ? 255 : r
    }
  }

  clear(){
    for (let p = 0; p<this.cellWide*this.cellHigh;p++ ){
      this.cells[p] = 0
    }
  }

  draw(x,y){
    let pos = x + y* this.cellWide
    this.cells[pos-1-this.cellWide]=255
    this.cells[pos] = 255
    this.cells[pos+1]=255
    this.cells[pos-1+this.cellWide]=255
    this.cells[pos+this.cellWide]=255
  }

  isActive(c){
    if (c<0) return this.isActive(c+this.cellsVisible)
    if (c>this.cellsVisible) return this.isActive(c-this.cellsVisible)
    if (this.cells[c]==255) return 1
    return 0
  }

  step() {
    let row = this.cellWide
    let new_pixels = new Uint8Array(this.cellsVisible)
    for (let c = 0; c<this.cellsVisible;c++){
      let neighbours  = this.isActive(c-1-row) + this.isActive(c-row) + this.isActive(1+c-row) +
      this.isActive(c-1)     +                        this.isActive(c+1) +
      this.isActive(c-1+row) + this.isActive(c+row) + this.isActive(1+c+row)

      // Any live cell with two or three live neighbours survives.
      if (this.cells[c]==255 && (neighbours==2 || neighbours==3)) {new_pixels[c]=255}
      // Any dead cell with three live neighbours becomes a live cell.
      if (this.cells[c]!=255 && neighbours==3) {new_pixels[c]=255}
      // All other live cells die in the next generation. Similarly, all other dead cells stay dead.

      if (new_pixels[c]==0){
        new_pixels[c] = this.cells[c] > 4 ? this.cells[c]-4 : 0
        if (new_pixels[c]>160) new_pixels[c]=160
      }
    }
    this.cells = new_pixels
  }

  renderLife(){
    let c=0,p=0,l=0,r=0,g=0,b=0,a=0xff000000
    let bits = Math.log2(this.ctx.canvas.width)-8

    for (let y = 0; y<this.height; y++){
      for (let x = 0; x<this.cellWide; x++){
        if (this.cells[c]==255) {
          r = 0x000000cc
          g = 0x0000dd00
          b = 0x00cc0000
          l++
        } else {
          r = (this.cells[c]+x*2)>>bits
          r = (r>255) ? 0x000000ff : r & 0x000000ff
          g = this.cells[c] << 7 & 0x0000ff00
          b = (255 - y) << 15 & 0x00ff0000
        }

        for (let i = p; i<(p+3*this.cellWide*4); i+=this.cellWide*4){
          this.imageOut32[i]  = a | r | g | b
          this.imageOut32[i+1]= a | r | g | b
          this.imageOut32[i+2]= a | r | g | b
        }
        c++
        p+=4
      }
      p+=3*this.cellWide*4
    }

    this.ctx.putImageData(this.imageDataOut,0,0);

  }
}

export default Life
