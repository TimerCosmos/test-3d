import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnInit,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import * as THREE from 'three';
import { AmmoServiceService } from '../services/ammo-service.service';
import { HelicopterStand } from '../comp/comp.component';

@Component({
  selector: 'app-three-scene',
  standalone: false,
  templateUrl: './three-scene.component.html',
  styleUrl: './three-scene.component.scss'
})
export class ThreeSceneComponent implements AfterViewInit,OnInit {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;
  number : number = 1;
  Scene : THREE.Scene = new THREE.Scene();
  Camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,1,15000)
  Renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha : true });
  degToRad = (degrees: number) => degrees * (Math.PI / 180);
  vehicle = new THREE.Group()
  currentVehicle : string = "Helicopter"
  pressedkeys = new Set<String>()
  isDragging : boolean= false;
  previousMousePosition:any = {
    x: 0,
    y: 0
  };
  vehicleSelected: boolean = false;
  currentYaw: number=0;
  currentLean: number=0;
  tilt: boolean = false;
  leanResetTimeout!: ReturnType<typeof setTimeout>;
  clock = new THREE.Clock();
  constructor(public router:Router,public ammoService : AmmoServiceService){

  }
  async ngOnInit(): Promise<void> {
    await this.ammoService.init(); 
  }
  ngAfterViewInit(): void {
    this.createVehicle()
    this.vehicle.position.z = 50
    this.addSun()
    this.addTrees()
    this.addClouds()
    this.createGround()
    this.BasicSceneSettings()
  }
  createVehicle(){
    if (this.currentVehicle == "Helicopter"){
      this.createHelicopter()
    }else{
      this.createCar()
    }
  }
  BasicSceneSettings(){
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef.nativeElement.appendChild(this.Renderer.domElement);
    this.Camera.position.z = this.vehicle.position.z + 100;
    this.Camera.position.y = this.vehicle.position.y + 20;
  } 
  addTrees(){ 
    for (let i = 0; i < 50; i++) {
      const treeTrunkGeometry = new THREE.CylinderGeometry(5,5,25,50)
      const treeMaterial = new THREE.MeshStandardMaterial({color : '#A76545'})
      const tree = new THREE.Mesh(treeTrunkGeometry,treeMaterial)
      const radius = 10;
      const widthSegments = 32;
      const heightSegments = 16;
      const phiStart = 0;
      const phiLength = Math.PI * 2;
      const thetaStart = 0;
      const thetaLength = Math.PI / 2; 
      const treePartGeometry = new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength);
      const material = new THREE.MeshStandardMaterial({color: '#90C67C',side: THREE.DoubleSide});
      const treePartOne = new THREE.Mesh(treePartGeometry, material);
      const treePartTwo = new THREE.Mesh(treePartGeometry, material);
      const treePartThree = new THREE.Mesh(treePartGeometry, material);
      const treePartFour = new THREE.Mesh(treePartGeometry,material)
      const treePartFive = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength/6,thetaStart,thetaLength*2/3),material)
      const treePartSix = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength*2/3),material)
      const treePartSeven = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart+90,phiLength/6,thetaStart,thetaLength*2/3),material)
      treePartOne.position.y = 10
      treePartTwo.position.set(5,10,0)
      treePartTwo.rotation.z = this.degToRad(-30)
      treePartThree.rotation.z = this.degToRad(30)
      treePartThree.position.set(-5,10,0)
      treePartFour.position.y = 15
      treePartFive.position.set(0,9,1)
      treePartFive.rotation.x = this.degToRad(60)
      treePartSeven.position.set(0,9,1)
      treePartSeven.rotation.x = this.degToRad(60)
      treePartSix.position.set(0,7,-7)
      const Tree = new THREE.Group() 
      Tree.add(treePartOne);
      Tree.add(treePartTwo);
      Tree.add(treePartThree);
      Tree.add(treePartFour)
      Tree.add(treePartFive)
      Tree.add(treePartSix)
      Tree.add(treePartSeven)
      Tree.add(tree) 
      Tree.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true; 
        }
      });
      Tree.position.set(0-i*100,7,i%2 == 0 ? Math.floor(Math.random()*300) : -1 * Math.floor(Math.random()*300))
      this.Scene.add(Tree)
    }   
  }
  addClouds(){
    for(let i=0; i< 75; i++){
      const radius = 10;
      const widthSegments = 32;
      const heightSegments = 16;
      const phiStart = 0;
      const phiLength = Math.PI * 2;
      const thetaStart = 0;
      const thetaLength = Math.PI / 2; 
      const material = new THREE.MeshStandardMaterial({color: '#FDFAF6',side: THREE.DoubleSide});
      const cloudPartOne = new THREE.Mesh(new THREE.SphereGeometry(radius*1.5,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
      const cloudPartTwo = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
      const cloudPartThree = new THREE.Mesh(new THREE.SphereGeometry(radius*0.75,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
      const cloudPartFour = new THREE.Mesh(new THREE.SphereGeometry(radius,widthSegments,heightSegments,phiStart,phiLength,thetaStart,thetaLength),material)
      cloudPartTwo.position.x = 15
      cloudPartThree.position.set(12,8,0)
      cloudPartFour.position.x = -10
      cloudPartThree.rotation.z = this.degToRad(-30)
      const cloud = new THREE.Group()
      cloud.add(cloudPartOne)
      cloud.add(cloudPartTwo)
      cloud.add(cloudPartThree)
      cloud.add(cloudPartFour)
      cloud.scale.set(Math.max(1,Math.floor(Math.random() * 5)),Math.max(1,Math.floor(Math.random() * 3)),Math.max(1,Math.floor(Math.random() * 3)))
      cloud.position.set(-i*50,Math.max(100,Math.floor(Math.random() * 200)),i%2 == 0 ? Math.floor(Math.random()*300) : -1 * Math.floor(Math.random()*300))
      this.Scene.add(cloud)
    }       
  }
  addSun(){
    const sunGeometry = new THREE.SphereGeometry(1000)
    const sunMaterial = new THREE.MeshStandardMaterial({color : '#FFCF33'})
    const sun = new THREE.Mesh(sunGeometry,sunMaterial)
    sun.position.set(10,5000,-11000)
    this.Scene.add(sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(10,5000,11000)
    sunLight.castShadow = true;
    this.Scene.add(sunLight);
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 15000;
    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);
    this.Scene.add(target);
    sunLight.target = target;
    sunLight.target.updateMatrixWorld();
    this.Renderer.shadowMap.enabled = true;
    this.Renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  createGround(){
    const groundGeometry = new THREE.PlaneGeometry(10000,10000)
    const material = new THREE.MeshStandardMaterial({ color: '#90C67C',side: THREE.DoubleSide})
    const ground = new THREE.Mesh(groundGeometry,material)
    ground.position.y = -5
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.Scene.add(ground)
  }
  createCar(){
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/wheel.jpg');
    const geometry = new THREE.BoxGeometry(5,5,5);
    const coneGeometry = new THREE.ConeGeometry(2.5, 5)
    const wheelGeometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100)    
    const bodyMaterial = new THREE.MeshStandardMaterial({color : '#1F7D53'})
    const hoodMaterial = new THREE.MeshStandardMaterial({color : '#FF8989'})
    const wheelmaterial = new THREE.MeshStandardMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, bodyMaterial);
    const cone = new THREE.Mesh(coneGeometry, hoodMaterial)
    const sphereOne = new THREE.Mesh(wheelGeometry, wheelmaterial)
    const sphereTwo = new THREE.Mesh(wheelGeometry, wheelmaterial)
    const sphereThree = new THREE.Mesh(wheelGeometry, wheelmaterial)
    const sphereFour = new THREE.Mesh(wheelGeometry, wheelmaterial)
    cone.position.x = -5
    sphereOne.position.set(-2.5,-3,2.5)
    sphereThree.position.set(-2.5,-3,-2.5)
    sphereTwo.position.set(2.5,-3,2.5)
    sphereFour.position.set(2.5,-3,-2.5)
    cone.rotation.z = this.degToRad(90);
    this.vehicle.add(cube)
    this.vehicle.add(cone)
    this.vehicle.add(sphereOne)
    this.vehicle.add(sphereTwo)
    this.vehicle.add(sphereFour)
    this.vehicle.add(sphereThree)
    this.vehicle.position.y = 0
    this.vehicle.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true; 
      }
    });
    this.Scene.add(this.vehicle) 
    window.addEventListener('keyup', (event) => { 
      if (event.code == "ArrowLeft" || event.code == "ArrowRight" || event.code == "KeyA" || event.code == "KeyD"){
        sphereOne.rotation.y = this.degToRad(0)
        sphereThree.rotation.y = this.degToRad(0)
      }
    })
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyW', 'KeyS', 'KeyD','KeyA'].includes(event.code)) {
        event.preventDefault();
        if(this.pressedkeys.has('KeyW')){
          sphereOne.rotation.z += this.degToRad(5)
          sphereTwo.rotation.z += this.degToRad(5)
          sphereThree.rotation.z += this.degToRad(5)
          sphereFour.rotation.z += this.degToRad(5)
        }else if(this.pressedkeys.has('KeyS')){
          sphereOne.rotation.z -= this.degToRad(5)
          sphereTwo.rotation.z -= this.degToRad(5)
          sphereThree.rotation.z -= this.degToRad(5)
          sphereFour.rotation.z -= this.degToRad(5)
        }
        if(this.pressedkeys.has('ArrowRight') || this.pressedkeys.has('KeyD')){
          sphereOne.rotation.y = this.degToRad(-45)
          sphereThree.rotation.y = this.degToRad(-45)
        }
        if(this.pressedkeys.has('ArrowLeft') || this.pressedkeys.has('KeyA')){
          sphereOne.rotation.y = this.degToRad(45)
          sphereThree.rotation.y = this.degToRad(45)
        }
      }
    });    
    const animate = () => {
      requestAnimationFrame(animate);
      this.Renderer.render(this.Scene, this.Camera);
    };
    animate();
  }
  createHelicopter(){
    const boxGeometry = new THREE.BoxGeometry(20,10,15)
    const cylinderGeometry = new THREE.CylinderGeometry(0.5,0.5,5)
    const helicoperHoodGeometry = new THREE.CylinderGeometry(5,2,5)
    const coneGeometry = new THREE.ConeGeometry(1.5, 3)
    const largePropellerGeometry = new THREE.BoxGeometry(20,0.5,3)
    const smallPropellerGeometry = new THREE.BoxGeometry(0.75,5,0.5)
    const tailStartGeometry = new THREE.CylinderGeometry(5,1,2)
    const tailGeometry = new THREE.CylinderGeometry(1,0.5,25)
    const footStandGeometry = new THREE.CylinderGeometry(0.5,0.5,4)
    const bodyMaterial = new THREE.MeshStandardMaterial({color : '#1F7D53'})
    const cylinderMaterial = new THREE.MeshStandardMaterial({color : '#000000'})
    const pinkMaterial = new THREE.MeshStandardMaterial({color : '#FF8989'})
    const helicopterBody = new THREE.Mesh(boxGeometry, bodyMaterial)
    const propellerStand = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    const propellerFoot = new THREE.Mesh(new THREE.BoxGeometry(12,2,10),bodyMaterial)
    const propellerHolder = new THREE.Mesh(coneGeometry,bodyMaterial)
    const propellerMotor = new THREE.Mesh( new THREE.CylinderGeometry(1,1,0.5),cylinderMaterial)
    const tailPropeller = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,2),cylinderMaterial)
    const helicopterHood = new THREE.Mesh(helicoperHoodGeometry,pinkMaterial)
    const largePropellerOne = new THREE.Mesh(largePropellerGeometry,bodyMaterial)
    const largePropellerTwo = new THREE.Mesh(largePropellerGeometry,bodyMaterial)
    const tailStart = new THREE.Mesh(tailStartGeometry,pinkMaterial)
    const tail = new THREE.Mesh(tailGeometry,bodyMaterial)
    const tailPropellerOne = new THREE.Mesh(smallPropellerGeometry,bodyMaterial)
    const tailPropellerTwo = new THREE.Mesh(smallPropellerGeometry,bodyMaterial)
    const tailPropellerStand = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,2),bodyMaterial)
    const footStandOne = new THREE.Mesh(footStandGeometry,cylinderMaterial)
    const footStandTwo = new THREE.Mesh(footStandGeometry,cylinderMaterial)
    const footStandThree = new THREE.Mesh(footStandGeometry,cylinderMaterial)
    const footStandFour = new THREE.Mesh(footStandGeometry,cylinderMaterial)
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/wheel.jpg');
    const path = new HelicopterStand( 10 );
    const landingRod = new THREE.TubeGeometry( path, 50, 1, 10, false );
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const landingOne = new THREE.Mesh( landingRod, material );
    const landingTwo = new THREE.Mesh( landingRod, material );
    helicopterHood.rotation.z = this.degToRad(270);
    tailPropellerStand.rotation.x = this.degToRad(90)
    tailStart.rotation.z = this.degToRad(90)
    tail.rotation.z = this.degToRad(90)
    propellerStand.position.y = 8
    propellerFoot.position.y = 5
    propellerMotor.position.y = 10.5
    largePropellerOne.position.set(11,10.5,0)
    largePropellerTwo.position.set(-11,10.5,0)
    propellerHolder.position.y = 7.5
    helicopterHood.position.x = -12
    tailStart.position.x = 11
    tail.position.x = 12
    tailPropeller.position.x = 25
    tailPropellerStand.position.set(25,0,2)
    tailPropeller.rotation.x = this.degToRad(90)
    tailPropellerOne.position.set(25,2,2)
    tailPropellerTwo.position.set(25,-2,2) 
    footStandOne.position.set(-6,-7,5)
    footStandThree.position.set(-6,-7,-5)
    footStandTwo.position.set(6,-7,5)
    footStandFour.position.set(6,-7,-5) 
    landingOne.position.set(0,-10,5) 
    landingTwo.position.set(0,-10,-5)
    const propeller = new THREE.Group()
    propeller.add(largePropellerOne)
    propeller.add(largePropellerTwo)
    propeller.add(propellerMotor)
    const smallPropeller = new THREE.Group()
    smallPropeller.add(tailPropellerStand)
    smallPropeller.add(tailPropellerOne)
    smallPropeller.add(tailPropellerTwo)
    this.vehicle.add(helicopterBody)
    this.vehicle.add(propellerStand)
    this.vehicle.add(propellerFoot)
    this.vehicle.add(propellerHolder)
    this.vehicle.add(helicopterHood)
    this.vehicle.add(propeller)
    this.vehicle.add(tailStart)
    this.vehicle.add(tailPropeller)
    this.vehicle.add(tail)
    this.vehicle.add(footStandOne)
    this.vehicle.add(footStandTwo)
    this.vehicle.add(footStandFour)
    this.vehicle.add(footStandThree)
    this.vehicle.add(landingOne)
    this.vehicle.add(landingTwo)
    this.vehicle.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true; 
      }
    });
    this.vehicle.position.y = 50
    const box = new THREE.Box3().setFromObject(smallPropeller);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const smallPropellerPivot = new THREE.Group()
    smallPropeller.position.sub(center);
    smallPropellerPivot.add(smallPropeller);
    smallPropellerPivot.position.copy(center);
    this.vehicle.add(smallPropellerPivot);
    this.Scene.add(this.vehicle)
    const animate = () => {
      requestAnimationFrame(animate);
      propeller.rotation.y += this.degToRad(75)
      smallPropellerPivot.rotation.z += this.degToRad(75)
      this.Renderer.render(this.Scene, this.Camera);
    };
    animate();
  }
  mouseMovements(){
    this.Renderer.domElement.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };
    });    
    this.Renderer.domElement.addEventListener('mouseup', () => {
      this.isDragging = false;
    });    
    this.Renderer.domElement.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });  
    this.Renderer.domElement.addEventListener('mousemove', (event) => {
      if (!this.isDragging || !this.vehicle) return;
  
      const deltaMove = {
        x: event.offsetX - this.previousMousePosition.x,
        y: event.offsetY - this.previousMousePosition.y
      };
  
      const rotationSpeed = 0.01;
      this.vehicle.rotation.y += deltaMove.x * rotationSpeed;
      this.vehicle.rotation.x += deltaMove.y * rotationSpeed;
  
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };

    });     
  }
  toNewComp(){
    this.router.navigate(['/newComp'])
  }
  vehicleMovements() {
    let speed = this.currentVehicle === "Helicopter" ? 5 : 1;
    this.Renderer.domElement.addEventListener('mousemove', (event) => {
      if (!this.isDragging) return;  
      const deltaMove = {
        x: event.offsetX - this.previousMousePosition.x,
        y: event.offsetY - this.previousMousePosition.y
      };  
      const rotationSpeed = 0.005;
      this.vehicle.rotation.y += deltaMove.x * rotationSpeed;
      this.vehicle.rotation.x += deltaMove.y * rotationSpeed;  
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };
    });
    window.addEventListener('keyup', (event) => {
      if (["ArrowRight", "ArrowLeft", "KeyA", "KeyD"].includes(event.code)) {
        this.tilt = false;
      }  
      this.pressedkeys.delete(event.code);
    });
    window.addEventListener('keydown', (event) => {
      const xdir = this.vehicle.rotation.x;
      const ydir = this.vehicle.rotation.y;
      const zdir = this.vehicle.rotation.z;  
      const dir = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(xdir, ydir, zdir, 'XYZ'));  
      if (["ArrowRight", "ArrowLeft", "KeyA", "KeyD"].includes(event.code)) {
        this.tilt = true;
        this.handleTilt(event.code);
      }  
      this.pressedkeys.add(event.code);  
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyW', 'KeyS', 'KeyD', 'KeyA'].includes(event.code)) {
        event.preventDefault();
      }
      if (this.pressedkeys.has('KeyW')) {
        this.vehicle.position.x += -dir.x * speed;
        if (this.currentVehicle === "Helicopter") {
          this.vehicle.position.y += -dir.y * speed;
        }
        this.vehicle.position.z += -dir.z * speed;
      }
      if (this.pressedkeys.has('KeyS')) {
        this.vehicle.position.x += dir.x * speed;
        if (this.currentVehicle === "Helicopter") {
          this.vehicle.position.y += dir.y * speed;
        }
        this.vehicle.position.z += dir.z * speed;
      }
      if (this.currentVehicle === "Helicopter") {  
        if (this.pressedkeys.has('ArrowUp')) {
            this.vehicle.rotation.z -= this.degToRad(1);
        }  
        if (this.pressedkeys.has('ArrowDown')) {
            this.vehicle.rotation.z += this.degToRad(1);
        }
      }
      this.Camera.position.x = this.vehicle.position.x 
      this.Camera.position.y = this.vehicle.position.y + 20
      this.Camera.position.z = this.vehicle.position.z + 100
    });
  }  
  handleTilt(code: string) {
    const turnStep = this.degToRad(3); 
    const maxLean = this.degToRad(30);      
    const leanStep = this.degToRad(1); 
    this.currentLean = this.currentLean ?? 0;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.vehicle.quaternion).normalize();
    let side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
    if (side.lengthSq() === 0) {
      side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(1, 0, 0));
    }
    side.normalize();
    if (this.pressedkeys.has('ArrowLeft') || this.pressedkeys.has('KeyA')) {
        const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.pressedkeys.has('KeyS') ? -turnStep : turnStep);
        this.vehicle.quaternion.multiply(yaw);
      if (this.currentVehicle === "Helicopter" && this.currentLean > -maxLean) {
        const lean = new THREE.Quaternion().setFromAxisAngle(side, -leanStep);
        this.vehicle.quaternion.multiply(lean);
        this.currentLean -= leanStep;
      }
    }
    if (this.pressedkeys.has('ArrowRight') || this.pressedkeys.has('KeyD')) {
        const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.pressedkeys.has('KeyS') ? turnStep : -turnStep);
        this.vehicle.quaternion.multiply(yaw);
      if (this.currentVehicle === "Helicopter" && this.currentLean < maxLean) {
        const lean = new THREE.Quaternion().setFromAxisAngle(side, leanStep);
        this.vehicle.quaternion.multiply(lean);
        this.currentLean += leanStep;
      }
    }
  }
  ChangeVehicle(vehicle:string){
    this.currentVehicle = vehicle
    this.vehicle.clear()
    this.vehicle.rotation.y = this.degToRad(0)
    this.vehicleSelected = true
    this.mouseMovements()
    this.vehicleMovements()
    this.createVehicle()
    this.BasicSceneSettings()
  }
  SelectVehicle(){
    this.vehicleSelected = false
  }
}
