'use strict';

class User {
  constructor({
    id,
    name,
    email,
    password,
    university = '',
    course = '',
    avatar = '',
    favorites = [],
    createdAt
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.university = university;
    this.course = course;
    this.avatar = avatar;
    this.favorites = Array.isArray(favorites) ? [...favorites] : [];
    this.createdAt = createdAt || new Date().toISOString();
  }

  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      university: this.university,
      course: this.course,
      avatar: this.avatar,
      favorites: this.favorites,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
