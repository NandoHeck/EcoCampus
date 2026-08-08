'use strict';

class AdController {
  constructor({ createAd, listAds, getAd, updateAd, deleteAd }) {
    this.createAd = createAd;
    this.listAds = listAds;
    this.getAd = getAd;
    this.updateAd = updateAd;
    this.deleteAd = deleteAd;
  }

  list = async (req, res, next) => {
    try {
      const { category, type, search, sortBy, limit } = req.query;
      const ads = await this.listAds.execute({ category, type, search, sortBy, limit });
      res.json({ data: ads, total: ads.length });
    } catch (err) { next(err); }
  };

  getOne = async (req, res, next) => {
    try {
      const ad = await this.getAd.execute(req.params.id, { incrementViews: true });
      res.json({ data: ad });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      const ad = await this.createAd.execute({ ...req.body, userId });
      res.status(201).json({ data: ad });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const requesterId = req.user ? req.user.id : req.body.userId;
      const ad = await this.updateAd.execute(req.params.id, req.body, { requesterId });
      res.json({ data: ad });
    } catch (err) { next(err); }
  };

  remove = async (req, res, next) => {
    try {
      const requesterId = req.user ? req.user.id : req.body.userId;
      await this.deleteAd.execute(req.params.id, { requesterId });
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

module.exports = AdController;
