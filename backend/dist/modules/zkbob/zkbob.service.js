import { ZkBobAdapter } from './zkbob.adapter';
export class ZkBobService {
    adapter;
    constructor(adapter) {
        this.adapter = adapter || new ZkBobAdapter();
    }
    async generateIntent(params) {
        return this.adapter.createPaymentIntent(params);
    }
    async verifyPayment(params) {
        return this.adapter.verifyPayment(params);
    }
}
export const zkbobService = new ZkBobService();
