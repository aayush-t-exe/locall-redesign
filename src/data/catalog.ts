/**
 * Sample data for the prototype. Shops, prices and ratings are made up but realistic for
 * Durg / Bhilai (Chhattisgarh). "Navneet Kirana Stores" and "Momo Land" are names that appear
 * in Locall's own demo screenshots.
 */
import type { ImageKey } from './images';

export type Category = 'food' | 'clothes' | 'household' | 'furniture' | 'salon' | 'grocery';

export type Shop = {
  id: string;
  name: string;
  nameHi: string;
  category: Category;
  area: string;
  areaHi: string;
  km: number;
  /** Bearing from the user in degrees, used to place pins on the radius map. */
  bearing: number;
  rating: number;
  reviews: number;
  since: number;
  owner: string;
  ownerHi: string;
  quote: string;
  quoteHi: string;
  image: ImageKey;
  ownerImage?: ImageKey;
  verified: boolean;
  opens: number; // hour, 24h
  closes: number;
};

export type Deal = {
  id: string;
  shopId: string;
  title: string;
  titleHi: string;
  unit: string;
  unitHi: string;
  category: Category;
  price: number;
  mrp: number;
  /** Minutes from app start until the deal ends. Negative = already ended. */
  endsInMin: number;
  image: ImageKey;
  note: string;
  noteHi: string;
  popular?: boolean;
};

export const USER_AREA = { name: 'Shankar Nagar, Durg', nameHi: 'शंकर नगर, दुर्ग' };

export const AREAS = [
  { name: 'Shankar Nagar, Durg', nameHi: 'शंकर नगर, दुर्ग' },
  { name: 'Padmanabhpur, Durg', nameHi: 'पद्मनाभपुर, दुर्ग' },
  { name: 'Nehru Nagar, Bhilai', nameHi: 'नेहरू नगर, भिलाई' },
  { name: 'Supela, Bhilai', nameHi: 'सुपेला, भिलाई' },
];

