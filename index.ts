import * as BABYLON from 'babylonjs'
import 'babylonjs-materials';
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-procedural-textures'
import 'babylonjs-post-process'

// BABYLON.Database.IDBStorageEnabled = true;

class Game {

  private _canvas: HTMLCanvasElement;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _camera: BABYLON.ArcRotateCamera;
  private _light: BABYLON.Light;

  constructor(canvasElement: string) {
    // Create canvas and engine.
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    this._engine = new BABYLON.Engine(this._canvas, true);
  }

  createScene(): void {

    //this._scene = scene !== undefined ? scene : new BABYLON.Scene(this._engine);
    this._scene = new BABYLON.Scene(this._engine);
    this._camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 0.5, BABYLON.Vector3.Zero(), this._scene);
    var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 10, 0), this._scene);
    var light1 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, -10, 0), this._scene);
    var light2 = new BABYLON.PointLight("Omni2", new BABYLON.Vector3(10, 0, 0), this._scene);
    var light3 = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(1, -1, 0), this._scene);
    // var sphere = BABYLON.Mesh.CreateSphere("Sphere", 100, 3, scene);

    this._camera.setPosition(new BABYLON.Vector3(20, 20, 20));
    this._camera.attachControl(this._canvas, true);

    light3.parent = this._camera;

    var wireframeMat = new BABYLON.StandardMaterial("texture1", this._scene);
    wireframeMat.wireframe = true;

    // Skybox
    const skybox = BABYLON.Mesh.CreateBox("skyBox", 1001.0, this._scene);

    new BABYLON.PhotoDome(
      "skybox",
      "./textures/mySkybox.jpg",
      {
          resolution: 32,
          size: 1000
      },
      this._scene
    );


    // xray material
    var xray_mat = new BABYLON.StandardMaterial("xray", this._scene);
      xray_mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    xray_mat.alpha = 0.1;
    var fresnel_params = new BABYLON.FresnelParameters();
    fresnel_params.isEnabled = true;
    fresnel_params.leftColor = new BABYLON.Color3(0.5, 0.6, 1);
    fresnel_params.rightColor = new BABYLON.Color3(0, 0, 0);
    fresnel_params.power = 2;
    fresnel_params.bias = 0.1;
    var fresnel_params2 = new BABYLON.FresnelParameters();
    fresnel_params2.isEnabled = true;
    fresnel_params2.leftColor = new BABYLON.Color3(1, 1, 1);
    fresnel_params2.rightColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    fresnel_params2.power = 2;
    fresnel_params2.bias = 0.5;
    xray_mat.emissiveFresnelParameters = fresnel_params;
    xray_mat.opacityFresnelParameters = fresnel_params2;

   const cameraTarget = BABYLON.Mesh.CreateCylinder("cameraTarget", 0, 0, 0, 0, 1, this._scene, false)
   const rotAnim = new BABYLON.Animation("ra", "rotation", 15,
   BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

   let rotKeys = [];
   rotKeys.push({ frame: 0, value: new BABYLON.Vector3(-30,0,0) });
   rotKeys.push({ frame: 40, value: new BABYLON.Vector3(-30, -Math.PI*2, -10) });
   rotKeys.push({ frame: 50, value: new BABYLON.Vector3(0, Math.PI*1.5, 0) });
   rotKeys.push({ frame: 80, value: new BABYLON.Vector3(30, Math.PI*2, 0) });
   rotKeys.push({ frame: 110, value: new BABYLON.Vector3(0, Math.PI, 0) });
   rotKeys.push({ frame: 120, value: new BABYLON.Vector3(0, 0, 0) });
   rotAnim.setKeys(rotKeys);

   var rotEase = new BABYLON.SineEase();
   rotAnim.setEasingFunction(rotEase);
   this._camera.parent = cameraTarget
   cameraTarget.animations.push(rotAnim)
   this._scene.beginAnimation(cameraTarget, 0, 120, true, 0.1);

    //Creation of a material with an image texture
    let myMesh
    let alpha = 0;

    // scene's actions
    this._scene.actionManager = new BABYLON.ActionManager(this._scene);

    const rotate = (mesh) => {
      this._scene.actionManager.registerAction(new BABYLON.IncrementValueAction(BABYLON.ActionManager.OnEveryFrameTrigger, mesh, "rotation.y", 1.0));
    }




    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "/", "zeukkari.glb", this._scene, (newMeshes) => {
      myMesh = newMeshes[1]
      myMesh.material = xray_mat
      //myMesh.material = wireframeMat

      myMesh.position.y -= 5

      this._scene.registerBeforeRender(() => {
        light0.position = new BABYLON.Vector3(10 * Math.sin(alpha), 0, 10 * Math.cos(alpha));
        light1.position = new BABYLON.Vector3(10 * Math.sin(alpha), 0, -10 * Math.cos(alpha));
        light2.position = new BABYLON.Vector3(10 * Math.cos(alpha), 0, 10 * Math.sin(alpha));

        alpha += 0.01;

        myMesh.visibility = Math.abs(Math.sin(alpha))

        if(10 * Math.sin(alpha) > 0) {
          myMesh.material = xray_mat
        }
        if(10 * Math.sin(alpha) < 0) {
          myMesh.material = wireframeMat
        }
        rotate(myMesh)
      });

      const axis = new BABYLON.Vector3(0, 1, 0);
      const angle = 0.002;

      this._scene.registerAfterRender(() => {
        myMesh.rotate(axis, angle, BABYLON.Space.WORLD);
      })
    });

  }
  doRender(): void {
    // Run the render loop.
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });

    // The canvas/window resize event handler.
    window.addEventListener('resize', () => {
      this._engine.resize();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Create the game using the 'renderCanvas'.
  let game = new Game('renderCanvas');

  // Create the scene.
  game.createScene();

  // Start render loop.
  game.doRender();
});
