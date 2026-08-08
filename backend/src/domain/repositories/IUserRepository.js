'use strict';

class IUserRepository {
  async findById(_id) { throw new Error('Not implemented'); }
  async findByEmail(_email) { throw new Error('Not implemented'); }
  async create(_user) { throw new Error('Not implemented'); }
  async update(_id, _partial) { throw new Error('Not implemented'); }
  async addFavorite(_userId, _adId) { throw new Error('Not implemented'); }
  async removeFavorite(_userId, _adId) { throw new Error('Not implemented'); }
}

module.exports = IUserRepository;