export const shops: Shop[] = [
  {
    id: 'momo-land', name: 'Momo Land', nameHi: 'मोमो लैंड', category: 'food',
    area: 'Shankar Nagar', areaHi: 'शंकर नगर', km: 0.4, bearing: 40, rating: 4.4, reviews: 128, since: 2016,
    owner: 'Rohit Thapa', ownerHi: 'रोहित थापा',
    quote: 'Fresh dough every evening. The red chutney is my mother’s recipe.',
    quoteHi: 'हर शाम ताज़ा आटा। लाल चटनी मेरी माँ की रेसिपी है।',
    image: 'momos', ownerImage: 'owner-momo', verified: true, opens: 11, closes: 23,
  },
  {
    id: 'navneet-kirana', name: 'Navneet Kirana Stores', nameHi: 'नवनीत किराना स्टोर्स', category: 'grocery',
    area: 'Shankar Nagar', areaHi: 'शंकर नगर', km: 0.6, bearing: 200, rating: 4.3, reviews: 89, since: 2004,
    owner: 'Navneet Agrawal', ownerHi: 'नवनीत अग्रवाल',
    quote: 'Call before 7 and we keep your list packed at the counter.',
    quoteHi: '7 बजे से पहले फ़ोन करें, आपका सामान पैक करके रखेंगे।',
    image: 'kirana', ownerImage: 'owner-kirana', verified: true, opens: 8, closes: 22,
  },
  {
    id: 'sahu-veg', name: 'Sahu Fresh Sabzi', nameHi: 'साहू फ़्रेश सब्ज़ी', category: 'grocery',
    area: 'Shankar Nagar', areaHi: 'शंकर नगर', km: 0.8, bearing: 120, rating: 4.5, reviews: 64, since: 2012,
    owner: 'Ramprasad Sahu', ownerHi: 'रामप्रसाद साहू',
    quote: 'Straight from the Thursday mandi. What is left by evening goes cheaper.',
    quoteHi: 'गुरुवार की मंडी से सीधे। शाम तक जो बचे, वो सस्ता।',
    image: 'vegetables', ownerImage: 'owner-vegetables', verified: true, opens: 7, closes: 21,
  },
  {
    id: 'sharma-sweets', name: 'Sharma Sweets & Namkeen', nameHi: 'शर्मा स्वीट्स एंड नमकीन', category: 'food',
    area: 'Indira Market', areaHi: 'इंदिरा मार्केट', km: 1.2, bearing: 300, rating: 4.6, reviews: 412, since: 1987,
    owner: 'Ramesh Sharma', ownerHi: 'रमेश शर्मा',
    quote: 'Jalebi is fried fresh at 7 every morning. Ask for it hot.',
    quoteHi: 'जलेबी रोज़ सुबह 7 बजे ताज़ी बनती है। गरम माँगिए।',
    image: 'store-sweets', ownerImage: 'owner-sweets', verified: true, opens: 7, closes: 22,
  },
  {
    id: 'glow-salon', name: 'Glow Unisex Salon', nameHi: 'ग्लो यूनिसेक्स सैलून', category: 'salon',
    area: 'Shankar Nagar', areaHi: 'शंकर नगर', km: 1.4, bearing: 80, rating: 4.2, reviews: 97, since: 2018,
    owner: 'Pooja Yadav', ownerHi: 'पूजा यादव',
    quote: 'Weekday afternoons are quiet, so we pass the saving on to you.',
    quoteHi: 'हफ़्ते की दोपहर शांत रहती है, इसलिए उस समय सस्ता।',
    image: 'salon', verified: true, opens: 10, closes: 21,
  },
  {
    id: 'kulhad-chai', name: 'Kulhad Chai Adda', nameHi: 'कुल्हड़ चाय अड्डा', category: 'food',
    area: 'Station Road', areaHi: 'स्टेशन रोड', km: 1.6, bearing: 250, rating: 4.2, reviews: 176, since: 2019,
    owner: 'Aman Tiwari', ownerHi: 'अमन तिवारी',
    quote: 'Adrak chai, clay cups, and the 5 PM samosa batch.',
    quoteHi: 'अदरक वाली चाय, मिट्टी के कुल्हड़ और 5 बजे के समोसे।',
    image: 'chai', ownerImage: 'owner-chai', verified: false, opens: 6, closes: 23,
  },
  {
    id: 'handloom-house', name: 'Chhattisgarh Handloom House', nameHi: 'छत्तीसगढ़ हैंडलूम हाउस', category: 'clothes',
    area: 'Gandhi Chowk', areaHi: 'गांधी चौक', km: 1.9, bearing: 330, rating: 4.7, reviews: 203, since: 1995,
    owner: 'Shyamlal Dewangan', ownerHi: 'श्यामलाल देवांगन',
    quote: 'Kosa and cotton from weavers we have known for 30 years.',
    quoteHi: 'कोसा और कॉटन, उन बुनकरों से जिन्हें हम 30 साल से जानते हैं।',
    image: 'kurta', ownerImage: 'owner-tailor', verified: true, opens: 10, closes: 21,
  },
  {
    id: 'annapurna-dosa', name: 'Annapurna Dosa Corner', nameHi: 'अन्नपूर्णा डोसा कॉर्नर', category: 'food',
    area: 'Padmanabhpur', areaHi: 'पद्मनाभपुर', km: 2.1, bearing: 160, rating: 4.5, reviews: 230, since: 2011,
    owner: 'K. Lakshmi', ownerHi: 'के. लक्ष्मी',
    quote: 'Batter ground on stone every morning.',
    quoteHi: 'घोल रोज़ सुबह पत्थर पर पिसता है।',
    image: 'dosa', verified: true, opens: 8, closes: 22,
  },
  {
    id: 'ganesh-saree', name: 'Shree Ganesh Saree Kendra', nameHi: 'श्री गणेश साड़ी केंद्र', category: 'clothes',
    area: 'Durg Main Market', areaHi: 'दुर्ग मेन मार्केट', km: 2.4, bearing: 280, rating: 4.4, reviews: 151, since: 1999,
    owner: 'Mahesh Gupta', ownerHi: 'महेश गुप्ता',
    quote: 'Wedding season sets, and a free fall-pico with every saree.',
    quoteHi: 'शादी के सीज़न के सेट, हर साड़ी पर फ़ॉल-पिको मुफ़्त।',
    image: 'saree', verified: true, opens: 10, closes: 21,
  },
  {
    id: 'agrawal-bartan', name: 'Agrawal Bartan Bhandar', nameHi: 'अग्रवाल बर्तन भंडार', category: 'household',
    area: 'Ganjpara', areaHi: 'गंजपारा', km: 2.8, bearing: 230, rating: 4.3, reviews: 72, since: 1982,
    owner: 'Suresh Agrawal', ownerHi: 'सुरेश अग्रवाल',
    quote: 'Free name engraving on any steel set.',
    quoteHi: 'किसी भी स्टील सेट पर नाम मुफ़्त में लिखवाएँ।',
    image: 'store-utensils', ownerImage: 'store-utensils', verified: true, opens: 9, closes: 21,
  },
  {
    id: 'sahu-plastics', name: 'Sahu Home Needs', nameHi: 'साहू होम नीड्स', category: 'household',
    area: 'Ganjpara', areaHi: 'गंजपारा', km: 3.1, bearing: 190, rating: 4.0, reviews: 41, since: 2015,
    owner: 'Dinesh Sahu', ownerHi: 'दिनेश साहू',
    quote: 'Everything for a new kitchen, under one roof.',
    quoteHi: 'नई रसोई का सब कुछ, एक ही जगह।',
    image: 'storage', verified: false, opens: 9, closes: 21,
  },
  {
    id: 'style-point', name: 'Style Point Menswear', nameHi: 'स्टाइल पॉइंट मेंसवियर', category: 'clothes',
    area: 'Tilak Nagar', areaHi: 'तिलक नगर', km: 3.6, bearing: 20, rating: 4.1, reviews: 58, since: 2014,
    owner: 'Imran Khan', ownerHi: 'इमरान ख़ान',
    quote: 'Alterations done the same day.',
    quoteHi: 'ऑल्टर उसी दिन।',
    image: 'shirts', ownerImage: 'owner-menswear', verified: true, opens: 10, closes: 21,
  },
  {
    id: 'step-up', name: 'Step Up Footwear', nameHi: 'स्टेप अप फ़ुटवियर', category: 'clothes',
    area: 'Pulgaon Chowk', areaHi: 'पुलगांव चौक', km: 4.2, bearing: 100, rating: 4.0, reviews: 39, since: 2017,
    owner: 'Vikas Jain', ownerHi: 'विकास जैन',
    quote: 'Bring your child; we measure both feet properly.',
    quoteHi: 'बच्चे को साथ लाइए, दोनों पैर ठीक से नापते हैं।',
    image: 'shoes', verified: true, opens: 10, closes: 21,
  },
  {
    id: 'verma-furniture', name: 'Verma Furniture Works', nameHi: 'वर्मा फ़र्नीचर वर्क्स', category: 'furniture',
    area: 'Pulgaon Road', areaHi: 'पुलगांव रोड', km: 5.5, bearing: 140, rating: 4.6, reviews: 84, since: 1979,
    owner: 'Ashok Verma', ownerHi: 'अशोक वर्मा',
    quote: 'Sheesham from our own workshop. Free delivery within Durg.',
    quoteHi: 'अपनी वर्कशॉप की शीशम। दुर्ग में डिलीवरी मुफ़्त।',
    image: 'chair', verified: true, opens: 10, closes: 20,
  },
  {
    id: 'slice-street', name: 'Slice Street Café', nameHi: 'स्लाइस स्ट्रीट कैफ़े', category: 'food',
    area: 'Nehru Nagar, Bhilai', areaHi: 'नेहरू नगर, भिलाई', km: 6.8, bearing: 60, rating: 4.3, reviews: 310, since: 2020,
    owner: 'Neha Chandrakar', ownerHi: 'नेहा चंद्राकर',
    quote: 'Wood-fired base, local paneer.',
    quoteHi: 'लकड़ी की भट्टी, लोकल पनीर।',
    image: 'pizza', verified: true, opens: 12, closes: 23,
  },
  {
    id: 'bhilai-thali', name: 'Chhattisgarhi Rasoi', nameHi: 'छत्तीसगढ़ी रसोई', category: 'food',
    area: 'Supela, Bhilai', areaHi: 'सुपेला, भिलाई', km: 11.5, bearing: 85, rating: 4.5, reviews: 266, since: 2008,
    owner: 'Geeta Verma', ownerHi: 'गीता वर्मा',
    quote: 'Chila, fara and bafauri on Sundays.',
    quoteHi: 'रविवार को चीला, फरा और बफौरी।',
    image: 'thali', verified: true, opens: 11, closes: 22,
  },
  {
    id: 'risali-biryani', name: 'Risali Biryani House', nameHi: 'रिसाली बिरयानी हाउस', category: 'food',
    area: 'Risali, Bhilai', areaHi: 'रिसाली, भिलाई', km: 14.2, bearing: 110, rating: 4.1, reviews: 145, since: 2013,
    owner: 'Salim Qureshi', ownerHi: 'सलीम क़ुरैशी',
    quote: 'Dum biryani, slow-cooked for three hours.',
    quoteHi: 'तीन घंटे की दम बिरयानी।',
    image: 'biryani', verified: false, opens: 12, closes: 23,
  },
];

