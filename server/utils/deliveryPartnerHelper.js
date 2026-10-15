// Pool of authentic Bangalore Delivery Fleet Partners
const DELIVERY_PARTNERS_POOL = [
  { name: 'Suresh Gowda', rating: 4.9, vehicleSeries: 'KA 05' },
  { name: 'Syed Farhan', rating: 4.8, vehicleSeries: 'KA 03' },
  { name: 'Venkatesh Rao', rating: 4.7, vehicleSeries: 'KA 51' },
  { name: 'Mohammed Altaf', rating: 4.9, vehicleSeries: 'KA 04' },
  { name: 'Manjunath Reddy', rating: 4.8, vehicleSeries: 'KA 53' },
  { name: 'Praveen Kumar', rating: 4.9, vehicleSeries: 'KA 02' },
  { name: 'Karthik Swamy', rating: 4.8, vehicleSeries: 'KA 41' },
  { name: 'Anand Murthy', rating: 4.7, vehicleSeries: 'KA 05' },
  { name: 'Deepak Nayak', rating: 4.9, vehicleSeries: 'KA 01' },
  { name: 'Imran Pasha', rating: 4.8, vehicleSeries: 'KA 03' },
  { name: 'Chethan Gowda', rating: 4.8, vehicleSeries: 'KA 51' },
  { name: 'Ramesh Kumar', rating: 4.8, vehicleSeries: 'KA 01' }
];

const VEHICLE_LETTERS = ['EB', 'MN', 'HG', 'QL', 'JK', 'TR', 'XY', 'CD', 'PL', 'RT', 'WE', 'ZX'];

function getRandomDeliveryPartner() {
  const partner = DELIVERY_PARTNERS_POOL[Math.floor(Math.random() * DELIVERY_PARTNERS_POOL.length)];
  const randomLetter = VEHICLE_LETTERS[Math.floor(Math.random() * VEHICLE_LETTERS.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const vehicleNumber = `${partner.vehicleSeries} ${randomLetter} ${randomNum}`;
  const randomPhoneEnd = Math.floor(10000 + Math.random() * 90000);
  const phone = `+91 98450 ${randomPhoneEnd}`;

  return {
    name: partner.name,
    phone,
    vehicleNumber,
    rating: partner.rating
  };
}

module.exports = {
  DELIVERY_PARTNERS_POOL,
  getRandomDeliveryPartner
};
