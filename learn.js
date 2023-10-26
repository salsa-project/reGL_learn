const regl = require('regl')()
const bunny = require('bunny') // bunny model
const createCamera = require('perspective-camera')
const angleNormals = require('angle-normals')
const mat4 = require('gl-mat4')



const camera = createCamera({
    fov: Math.PI/4,
    near: 0.01,
    far: 100,
    viewport: [0,0, window.innerWidth, window.innerHeight],
})
//set up our camera
camera.translate([0,5,-30])
camera.lookAt([0,5,0])
camera.update()


const draw = regl({
    vert: `
        precision mediump float;
        attribute vec3 position, normal;
        uniform float time;
        uniform mat4 projectionView, model;

        varying vec3 vNormal;

        void main(){
            vNormal = normal;
            gl_Position = projectionView * model * vec4(position, 1.0);
        }
    `,
    frag: `
        precision mediump float;

        varying vec3 vNormal;

        void main(){
            gl_FragColor = vec4(vNormal *0.5 +0.5, 1.0);
        }
    `,
    attributes: {
        position: bunny.positions,
        normal: angleNormals(bunny.cells, bunny.positions)
    },
    uniforms: {
        time: (context)=>-context.time % 1,
        projectionView: camera.projView,
        model: (context)=> mat4.rotateY([], mat4.identity([]), context.time*10)
    },
    elements: bunny.cells
})

const loop = regl.frame(()=>{
    try {
        regl.clear({
            color: [0, 0, 0, 1]
        })
        draw()
        
    } catch (error) {
        loop.cancel()
        throw error;
    }
})
