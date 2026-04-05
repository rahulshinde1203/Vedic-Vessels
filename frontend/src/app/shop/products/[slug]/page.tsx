'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart, ArrowLeft, Star, Minus, Plus,
  Shield, Truck, RotateCcw, CheckCircle2,
  ChevronDown, Share2, Heart, ZoomIn, MapPin, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';
import { useAuthStore } from '../../../../store/auth.store';

/* ─── Static data ───────────────────────────────────────── */
const REVIEWS = [
  {
    id: 1, name: 'Priya Sharma', initials: 'PS', location: 'Mumbai',
    rating: 5, date: 'Mar 2025', verified: true,
    title: 'Exceptional quality — worth every rupee',
    text: 'I\'ve been using this copper vessel for 3 months now and the quality is exceptional. The finish is smooth, it doesn\'t leak, and I genuinely notice a difference in how my morning water tastes. Packaging was premium too.',
  },
  {
    id: 2, name: 'Ramesh Kumar', initials: 'RK', location: 'Bangalore',
    rating: 5, date: 'Feb 2025', verified: true,
    title: 'Exactly as described, fast shipping',
    text: 'Bought this as a gift for my parents and they absolutely love it. The craftsmanship is beautiful — you can see the handmade character in every detail. Arrived within 3 days, packed very carefully.',
  },
  {
    id: 3, name: 'Anita Mehta', initials: 'AM', location: 'Delhi',
    rating: 4, date: 'Jan 2025', verified: true,
    title: 'Beautiful piece, slight patina appeared',
    text: 'The vessel is stunning and very authentic. One star less because after two weeks a slight patina appeared, but after some research I found that\'s natural for pure copper and actually a sign of authenticity!',
  },
  {
    id: 4, name: 'Vikram Nair', initials: 'VN', location: 'Kochi',
    rating: 5, date: 'Dec 2024', verified: true,
    title: 'Switched from plastic — never going back',
    text: 'My Ayurveda practitioner recommended copper vessels and I found Vedic Vessels through a friend. Best decision I\'ve made. The water tastes cleaner and I feel more energetic in the mornings. Highly recommend.',
  },
];

const RATING_DIST = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 19 },
  { stars: 3, pct: 8 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 2 },
];
const AVG_RATING = 4.7;
const TOTAL_REVIEWS = 247;

const BENEFITS = [
  { icon: '💧', title: 'Purifies Water Naturally', desc: 'Copper ions destroy harmful bacteria and viruses, providing natural antimicrobial purification — known in Ayurveda as Tamra Jal.' },
  { icon: '🔥', title: 'Improves Digestion', desc: 'Stimulates peristalsis, reduces stomach inflammation, and helps kill bacteria that cause ulcers. Recommended for digestive health.' },
  { icon: '⚡', title: 'Boosts Immunity', desc: 'An essential trace mineral for white blood cell production, copper strengthens your natural immune response with every sip.' },
  { icon: '✨', title: 'Anti-Aging & Skin Glow', desc: 'Rich in antioxidants, copper fights free radicals that cause premature aging — traditional texts prescribe it for natural radiance.' },
];

const FAQS = [
  { q: 'How do I care for this copper vessel?', a: 'Clean with a mix of lemon juice and salt every 2–3 weeks to remove patina. Rinse thoroughly and dry with a soft cloth. Avoid dish soap as it strips the natural coating.' },
  { q: 'Is the copper 100% pure?', a: 'Yes. Our vessels are crafted from 99.9% pure copper, certified and sourced directly from artisans in Rajasthan. We never use alloys or plating.' },
  { q: 'How long should I store water before drinking?', a: 'Store water in the copper vessel for a minimum of 6–8 hours (overnight is ideal) for maximum Ayurvedic benefits. Room temperature water works best.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy. If the product is damaged or doesn\'t match the description, we\'ll replace it or issue a full refund.' },
];

