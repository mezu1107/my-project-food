import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Users, Bike, Tag, UtensilsCrossed, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Bike, label: "Riders", path: "/admin/riders" },
    { icon: Tag, label: "Deals", path: "/admin/deals" },
    { icon: UtensilsCrossed, label: "Food Items", path: "/admin/food-items" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center justify-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">AM Foods Admin</h1>
        </div>
        <nav className="space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <h2 className="text-lg font-semibold">
            {navItems.find((item) => item.path === location.pathname)?.label || "Admin Panel"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {currentUser?.name || "Admin"}
            </span>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
