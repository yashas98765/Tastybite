const seedData = {
  users: [
    {
      name: 'TastyBite Admin',
      email: 'admin@tastybite.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 99001 12233',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      addresses: [
        {
          tag: 'Office',
          street: '45 Tech Hub, Outer Ring Road, Bellandur',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560103',
          country: 'India',
          phone: '+91 99001 12233',
          isDefault: true
        }
      ]
    },
    {
      name: 'Rahul Sharma',
      email: 'customer@tastybite.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '+91 98450 67890',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      addresses: [
        {
          tag: 'Home',
          street: 'Flat 402, Green Glen Layout, Bellandur',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560103',
          country: 'India',
          phone: '+91 98450 67890',
          isDefault: true
        },
        {
          tag: 'Office',
          street: 'Floor 5, Innovate Tower, Whitefield',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560066',
          country: 'India',
          phone: '+91 98450 67890',
          isDefault: false
        }
      ]
    },
    {
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'Password@123',
      role: 'customer',
      phone: '+91 97420 54321',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      addresses: [
        {
          tag: 'Hostel',
          street: 'Room 214, Cambridge Heights, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560038',
          country: 'India',
          phone: '+91 97420 54321',
          isDefault: true
        }
      ]
    }
  ],

  categories: [
    {
      name: 'Biryani',
      slug: 'biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
      description: 'Fragrant aromatic basmati rice cooked with authentic spices'
    },
    {
      name: 'Pizzas',
      slug: 'pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
      description: 'Wood-fired, hand-tossed artisan pizzas with gourmet cheeses'
    },
    {
      name: 'Burgers',
      slug: 'burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
      description: 'Juicy, sizzling patties layered in toasted brioche buns'
    },
    {
      name: 'North Indian',
      slug: 'north-indian',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
      description: 'Rich curries, buttery naans, and smoky tandoori delights'
    },
    {
      name: 'South Indian',
      slug: 'south-indian',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=400&q=80',
      description: 'Crispy golden dosas, fluffy idlis, and coastal delicacies'
    },
    {
      name: 'Healthy Bowls',
      slug: 'healthy-bowls',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      description: 'Nutrient-packed superfood salads, poke bowls, and protein bowls'
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
      description: 'Decadent chocolate pastries, waffles, and traditional sweets'
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80',
      description: 'Fresh pressed juices, thick milkshakes, and artisanal coolers'
    }
  ],

  restaurants: [
    {
      name: 'Royal Biryani House',
      tagline: 'Legacy of Authentic Awadhi & Hyderabadi Flavors',
      description: 'Renowned for slow-cooked dum biryanis, tender kebabs, and secret heritage masala blends.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Biryani', 'Mughlai', 'North Indian'],
      rating: 4.8,
      reviewCount: 420,
      deliveryTimeMinutes: 25,
      deliveryFee: 30,
      minOrder: 200,
      costForTwo: 550,
      location: {
        address: '88 Brigade Road, Ashok Nagar',
        city: 'Bangalore',
        area: 'Brigade Road',
        lat: 12.9716,
        lng: 77.607
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '11:00 AM - 11:30 PM'
    },
    {
      name: 'Artisan Crust Pizza Co.',
      tagline: 'Authentic Neapolitan Woodfired Pizzas',
      description: 'Stone-baked artisan sourdough pizzas, fresh mozzarella di bufala, and house-made pesto sauces.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Pizzas', 'Italian', 'Fast Food'],
      rating: 4.7,
      reviewCount: 310,
      deliveryTimeMinutes: 30,
      deliveryFee: 35,
      minOrder: 250,
      costForTwo: 600,
      location: {
        address: '12 100ft Road, Indiranagar',
        city: 'Bangalore',
        area: 'Indiranagar',
        lat: 12.9784,
        lng: 77.6408
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '12:00 PM - 12:00 AM'
    },
    {
      name: 'The Burger Club',
      tagline: 'Hand-Crafted Smashed Gourmet Burgers',
      description: 'Thick hand-smashed double patties, melted sharp cheddar, crispy bacon, and truffle fries.',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Burgers', 'American', 'Fast Food'],
      rating: 4.6,
      reviewCount: 285,
      deliveryTimeMinutes: 20,
      deliveryFee: 25,
      minOrder: 180,
      costForTwo: 450,
      location: {
        address: '5th Block, Koramangala',
        city: 'Bangalore',
        area: 'Koramangala',
        lat: 12.9352,
        lng: 77.6245
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '11:30 AM - 11:00 PM'
    },
    {
      name: 'Punjab Grill & Spice',
      tagline: 'Hearty Punjabi Flavors & Smoky Kebabs',
      description: 'Velvety Dal Makhani, Paneer Butter Masala, Garlic Butter Naans, and charcoal tandoor specials.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['North Indian', 'Tandoor', 'Curries'],
      rating: 4.5,
      reviewCount: 190,
      deliveryTimeMinutes: 35,
      deliveryFee: 30,
      minOrder: 200,
      costForTwo: 500,
      location: {
        address: 'Church Street, Central District',
        city: 'Bangalore',
        area: 'MG Road',
        lat: 12.9752,
        lng: 77.6042
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: false,
      openingHours: '12:00 PM - 10:30 PM'
    },
    {
      name: 'Dakshin Heritage Tiffin',
      tagline: 'Traditional 100% Pure Vegetarian South Indian',
      description: 'Ghee Podi Masala Dosa, Filter Coffee, Thatte Idli, and authentic coconut and tomato chutneys.',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['South Indian', 'Breakfast', 'Pure Veg'],
      rating: 4.9,
      reviewCount: 540,
      deliveryTimeMinutes: 18,
      deliveryFee: 20,
      minOrder: 120,
      costForTwo: 280,
      location: {
        address: 'Gandhi Bazaar, Basavanagudi',
        city: 'Bangalore',
        area: 'Basavanagudi',
        lat: 12.9429,
        lng: 77.5739
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: true,
      openingHours: '07:00 AM - 10:00 PM'
    },
    {
      name: 'Green Fork Superfood Bowls',
      tagline: 'Healthy, High Protein & Wholesome Eating',
      description: 'Clean eating made delicious with quinoa macro bowls, avocado protein salads, and chia pudding.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Healthy Bowls', 'Salads', 'Keto'],
      rating: 4.6,
      reviewCount: 160,
      deliveryTimeMinutes: 25,
      deliveryFee: 30,
      minOrder: 220,
      costForTwo: 550,
      location: {
        address: 'HSR Layout, Sector 2',
        city: 'Bangalore',
        area: 'HSR Layout',
        lat: 12.9121,
        lng: 77.6446
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: false,
      openingHours: '08:30 AM - 09:30 PM'
    },
    {
      name: 'Sweet Tooth Patisserie',
      tagline: 'Belgian Chocolate Delights & Gourmet Cheesecakes',
      description: 'Handmade Belgian chocolate brownies, New York cheesecakes, tiramisu jars, and cinnamon rolls.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Desserts', 'Bakery', 'Waffles'],
      rating: 4.8,
      reviewCount: 390,
      deliveryTimeMinutes: 20,
      deliveryFee: 25,
      minOrder: 150,
      costForTwo: 350,
      location: {
        address: 'Koramangala 4th Block',
        city: 'Bangalore',
        area: 'Koramangala',
        lat: 12.9345,
        lng: 77.6291
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '10:00 AM - 11:59 PM'
    },
    {
      name: 'Dragon Wok Asian Kitchen',
      tagline: 'Sizzling Dim Sums, Ramen & Hakka Specialties',
      description: 'Pan-Asian street favorites: steamed crystal dumplings, spicy schezwan fried rice, and ramen bowls.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Chinese', 'Asian', 'Noodles'],
      rating: 4.4,
      reviewCount: 215,
      deliveryTimeMinutes: 30,
      deliveryFee: 30,
      minOrder: 200,
      costForTwo: 480,
      location: {
        address: 'CMR Road, Kalyan Nagar',
        city: 'Bangalore',
        area: 'Kalyan Nagar',
        lat: 13.0163,
        lng: 77.6433
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: false,
      openingHours: '12:30 PM - 11:00 PM'
    },
    {
      name: 'Coastal Bay Seafood',
      tagline: 'Fresh Catch, Mangalorean & Goan Coastal Spices',
      description: 'Specializing in fresh pomfret fry, butter garlic prawns, Goan curries, and crab masala.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Seafood', 'Coastal', 'Mangalorean'],
      rating: 4.8,
      reviewCount: 310,
      deliveryTimeMinutes: 30,
      deliveryFee: 35,
      minOrder: 250,
      costForTwo: 700,
      location: {
        address: '4th Cross, Ulsoor Lake Road',
        city: 'Bangalore',
        area: 'Ulsoor',
        lat: 12.9818,
        lng: 77.6186
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '11:30 AM - 11:00 PM'
    },
    {
      name: 'The Daily Roast Cafe',
      tagline: 'Artisanal Brews, Shakes & Gourmet Wraps',
      description: 'Handcrafted espresso, chilled frappes, thick milkshakes, mocktails, and fresh sourdough sandwiches.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Beverages', 'Cafe', 'Fast Food'],
      rating: 4.7,
      reviewCount: 240,
      deliveryTimeMinutes: 20,
      deliveryFee: 25,
      minOrder: 150,
      costForTwo: 350,
      location: {
        address: 'Lavelle Road, Shanthala Nagar',
        city: 'Bangalore',
        area: 'Lavelle Road',
        lat: 12.9719,
        lng: 77.5996
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: true,
      openingHours: '08:00 AM - 11:00 PM'
    },
    {
      name: 'Meghana Foods',
      tagline: 'Bangalore’s Legendary Andhra Dum Biryani',
      description: 'World-famous spicy Andhra style chicken boneless biryani, paneer 65, fiery mutton fry, and authentic Rayalaseema thali.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Biryani', 'Andhra', 'South Indian'],
      rating: 4.9,
      reviewCount: 1420,
      deliveryTimeMinutes: 22,
      deliveryFee: 30,
      minOrder: 200,
      costForTwo: 550,
      location: {
        address: '1st Block, Jayanagar 11th Main',
        city: 'Bangalore',
        area: 'Jayanagar',
        lat: 12.9308,
        lng: 77.5838
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '11:00 AM - 11:30 PM'
    },
    {
      name: 'CTR - Shri Sagar',
      tagline: 'Iconic Benne Masala Dosa Since 1920',
      description: 'World-famous crispy golden butter Benne Masala Dosa, uddin vada, poori saagu, and hot frothy Kumbakonam filter coffee.',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['South Indian', 'Breakfast', 'Pure Veg'],
      rating: 4.9,
      reviewCount: 1650,
      deliveryTimeMinutes: 18,
      deliveryFee: 20,
      minOrder: 120,
      costForTwo: 240,
      location: {
        address: '7th Cross, Margosa Road, Malleshwaram',
        city: 'Bangalore',
        area: 'Malleshwaram',
        lat: 13.0031,
        lng: 77.5684
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: true,
      openingHours: '07:30 AM - 10:00 PM'
    },
    {
      name: 'Truffles',
      tagline: 'Bangalore’s Favorite All-American Burgers & Steaks',
      description: 'Legendary oversized All-American double cheese burgers, crunchy peri-peri chicken steaks, creamy Alfredo pasta, and Ferrero shakes.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Burgers', 'Continental', 'Fast Food'],
      rating: 4.8,
      reviewCount: 980,
      deliveryTimeMinutes: 25,
      deliveryFee: 25,
      minOrder: 180,
      costForTwo: 480,
      location: {
        address: 'St. Marks Road, Near Museum Road',
        city: 'Bangalore',
        area: 'St. Marks Road',
        lat: 12.9734,
        lng: 77.6015
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '11:00 AM - 11:00 PM'
    },
    {
      name: 'Nagarjuna Andhra Restaurant',
      tagline: 'Authentic Banana Leaf Royal Andhra Feasts',
      description: 'Iconic spicy Guntur chicken roast, Gongura mutton, steamed sona masuri rice served with spicy podi and pure desi ghee.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Andhra', 'Biryani', 'South Indian'],
      rating: 4.7,
      reviewCount: 780,
      deliveryTimeMinutes: 28,
      deliveryFee: 30,
      minOrder: 220,
      costForTwo: 650,
      location: {
        address: '44/1 Residency Road, Shanthala Nagar',
        city: 'Bangalore',
        area: 'Residency Road',
        lat: 12.9721,
        lng: 77.6048
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '12:00 PM - 11:00 PM'
    },
    {
      name: 'Toit Brewpub Kitchen',
      tagline: 'Wood-Fired Neapolitan Pizzas & Brew Grubs',
      description: 'Stone-baked artisan sourdough pizzas, smokey BBQ wings, stuffed garlic breads, and loaded gourmet fries.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Pizzas', 'Italian', 'Continental'],
      rating: 4.8,
      reviewCount: 860,
      deliveryTimeMinutes: 30,
      deliveryFee: 35,
      minOrder: 250,
      costForTwo: 750,
      location: {
        address: '298 100ft Road, Indiranagar',
        city: 'Bangalore',
        area: 'Indiranagar',
        lat: 12.9793,
        lng: 77.6405
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '12:00 PM - 12:00 AM'
    },
    {
      name: 'Empire Restaurant',
      tagline: 'Taste of Bengaluru - The Midnight Food Legend',
      description: 'Iconic Empire special coin parotta, rich aromatic ghee rice, grilled tandoori chicken, and signature butter chicken curries.',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['North Indian', 'Biryani', 'Mughlai'],
      rating: 4.6,
      reviewCount: 1100,
      deliveryTimeMinutes: 24,
      deliveryFee: 30,
      minOrder: 150,
      costForTwo: 450,
      location: {
        address: '36 Church Street, Shanthala Nagar',
        city: 'Bangalore',
        area: 'Church Street',
        lat: 12.975,
        lng: 77.6062
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: false,
      openingHours: '11:00 AM - 01:00 AM'
    },
    {
      name: 'Corner House Ice Cream',
      tagline: 'Home of the Legendary "Death By Chocolate"',
      description: 'Bangalore’s beloved dessert destination since 1982. Famous for the legendary DBC sundae, hot chocolate fudge, and fruit melbas.',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Desserts', 'Ice Cream', 'Bakery'],
      rating: 4.9,
      reviewCount: 1540,
      deliveryTimeMinutes: 15,
      deliveryFee: 20,
      minOrder: 140,
      costForTwo: 300,
      location: {
        address: '1st A Main, 7th Block, Koramangala',
        city: 'Bangalore',
        area: 'Koramangala',
        lat: 12.934,
        lng: 77.627
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: true,
      openingHours: '11:00 AM - 11:59 PM'
    },
    {
      name: 'Vidyarthi Bhavan',
      tagline: 'Heritage Culinary Icon of Gandhi Bazaar Since 1943',
      description: 'Thick, crispy golden ghee-roasted masala dosas, crunchiest rava vadas, pineapple kesari bath, and steaming heritage filter coffee.',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['South Indian', 'Breakfast', 'Pure Veg'],
      rating: 4.9,
      reviewCount: 1780,
      deliveryTimeMinutes: 20,
      deliveryFee: 20,
      minOrder: 100,
      costForTwo: 220,
      location: {
        address: '32 Gandhi Bazaar Main Road, Basavanagudi',
        city: 'Bangalore',
        area: 'Basavanagudi',
        lat: 12.9436,
        lng: 77.5742
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: true,
      openingHours: '06:30 AM - 08:30 PM'
    },
    {
      name: 'Shiro Asian Kitchen',
      tagline: 'Gourmet Teppanyaki, Sushi & Pan-Asian Elegance',
      description: 'Exquisite dim sum baskets, salmon avocado maki rolls, rich Thai green curry, and Korean bibimbap bowls.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Chinese', 'Asian', 'Sushi'],
      rating: 4.7,
      reviewCount: 420,
      deliveryTimeMinutes: 32,
      deliveryFee: 40,
      minOrder: 300,
      costForTwo: 950,
      location: {
        address: 'Level 2, UB City, 24 Vittal Mallya Road',
        city: 'Bangalore',
        area: 'UB City / Lavelle Road',
        lat: 12.9719,
        lng: 77.596
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: false,
      openingHours: '12:30 PM - 11:30 PM'
    },
    {
      name: 'Udupi Grand Heritage',
      tagline: 'Pure Vegetarian Traditional Udupi Feast',
      description: 'Wholesome banana leaf South Indian thalis, Bisi Bele Bath with boondi, Mysore Pak, and butter paper dosas.',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['South Indian', 'Pure Veg', 'North Indian'],
      rating: 4.6,
      reviewCount: 520,
      deliveryTimeMinutes: 22,
      deliveryFee: 25,
      minOrder: 150,
      costForTwo: 320,
      location: {
        address: 'ITPL Main Road, Near Prestige Shantiniketan',
        city: 'Bangalore',
        area: 'Whitefield',
        lat: 12.9866,
        lng: 77.7314
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: true,
      openingHours: '07:00 AM - 10:30 PM'
    },
    {
      name: 'Brahmin’s Tiffin Bar',
      tagline: 'Steaming Idlis & Crisp Vadas with World-Famous Chutney',
      description: 'Legendary piping hot button idlis, crispy uddin vadas drenched in authentic fresh coconut chutney, and filter kaapi.',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['South Indian', 'Breakfast', 'Pure Veg'],
      rating: 4.9,
      reviewCount: 1350,
      deliveryTimeMinutes: 16,
      deliveryFee: 20,
      minOrder: 100,
      costForTwo: 180,
      location: {
        address: 'Near Shankar Mutt, Shankarpuram',
        city: 'Bangalore',
        area: 'Basavanagudi / Shankarpuram',
        lat: 12.9511,
        lng: 77.5714
      },
      isOpen: true,
      isFeatured: true,
      pureVeg: true,
      openingHours: '06:00 AM - 07:00 PM'
    },
    {
      name: 'O.G. Variar & Sons Bakery',
      tagline: 'Bengaluru’s Most Loved Heritage Bakery Since 1955',
      description: 'Melt-in-the-mouth pure butter biscuits, spicy vegetable puffs, authentic plum cake slices, and freshly baked Dilkush.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      cuisines: ['Bakery', 'Desserts', 'Fast Food'],
      rating: 4.8,
      reviewCount: 780,
      deliveryTimeMinutes: 20,
      deliveryFee: 20,
      minOrder: 150,
      costForTwo: 260,
      location: {
        address: '12th Main, 2nd Block, Rajajinagar',
        city: 'Bangalore',
        area: 'Rajajinagar',
        lat: 12.993,
        lng: 77.556
      },
      isOpen: true,
      isFeatured: false,
      pureVeg: true,
      openingHours: '09:00 AM - 09:00 PM'
    }
  ],

  coupons: [
    {
      code: 'TASTY50',
      description: '50% Flat Discount on orders above Rs. 299 (Max Rs. 120)',
      discountPercentage: 50,
      flatDiscount: 0,
      minOrderAmount: 299,
      maxDiscount: 120,
      isActive: true
    },
    {
      code: 'WELCOME20',
      description: '20% off for all food lovers on your meal (Max Rs. 100)',
      discountPercentage: 20,
      flatDiscount: 0,
      minOrderAmount: 199,
      maxDiscount: 100,
      isActive: true
    },
    {
      code: 'BITE100',
      description: 'Flat Rs. 100 OFF on orders above Rs. 499',
      discountPercentage: 0,
      flatDiscount: 100,
      minOrderAmount: 499,
      maxDiscount: 100,
      isActive: true
    },
    {
      code: 'FIRSTBITE',
      description: 'First Bite Special: 60% OFF up to Rs. 150 on orders above Rs. 249',
      discountPercentage: 60,
      flatDiscount: 0,
      minOrderAmount: 249,
      maxDiscount: 150,
      isActive: true
    },
    {
      code: 'FEAST30',
      description: '30% OFF on Group Meals & Large Orders above Rs. 399 (Max Rs. 150)',
      discountPercentage: 30,
      flatDiscount: 0,
      minOrderAmount: 399,
      maxDiscount: 150,
      isActive: true
    },
    {
      code: 'TASTY150',
      description: 'Flat Rs. 150 OFF on orders above Rs. 699',
      discountPercentage: 0,
      flatDiscount: 150,
      minOrderAmount: 699,
      maxDiscount: 150,
      isActive: true
    },
    {
      code: 'BIRYANI25',
      description: '25% OFF on Biryanis, Curries & Rice Bowls above Rs. 299 (Max Rs. 100)',
      discountPercentage: 25,
      flatDiscount: 0,
      minOrderAmount: 299,
      maxDiscount: 100,
      isActive: true
    },
    {
      code: 'SWEETTREAT',
      description: 'Flat Rs. 50 OFF on Desserts, Bakery & Cafe specials above Rs. 199',
      discountPercentage: 0,
      flatDiscount: 50,
      minOrderAmount: 199,
      maxDiscount: 50,
      isActive: true
    },
    {
      code: 'SUPER60',
      description: 'Flat Rs. 60 OFF Instant discount on orders above Rs. 349',
      discountPercentage: 0,
      flatDiscount: 60,
      minOrderAmount: 349,
      maxDiscount: 60,
      isActive: true
    },
    {
      code: 'MIDNIGHT',
      description: '20% OFF up to Rs. 80 on late-night cravings above Rs. 249',
      discountPercentage: 20,
      flatDiscount: 0,
      minOrderAmount: 249,
      maxDiscount: 80,
      isActive: true
    },
    {
      code: 'MEGA200',
      description: 'Mega Feast: Flat Rs. 200 OFF on Family & Party orders above Rs. 899',
      discountPercentage: 0,
      flatDiscount: 200,
      minOrderAmount: 899,
      maxDiscount: 200,
      isActive: true
    },
    {
      code: 'CHEF75',
      description: 'Flat Rs. 75 OFF on Chef Handcrafted Specials above Rs. 399',
      discountPercentage: 0,
      flatDiscount: 75,
      minOrderAmount: 399,
      maxDiscount: 75,
      isActive: true
    }
  ]
};

module.exports = seedData;
