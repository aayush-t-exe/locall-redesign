/*
 * Photos come only from the set supplied for this prototype (assets/images/photos).
 * A key set to `null` makes <Photo> draw gold 3D "ticket art" instead (used while a photo is missing).
 */
const p = {
  momos: require('../../assets/images/photos/1-momos.jpg'),
  jalebi: require('../../assets/images/photos/2-jalebi.jpg'),
  dosa: require('../../assets/images/photos/3-dosa.jpg'),
  kaju: require('../../assets/images/photos/4-kaju-katli.jpg'),
  chai: require('../../assets/images/photos/5-chai-samosa.jpg'),
  haircut: require('../../assets/images/photos/6-haircut.jpg'),
  kurti: require('../../assets/images/photos/7-kurti.jpg'),
  kirana: require('../../assets/images/photos/8-kirana.jpg'),
  vegetables: require('../../assets/images/photos/9-vegetables.jpg'),
  saree: require('../../assets/images/photos/10-saree.jpg'),
  utensils: require('../../assets/images/photos/11-steel-utensils.jpg'),
  storage: require('../../assets/images/photos/12-storage-jars.jpg'),
  shirts: require('../../assets/images/photos/13-mens-shirts.jpg'),
  shoes: require('../../assets/images/photos/14-kids-shoes.jpg'),
  chair: require('../../assets/images/photos/15-wooden-chair.jpg'),
  pizza: require('../../assets/images/photos/16-pizza.jpg'),
  thali: require('../../assets/images/photos/17-thali.jpg'),
  biryani: require('../../assets/images/photos/18-biryani.jpg'),
  owner: require('../../assets/images/photos/19-shop-owner.jpg'),
  sweetShop: require('../../assets/images/photos/20-sweet-shop.jpg'),
  chaiStall: require('../../assets/images/photos/21-chai-stall.jpg'),
  clothesShop: require('../../assets/images/photos/22-clothes-shop.jpg'),
};

export const images = {
  'momos': p.momos,
  'kirana': p.kirana,
  'vegetables': p.vegetables,
  'mithai': p.kaju,
  'jalebi': p.jalebi,
  'salon': p.haircut,
  'chai': p.chai,
  'kurta': p.kurti,
  'dosa': p.dosa,
  'saree': p.saree,
  'utensils': p.utensils,
  'storage': p.storage,
  'shirts': p.shirts,
  'shoes': p.shoes,
  'chair': p.chair,
  'pizza': p.pizza,
  'thali': p.thali,
  'biryani': p.biryani,
  'owner-momo': p.momos,
  'owner-kirana': p.owner,
  'owner-vegetables': p.vegetables,
  'owner-sweets': p.sweetShop,
  'store-sweets': p.sweetShop,
  'owner-tailor': p.kurti,
  'owner-menswear': p.clothesShop,
  'owner-chai': p.chaiStall,
  'store-utensils': p.utensils,
} as const;

export type ImageKey = keyof typeof images;

/* Premium gold 3D icons (3dicons.co, CC0). */
export const gold3d = {
  teaCup: require('../../assets/images/3d/tea-cup.png'),
  candy: require('../../assets/images/3d/candy.png'),
  bag: require('../../assets/images/3d/bag.png'),
  scissor: require('../../assets/images/3d/scissor.png'),
  giftBox: require('../../assets/images/3d/gift-box.png'),
  fire: require('../../assets/images/3d/fire.png'),
  star: require('../../assets/images/3d/star.png'),
  mapPin: require('../../assets/images/3d/map-pin.png'),
  rupee: require('../../assets/images/3d/rupee.png'),
  bookmark: require('../../assets/images/3d/bookmark.png'),
  medal: require('../../assets/images/3d/medal.png'),
  crown: require('../../assets/images/3d/crown.png'),
  trophy: require('../../assets/images/3d/trophy.png'),
  coin: require('../../assets/images/3d/3d-coin.png'),
  moneyBag: require('../../assets/images/3d/money-bag.png'),
  wallet: require('../../assets/images/3d/wallet.png'),
  bell: require('../../assets/images/3d/bell.png'),
  heart: require('../../assets/images/3d/heart.png'),
} as const;

export type Gold3dKey = keyof typeof gold3d;

/** Which gold object stands in for a photo that has not been supplied yet. */
export const artFor: Record<ImageKey, Gold3dKey> = {
  'momos': 'fire', 'kirana': 'bag', 'vegetables': 'bag', 'mithai': 'candy', 'jalebi': 'candy', 'salon': 'scissor',
  'chai': 'teaCup', 'kurta': 'crown', 'dosa': 'teaCup', 'saree': 'crown', 'utensils': 'giftBox', 'storage': 'giftBox',
  'shirts': 'crown', 'shoes': 'star', 'chair': 'star', 'pizza': 'fire', 'thali': 'teaCup', 'biryani': 'fire',
  'owner-momo': 'fire', 'owner-kirana': 'bag', 'owner-vegetables': 'bag', 'owner-sweets': 'candy', 'store-sweets': 'candy',
  'owner-tailor': 'crown', 'owner-menswear': 'crown', 'owner-chai': 'teaCup', 'store-utensils': 'giftBox',
};
