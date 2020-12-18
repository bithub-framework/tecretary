class ContextAccountPrivateApi {
    constructor(texchange) {
        this.texchange = texchange;
    }
    async makeLimitOrder(order) {
        return this.texchange.makeLimitOrder(order);
    }
    async cancelOrder(oid) {
        return this.texchange.cancelOrder(oid);
    }
    async getOpenOrders() {
        return this.texchange.getOpenOrders();
    }
    async getAssets() {
        return this.texchange.getAssets();
    }
}
export { ContextAccountPrivateApi as default, ContextAccountPrivateApi, };
//# sourceMappingURL=private-api.js.map