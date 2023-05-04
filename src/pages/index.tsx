import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { AmbientLight, AnimationAction, AnimationMixer, AxesHelper, Clock, Color, DirectionalLight, DoubleSide, Mesh, MeshPhongMaterial, NearestFilter, Object3D, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, TextureLoader, WebGLRenderer, sRGBEncoding } from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import {CSS2DObject, CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';

export default function Home() {
  const animationRef = useRef<any>(null);
  const cssRef = useRef<any>(null);
  // Initialize three.js objects
  useEffect(() => {
    const animationActions: AnimationAction[] = [];
    let mixer: AnimationMixer;
    const scene = new Scene();
    const cssScene = new Scene();

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const render = new WebGLRenderer();
    const cssRender = new CSS2DRenderer();
    const fbxLoader: FBXLoader = new FBXLoader();
    let modelReady = false;

    // 2D object
    const frameContainer = document.createElement('div');
    frameContainer.style.width = '100%';
    frameContainer.style.height = '90%';
    frameContainer.style.borderRadius = '10px';
    frameContainer.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.7)";
    frameContainer.style.backgroundColor = '#fff';

    const frameCreation = document.createElement('iframe');
    frameCreation.style.width = "100%";
    frameCreation.style.height = "100%";
    frameCreation.style.border = '0px';
    frameCreation.style.borderRadius = '10px';
    frameCreation.src = 'https://rappi.com.co';
    frameContainer.appendChild(frameCreation);

    const frame = new CSS2DObject(frameContainer);
    //3.4
    frame.position.set((window.innerWidth * 3.2) / 1512, 1.2, 0)
    cssScene.add(frame);
    cssRender.setSize(window.innerWidth * 0.5, window.innerHeight);
    //scene.add(cssScene);
    
    // 3d Render
    render.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0.7, 1.2, 1);
    
    scene.background = new Color('white');
    scene.add(new AxesHelper(5));
    const ambientLight = new AmbientLight();
    const directionalLigth = new DirectionalLight();
    scene.add(directionalLigth);
    scene.add(ambientLight);

    // Add testing plane
    const planeSize = 40;

    const loader = new TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.encoding = sRGBEncoding;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new PlaneGeometry(planeSize, planeSize);
    const planeMat = new MeshPhongMaterial({
      map: texture,
      side: DoubleSide,
    });
    const mesh = new Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
    

    // Add canvas to space
    if (animationRef.current.firstChild)
      animationRef.current?.removeChild(animationRef.current.firstChild as Node);
    animationRef.current?.appendChild(render.domElement);

    // Add cssRender
    if (cssRef.current.firstChild)
      cssRef.current?.removeChild(cssRef.current.firstChild as Node);
    cssRef.current?.appendChild(cssRender.domElement);

    window.addEventListener('resize' , onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      render.setSize(window.innerWidth, window.innerHeight);
      cssRender.setSize(window.innerWidth * 0.5, window.innerHeight);
      frame.position.set((window.innerWidth * 3.2) / 1512, 1.2, 0)
      
      cssRender.render(cssScene, camera);
      render.render(scene, camera);
    }

    // Load model
    fbxLoader.load('models/greeting.fbx', (object) => {
      object.scale.set(0.01, 0.01, 0.01);
      object.rotateY(0.5);
      mixer = new AnimationMixer(object);

      const animationAction = mixer.clipAction((object as Object3D).animations[0]);
      animationActions.push(animationAction);

      scene.add(object);

      fbxLoader.load('models/greeting@animate.fbx', (object) => {
        const animationAction = mixer.clipAction((object as Object3D).animations[0]);
        animationActions.push(animationAction);
        modelReady = true;
        animationActions[1].play();
      }, (xhr) => {
        console.log("Loading Animation:", (xhr.loaded / xhr.total) * 100 + "%")
      }, (err) => console.error(err));
    }, (xhr) => {
      console.log("Loading main:", (xhr.loaded / xhr.total) * 100 + "%")
    }, (err) => console.error(err));

    const clock = new Clock();

    function animate()  {
      requestAnimationFrame(animate);
      if (modelReady) mixer.update(clock.getDelta())
      render.render(scene, camera);
      cssRender.render(cssScene, camera);
    }

    if (WebGL.isWebGLAvailable())
      animate()
    
  }, []);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='absolutePosition' ref={cssRef}></div>
      <div ref={animationRef} />
    </>
  )
}
