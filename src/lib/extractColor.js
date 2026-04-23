function rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
            default:
                break
        }
        h /= 6
    }
    return [h, s, l]
}

function hslToRgb(h, s, l) {
    let r
    let g
    let b
    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Samples an image and returns a dark, dark-theme-friendly tint that shares
 * the thumbnail's dominant hue. Falls back to null if sampling fails.
 *
 * The returned color is always at ~8% lightness so it blends into a dark UI.
 */
export async function extractOverlayColor(src) {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                const size = 32
                canvas.width = size
                canvas.height = size
                const ctx = canvas.getContext('2d', { willReadFrequently: true })
                ctx.drawImage(img, 0, 0, size, size)
                const { data } = ctx.getImageData(0, 0, size, size)

                // Weight pixels by saturation so near-white/near-black pixels
                // don't dominate a thumbnail that has a clear accent hue.
                let rSum = 0
                let gSum = 0
                let bSum = 0
                let wSum = 0
                let rAvg = 0
                let gAvg = 0
                let bAvg = 0
                let avgCount = 0

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i]
                    const g = data[i + 1]
                    const b = data[i + 2]
                    const a = data[i + 3]
                    if (a < 10) continue

                    rAvg += r
                    gAvg += g
                    bAvg += b
                    avgCount++

                    const max = Math.max(r, g, b)
                    const min = Math.min(r, g, b)
                    const sat = max === 0 ? 0 : (max - min) / max
                    const weight = sat * sat
                    rSum += r * weight
                    gSum += g * weight
                    bSum += b * weight
                    wSum += weight
                }

                if (avgCount === 0) return resolve(null)

                let r
                let g
                let b
                if (wSum > 0.5) {
                    r = rSum / wSum
                    g = gSum / wSum
                    b = bSum / wSum
                } else {
                    // Thumbnail is mostly neutral — use plain average.
                    r = rAvg / avgCount
                    g = gAvg / avgCount
                    b = bAvg / avgCount
                }

                const [h, s] = rgbToHsl(r, g, b)
                const newL = 0.08
                const newS = Math.min(Math.max(s, 0.15), 0.55)
                const [nr, ng, nb] = hslToRgb(h, newS, newL)
                resolve(`rgb(${nr}, ${ng}, ${nb})`)
            } catch (err) {
                resolve(null)
            }
        }
        img.onerror = () => resolve(null)
        img.src = src
    })
}