export const deals: Deal[] = [
  { id: 'd-momos', shopId: 'momo-land', title: 'Chicken Steamed Momos', titleHi: 'चिकन स्टीम्ड मोमोज़', unit: 'Plate of 8', unitHi: '8 पीस की प्लेट', category: 'food', price: 69, mrp: 100, endsInMin: 150, image: 'momos', note: 'Evening offer, 5 to 9 PM. Dine in or takeaway.', noteHi: 'शाम का ऑफ़र, 5 से 9 बजे। वहीं खाएँ या पैक कराएँ।', popular: true },
  { id: 'd-atta', shopId: 'navneet-kirana', title: 'Aashirvaad Atta 10 kg', titleHi: 'आशीर्वाद आटा 10 kg', unit: '10 kg bag', unitHi: '10 kg बैग', category: 'grocery', price: 389, mrp: 440, endsInMin: 2 * 24 * 60, image: 'kirana', note: 'One bag per family. Keep it aside with a call.', noteHi: 'एक परिवार को एक बैग। फ़ोन करके अलग रखवा लें।' },
  { id: 'd-veg', shopId: 'sahu-veg', title: 'Seasonal Sabzi Basket', titleHi: 'मौसमी सब्ज़ी की टोकरी', unit: 'About 4 kg mixed', unitHi: 'लगभग 4 kg मिक्स', category: 'grocery', price: 99, mrp: 140, endsInMin: 260, image: 'vegetables', note: 'Tomato, onion, potato, palak and whatever is fresh today.', noteHi: 'टमाटर, प्याज़, आलू, पालक और आज जो ताज़ा है।', popular: true },
  { id: 'd-jalebi', shopId: 'sharma-sweets', title: 'Hot Jalebi', titleHi: 'गरम जलेबी', unit: '250 g', unitHi: '250 g', category: 'food', price: 50, mrp: 70, endsInMin: 24 * 60 + 180, image: 'jalebi', note: 'Morning batch 7 to 10 AM.', noteHi: 'सुबह 7 से 10 बजे का बैच।' },
  { id: 'd-kaju', shopId: 'sharma-sweets', title: 'Kaju Katli Box', titleHi: 'काजू कतली का डिब्बा', unit: '500 g', unitHi: '500 g', category: 'food', price: 399, mrp: 499, endsInMin: 5 * 24 * 60, image: 'mithai', note: 'Made with pure ghee. Gift packing free.', noteHi: 'शुद्ध घी में बनी। गिफ़्ट पैकिंग मुफ़्त।', popular: true },
  { id: 'd-haircut', shopId: 'glow-salon', title: 'Haircut + Beard Trim', titleHi: 'हेयरकट + दाढ़ी ट्रिम', unit: 'Weekdays 12 to 4 PM', unitHi: 'सोम-शुक्र, 12 से 4 बजे', category: 'salon', price: 149, mrp: 220, endsInMin: 3 * 24 * 60, image: 'salon', note: 'Walk in or book on WhatsApp.', noteHi: 'सीधे आएँ या WhatsApp पर बुक करें।' },
  { id: 'd-chai', shopId: 'kulhad-chai', title: '2 Kulhad Chai + Samosa', titleHi: '2 कुल्हड़ चाय + समोसा', unit: 'Combo', unitHi: 'कॉम्बो', category: 'food', price: 45, mrp: 60, endsInMin: 330, image: 'chai', note: 'Every day 4 to 7 PM.', noteHi: 'रोज़ शाम 4 से 7 बजे।' },
  { id: 'd-kurta', shopId: 'handloom-house', title: 'Handloom Cotton Kurti', titleHi: 'हैंडलूम कॉटन कुर्ती', unit: 'Kurta and kurti sets, S to XXL', unitHi: 'कुर्ता और कुर्ती सेट, S से XXL', category: 'clothes', price: 549, mrp: 799, endsInMin: 4 * 24 * 60, image: 'kurta', note: 'Woven in Chhattisgarh. Free alteration.', noteHi: 'छत्तीसगढ़ में बुना। ऑल्टर मुफ़्त।', popular: true },
  { id: 'd-dosa', shopId: 'annapurna-dosa', title: 'Masala Dosa + Filter Coffee', titleHi: 'मसाला डोसा + फ़िल्टर कॉफ़ी', unit: 'Combo', unitHi: 'कॉम्बो', category: 'food', price: 89, mrp: 120, endsInMin: 24 * 60 + 60, image: 'dosa', note: 'Breakfast offer, 8 to 11 AM.', noteHi: 'नाश्ते का ऑफ़र, 8 से 11 बजे।' },
  { id: 'd-saree', shopId: 'ganesh-saree', title: 'Cotton Silk Saree', titleHi: 'कॉटन सिल्क साड़ी', unit: 'With blouse piece', unitHi: 'ब्लाउज़ पीस के साथ', category: 'clothes', price: 1299, mrp: 1799, endsInMin: 6 * 24 * 60, image: 'saree', note: 'Free fall-pico. 12 colours in stock.', noteHi: 'फ़ॉल-पिको मुफ़्त। 12 रंग उपलब्ध।' },
  { id: 'd-steel', shopId: 'agrawal-bartan', title: 'Steel Tiffin Set', titleHi: 'स्टील टिफ़िन सेट', unit: '3 tier with bag', unitHi: '3 डिब्बे, बैग के साथ', category: 'household', price: 449, mrp: 620, endsInMin: 3 * 24 * 60, image: 'utensils', note: 'Free name engraving.', noteHi: 'नाम मुफ़्त में लिखवाएँ।' },
  { id: 'd-storage', shopId: 'sahu-plastics', title: 'Kitchen Storage Jars', titleHi: 'किचन स्टोरेज डिब्बे', unit: 'Set of 6', unitHi: '6 का सेट', category: 'household', price: 299, mrp: 450, endsInMin: 24 * 60 + 300, image: 'storage', note: 'Airtight, BPA free.', noteHi: 'एयरटाइट, BPA फ़्री।' },
  { id: 'd-shirts', shopId: 'style-point', title: 'Cotton Shirts, Buy 2', titleHi: 'कॉटन शर्ट, 2 लें', unit: 'Any 2 shirts', unitHi: 'कोई भी 2 शर्ट', category: 'clothes', price: 899, mrp: 1398, endsInMin: 2 * 24 * 60 + 200, image: 'shirts', note: 'Same-day alteration.', noteHi: 'उसी दिन ऑल्टर।' },
  { id: 'd-shoes', shopId: 'step-up', title: 'Kids’ School Shoes', titleHi: 'बच्चों के स्कूल शूज़', unit: 'Sizes 8C to 5', unitHi: 'साइज़ 8C से 5', category: 'clothes', price: 449, mrp: 699, endsInMin: 5 * 24 * 60, image: 'shoes', note: 'Free socks with every pair.', noteHi: 'हर जोड़ी के साथ मोज़े मुफ़्त।' },
  { id: 'd-chair', shopId: 'verma-furniture', title: 'Sheesham Wood Chair', titleHi: 'शीशम की कुर्सी', unit: 'Hand finished', unitHi: 'हाथ से तैयार', category: 'furniture', price: 2499, mrp: 3400, endsInMin: 7 * 24 * 60, image: 'chair', note: 'Free delivery within Durg.', noteHi: 'दुर्ग में डिलीवरी मुफ़्त।', popular: true },
  { id: 'd-pizza', shopId: 'slice-street', title: 'Paneer Tikka Pizza', titleHi: 'पनीर टिक्का पिज़्ज़ा', unit: 'Medium, 8 inch', unitHi: 'मीडियम, 8 इंच', category: 'food', price: 199, mrp: 299, endsInMin: 410, image: 'pizza', note: 'Weekday lunch offer.', noteHi: 'सोम-शुक्र लंच ऑफ़र।' },
  { id: 'd-thali', shopId: 'bhilai-thali', title: 'Chhattisgarhi Thali', titleHi: 'छत्तीसगढ़ी थाली', unit: 'Unlimited rice', unitHi: 'चावल अनलिमिटेड', category: 'food', price: 129, mrp: 170, endsInMin: 2 * 24 * 60, image: 'thali', note: 'Chila, fara, dal, sabzi, rice, chutney.', noteHi: 'चीला, फरा, दाल, सब्ज़ी, चावल, चटनी।' },
  { id: 'd-biryani', shopId: 'risali-biryani', title: 'Veg Dum Biryani', titleHi: 'वेज दम बिरयानी', unit: 'Serves 2', unitHi: '2 लोगों के लिए', category: 'food', price: 149, mrp: 210, endsInMin: 24 * 60 + 420, image: 'biryani', note: 'Comes with raita and salan.', noteHi: 'रायता और सालन के साथ।' },
  // Ended: only visible in History > Saved > Ended
  { id: 'd-dryfruit', shopId: 'sharma-sweets', title: 'Dry Fruit Gift Box', titleHi: 'ड्राई फ़्रूट गिफ़्ट बॉक्स', unit: '400 g', unitHi: '400 g', category: 'food', price: 549, mrp: 750, endsInMin: -26 * 60, image: 'mithai', note: 'Festival offer.', noteHi: 'त्योहार का ऑफ़र।' },
];

