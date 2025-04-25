import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-comp',
  standalone: false,
  templateUrl: './comp.component.html',
  styleUrl: './comp.component.scss'
})
export class CompComponent implements OnInit {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;
  number : number = 1;
  scene : THREE.Scene = new THREE.Scene();
  mesh!: THREE.Group;
  camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,0.1,1000)
  renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha : true });
  degToRad = (degrees: number) => degrees * (Math.PI / 180);
  isDragging : boolean= false;
  previousMousePosition:any = {
    x: 0,
    y: 0
  };
  rigidBodies: any[] = [];  // Declare rigidBodies array
  physicsWorld: any;
  pressedkeys = new Set<String>()
  Camera: any;
  vehicle: any;
  vehicleMeshes!: { chassis: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>; wheels: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>[]; };
  clock = new THREE.Clock();
  chassisBody: any;
  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor('#B4EBE6');
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;  // Enable shadow map
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 100, 0);
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1000;
    light.castShadow = true;  
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x404040));
    const tmpTrans = new (window as any).Ammo.btTransform();
    const animate = () => {
      requestAnimationFrame(animate);
      if (this.physicsWorld) {
        this.physicsWorld.stepSimulation(1 / 60, 10);
        for (const obj of this.rigidBodies) {
          const motionState = obj.body.getMotionState();
          if (motionState) {
            motionState.getWorldTransform(tmpTrans);
            const origin = tmpTrans.getOrigin();
            const rotation = tmpTrans.getRotation();            
            obj.mesh.position.set(origin.x(), origin.y(), origin.z());
            obj.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
          }
        }
      }
      if (this.chassisBody) {
        const motionState = this.chassisBody.getMotionState();
        if (motionState) {
          const transform = new (window as any).Ammo.btTransform();
          motionState.getWorldTransform(transform);
          
          const origin = transform.getOrigin();
          const rotation = transform.getRotation();
          const offset = new THREE.Vector3(-8, 4, 0); 
          const quaternion = new THREE.Quaternion(
            rotation.x(), rotation.y(), rotation.z(), rotation.w()
          );
          offset.applyQuaternion(quaternion);
          this.camera.position.set(origin.x() + offset.x,origin.y() + offset.y,origin.z() + offset.z);
          this.camera.lookAt(origin.x(), origin.y(), origin.z());
          
          (window as any).Ammo.destroy(transform);
        }
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
    const waitForAmmo = () => {
      const AmmoLib = (window as any).Ammo;
      if (AmmoLib && AmmoLib.btVector3) {
        const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
        const dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
        const broadphase = new AmmoLib.btDbvtBroadphase();
        const solver = new AmmoLib.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new AmmoLib.btDiscreteDynamicsWorld(dispatcher,broadphase,solver,collisionConfiguration);
        this.physicsWorld.setGravity(new AmmoLib.btVector3(0, -9.8, 0));
        this.createAmmoGround(AmmoLib, this.physicsWorld);
        // this.createFallingBall(AmmoLib, this.physicsWorld,10,5);
        this.createVehicle(AmmoLib, this.physicsWorld);
      } else {
        setTimeout(waitForAmmo, 50);
      }
    };
    waitForAmmo(); 
  }  
  createAmmoGround(AmmoLib: any, physicsWorld: any): void {
    const groundShape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(500, 1, 500)); 
    const groundTransform = new AmmoLib.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new AmmoLib.btVector3(0, -5, 0));
    const mass = 0;  
    const localInertia = new AmmoLib.btVector3(0, 0, 0);
    if (mass !== 0) {
      groundShape.calculateLocalInertia(mass, localInertia);
    }
    const motionState = new AmmoLib.btDefaultMotionState(groundTransform);
    const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, groundShape, localInertia);
    const body = new AmmoLib.btRigidBody(rbInfo);
    body.setRestitution(0.8);
    physicsWorld.addRigidBody(body);
    const geometry = new THREE.BoxGeometry(1000, 2, 1000); 
    const material = new THREE.MeshStandardMaterial({ color: "#90C67C" });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -5, 0);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }
  createFallingBall(AmmoLib: any, physicsWorld: any, yPosition:number, ballMass:number): void {
    const radius = 1;
    const ballShape = new AmmoLib.btSphereShape(radius);
    const ballTransform = new AmmoLib.btTransform();
    ballTransform.setIdentity();
    ballTransform.setOrigin(new AmmoLib.btVector3(0, yPosition, 0)); 
    const mass = ballMass;
    const localInertia = new AmmoLib.btVector3(0, 0, 0);
    ballShape.calculateLocalInertia(mass, localInertia);
    const motionState = new AmmoLib.btDefaultMotionState(ballTransform);
    const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, ballShape, localInertia);
    const body = new AmmoLib.btRigidBody(rbInfo);
    body.setRestitution(0.8);
    body.setFriction(0.5);
    body.setRollingFriction(0.1); 
    physicsWorld.addRigidBody(body);
    console.log('Ball added to physics world.');
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, mass == 10 ?  material : new THREE.MeshStandardMaterial({color : '#FFFFFF'}));
    mesh.position.set(0, yPosition, 0);  
    mesh.castShadow = true; 
    mesh.receiveShadow = true
    this.scene.add(mesh);
    this.rigidBodies.push({ mesh, body });
    const forceDirection = new THREE.Vector3(0, 0, 0);
    window.addEventListener('keydown', (event) => {
      const speed = 20;
      this.pressedkeys.add(event.code)
      if (this.pressedkeys.has('KeyW')) {
        forceDirection.z = -2; 
      } if (this.pressedkeys.has('KeyS')) {
        forceDirection.z = 2;  
      }  if (this.pressedkeys.has('ArrowLeft') || this.pressedkeys.has('KeyA')) {
        forceDirection.x = -2; 
      }  if (this.pressedkeys.has('ArrowRight') || this.pressedkeys.has('KeyD')) {
        forceDirection.x = 2;  
      }
      if (forceDirection.length() > 0) {
        body.activate();
        const force = new AmmoLib.btVector3(forceDirection.x * speed, forceDirection.y, forceDirection.z * speed);
        body.applyCentralForce(force);
      }
    const cameraSpeed = 20;
    if (this.pressedkeys.has('KeyW')) {
      this.Camera.position.z -= cameraSpeed;
    }
    if (this.pressedkeys.has('KeyS')) {
      this.Camera.position.z += cameraSpeed;
    }
    if (this.pressedkeys.has('ArrowLeft') || this.pressedkeys.has('KeyA')) {
      this.Camera.position.x -= cameraSpeed;
    }
    if (this.pressedkeys.has('ArrowRight') || this.pressedkeys.has('KeyD')) {
      this.Camera.position.x += cameraSpeed;
    }
      event.preventDefault();
    });
    window.addEventListener('keyup', (event) => {
      if (event.code == 'KeyW') {
        forceDirection.z = 0; 
      } if (event.code == 'KeyS') {
        forceDirection.z = 0;  
      }  if (event.code == 'ArrowLeft' || event.code == 'KeyA') {
        forceDirection.x = 0; 
      }  if (event.code == 'ArrowRight' || event.code == 'KeyD') {
        forceDirection.x = 0;  
      }
      this.pressedkeys.delete(event.code);
    });
  }
  createVehicle(AmmoLib: any, physicsWorld: any): void {
    const chassisWidth = 1.8;
    const chassisHeight = 0.6;
    const chassisLength = 4;
    const massVehicle = 500;
    const wheelDirectionCS0 = new AmmoLib.btVector3(0, -1, 0);
    const wheelAxleCS = new AmmoLib.btVector3(-1, 0, 0);
    const suspensionRestLength = 0.6;
    const wheelRadius = 0.6;
  
    const halfTrack = chassisWidth / 2 + 0.2;
    const wheelBase = chassisLength / 2 - 0.7;
    const wheelYOffset = -chassisHeight / 2 + wheelRadius;
    const chassisShape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(chassisWidth / 2, chassisHeight / 2, chassisLength / 2));
    const transform = new AmmoLib.btTransform();
    transform.setIdentity();
    const chassisStartY =-5+ wheelRadius + suspensionRestLength + (chassisHeight / 2);
    transform.setOrigin(new AmmoLib.btVector3(0, chassisStartY, 0));
    
    const motionState = new AmmoLib.btDefaultMotionState(transform);
    const localInertia = new AmmoLib.btVector3(0, 0, 0);
    chassisShape.calculateLocalInertia(massVehicle, localInertia);
    const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(massVehicle, motionState, chassisShape, localInertia);
    this.chassisBody = new AmmoLib.btRigidBody(rbInfo);
    this.chassisBody.setActivationState(4);
    physicsWorld.addRigidBody(this.chassisBody);
  
    // THREE.js chassis mesh
    const chassisGeometry = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength);
    const chassisMaterial = new THREE.MeshStandardMaterial({ color: 0x5500ff });
    const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassisMesh.castShadow = true;
    chassisMesh.position.set(0, chassisStartY, 0);
    this.scene.add(chassisMesh);
    
    // Vehicle setup
    const tuning = new AmmoLib.btVehicleTuning();
    tuning.set_m_suspensionStiffness(20.0);        // How stiff the suspension is
    tuning.set_m_suspensionCompression(4.0);       // Shock absorber compression speed
    tuning.set_m_suspensionDamping(2.3);           // Shock absorber rebound damping
    tuning.set_m_maxSuspensionTravelCm(500.0);     // Max travel in cm
    tuning.set_m_maxSuspensionForce(10000.0); 
    const vehicleRayCaster = new AmmoLib.btDefaultVehicleRaycaster(physicsWorld);
    const vehicle = new AmmoLib.btRaycastVehicle(tuning, this.chassisBody, vehicleRayCaster);
    vehicle.setCoordinateSystem(0, 1, 2); // x=right, y=up, z=forward
    physicsWorld.addAction(vehicle);




    this.vehicle = vehicle;
    
    // Wheel setup
    
    const wheelPositions = [
      { pos: new AmmoLib.btVector3(-halfTrack, wheelYOffset,  wheelBase), front: true },   // Front-left
      { pos: new AmmoLib.btVector3( halfTrack, wheelYOffset,  wheelBase), front: true },   // Front-right
      { pos: new AmmoLib.btVector3(-halfTrack, wheelYOffset, -wheelBase), front: false },  // Rear-left
      { pos: new AmmoLib.btVector3( halfTrack, wheelYOffset, -wheelBase), front: false }   // Rear-right
    ];
    
    const wheelMeshes: THREE.Mesh[] = [];
    
    // Add wheels
    wheelPositions.forEach((wheel, i) => {
      const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.3, 24);
      wheelGeometry.rotateZ(Math.PI / 2);
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelMesh.castShadow = true;
      this.scene.add(wheelMesh);
      wheelMeshes.push(wheelMesh);
      vehicle.addWheel(
        wheel.pos,
        wheelDirectionCS0,
        wheelAxleCS,
        suspensionRestLength,
        wheelRadius,
        tuning,
        wheel.front
      );
      const wheelInfo = vehicle.getWheelInfo(i);
      wheelInfo.set_m_wheelsDampingRelaxation(2.3);
wheelInfo.set_m_wheelsDampingCompression(4.4);
wheelMeshes[i].rotation.set(0, 0, 0);
      // then update visual positions
      vehicle.updateWheelTransform(i, true);
    });
    
    this.vehicleMeshes = { chassis: chassisMesh, wheels: wheelMeshes };
    
    // --- Sync visual chassis & wheels each frame
    const updateVehicle = () => {
      const tm =  this.chassisBody.getWorldTransform();
      const p = tm.getOrigin();
      const q = tm.getRotation();
      chassisMesh.position.set(p.x(), p.y(), p.z());
      chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
      for (let i = 0; i < vehicle.getNumWheels(); i++) {
        vehicle.updateWheelTransform(i, true);
        const wt = vehicle.getWheelTransformWS(i);
        const wp = wt.getOrigin();
        const wq = wt.getRotation();
        const mesh = wheelMeshes[i];
        mesh.position.set(wp.x(), wp.y(), wp.z());
        mesh.quaternion.set(wq.x(), wq.y(), wq.z(), wq.w());
      }
      
      requestAnimationFrame(updateVehicle);
    };
    
    updateVehicle();
    window.addEventListener('keydown', (event) => {
      this.pressedkeys.add(event.code);    
      const engineForce = 2000;
      const brakeForce = 100;
      const steering = 0.5;
      if(["KeyW","KeyS","KeyD","KeyA","ArrowRight","ArrowUp","ArrowLeft","ArrowDown","Space"].includes(event.code))
        event.preventDefault()
      if (this.vehicle) {
        if (this.pressedkeys.has('KeyW')) {
          this.vehicle.applyEngineForce(engineForce, 2); 
          this.vehicle.applyEngineForce(engineForce, 3);
          this.vehicle.setBrake(0, 2);
          this.vehicle.setBrake(0, 3);
        }
    
        if (this.pressedkeys.has('KeyS')) {
          this.vehicle.applyEngineForce(-engineForce/3, 2); 
          this.vehicle.applyEngineForce(-engineForce/3, 3);
          this.vehicle.setBrake(0, 2);
          this.vehicle.setBrake(0, 3);
        }
    
        if (this.pressedkeys.has('KeyA') || this.pressedkeys.has('ArrowLeft')) {
          this.vehicle.setSteeringValue(steering, 0); 
          this.vehicle.setSteeringValue(steering, 1); 
        }
    
        if (this.pressedkeys.has('KeyD') || this.pressedkeys.has('ArrowRight')) {
          this.vehicle.setSteeringValue(-steering, 0);
          this.vehicle.setSteeringValue(-steering, 1);
        }

        if (this.pressedkeys.has('Space')) {
          this.vehicle.setBrake(brakeForce, 2);
          this.vehicle.setBrake(brakeForce, 3); 
          this.vehicle.applyEngineForce(0, 2);
          this.vehicle.applyEngineForce(0, 3);
        }
      }
    });
    
    window.addEventListener('keyup', (event) => {
      if (this.vehicle) {
        if (event.code === 'KeyW' || event.code === 'KeyS') {
          this.vehicle.applyEngineForce(0, 2);
          this.vehicle.applyEngineForce(0, 3);
          this.vehicle.setBrake(0, 2);
          this.vehicle.setBrake(0, 3);
        }
    
        if (event.code === 'KeyA' || event.code === 'ArrowLeft' ||
            event.code === 'KeyD' || event.code === 'ArrowRight') {
          this.vehicle.setSteeringValue(0, 0);
          this.vehicle.setSteeringValue(0, 1);
        }
      }
    
      this.pressedkeys.delete(event.code);
    });
    
    
  }
  
  
  beforeObjectCreation(){
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);
    this.mouseMovements()
  } 
  createCustomerTube(){
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/wheel.jpg');
  }
  mouseMovements(){
    console.log("helo")
    this.renderer.domElement.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
      };
    });    
    this.renderer.domElement.addEventListener('mouseup', () => {
      this.isDragging = false;
    });    
    this.renderer.domElement.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });   
    this.renderer.domElement.addEventListener('mousemove', (event) => {
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
