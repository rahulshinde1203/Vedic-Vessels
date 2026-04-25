export interface CreateAddressBody {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  state:    string;
  pincode:  string;
}

export interface UpdateAddressBody {
  fullName?: string;
  phone?:    string;
  address?:  string;
  city?:     string;
  state?:    string;
  pincode?:  string;
}
