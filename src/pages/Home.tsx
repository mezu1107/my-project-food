// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/features/menu/components/MenuItemCard";
import { mockMenuItems } from "@/lib/mockData";


type HomeProps = {
  openAreaChecker?: () => void;
};

export const Home = ({ openAreaChecker }: HomeProps = {}) => {
  // Filter truly featured items based on your mock data
  const featuredItems = mockMenuItems.filter((item) => {
    const featuredNames = [
      "Lacha Paratha",
      "Aloo Cheese Paratha",
      "Special Masala Biryani",
      "Chicken Pulao",
      "Chai / Karak Chai",
      "Gur Wali chaye",
    ];
    return featuredNames.includes(item.name);
  });

  const promotionalTexts = [
    { main: "AUTHENTIC PAKISTANI TASTE", sub: "Handcrafted desi dishes made with love" },
    { main: "FRESH & HALAL", sub: "100% fresh ingredients, always halal-certified" },
    { main: "GHAR KA KHANA", sub: "Comforting home-style cooking, just like ammi makes" },
  ];

  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promotionalTexts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { name: "Breakfast", icon: "🍳", link: "/menu?category=breakfast" },
    { name: "Lunch", icon: "🍛", link: "/menu?category=lunch" },
    { name: "Dinner", icon: "🍲", link: "/menu?category=dinner" },
    { name: "Desserts", icon: "🍰", link: "/menu?category=desserts" },
    { name: "Beverages", icon: "🥤", link: "/menu?category=beverages" },
  ];

  const testimonials = [
    {
      name: "Ahmed Khan",
      rating: 5,
      comment: "The Special Masala Biryani is absolutely incredible! Best in town.",
    },
    {
      name: "Fatima Ali",
      rating: 5,
      comment: "Aloo Cheese Paratha with Karak Chai — perfect breakfast combo!",
    },
    {
      name: "Usman Tariq",
      rating: 5,
      comment: "Finally authentic Lacha Paratha and Chicken Pulao. Highly recommend!",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-background min-h-[80vh] flex items-center py-12 lg:py-0">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-400 rounded-full blur-3xl"></div>
        </div>

        {/* Left Side: Chicken Karahi */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
        >
          <img
              src="/Chicken-Karahi.jpg"
            alt="Authentic Chicken Karahi"
            className="w-80 lg:w-96 2xl:w-[500px] rounded-3xl shadow-2xl border-8 border-white/80 rotate-[-12deg] hover:rotate-[-8deg] transition-transform duration-700"
          />
        </motion.div>

        {/* Right Side: Special Masala Biryani */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
        >
          <img
            src="https://www.shutterstock.com/image-photo/hyderabadi-chicken-biryani-aromatic-flavorful-600nw-2497040151.jpg"
            alt="Special Masala Biryani"
            className="w-80 lg:w-96 2xl:w-[500px] rounded-3xl shadow-2xl border-8 border-white/80 rotate-[12deg] hover:rotate-[8deg] transition-transform duration-700"
          />
        </motion.div>

        {/* Center Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">Al</span>
              <span className="text-orange-600">Tawakkal</span>
              <span className="text-foreground">foods</span>
            </motion.h1>

            <motion.div
              key={currentPromoIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-orange-700">
                {promotionalTexts[currentPromoIndex].main}
              </p>
              <p className="text-lg sm:text-xl text-muted-foreground mt-3">
                {promotionalTexts[currentPromoIndex].sub}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Bringing authentic Pakistani home-cooked flavors straight to your door.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link to="/menu">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
                <Link to="/about">Our Story</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Explore Our Menu
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From flaky parathas to aromatic biryanis – all made fresh daily
          </p>
        </motion.div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 place-items-center">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={category.link}
                className="group block bg-card rounded-2xl p-6 text-center hover:shadow-2xl transition-all border hover:border-orange-300"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Dishes */}
      {featuredItems.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Customer Favorites
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our most loved and ordered dishes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredItems.slice(0, 6).map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <MenuItemCard item={item} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/menu">View Full Menu</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-orange-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Happy Customers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from food lovers like you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="h-6 w-6 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6">
                  "{testimonial.comment}"
                </p>
                <p className="font-bold text-lg">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready for Authentic Pakistani Food?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Order your favorite dishes now and enjoy the real taste of tradition.
          </p>
          <Button size="lg" variant="secondary" asChild className="px-10 py-7 text-xl">
            <Link to="/menu">
              Browse Menu <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </>
  );
};

export default Home;