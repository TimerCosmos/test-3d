import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-comp',
  standalone: false,
  templateUrl: './comp.component.html',
  styleUrl: './comp.component.scss'
})
export class CompComponent implements AfterViewInit,OnInit {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;
  number : number = 1;
  Scene : THREE.Scene = new THREE.Scene();
  mesh!: THREE.Group;
  Camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,0.1,1000)
  Renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha : true });
  degToRad = (degrees: number) => degrees * (Math.PI / 180);
  isDragging : boolean= false;
  previousMousePosition:any = {
    x: 0,
    y: 0
  };
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    this.beforeObjectCreation()
    this.createCustomerTube()
    this.afterObjectCreation()
    this.Renderer.domElement.style.pointerEvents = 'auto';
this.Renderer.domElement.style.width = '100%';
this.Renderer.domElement.style.height = '100%';
this.Renderer.domElement.style.display = 'block'; // ensure it's block-level
this.Renderer.domElement.style.background = 'rgba(0,0,0,0.1)'; // just to confirm visibility

  }
  beforeObjectCreation(){
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef.nativeElement.appendChild(this.Renderer.domElement);
    this.Camera.position.z = 10;
    this.mouseMovements()
  } 
  afterObjectCreation(){
    const animate = () => {
      requestAnimationFrame(animate);
      this.Renderer.render(this.Scene, this.Camera);
    };
    animate();
  }
  createCustomerTube(){
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/wheel.jpg');
    // const path = new TreeTrunk( 10 );
    // const geometry = new THREE.TubeGeometry( path, 50, 1, 10, false );
    // const material = new THREE.MeshBasicMaterial({ map: texture });
    // this.mesh = new THREE.Mesh( geometry, material );

    // this.Scene.add( this.mesh );

    // const treeTrunkGeometry = new THREE.CylinderGeometry(5,5,25,50)
    // const treeMaterial = new THREE.MeshBasicMaterial({color : '#A76545'})
    // const tree = new THREE.Mesh(treeTrunkGeometry,treeMaterial)
    // const radius = 10;
    // const widthSegments = 32;
    // const heightSegments = 16;
    // const phiStart = 0;
    // const phiLength = Math.PI * 2;
    // const thetaStart = 0;
    // const thetaLength = Math.PI / 2; 
    // const treePartGeometry = new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength);
    // const material = new THREE.MeshBasicMaterial({
    //   color: '#90C67C',
    //   side: THREE.DoubleSide
    // });
    // const treePartOne = new THREE.Mesh(treePartGeometry, material);
    // const treePartTwo = new THREE.Mesh(treePartGeometry, material);
    // const treePartThree = new THREE.Mesh(treePartGeometry, material);
    // const treePartFour = new THREE.Mesh(treePartGeometry,material)
    // const treePartFive = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength/6,thetaStart,thetaLength*2/3),material)
    // const treePartSix = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength*2/3),material)
    // const treePartSeven = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart+90,phiLength/6,thetaStart,thetaLength*2/3),material)
    // treePartOne.position.y = 10
    // treePartTwo.position.y = 10
    // treePartTwo.position.x = 5
    // treePartTwo.rotation.z = this.degToRad(-30)
    // treePartThree.rotation.z = this.degToRad(30)
    // treePartThree.position.y = 10
    // treePartThree.position.x = -5
    // treePartFour.position.y = 15
    // treePartFive.position.y = 9
    // treePartFive.position.z = 1
    // treePartFive.rotation.x = this.degToRad(60)
    // treePartSeven.position.y = 9
    // treePartSeven.position.z = 1
    // treePartSeven.rotation.x = this.degToRad(60)
    // treePartSix.position.z = -7
    // treePartSix.position.y = 7

    // const Tree = new THREE.Group()

    // Tree.add(treePartOne);
    // Tree.add(treePartTwo);
    // Tree.add(treePartThree);
    // Tree.add(treePartFour)
    // Tree.add(treePartFive)
    // Tree.add(treePartSix)
    // Tree.add(treePartSeven)
    // Tree.add(tree)
    // this.mesh = Tree;

    // this.Scene.add(Tree)

    // const radius = 10;
    // const widthSegments = 32;
    // const heightSegments = 16;
    // const phiStart = 0;
    // const phiLength = Math.PI * 2;
    // const thetaStart = 0;
    // const thetaLength = Math.PI / 2; 
    // const material = new THREE.MeshBasicMaterial({
    //   color: '#FDFAF6',
    //   side: THREE.DoubleSide
    // });
    // const cloudPartOne = new THREE.Mesh(new THREE.SphereGeometry(radius*1.5,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
    // const cloudPartTwo = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
    // const cloudPartThree = new THREE.Mesh(new THREE.SphereGeometry(radius*0.75,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
    // const cloudPartFour = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)

    // cloudPartTwo.position.x = 15
    // cloudPartThree.position.x = 12
    // cloudPartThree.position.z = 0
    // cloudPartThree.position.y = 8
    // cloudPartFour.position.x = -10
    // cloudPartThree.rotation.z = this.degToRad(-30)
    // const cloud = new THREE.Group()
    // cloud.add(cloudPartOne)
    // cloud.add(cloudPartTwo)
    // cloud.add(cloudPartThree)
    // cloud.add(cloudPartFour)

    // this.mesh = cloud
    // this.Scene.add(cloud)
    // Directional light (like sunlight)
// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(20, 20, 10);
// light.castShadow = true; // ✅ Light casts shadows
// this.Scene.add(light);

// // Floor plane
// const floor = new THREE.Mesh(
//   new THREE.PlaneGeometry(200, 200),
//   new THREE.MeshStandardMaterial({ color: 0x888888 })
// );
// floor.rotation.z = -Math.PI / 2;
// floor.receiveShadow = true; // ✅ Floor shows shadows
// this.Scene.add(floor);

// // A cube that casts a shadow
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(2, 2, 2),
//   new THREE.MeshStandardMaterial({ color: 0xff0000 })
// );
// cube.position.set(0, 1, 0);
// cube.castShadow = true; // ✅ Cube casts shadow
// this.Scene.add(cube)
// // Enable shadows in the renderer
// this.Renderer.shadowMap.enabled = true;

    const roadGeometry = new THREE.PlaneGeometry(10,7)
    const dividerGeometry = new THREE.PlaneGeometry(3,0.5)
    const smallDividerGeometry = new THREE.PlaneGeometry(1.5,0.5)
    const roadMaterial = new THREE.MeshStandardMaterial({color : '#000000'})
    const dividerMaterial = new THREE.MeshBasicMaterial({color : '#FFFFFF',side: THREE.DoubleSide})
    const thar = new THREE.Mesh(roadGeometry,roadMaterial)
    const divider = new THREE.Mesh(dividerGeometry,dividerMaterial)
    const dividerTwo = new THREE.Mesh(smallDividerGeometry,dividerMaterial)
    const dividerThree = new THREE.Mesh(smallDividerGeometry,dividerMaterial)
    thar.rotation.x = this.degToRad(-90)
    divider.rotation.x = this.degToRad(-90)
    dividerThree.rotation.x = this.degToRad(-90)
    dividerTwo.rotation.x = this.degToRad(-90)
    thar.position.set(0,-5,-10)
    divider.position.set(0,-4.9,-10)
    dividerTwo.position.set(4.2,-4.9,-10)
    dividerThree.position.set(-4.2,-4.9,-10)
    const road = new THREE.Group()
    road.add(thar)
    road.add(divider)
    road.add(dividerTwo)
    road.add(dividerThree)
    this.mesh = road
    this.Scene.add(road)


  }
  mouseMovements(){
    console.log("helo")
    this.Renderer.domElement.addEventListener('mousedown', (event) => {
      console.log('mousedown')
      this.isDragging = true;
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };
    });    
    this.Renderer.domElement.addEventListener('mouseup', () => {
      console.log('mouseup')
      this.isDragging = false;
    });    
    this.Renderer.domElement.addEventListener('mouseleave', () => {
      console.log('mouseleave')
      this.isDragging = false;
    });   
    this.Renderer.domElement.addEventListener('mousemove', (event) => {
      console.log('mousemove')
      if (!this.isDragging || !this.mesh) return;
  
      const deltaMove = {
        x: event.offsetX - this.previousMousePosition.x,
        y: event.offsetY - this.previousMousePosition.y
      };
  
      const rotationSpeed = 0.01;
      this.mesh.rotation.y += deltaMove.x * rotationSpeed;
      this.mesh.rotation.x += deltaMove.y * rotationSpeed;
  
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };

    });    
  }
}
export class HelicopterStand extends THREE.Curve<THREE.Vector3>{
  scale: number;
  constructor(scale = 1) {
		super();
		this.scale = scale;
	}
  override getPoint(t:any, optionalTarget = new THREE.Vector3()) {
    const tx = (t - 0.5) * 3;
    const straightLimit = 1.2; 
    const ty = (Math.abs(tx) <= straightLimit)
      ? 0
      : Math.exp((Math.abs(tx) - straightLimit) * 3) * 0.3 - 0.3;
    const tz = 0;
  
    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}
export class TreeTrunk extends THREE.Curve<THREE.Vector3>{
  scale : number;
  constructor(scale =1){
    super();
    this.scale = scale
  }
  override getPoint(t:any, optionalTarget = new THREE.Vector3()) {
    const tx = (t - 0.5) * 3;
    const straightLimit = 1.2; 
    const ty = (Math.abs(tx) <= straightLimit)
      ? 0
      : Math.exp((Math.abs(tx) - straightLimit) * 3) * 0.3 - 0.3;
    const tz = 0;
  
    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}