export const shopById = Object.fromEntries(shops.map((s) => [s.id, s])) as Record<string, Shop>;
export const dealById = Object.fromEntries(deals.map((d) => [d.id, d])) as Record<string, Deal>;

export const CATEGORIES: { key: 'all' | Category; label: 'catAll' | 'catFood' | 'catClothes' | 'catHousehold' | 'catFurniture' | 'catSalon' | 'catGrocery' }[] = [
  { key: 'all', label: 'catAll' },
  { key: 'food', label: 'catFood' },
  { key: 'grocery', label: 'catGrocery' },
  { key: 'clothes', label: 'catClothes' },
  { key: 'household', label: 'catHousehold' },
  { key: 'furniture', label: 'catFurniture' },
  { key: 'salon', label: 'catSalon' },
];

export const RADIUS_STOPS = [1, 3, 5, 10, 20, 0] as const; // 0 = any

/** Past activity for the demo user. */
export type Order = { id: string; dealId: string; dateLabel: string; dateLabelHi: string; saved: number; paid: number; status: 'picked' | 'reserved'; code?: string };

export const seedOrders: Order[] = [
  { id: 'o1', dealId: 'd-kurta', dateLabel: '28 Oct', dateLabelHi: '28 अक्टू', saved: 250, paid: 549, status: 'picked' },
  { id: 'o2', dealId: 'd-haircut', dateLabel: '24 Oct', dateLabelHi: '24 अक्टू', saved: 71, paid: 149, status: 'picked' },
  { id: 'o3', dealId: 'd-atta', dateLabel: '19 Oct', dateLabelHi: '19 अक्टू', saved: 51, paid: 389, status: 'picked' },
  { id: 'o4', dealId: 'd-jalebi', dateLabel: '12 Oct', dateLabelHi: '12 अक्टू', saved: 20, paid: 50, status: 'picked' },
];

export type Review = { id: string; shopId: string; stars: number; text: string; textHi: string; when: string; whenHi: string };

export const seedReviews: Review[] = [
  { id: 'r1', shopId: 'handloom-house', stars: 5, text: 'Kurta fabric is lovely and they fixed the sleeves in 20 minutes.', textHi: 'कुर्ते का कपड़ा बढ़िया है और 20 मिनट में आस्तीन ठीक कर दी।', when: '4 days ago', whenHi: '4 दिन पहले' },
  { id: 'r2', shopId: 'glow-salon', stars: 4, text: 'Good haircut, had to wait 10 minutes.', textHi: 'हेयरकट अच्छा, 10 मिनट रुकना पड़ा।', when: '1 week ago', whenHi: '1 हफ़्ता पहले' },
];

export const DEMO_USER = { name: 'Ananya Sahu', nameHi: 'अनन्या साहू', phone: '+91 98•••• 4210', email: 'ananya.sahu@example.com' };
