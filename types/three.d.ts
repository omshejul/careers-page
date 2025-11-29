declare module "three" {
    export interface Uniform<T = any> {
        value: T;
    }

    export class Scene {
        add(object: any): void;
    }

    export class OrthographicCamera {
        constructor(
            left: number,
            right: number,
            top: number,
            bottom: number,
            near?: number,
            far?: number
        );
    }

    export class PlaneGeometry {
        constructor(width?: number, height?: number);
        dispose(): void;
    }

    export interface ShaderMaterialParameters {
        vertexShader?: string;
        fragmentShader?: string;
        uniforms?: Record<string, Uniform>;
        transparent?: boolean;
        premultipliedAlpha?: boolean;
    }

    export class ShaderMaterial {
        constructor(parameters?: ShaderMaterialParameters);
        uniforms: Record<string, Uniform>;
        dispose(): void;
    }

    export class Mesh {
        constructor(geometry?: any, material?: any);
    }

    export interface WebGLRendererParameters {
        alpha?: boolean;
        antialias?: boolean;
        powerPreference?: string;
    }

    export type ColorRepresentation = number | string;

    export class WebGLRenderer {
        constructor(parameters?: WebGLRendererParameters);
        domElement: HTMLCanvasElement;
        outputColorSpace?: unknown;
        setPixelRatio(value: number): void;
        setClearColor(color: ColorRepresentation, alpha?: number): void;
        setSize(width: number, height: number, updateStyle?: boolean): void;
        render(scene: Scene, camera: OrthographicCamera): void;
        dispose(): void;
    }

    export class Vector2 {
        constructor(x?: number, y?: number);
        set(x: number, y: number): this;
        copy(v: Vector2): this;
        lerp(v: Vector2, alpha: number): this;
    }

    export class Vector3 {
        constructor(x?: number, y?: number, z?: number);
        set(x: number, y: number, z: number): this;
        copy(v: Vector3): this;
    }

    export class Clock {
        constructor(autoStart?: boolean);
        readonly elapsedTime: number;
        getDelta(): number;
    }

    export const SRGBColorSpace: unknown;
}

