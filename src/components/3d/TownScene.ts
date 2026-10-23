import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Pre-allocated math objects to guarantee zero Garbage Collection during render loop
const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export interface SceneCallbacks {
  onPoleClick?: (poleIndex: number) => void;
  onSynagogueClick?: () => void;
}

export class TownScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Camera targets for smooth damping
  private desiredCameraPos = new THREE.Vector3(0, 16, 24);
  private desiredLookAt = new THREE.Vector3(0, 0, 0);
  private currentLookAt = new THREE.Vector3(0, 0, 0);

  // Scene elements
  public poles: THREE.Group[] = [];
  public wireMeshes: THREE.Line[] = [];
  public virtualWallMeshes: THREE.Mesh[] = [];
  public synagogueGroup: THREE.Group | null = null;
  public matzahBoxGroup: THREE.Group | null = null;
  public pedestriansGroup: THREE.Group = new THREE.Group();
  public brokenWireGroup: THREE.Group = new THREE.Group();

  // State
  public showVirtualWalls: boolean = true;
  public isEruvKosher: boolean = false;
  private callbacks: SceneCallbacks = {};

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private interactiveObjects: THREE.Object3D[] = [];

  // Orbit control emulation / dragging & touch gestures
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 30, theta: 0.8, phi: 1.1 };
  private touchPinchDistance: number = 0;
  private touchStartTime: number = 0;
  private touchStartPos = { x: 0, y: 0 };
  private hasMovedSignificantly = false;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1726);
    this.scene.fog = new THREE.FogExp2(0x0e1726, 0.015);

    // Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    this.camera.position.set(0, 18, 26);
    this.desiredCameraPos.copy(this.camera.position);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Studio Environment (RoomEnvironment via PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting rig
    this.setupLighting();

    // Build the 3D town world
    this.buildTown();

    // Setup input listeners
    this.setupEventListeners();

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // Start tick
    this.animate();
  }

  private setupLighting() {
    // Warm key sunlight (late Friday afternoon sun before sunset)
    const keyLight = new THREE.DirectionalLight(0xffecd2, 2.2);
    keyLight.position.set(28, 35, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 120;
    const d = 32;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cool sky / warm ground hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x334155, 0.9);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // Soft golden rim light
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
    rimLight.position.set(-20, 15, -25);
    this.scene.add(rimLight);
  }

  private createRoadTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Asphalt color
    ctx.fillStyle = '#262930';
    ctx.fillRect(0, 0, 512, 512);

    // Fine asphalt grain
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(30 + Math.random() * 25);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Dashed center yellow line
    ctx.fillStyle = '#fbbf24';
    ctx.lineWidth = 10;
    for (let y = 16; y < 512; y += 48) {
      ctx.fillRect(251, y, 10, 28);
    }

    // White edge borders
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(35, 0, 8, 512);
    ctx.fillRect(469, 0, 8, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  private buildTown() {
    // 1. Natural Terrain Ground
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Grassy neighborhood block (elevated slightly by 0.03 to avoid z-fighting)
    const lawnGeo = new THREE.PlaneGeometry(48, 48);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a2f,
      roughness: 0.95,
      metalness: 0.05,
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(0, 0.03, 0);
    lawn.receiveShadow = true;
    this.scene.add(lawn);

    // 3. Roads surrounding the center block
    const roadMat = new THREE.MeshStandardMaterial({
      roughness: 0.75,
      metalness: 0.2,
      map: this.createRoadTexture(),
    });

    // Ring roads
    const roadConfigs = [
      { x: 0, z: 27, w: 56, h: 8, rot: 0 },
      { x: 0, z: -27, w: 56, h: 8, rot: 0 },
      { x: 27, z: 0, w: 8, h: 56, rot: 0 },
      { x: -27, z: 0, w: 8, h: 56, rot: 0 },
    ];

    roadConfigs.forEach(r => {
      const roadGeo = new THREE.PlaneGeometry(r.w, r.h);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(r.x, 0.04, r.z);
      road.receiveShadow = true;
      this.scene.add(road);
    });

    // 4. Sidewalks along the lawn perimeter
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
      metalness: 0.1,
    });
    const curbGeoH = new THREE.BoxGeometry(50, 0.12, 1.4);
    const curbGeoV = new THREE.BoxGeometry(1.4, 0.12, 50);

    const curbN = new THREE.Mesh(curbGeoH, sidewalkMat);
    curbN.position.set(0, 0.06, 23.3);
    curbN.receiveShadow = true;
    this.scene.add(curbN);

    const curbS = new THREE.Mesh(curbGeoH, sidewalkMat);
    curbS.position.set(0, 0.06, -23.3);
    curbS.receiveShadow = true;
    this.scene.add(curbS);

    const curbE = new THREE.Mesh(curbGeoV, sidewalkMat);
    curbE.position.set(23.3, 0.06, 0);
    curbE.receiveShadow = true;
    this.scene.add(curbE);

    const curbW = new THREE.Mesh(curbGeoV, sidewalkMat);
    curbW.position.set(-23.3, 0.06, 0);
    curbW.receiveShadow = true;
    this.scene.add(curbW);

    // 5. Buildings
    this.buildSynagogue();
    this.buildTownHouses();

    // 6. Trees and street decor
    this.buildTreesAndProps();

    // 7. Eruv Poles & Wires
    this.buildEruvPerimeter();

    // 8. Virtual walls
    this.buildVirtualWalls();

    // 9. Pedestrians (emerge when eruv is kosher)
    this.buildPedestrians();
    this.scene.add(this.pedestriansGroup);
  }

  /**
   * Central Synagogue (Beit Knesset)
   * 10-part procedural model with arched portico, dome, and stone walls
   */
  private buildSynagogue() {
    const group = new THREE.Group();
    group.position.set(0, 0, -6);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd6cbb7,
      roughness: 0.65,
      metalness: 0.15,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x243c5a,
      roughness: 0.4,
      metalness: 0.3,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.85,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
    });

    // 1. Foundation base
    const baseGeo = new THREE.BoxGeometry(10, 0.6, 9);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.3;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // 2. Entrance steps
    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(4.5 - s * 0.4, 0.15, 1.2),
        stoneMat
      );
      step.position.set(0, 0.075 + s * 0.15, 4.8 - s * 0.35);
      step.receiveShadow = true;
      group.add(step);
    }

    // 3. Main sanctuary body
    const bodyGeo = new THREE.BoxGeometry(9, 4.5, 8);
    const body = new THREE.Mesh(bodyGeo, stoneMat);
    body.position.y = 2.85;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 4. Arched entryway surround
    const archPortal = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 3.4, 0.6),
      roofMat
    );
    archPortal.position.set(0, 2.1, 4.25);
    archPortal.castShadow = true;
    group.add(archPortal);

    // 5. Entrance doors
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.6,
      metalness: 0.2,
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, 0.2), doorMat);
    door.position.set(0, 1.8, 4.5);
    group.add(door);

    // 6. Arched stained glass windows
    [-3, 3].forEach(wx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.3), glassMat);
      win.position.set(wx, 3.2, 4.05);
      group.add(win);
    });

    // 7. Roof cornice & pediment
    const corniceGeo = new THREE.BoxGeometry(9.6, 0.4, 8.6);
    const cornice = new THREE.Mesh(corniceGeo, roofMat);
    cornice.position.y = 5.25;
    cornice.castShadow = true;
    group.add(cornice);

    // 8. Pitched roof / dome base
    const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.7, 1.2, 16), roofMat);
    domeBase.position.y = 5.9;
    domeBase.castShadow = true;
    group.add(domeBase);

    // 9. Central Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      goldMat
    );
    dome.position.y = 6.4;
    dome.castShadow = true;
    group.add(dome);

    // 10. Star emblem / Finial atop dome
    const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), goldMat);
    finial.position.y = 9.0;
    group.add(finial);

    // Communal Matzah Box table setup inside / at porch
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 0.7 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.8), tableMat);
    table.position.set(0, 0.8, 3.8);
    table.castShadow = true;
    group.add(table);

    // Matzah Box (Communal Eruv Chatzerot deposit)
    this.matzahBoxGroup = new THREE.Group();
    this.matzahBoxGroup.position.set(0, 1.35, 3.8);

    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.3,
      metalness: 0.4,
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.5), boxMat);
    box.castShadow = true;
    this.matzahBoxGroup.add(box);

    // Hebrew label or ribbon
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.08, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 })
    );
    this.matzahBoxGroup.add(ribbon);

    // Soft beacon above matzah box
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xfacc15,
        emissiveIntensity: 0.9,
      })
    );
    beacon.position.y = 0.4;
    this.matzahBoxGroup.add(beacon);

    // Initially hidden until placed, or visible with glow
    group.add(this.matzahBoxGroup);

    // Make synagogue clickable
    body.userData = { isSynagogue: true };
    this.interactiveObjects.push(body);

    this.synagogueGroup = group;
    this.scene.add(group);
  }

  /**
   * Residential houses with front yards, porches, and chimneys
   */
  private buildTownHouses() {
    const houseConfigs = [
      { x: -14, z: 8, rot: 0, color: 0x94a3b8, roofColor: 0x7c2d12 },
      { x: -14, z: -8, rot: 0, color: 0xc4b5fd, roofColor: 0x334155 },
      { x: 14, z: 8, rot: Math.PI, color: 0xfde68a, roofColor: 0x854d0e },
      { x: 14, z: -8, rot: Math.PI, color: 0xa7f3d0, roofColor: 0x065f46 },
      { x: 0, z: 12, rot: Math.PI / 2, color: 0xfbcfe8, roofColor: 0x831843 },
    ];

    houseConfigs.forEach(cfg => {
      const hGroup = new THREE.Group();
      hGroup.position.set(cfg.x, 0, cfg.z);
      hGroup.rotation.y = cfg.rot;

      const wallMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.7,
        metalness: 0.1,
      });

      const roofMat = new THREE.MeshStandardMaterial({
        color: cfg.roofColor,
        roughness: 0.5,
        metalness: 0.2,
      });

      // House main block
      const mainGeo = new THREE.BoxGeometry(6.5, 3.8, 5.5);
      const mainMesh = new THREE.Mesh(mainGeo, wallMat);
      mainMesh.position.y = 1.9;
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      hGroup.add(mainMesh);

      // Pitched roof (Triangular Prism via Cone / Cylinder or Extrude)
      const roofGeo = new THREE.ConeGeometry(5.2, 2.2, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 4.8;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(0.9, 1, 1.25);
      roof.castShadow = true;
      hGroup.add(roof);

      // Front porch
      const porch = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.2, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 })
      );
      porch.position.set(0, 0.1, 3.3);
      porch.receiveShadow = true;
      hGroup.add(porch);

      // Door
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.2, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 })
      );
      door.position.set(0, 1.3, 2.8);
      hGroup.add(door);

      // Chimney
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 2.2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 })
      );
      chimney.position.set(1.8, 5.0, -1);
      chimney.castShadow = true;
      hGroup.add(chimney);

      // Fence around private yard (Reshut HaYachid demonstration)
      const fenceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
      const fenceL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 6), fenceMat);
      fenceL.position.set(-4, 0.4, 1);
      fenceL.castShadow = true;
      hGroup.add(fenceL);

      this.scene.add(hGroup);
    });
  }

  /**
   * Procedural trees, street lamps, fire hydrants, baby stroller
   */
  private buildTreesAndProps() {
    // 1. Procedural 4-part trees
    const treePositions = [
      { x: -7, z: 7 },
      { x: 7, z: 7 },
      { x: -7, z: -14 },
      { x: 7, z: -14 },
      { x: -18, z: 0 },
      { x: 18, z: 0 },
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 }),
    ];

    treePositions.forEach((pos, idx) => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 2.5, 8), trunkMat);
      trunk.position.y = 1.25;
      trunk.castShadow = true;
      tree.add(trunk);

      // 3 overlapping foliage clusters
      const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), leafMats[idx % 3]);
      foliage1.position.set(0, 2.8, 0);
      foliage1.castShadow = true;
      tree.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1), leafMats[(idx + 1) % 3]);
      foliage2.position.set(0.4, 3.6, 0.3);
      foliage2.castShadow = true;
      tree.add(foliage2);

      const foliage3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9), leafMats[(idx + 2) % 3]);
      foliage3.position.set(-0.3, 4.2, -0.2);
      foliage3.castShadow = true;
      tree.add(foliage3);

      this.scene.add(tree);
    });

    // 2. Fire Hydrant (Mekom Petur example - elevated > 3 tefachim, area < 4x4 tefachim)
    const hydrant = new THREE.Group();
    hydrant.position.set(12, 0, 16);

    const hydrantMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.6,
    });
    const hBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 12), hydrantMat);
    hBody.position.y = 0.45;
    hBody.castShadow = true;
    hydrant.add(hBody);

    const hCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), hydrantMat);
    hCap.position.y = 0.9;
    hydrant.add(hCap);

    const hSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), hydrantMat);
    hSpout.rotation.z = Math.PI / 2;
    hSpout.position.y = 0.6;
    hydrant.add(hSpout);

    this.scene.add(hydrant);

    // 3. Baby stroller near House 1
    const stroller = new THREE.Group();
    stroller.position.set(-11, 0, 9);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });

    // Chassis
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.9), frameMat);
    seat.position.y = 0.6;
    seat.castShadow = true;
    stroller.add(seat);

    // Wheels
    [[-0.4, -0.3], [-0.4, 0.3], [0.4, -0.3], [0.4, 0.3]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.18, wz);
      stroller.add(wheel);
    });

    // Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), frameMat);
    handle.rotation.x = Math.PI / 4;
    handle.position.set(0, 0.8, -0.5);
    stroller.add(handle);

    this.scene.add(stroller);
  }

  /**
   * The 8 Perimeter Eruv Utility Poles
   * Constructed with high detail (Wood Pole, Crossarm, Lechi strip, Top Cap groove, Guy wire)
   */
  private buildEruvPerimeter() {
    // 8 poles forming an octagon/rectangle enclosing the town
    const poleCoords: [number, number, number][] = [
      [-20, 0, 16],   // Pole 0: Large Gap Task
      [-10, 0, 20],   // Pole 1: Normal
      [0, 0, 20],     // Pole 2: Broken Wire Task (North Oak Ave)
      [10, 0, 20],    // Pole 3: Normal
      [20, 0, 16],    // Pole 4: Side Attachment Task (Maple St)
      [20, 0, -16],   // Pole 5: Normal
      [0, 0, -20],    // Pole 6: Leaning Pole Task (Parkway)
      [-20, 0, -16],  // Pole 7: Normal
    ];

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033, // Utility pole dark treated wood
      roughness: 0.85,
      metalness: 0.1,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.4,
      metalness: 0.75,
    });

    const lechiMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Sky blue plastic/wood strip (Lechi) commonly seen on municipal eruv poles!
      roughness: 0.5,
      metalness: 0.2,
    });

    const warningMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red marker for tasks
      roughness: 0.3,
      emissive: 0xef4444,
      emissiveIntensity: 0.4,
    });

    poleCoords.forEach((pos, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(pos[0], pos[1], pos[2]);

      // 1. Concrete base footer
      const footer = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.5, 12), metalMat);
      footer.position.y = 0.25;
      footer.receiveShadow = true;
      pGroup.add(footer);

      // 2. Main wooden telephone pole (Height: 5.5 meters)
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 5.5, 12);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.0;
      pole.castShadow = true;
      pGroup.add(pole);

      // 3. Crossarm bracket
      const crossarm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.15), metalMat);
      crossarm.position.y = 5.3;
      crossarm.castShadow = true;
      pGroup.add(crossarm);

      // 4. Glass / Ceramic insulators
      [-0.6, 0.6].forEach(ix => {
        const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8), metalMat);
        ins.position.set(ix, 5.48, 0);
        pGroup.add(ins);
      });

      // 5. The Halachic Lechi (Doorpost Strip):
      // The crucial vertical strip affixed to the pole running from the ground all the way up under the wire!
      const lechiGeo = new THREE.BoxGeometry(0.06, 5.2, 0.08);
      const lechi = new THREE.Mesh(lechiGeo, lechiMat);
      lechi.position.set(0, 2.7, 0.22);
      pGroup.add(lechi);

      // 6. Top cap / Grooved Saddle directly overhead ("Al Gabav")
      const capSaddle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), metalMat);
      capSaddle.position.set(0, 5.62, 0);
      pGroup.add(capSaddle);

      // Task 2: Pole 4 has wire attached to SIDE bracket!
      if (idx === 4) {
        const sideBracket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.08), warningMat);
        sideBracket.position.set(0.35, 4.8, 0);
        sideBracket.name = 'sideBracket';
        pGroup.add(sideBracket);
      }

      // Task 3: Pole 6 is severely leaning!
      if (idx === 6) {
        pGroup.rotation.z = 0.35; // Leaning 20 degrees!
      }

      // Inspection Marker Beacon above pole
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3, 0),
        warningMat
      );
      marker.position.y = 6.4;
      marker.name = `marker_${idx}`;
      pGroup.add(marker);

      // Metadata for raycasting
      pGroup.userData = { poleIndex: idx };
      pole.userData = { poleIndex: idx };
      this.interactiveObjects.push(pole);

      this.poles.push(pGroup);
      this.scene.add(pGroup);
    });

    // Reconstruct the connecting wire network
    this.updateWireNetwork();
  }

  /**
   * Generates or refreshes the continuous high-visibility perimeter wire
   */
  public updateWireNetwork(fixedTasks: { [key: string]: boolean } = {}) {
    // Remove existing wire lines
    this.wireMeshes.forEach(line => this.scene.remove(line));
    this.wireMeshes = [];
    this.scene.remove(this.brokenWireGroup);
    this.brokenWireGroup = new THREE.Group();

    const isBrokenFixed = fixedTasks['broken-wire'] !== false;
    const isSideFixed = fixedTasks['side-attachment'] !== false;
    const isGapFixed = fixedTasks['large-gap'] !== false;
    const isLeaningFixed = fixedTasks['leaning-pole'] !== false;
    const isSlackFixed = fixedTasks['slack-wire'] !== false;
    const isLavudFixed = fixedTasks['lavud-gap'] !== false;
    const isLeaseFixed = fixedTasks['sechirat-reshut'] !== false;

    // Update pole 6 rotation if fixed
    if (this.poles[6]) {
      this.poles[6].rotation.z = isLeaningFixed ? 0 : 0.35;
    }

    // Material for kosher wire vs pasul wire
    const kosherWireMat = new THREE.LineBasicMaterial({
      color: 0x10b981, // Emerald green
      linewidth: 3,
    });

    const pasulWireMat = new THREE.LineBasicMaterial({
      color: 0xef4444, // Red
      linewidth: 3,
    });

    const count = this.poles.length;
    for (let i = 0; i < count; i++) {
      const nextIdx = (i + 1) % count;

      const pA = this.poles[i];
      const pB = this.poles[nextIdx];

      // Get world coordinates of top wire attachment
      const posA = new THREE.Vector3();
      const posB = new THREE.Vector3();

      pA.getWorldPosition(posA);
      pB.getWorldPosition(posB);

      posA.y += 5.6;
      posB.y += 5.6;

      // Handle Task 2: Pole 4 side attachment
      if (i === 4 && !isSideFixed) {
        posA.x += 0.45;
        posA.y -= 0.8;
      }
      if (nextIdx === 4 && !isSideFixed) {
        posB.x += 0.45;
        posB.y -= 0.8;
      }

      // Handle Task 1: Broken wire between Pole 2 and Pole 3
      if (i === 2 && !isBrokenFixed) {
        // Draw dangling broken segments with gravity droop!
        const midPoint = new THREE.Vector3().lerpVectors(posA, posB, 0.45);
        midPoint.y = 0.5; // fallen to the ground!

        const ptsA = [posA, new THREE.Vector3(posA.x + 1.5, posA.y - 1.5, posA.z), midPoint];
        const geoA = new THREE.BufferGeometry().setFromPoints(ptsA);
        const lineA = new THREE.Line(geoA, pasulWireMat);
        this.brokenWireGroup.add(lineA);

        const midPoint2 = new THREE.Vector3().lerpVectors(posA, posB, 0.55);
        midPoint2.y = 0.3;
        const ptsB = [midPoint2, new THREE.Vector3(posB.x - 1.5, posB.y - 1.5, posB.z), posB];
        const geoB = new THREE.BufferGeometry().setFromPoints(ptsB);
        const lineB = new THREE.Line(geoB, pasulWireMat);
        this.brokenWireGroup.add(lineB);

        this.scene.add(this.brokenWireGroup);
        continue;
      }

      // Handle Segment Halachic Validity
      let isSegmentKosher = true;
      if (i === 7 && !isGapFixed) {
        isSegmentKosher = false;
      }
      if ((i === 4 || nextIdx === 4) && !isSideFixed) {
        isSegmentKosher = false;
      }
      if ((i === 6 || nextIdx === 6) && !isLeaningFixed) {
        isSegmentKosher = false;
      }
      if ((i === 5 || nextIdx === 5) && !isSlackFixed) {
        isSegmentKosher = false;
      }
      if ((i === 1 || nextIdx === 1) && !isLavudFixed) {
        isSegmentKosher = false;
      }
      if ((i === 7 || nextIdx === 7) && !isLeaseFixed) {
        isSegmentKosher = false;
      }

      // Add slight natural catenary sag to realistic wire
      const points: THREE.Vector3[] = [];
      const segments = 12;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const pt = new THREE.Vector3().lerpVectors(posA, posB, t);
        
        let sag = Math.sin(t * Math.PI) * 0.18;
        // Thermal sag & wind sway between Pole 5 and Pole 6 if unfixed
        if (i === 5 && !isSlackFixed) {
          sag = Math.sin(t * Math.PI) * 0.82;
          pt.x += Math.sin(t * Math.PI) * 0.65;
        }

        pt.y -= sag;
        points.push(pt);
      }

      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wireMesh = new THREE.Line(
        wireGeo,
        isSegmentKosher && this.isEruvKosher ? kosherWireMat : pasulWireMat
      );
      this.wireMeshes.push(wireMesh);
      this.scene.add(wireMesh);
    }
  }

  /**
   * The "Gud Asek" (Pull and Ascend) Halachic Virtual Walls:
   * Glowing translucent vertical planes rising from the ground straight up to the wire overhead!
   */
  private buildVirtualWalls() {
    this.virtualWallMeshes.forEach(m => this.scene.remove(m));
    this.virtualWallMeshes = [];

    const wallMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const count = this.poles.length;
    for (let i = 0; i < count; i++) {
      const nextIdx = (i + 1) % count;
      const pA = this.poles[i];
      const pB = this.poles[nextIdx];

      const posA = new THREE.Vector3();
      const posB = new THREE.Vector3();
      pA.getWorldPosition(posA);
      pB.getWorldPosition(posB);

      const height = 5.6;
      const dist = posA.distanceTo(posB);
      const wallGeo = new THREE.PlaneGeometry(dist, height);

      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.lerpVectors(posA, posB, 0.5);
      wall.position.y = height / 2;

      // Orient plane between pA and pB
      const angle = Math.atan2(posB.z - posA.z, posB.x - posA.x);
      wall.rotation.y = -angle;

      wall.visible = this.showVirtualWalls && this.isEruvKosher;
      this.virtualWallMeshes.push(wall);
      this.scene.add(wall);
    }
  }

  /**
   * Pedestrians carrying permitted items on Shabbat (pushing strollers, carrying books)
   * Activated when eruv becomes kosher!
   */
  private buildPedestrians() {
    this.pedestriansGroup.clear();

    const walkerConfigs = [
      { x: -5, z: 10, rot: 0, hasStroller: true },
      { x: 3, z: 5, rot: Math.PI / 3, hasBook: true },
      { x: -2, z: -2, rot: Math.PI, hasBook: true },
      { x: 8, z: -4, rot: -Math.PI / 2, hasStroller: false },
    ];

    walkerConfigs.forEach(cfg => {
      const p = new THREE.Group();
      p.position.set(cfg.x, 0, cfg.z);
      p.rotation.y = cfg.rot;

      // Simple low-poly stylized character
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });

      // Legs
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.2), bodyMat);
      legL.position.set(-0.15, 0.35, 0);
      p.add(legL);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.2), bodyMat);
      legR.position.set(0.15, 0.35, 0);
      p.add(legR);

      // Torso / Shabbat suit
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      torso.position.set(0, 1.05, 0);
      p.add(torso);

      // Head with Kippah
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), skinMat);
      head.position.set(0, 1.6, 0);
      p.add(head);

      const kippah = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0x000000 }));
      kippah.position.set(0, 1.78, 0);
      p.add(kippah);

      // Carried Siddur (Prayer book)
      if (cfg.hasBook) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.3, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
        );
        book.position.set(0.35, 1.0, 0.2);
        p.add(book);
      }

      this.pedestriansGroup.add(p);
    });

    this.pedestriansGroup.visible = this.isEruvKosher;
  }

  public setEruvKosherStatus(isKosher: boolean, fixedTasks: { [key: string]: boolean }) {
    this.isEruvKosher = isKosher;
    this.updateWireNetwork(fixedTasks);

    // Update virtual walls visibility
    this.virtualWallMeshes.forEach(w => {
      w.visible = this.showVirtualWalls && isKosher;
    });

    // Update pedestrians visibility
    this.pedestriansGroup.visible = isKosher;

    // Update pole beacons
    this.poles.forEach((p, idx) => {
      const marker = p.getObjectByName(`marker_${idx}`) as THREE.Mesh;
      if (marker && marker.material instanceof THREE.MeshStandardMaterial) {
        const isPoleBroken = Object.entries(fixedTasks).some(([taskId, isFixed]) => {
          if (isFixed) return false;
          if (taskId === 'broken-wire' && idx === 2) return true;
          if (taskId === 'side-attachment' && idx === 4) return true;
          if (taskId === 'leaning-pole' && idx === 6) return true;
          if (taskId === 'large-gap' && idx === 0) return true;
          if (taskId === 'lavud-gap' && idx === 1) return true;
          if (taskId === 'slack-wire' && idx === 5) return true;
          if (taskId === 'sechirat-reshut' && idx === 7) return true;
          return false;
        });

        if (isKosher || !isPoleBroken) {
          marker.material.color.setHex(0x10b981);
          marker.material.emissive.setHex(0x10b981);
        } else {
          marker.material.color.setHex(0xef4444);
          marker.material.emissive.setHex(0xef4444);
        }
      }
    });
  }

  public toggleVirtualWalls(show: boolean) {
    this.showVirtualWalls = show;
    this.virtualWallMeshes.forEach(w => {
      w.visible = this.showVirtualWalls && this.isEruvKosher;
    });
  }

  /**
   * Smoothly move camera to target a specific pole or view
   */
  public focusOnPosition(pos: [number, number, number], target: [number, number, number]) {
    this.desiredCameraPos.set(pos[0], pos[1], pos[2]);
    this.desiredLookAt.set(target[0], target[1], target[2]);
  }

  public resetOverviewCamera() {
    this.desiredCameraPos.set(0, 20, 26);
    this.desiredLookAt.set(0, 0, 0);
  }

  private setupEventListeners() {
    const el = this.renderer.domElement;

    // Pointer events for dragging / orbit
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.spherical.theta -= deltaX * 0.006;
        this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, this.spherical.phi - deltaY * 0.006));

        // Recompute desired camera pos from spherical
        const x = this.desiredLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
        const y = this.desiredLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
        const z = this.desiredLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

        this.desiredCameraPos.set(x, y, z);

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Zoom via wheel
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(8, Math.min(60, this.spherical.radius + e.deltaY * 0.03));
      const x = this.desiredLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
      const y = this.desiredLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
      const z = this.desiredLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
      this.desiredCameraPos.set(x, y, z);
    }, { passive: false });

    // Click raycasting (Desktop mouse)
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.performRaycast();
    });

    // Touch event listeners for Mobile support
    el.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        const touch = e.touches[0];
        this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.touchStartTime = Date.now();
        this.hasMovedSignificantly = false;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchPinchDistance = Math.hypot(dx, dy);
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e: TouchEvent) => {
      // Prevent browser scroll or rubber-banding while navigating the 3D scene
      if (e.cancelable) e.preventDefault();

      if (e.touches.length === 1 && this.isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.previousMousePosition.x;
        const deltaY = touch.clientY - this.previousMousePosition.y;

        const moveDist = Math.hypot(touch.clientX - this.touchStartPos.x, touch.clientY - this.touchStartPos.y);
        if (moveDist > 8) {
          this.hasMovedSignificantly = true;
        }

        this.spherical.theta -= deltaX * 0.007;
        this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, this.spherical.phi - deltaY * 0.007));

        const x = this.desiredLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
        const y = this.desiredLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
        const z = this.desiredLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
        this.desiredCameraPos.set(x, y, z);

        this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        this.hasMovedSignificantly = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const diff = this.touchPinchDistance - newDist;

        this.spherical.radius = Math.max(8, Math.min(60, this.spherical.radius + diff * 0.08));
        const x = this.desiredLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
        const y = this.desiredLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
        const z = this.desiredLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
        this.desiredCameraPos.set(x, y, z);

        this.touchPinchDistance = newDist;
      }
    }, { passive: false });

    el.addEventListener('touchend', (e: TouchEvent) => {
      this.isDragging = false;
      const duration = Date.now() - this.touchStartTime;

      // Detect clean mobile tap (< 300ms, moved < 10px) to trigger selection
      if (!this.hasMovedSignificantly && duration < 320 && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = el.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        this.performRaycast();
      }
    });

    el.addEventListener('touchcancel', () => {
      this.isDragging = false;
    });

    // Window resize
    window.addEventListener('resize', this.onResize);
  }

  private performRaycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData.poleIndex !== undefined) {
        this.callbacks.onPoleClick?.(hit.userData.poleIndex);
      } else if (hit.userData.isSynagogue) {
        this.callbacks.onSynagogueClick?.();
      }
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Exponential smooth damping for camera position and look-at
    THREE.MathUtils.damp(this.camera.position.x, this.desiredCameraPos.x, 4.5, delta);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.desiredCameraPos.x, 4.5, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.desiredCameraPos.y, 4.5, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.desiredCameraPos.z, 4.5, delta);

    this.currentLookAt.x = THREE.MathUtils.damp(this.currentLookAt.x, this.desiredLookAt.x, 4.5, delta);
    this.currentLookAt.y = THREE.MathUtils.damp(this.currentLookAt.y, this.desiredLookAt.y, 4.5, delta);
    this.currentLookAt.z = THREE.MathUtils.damp(this.currentLookAt.z, this.desiredLookAt.z, 4.5, delta);

    this.camera.lookAt(this.currentLookAt);

    // Gentle floating animation on task beacons
    const time = this.clock.getElapsedTime();
    this.poles.forEach((p, idx) => {
      const marker = p.getObjectByName(`marker_${idx}`);
      if (marker) {
        marker.position.y = 6.4 + Math.sin(time * 3 + idx) * 0.15;
        marker.rotation.y += 0.02;
      }
    });

    // Gentle pulse on Matzah Box beacon
    if (this.matzahBoxGroup) {
      this.matzahBoxGroup.rotation.y = Math.sin(time * 2) * 0.1;
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
