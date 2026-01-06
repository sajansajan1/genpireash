import { FabricObject } from "fabric";

export interface ExtendedFabricObject extends FabricObject {
    id: string;
    __skipEmit?: boolean;
}