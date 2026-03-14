// Stub backend interface - replaced at deploy time with generated Motoko bindings
import type { Identity } from "@icp-sdk/core/agent";

export class ExternalBlob {
  url: string;
  contentType: string;
  onProgress?: (progress: number) => void;

  constructor(url: string, contentType = "application/octet-stream") {
    this.url = url;
    this.contentType = contentType;
  }

  async getBytes(): Promise<Uint8Array> {
    const response = await fetch(this.url);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  static fromURL(url: string): ExternalBlob {
    return new ExternalBlob(url);
  }
}

export interface CreateActorOptions {
  agentOptions?: {
    identity?: Identity | Promise<Identity>;
    host?: string;
  };
}

export interface backendInterface {
  _initializeAccessControlWithSecret: (secret: string) => Promise<void>;
  getCallerUserRole: () => Promise<string>;
  isCallerAdmin: () => Promise<boolean>;
  assignCallerUserRole: (user: unknown, role: string) => Promise<void>;
}

type UploadFn = (file: ExternalBlob) => Promise<Uint8Array>;
type DownloadFn = (bytes: Uint8Array) => Promise<ExternalBlob>;

// Placeholder actor factory - overridden by the real generated factory at deploy time
export const createActor = (
  _canisterId: string,
  _uploadFile?: UploadFn,
  _downloadFile?: DownloadFn,
  _options?: CreateActorOptions,
): backendInterface => {
  throw new Error("Backend actor not available in stub mode");
};

export const canisterId = "";
