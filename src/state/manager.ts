import type { DefaultsState, SoraActorRef, SoraSnapshot } from './soraMachine.js';
import { createSoraManager } from './soraMachine.js';
import type {
  CreateRequest,
  DeleteRequest,
  DownloadRequest,
  OperationResult,
  RefreshRequest,
  RemixRequest,
} from './soraMachine.js';

const waitForOperation = <TType extends OperationResult['type']>(
  actor: SoraActorRef,
  previousVersion: number,
  expectedType: TType,
) =>
  new Promise<Extract<OperationResult, { type: TType }>>((resolve, reject) => {
    const subscription = actor.subscribe((snapshot) => {
      const {
        operationVersion,
        lastOperation,
        error,
      } = snapshot.context;

      if (error) {
        subscription.unsubscribe();
        reject(new Error(error));
        return;
      }

      if (operationVersion <= previousVersion) {
        return;
      }

      if (!lastOperation || lastOperation.type !== expectedType) {
        return;
      }

      subscription.unsubscribe();
      actor.send({ type: 'CLEAR_OPERATION' });
      resolve(lastOperation as Extract<OperationResult, { type: TType }>);
    });
  });

export class SoraManagerController {
  #actor: SoraActorRef;

  constructor(actor: SoraActorRef) {
    this.#actor = actor;
  }

  static create() {
    return new SoraManagerController(createSoraManager());
  }

  get actor() {
    return this.#actor;
  }

  get snapshot(): SoraSnapshot {
    return this.#actor.getSnapshot();
  }

  setDefaults(defaults: Partial<DefaultsState>) {
    this.#actor.send({ type: 'SET_DEFAULTS', defaults });
  }

  async refresh(params?: RefreshRequest) {
    const version = this.snapshot.context.operationVersion;
    this.#actor.send({ type: 'RESET_ERROR' });
    this.#actor.send({ type: 'REFRESH', params });
    return waitForOperation(this.#actor, version, 'refresh');
  }

  async create(input: CreateRequest) {
    const version = this.snapshot.context.operationVersion;
    this.#actor.send({ type: 'RESET_ERROR' });
    this.#actor.send({ type: 'CREATE', input });
    return waitForOperation(this.#actor, version, 'create');
  }

  async remix(input: RemixRequest) {
    const version = this.snapshot.context.operationVersion;
    this.#actor.send({ type: 'RESET_ERROR' });
    this.#actor.send({ type: 'REMIX', input });
    return waitForOperation(this.#actor, version, 'remix');
  }

  async download(input: DownloadRequest) {
    const version = this.snapshot.context.operationVersion;
    this.#actor.send({ type: 'RESET_ERROR' });
    this.#actor.send({ type: 'DOWNLOAD', input });
    return waitForOperation(this.#actor, version, 'download');
  }

  async delete(input: DeleteRequest) {
    const version = this.snapshot.context.operationVersion;
    this.#actor.send({ type: 'RESET_ERROR' });
    this.#actor.send({ type: 'DELETE', input });
    return waitForOperation(this.#actor, version, 'delete');
  }

  async loadCurrency() {
    const version = this.snapshot.context.operationVersion;
    this.#actor.send({ type: 'RESET_ERROR' });
    this.#actor.send({ type: 'LOAD_CURRENCY' });
    return waitForOperation(this.#actor, version, 'currency');
  }

  subscribe(listener: (snapshot: SoraSnapshot) => void) {
    return this.#actor.subscribe((state) => listener(state));
  }

  getSnapshot(): SoraSnapshot {
    return this.#actor.getSnapshot();
  }

  getLastOperation(): OperationResult | null {
    return this.#actor.getSnapshot().context.lastOperation;
  }
}

export const createSoraManagerController = () => SoraManagerController.create();
