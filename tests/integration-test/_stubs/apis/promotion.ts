import appConfigs from "../../../../src/app-configs.IGT";
import nock from "nock";

export const stubPromotionService = (gameId: number) => {
    nock(appConfigs.promotionApiSettings.baseUrl).persist().get(`/promotions/all-promotions-running?gameId=${gameId}`).reply(200, []);
};
