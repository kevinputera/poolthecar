import { User } from './user';

class Customer extends User {
  static tableName = 'Customers';

  constructor(email, secret, name, gender, phone, profile_photo_url) {
    super(email, secret, name, gender, phone, profile_photo_url);
  }
}

module.exports = { Customer: Customer };
