// import { useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import { Search, Filter } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { MenuItemCard } from "@/components/MenuItemCard";
// import { Header } from "@/components/Header";
// import { Footer } from "@/components/Footer";
// import { mockMenuItems } from "@/lib/mockData";

// export const Menu = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [vegFilter, setVegFilter] = useState<boolean | null>(null);
//   const [spicyFilter, setSpicyFilter] = useState<boolean | null>(null);

//   const filteredItems = useMemo(() => {
//     return mockMenuItems.filter((item) => {
//       const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.description.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
//       const matchesVeg = vegFilter === null || item.isVeg === vegFilter;
//       const matchesSpicy = spicyFilter === null || item.isSpicy === spicyFilter;
      
//       return matchesSearch && matchesCategory && matchesVeg && matchesSpicy;
//     });
//   }, [searchQuery, selectedCategory, vegFilter, spicyFilter]);

//   const categories = [
//     { value: "all", label: "All Items" },
//     { value: "breakfast", label: "Breakfast" },
//     { value: "lunch", label: "Lunch" },
//     { value: "dinner", label: "Dinner" },
//     { value: "desserts", label: "Desserts" },
//     { value: "beverages", label: "Beverages" },
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />

//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-8"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Explore our delicious selection of authentic Pakistani cuisine
//           </p>
//         </motion.div>

//         {/* Search and Filters */}
//         <div className="mb-8 space-y-4">
//           <div className="relative max-w-xl mx-auto">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               placeholder="Search for dishes..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-12"
//             />
//           </div>

//           <div className="flex flex-wrap gap-3 justify-center">
//             <Button
//               variant={vegFilter === true ? "default" : "outline"}
//               size="sm"
//               onClick={() => setVegFilter(vegFilter === true ? null : true)}
//             >
//               🌿 Vegetarian
//             </Button>
//             <Button
//               variant={vegFilter === false ? "default" : "outline"}
//               size="sm"
//               onClick={() => setVegFilter(vegFilter === false ? null : false)}
//             >
//               🍖 Non-Veg
//             </Button>
//             <Button
//               variant={spicyFilter === true ? "default" : "outline"}
//               size="sm"
//               onClick={() => setSpicyFilter(spicyFilter === true ? null : true)}
//             >
//               🌶️ Spicy
//             </Button>
//             <Button
//               variant={spicyFilter === false ? "default" : "outline"}
//               size="sm"
//               onClick={() => setSpicyFilter(spicyFilter === false ? null : false)}
//             >
//               ❄️ Mild
//             </Button>
//             {(vegFilter !== null || spicyFilter !== null) && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setVegFilter(null);
//                   setSpicyFilter(null);
//                 }}
//               >
//                 Clear Filters
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Category Tabs */}
//         <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
//           <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2">
//             {categories.map((category) => (
//               <TabsTrigger key={category.value} value={category.value} className="flex-shrink-0">
//                 {category.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </Tabs>

//         {/* Menu Items Grid */}
//         {filteredItems.length > 0 ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//           >
//             {filteredItems.map((item, index) => (
//               <MenuItemCard key={item.id} item={item} index={index} />
//             ))}
//           </motion.div>
//         ) : (
//           <div className="text-center py-20">
//             <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//             <h3 className="text-xl font-semibold mb-2">No items found</h3>
//             <p className="text-muted-foreground">
//               Try adjusting your filters or search query
//             </p>
//           </div>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default Menu;
