// Read a picked image file, crop the middle square and shrink it to `px`
// (JPEG), for saving as a profile picture.
export function squareImage(file, px = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const sx = (img.naturalWidth - side) / 2
      const sy = (img.naturalHeight - side) / 2
      const cv = document.createElement('canvas')
      cv.width = px
      cv.height = px
      cv.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, px, px)
      URL.revokeObjectURL(url)
      resolve(cv.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file isn’t a picture the browser can read.'))
    }
    img.src = url
  })
}
