import { Injectable } from '@angular/core';
import * as THREE from 'three';
declare const Ammo: any;

@Injectable({
  providedIn: 'root',
})
export class AmmoServiceService {
  ammo: any;
  physicsWorld: any;
  rigidBodies: any[] = [];
  tmpTransform: any;

  async init(): Promise<void> {
    this.ammo = await Ammo();
    this.setupPhysicsWorld();
  }
  private setupPhysicsWorld(): void {
    const collisionConfig = new this.ammo.btDefaultCollisionConfiguration();
    const dispatcher = new this.ammo.btCollisionDispatcher(collisionConfig);
    const broadphase = new this.ammo.btDbvtBroadphase();
    const solver = new this.ammo.btSequentialImpulseConstraintSolver();

    this.physicsWorld = new this.ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfig);
    this.physicsWorld.setGravity(new this.ammo.btVector3(0, -9.8, 0));

    this.tmpTransform = new this.ammo.btTransform();
  }

  addRigidBody(mesh: THREE.Mesh, mass: number, group = 1, mask = -1): void {
    const shape = new this.ammo.btBoxShape(
      new this.ammo.btVector3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5)
    );

    const transform = new this.ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));

    const motionState = new this.ammo.btDefaultMotionState(transform);
    const localInertia = new this.ammo.btVector3(0, 0, 0);
    if (mass !== 0) shape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new this.ammo.btRigidBody(rbInfo);

    this.physicsWorld.addRigidBody(body, group, mask);

    mesh.userData['physicsBody'] = body;
    this.rigidBodies.push(mesh);
  }

  updatePhysics(deltaTime: number): void {
    this.physicsWorld.stepSimulation(deltaTime, 10);

    for (const mesh of this.rigidBodies) {
      const body = mesh.userData.physicsBody;
      const motionState = body.getMotionState();
      if (motionState) {
        motionState.getWorldTransform(this.tmpTransform);
        const origin = this.tmpTransform.getOrigin();
        const rotation = this.tmpTransform.getRotation();
        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }
  }
}