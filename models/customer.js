import { User } from './user';

class Customer extends User {
  constructor(email, secret, name, gender, phone, profile_photo_url) {
    super(email, secret, name, gender, phone, profile_photo_url);
  }
}
