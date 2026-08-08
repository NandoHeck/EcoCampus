'use strict';

class IAdRepository {
  async list(_filters) { throw new Error('Not implemented'); }
  async findById(_id) { throw new Error('Not implemented'); }
  async listByUser(_userId) { throw new Error('Not implemented'); }
  async create(_ad) { throw new Error('Not implemented'); }
  async update(_id, _partial) { throw new Error('Not implemented'); }
  async delete(_id) { throw new Error('Not implemented'); }
  async incrementViews(_id) { throw new Error('Not implemented'); }
}

module.exports = IAdRepository;
