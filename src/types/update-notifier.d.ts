declare module 'update-notifier' {
  interface PackageDescriptor {
    name: string;
    version: string;
  }

  interface UpdateInfo {
    name: string;
    current: string;
    latest: string;
    type?: string;
  }

  interface NotifyOptions {
    message?: string;
    defer?: boolean;
    boxenOptions?: Record<string, unknown>;
  }

  interface UpdateNotifierOptions {
    pkg: PackageDescriptor;
    distTag?: string;
    updateCheckInterval?: number;
    shouldNotifyInNpmScript?: boolean;
  }

  interface UpdateNotifierInstance {
    update?: UpdateInfo;
    notify(options?: NotifyOptions): UpdateNotifierInstance;
    check(): void;
    fetchInfo(): Promise<UpdateInfo>;
  }

  export default function updateNotifier(
    options: UpdateNotifierOptions,
  ): UpdateNotifierInstance;
}