/* ─── Sub-components ────────────────────────────────────── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i} size={size}
          className={i < Math.floor(rating) ? 'fill-brand-400 text-brand-400' : i < rating ? 'fill-brand-200 text-brand-400' : 'fill-brand-100 text-brand-200'}
        />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-3">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`skeleton rounded-xl h-${[4, 8, 6, 5, 4, 12, 14][i]}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ accordion item ────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-brand-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-brand-900">{q}</span>
        <ChevronDown size={16} className={`text-brand-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-brand-500 leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const router    = useRouter();
  const { user }  = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed]   = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode]  = useState('');
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data),
  });
  const product = data?.data;

  const addToCart = useMutation({
    mutationFn: () => api.post('/cart/items', { productId: product.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`);
    },
    onError: () => toast.error('Failed to add to cart'),
  });

  const guard = (cb: () => void) => {
    if (!user) { toast.error('Please sign in first'); router.push('/auth/login'); return; }
    cb();
  };

  const handleBuyNow = () => guard(() => {
    addToCart.mutate(undefined, {
      onSuccess: () => router.push('/shop/cart'),
    });
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const checkPincode = () => {
    if (pincode.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return; }
    setPinResult(`Estimated delivery: ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`);
  };

  if (isLoading) return <Skeleton />;
  if (isError || !product) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-brand-500 text-lg">Product not found.</p>
      <Link href="/shop/products" className="btn-primary">Back to Shop</Link>
    </div>
  );

  const images  = product.images?.length > 0 ? product.images : null;
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;
  const savings = product.comparePrice
    ? Number(product.comparePrice) - Number(product.price)
    : 0;
  const inStock  = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen bg-cream-100">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-brand-400">
          <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop/products" className="hover:text-brand-700 transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop/products?category=${product.category?.slug}`} className="hover:text-brand-700 transition-colors">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-brand-600 font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* ── Main section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Left: Gallery ── */}
          <div className="space-y-3">

            {/* Main image with zoom */}
            <div
              ref={imgRef}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square rounded-2xl overflow-hidden bg-cream-200 border border-brand-100 cursor-crosshair select-none"
            >
              {images ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-200 ${zoomed ? 'scale-150' : 'scale-100'}`}
                  style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                  <span className="text-8xl opacity-40">🏺</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {discount && discount > 0 && (
                  <span className="badge bg-green-500 text-white">{discount}% OFF</span>
                )}
                {lowStock && (
                  <span className="badge bg-red-500 text-white">Only {product.stock} left</span>
                )}
              </div>

              {/* Zoom hint */}
              {!zoomed && images && (
                <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 pointer-events-none">
                  <ZoomIn size={11} /> Hover to zoom
                </div>
              )}

              {/* Nav arrows when multiple images */}
              {images && images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ArrowLeft size={14} className="text-brand-700" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ArrowLeft size={14} className="text-brand-700 rotate-180" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images && images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                      selectedImage === i
                        ? 'border-brand-500 shadow-glow'
                        : 'border-brand-100 hover:border-brand-300'
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicator */}
            {images && images.length > 1 && (
              <div className="flex justify-center gap-1.5 pt-1">
                {images.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${selectedImage === i ? 'bg-brand-500 w-4' : 'bg-brand-200'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product info ── */}
          <div className="flex flex-col gap-5">

            {/* Category + wishlist */}
            <div className="flex items-start justify-between gap-4">
              <Link
                href={`/shop/products?category=${product.category?.slug}`}
                className="badge-copper hover:bg-brand-200 transition-colors"
              >
                {product.category?.name}
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setWishlist(v => !v); toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist'); }}
                  className={`btn-ghost btn-icon transition-colors ${wishlist ? 'text-red-500 bg-red-50' : 'text-brand-400'}`}
                  title="Add to wishlist"
                >
                  <Heart size={18} className={wishlist ? 'fill-red-500' : ''} />
                </button>
                <button
                  onClick={() => { navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {}); toast.success('Link copied!'); }}
                  className="btn-ghost btn-icon text-brand-400"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-950 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Stars rating={AVG_RATING} size={16} />
              <span className="font-bold text-brand-800 text-sm">{AVG_RATING}</span>
              <span className="text-brand-400 text-sm">({TOTAL_REVIEWS.toLocaleString()} reviews)</span>
              <span className="text-brand-200">·</span>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> {TOTAL_REVIEWS * 3}+ sold
              </span>
            </div>

            {/* Price block */}
            <div className="bg-gradient-to-r from-brand-50 to-cream-100 rounded-2xl p-4 md:p-5 border border-brand-100">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display font-bold text-3xl md:text-4xl text-brand-800">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-brand-300 line-through">
                    ₹{Number(product.comparePrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {discount && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge bg-green-500 text-white text-xs">{discount}% OFF</span>
                  <span className="text-green-700 text-sm font-semibold">
                    You save ₹{savings.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <p className="text-brand-400 text-xs mt-2">Inclusive of all taxes · Free shipping over ₹999</p>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inStock ? 'bg-green-500' : 'bg-red-500'} ${lowStock ? 'animate-pulse' : ''}`} />
              <span className={`text-sm font-semibold ${inStock ? (lowStock ? 'text-red-600' : 'text-green-700') : 'text-red-600'}`}>
                {!inStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} left — order soon!` : 'In Stock · Ready to ship'}
              </span>
            </div>

            {/* Description */}
            <p className="text-brand-600 text-sm leading-relaxed">{product.description}</p>

            {/* Divider */}
            <div className="border-t border-brand-100" />

            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-brand-700 w-20">Quantity</span>
                <div className="flex items-center border border-brand-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-2.5 hover:bg-brand-50 transition-colors text-brand-700 disabled:opacity-40"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-5 py-2.5 font-bold text-brand-900 border-x border-brand-100 min-w-[3.5rem] text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3.5 py-2.5 hover:bg-brand-50 transition-colors text-brand-700 disabled:opacity-40"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <span className="text-xs text-brand-400">{product.stock} available</span>
              </div>
            )}

            {/* ── CTA Buttons (HIGH PRIORITY) ── */}
            <div className="flex flex-col gap-3">
              {inStock ? (
                <>
                  <button
                    onClick={() => guard(() => addToCart.mutate())}
                    disabled={addToCart.isPending}
                    className="btn-primary w-full py-4 text-base gap-2.5 justify-center rounded-2xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
                  >
                    <ShoppingCart size={20} />
                    {addToCart.isPending ? 'Adding to cart…' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={addToCart.isPending}
                    className="btn-copper w-full py-4 text-base justify-center rounded-2xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
                  >
                    Buy Now — ₹{Number(product.price).toLocaleString('en-IN')}
                  </button>
                </>
              ) : (
                <button disabled className="w-full py-4 text-base rounded-2xl bg-brand-100 text-brand-400 font-semibold cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck,       label: 'Free Delivery',  sub: 'Orders over ₹999' },
                { icon: Shield,      label: 'Authentic',      sub: 'Pure & certified' },
                { icon: RotateCcw,   label: '7-Day Returns',  sub: 'Hassle-free' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-brand-100">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center mb-2">
                    <Icon size={15} className="text-brand-600" />
                  </div>
                  <p className="text-xs font-semibold text-brand-800">{label}</p>
                  <p className="text-2xs text-brand-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Delivery checker */}
            <div className="bg-white rounded-2xl border border-brand-100 p-4">
              <p className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-brand-500" /> Check Delivery
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={e => { setPincode(e.target.value.replace(/\D/, '').slice(0, 6)); setPinResult(null); }}
                  placeholder="Enter pincode"
                  maxLength={6}
                  className="input text-sm py-2 flex-1"
                />
                <button onClick={checkPincode} className="btn-secondary btn-sm flex-shrink-0">
                  Check
                </button>
              </div>
              {pinResult && (
                <p className="text-xs text-green-700 font-medium mt-2 flex items-center gap-1.5">
                  <Clock size={12} /> {pinResult}
                </p>
              )}
            </div>

            {/* SKU */}
            <p className="text-2xs text-brand-300">SKU: {product.sku}</p>
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="bg-white border-y border-brand-100 py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-subtitle">Backed by Ayurveda</p>
            <h2 className="section-title mb-3">Why Copper Vessels?</h2>
            <p className="text-brand-500 text-sm max-w-lg mx-auto leading-relaxed">
              Ancient Indian science, now confirmed by modern research. Here's what happens when you make the switch.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} className="card-hover p-6 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-100 transition-colors flex items-center justify-center text-3xl mx-auto mb-4">
                  {icon}
                </div>
                <h3 className="font-display font-semibold text-brand-900 mb-2 text-base">{title}</h3>
                <p className="text-brand-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* How to use */}
          <div className="mt-10 bg-gradient-to-r from-brand-50 to-cream-200 rounded-2xl p-6 md:p-8 border border-brand-100">
            <h3 className="font-display font-semibold text-brand-900 text-lg mb-5">How to Use for Best Results</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Fill at Night', desc: 'Pour clean water into the vessel and leave it overnight at room temperature.' },
                { step: '2', title: 'Wait 8 Hours', desc: 'Copper needs 6–8 hours to infuse its properties into the water. Patience is key.' },
                { step: '3', title: 'Drink on Empty Stomach', desc: 'Consume 2–3 glasses of Tamra Jal first thing each morning for maximum Ayurvedic benefits.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900 text-sm mb-1">{title}</p>
                    <p className="text-brand-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Rating summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <p className="section-subtitle mb-2">Customer Reviews</p>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display font-bold text-5xl text-brand-900">{AVG_RATING}</span>
                <span className="text-brand-400 text-sm">/ 5</span>
              </div>
              <Stars rating={AVG_RATING} size={18} />
              <p className="text-brand-400 text-sm mt-1 mb-6">{TOTAL_REVIEWS.toLocaleString()} verified reviews</p>

              {/* Distribution bars */}
              <div className="space-y-2">
                {RATING_DIST.map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-xs text-brand-600 font-medium w-4 text-right flex-shrink-0">{stars}</span>
                    <Star size={11} className="fill-brand-400 text-brand-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-brand-400 w-8 flex-shrink-0">{pct}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-brand-100">
                {user ? (
                  <button className="btn-secondary w-full justify-center text-sm">
                    Write a Review
                  </button>
                ) : (
                  <Link href="/auth/login" className="btn-secondary w-full justify-center text-sm">
                    Sign in to Review
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-5">
            {REVIEWS.map((r) => (
              <div key={r.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-brand-900 text-sm">{r.name}</p>
                        <p className="text-2xs text-brand-400">{r.location} · {r.date}</p>
                      </div>
                      <Stars rating={r.rating} size={13} />
                    </div>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-semibold mb-2">
                        <CheckCircle2 size={10} /> Verified Purchase
                      </span>
                    )}
                    <p className="text-brand-900 text-sm font-semibold mb-1">{r.title}</p>
                    <p className="text-brand-500 text-sm leading-relaxed">{r.text}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center pt-2">
              <button className="btn-secondary text-sm">
                Load more reviews
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="bg-white border-t border-brand-100 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="section-subtitle">Got questions?</p>
            <h2 className="section-title">Frequently Asked</h2>
          </div>
          <div className="card divide-y divide-brand-100 p-0 overflow-hidden">
            {FAQS.map(faq => (
              <div key={faq.q} className="px-6">
                <FaqItem {...faq} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sticky Mobile CTA ── */}
      {inStock && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-brand-100 px-4 py-3 shadow-[0_-4px_24px_rgba(58,23,5,0.12)]">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-brand-900 font-bold font-display text-lg leading-none">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </p>
              {discount && <p className="text-2xs text-green-600 font-semibold mt-0.5">{discount}% off · Save ₹{savings.toLocaleString('en-IN')}</p>}
            </div>
            <button
              onClick={() => guard(() => addToCart.mutate())}
              disabled={addToCart.isPending}
              className="btn-secondary btn-sm flex-shrink-0 gap-1.5"
            >
              <ShoppingCart size={15} />
              Add
            </button>
            <button
              onClick={handleBuyNow}
              disabled={addToCart.isPending}
              className="btn-copper btn-sm flex-shrink-0 px-5"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* Bottom padding for sticky bar on mobile */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
